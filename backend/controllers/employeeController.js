import { Employee, User, Department, Position, Role } from '../models/index.js';
import ExcelJS from 'exceljs';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';
import { logActivity } from '../services/auditService.js';
import { sendTemporaryPasswordEmail } from '../services/emailService.js';

const generateEmployeeNumber = async () => {
    const year = new Date().getFullYear();
    const count = await Employee.count();
    const sequence = (count + 1).toString().padStart(4, '0');
    return `EMP-${year}-${sequence}`;
};

export const getAllEmployees = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12; // 12 fits grid well
        const offset = (page - 1) * limit;

        const { search, department_id, position_id, status } = req.query;
        const whereClause = {};
        const userWhere = {};

        if (department_id) {
            whereClause.department_id = department_id;
        } else if (req.user.role === 'manager' || req.user.role === 'employee') {
            const employeeRecord = await Employee.findOne({ where: { user_id: req.user.id } });
            if (employeeRecord) {
                whereClause.department_id = employeeRecord.department_id;
            }
        }

        if (position_id) whereClause.position_id = position_id;
        if (status) whereClause.employment_status = status;

        if (search) {
            userWhere[Op.or] = [
                { first_name: { [Op.iLike]: `%${search}%` } },
                { last_name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { employee_id: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows } = await Employee.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    where: Object.keys(userWhere).length > 0 ? userWhere : undefined,
                    attributes: ['id', 'first_name', 'last_name', 'email', 'employee_id', 'profile_picture', 'profile_picture_url', 'role'],
                    include: [
                        {
                            model: Role,
                            attributes: ['id', 'name', 'code'],
                            through: { attributes: ['department_id'] }
                        }
                    ]
                },
                { model: Department, attributes: ['id', 'name', 'code'] },
                { model: Position, attributes: ['id', 'title', 'code', 'grade'] },
                { model: User, as: 'Manager', attributes: ['id', 'first_name', 'last_name'] }
            ],
            distinct: true, // Crucial for count when using includes
            limit: limit,
            offset: offset,
            order: [[User, 'first_name', 'ASC']]
        });

        res.status(200).json({
            employees: rows,
            total: count,
            page: page,
            limit: limit,
            totalPages: Math.ceil(count / limit)
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch employees', details: error.message });
    }
};

export const getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(parseInt(id))) {
            return res.status(400).json({ error: 'Invalid employee ID format' });
        }

        // Access control: only admin, HR, or the employee themselves can view full details
        if (req.user.role !== 'admin' && req.user.role !== 'hr' && req.user.id !== parseInt(id)) {
            // Check if requester is the employee's manager
            const employeeToView = await Employee.findOne({ where: { user_id: id } });
            if (!employeeToView || employeeToView.reports_to !== req.user.id) {
                return res.status(403).json({ error: 'Access denied. You can only view your own profile or profiles you manage.' });
            }
        }

        const employee = await Employee.findOne({
            where: { user_id: id },
            include: [
                {
                    model: User,
                    attributes: { exclude: ['password_hash'] },
                    include: [{ model: Role, attributes: ['id', 'name', 'code'], through: { attributes: [] } }]
                },
                { model: Department },
                { model: Position },
                { model: User, as: 'Manager', attributes: ['id', 'first_name', 'last_name', 'email'] }
            ]
        });

        if (!employee) return res.status(404).json({ error: 'Employee not found' });
        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching employee details', details: error.message });
    }
};

export const createEmployee = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { email, first_name, last_name, phone, gender, department_id, position_id, hire_date } = req.body;

        if (!email || !first_name || !last_name) {
            throw new Error('Email, first name, and last name are required');
        }

        if (!department_id || !position_id) {
            throw new Error('Department and Position are required to create an employee profile.');
        }

        // Check if user with email already exists
        let user = await User.findOne({ where: { email } });
        let tempPassword = req.body.password || email; // Default to email if no password provided

        const employeeNumber = await generateEmployeeNumber();

        if (!user) {
            user = await User.create({
                employee_id: employeeNumber,
                email,
                first_name,
                last_name,
                phone: phone === '' ? null : phone,
                gender: gender === '' ? null : gender,
                profile_picture: req.file ? req.file.path : null, // Save file URL
                password_hash: tempPassword,
                status: 'active'
            }, { transaction: t });
        } else {
            // If user exists, check if they already have an employee profile
            const existingEmployee = await Employee.findByPk(user.id);
            if (existingEmployee) throw new Error('Employee profile already exists for this user');
        }

        // Sanitize empty strings to null for Sequelize DATEONLY and Integer fields
        const employeeData = { ...req.body, user_id: user.id, employee_number: employeeNumber, created_by: req.user.id };
        Object.keys(employeeData).forEach(key => {
            if (employeeData[key] === '') employeeData[key] = null;
        });

        const employee = await Employee.create(employeeData, { transaction: t });

        await logActivity(req.user.id, 'CREATE', 'Employee', employee.user_id, null, employee.toJSON(), req);

        await t.commit();

        // Send temporary password email if a new user was created
        if (tempPassword) {
            try {
                await sendTemporaryPasswordEmail(user, tempPassword);
            } catch (error) {
                console.error('Failed to send temporary password email:', error);
            }
        }

        res.status(201).json({
            ...employee.toJSON(),
            profile_picture_url: user.profile_picture_url
        });
    } catch (error) {
        await t.rollback();
        console.error('Create Employee Error:', error);

        const errorMessage = error.errors
            ? error.errors.map(e => e.message).join(', ')
            : error.message;

        res.status(400).json({ error: 'Failed to create employee profile', details: errorMessage });
    }
};

export const updateEmployee = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;

        // Access control: only admin, HR, or the employee themselves
        if (req.user.role !== 'admin' && req.user.role !== 'hr' && req.user.id !== parseInt(id)) {
            return res.status(403).json({ error: 'Access denied. You can only update your own information.' });
        }

        const employee = await Employee.findOne({
            where: { user_id: id },
            include: [{ model: User }]
        });
        if (!employee) return res.status(404).json({ error: 'Employee profile not found' });

        const oldValues = employee.toJSON();

        // Update associated User model fields
        const userUpdates = {};
        if (req.body.first_name) userUpdates.first_name = req.body.first_name;
        if (req.body.last_name) userUpdates.last_name = req.body.last_name;
        if (req.file) userUpdates.profile_picture = req.file.path;
        if (req.body.role && req.user.role === 'admin') userUpdates.role = req.body.role;

        if (Object.keys(userUpdates).length > 0) {
            await User.update(userUpdates, { where: { id: id }, transaction: t });
        }

        // Restrict fields for non-admin/hr users
        const updateData = { ...req.body };
        if (req.user.role !== 'admin' && req.user.role !== 'hr') {
            const forbiddenFields = [
                'employment_status', 'hire_date', 'department_id', 'position_id',
                'reports_to', 'employee_number', 'salary_amount', 'salary_currency'
            ];
            forbiddenFields.forEach(field => delete updateData[field]);
        }

        // Update Employee model fields
        await employee.update(updateData, { transaction: t });
        const newValues = employee.toJSON();

        await logActivity(req.user.id, 'UPDATE', 'Employee', employee.user_id, oldValues, newValues, req);

        await t.commit();
        // Return employee with virtual profile_picture_url from User model
        const updatedUser = await User.findByPk(id);
        res.status(200).json({
            ...employee.toJSON(),
            profile_picture_url: updatedUser.profile_picture_url
        });
    } catch (error) {
        await t.rollback();
        console.error('Update Employee Error:', error);
        res.status(400).json({ error: 'Failed to update employee', details: error.message });
    }
};

export const deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findOne({ where: { user_id: req.params.id } });
        if (!employee) return res.status(404).json({ error: 'Employee not found' });

        // Check if employee is a manager of any department or other employees
        const managesDept = await Department.count({ where: { manager_id: req.params.id } });
        const managesEmp = await Employee.count({ where: { reports_to: req.params.id } });

        if (managesDept > 0 || managesEmp > 0) {
            return res.status(400).json({
                error: 'Cannot delete employee who is still assigned as a manager. Please reassign their subordinates first.'
            });
        }

        const oldValues = employee.toJSON();
        await employee.destroy();

        await logActivity(req.user.id, 'DELETE', 'Employee', req.params.id, oldValues, null, req);

        res.status(200).json({ message: 'Employee profile deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete employee', details: error.message });
    }
};

export const exportEmployees = async (req, res) => {
    try {
        const employees = await Employee.findAll({
            include: [
                { model: User, attributes: ['first_name', 'last_name', 'email', 'phone'] },
                { model: Department, attributes: ['name'] },
                { model: Position, attributes: ['title'] },
                { model: User, as: 'Manager', attributes: ['first_name', 'last_name'] }
            ],
            order: [[User, 'last_name', 'ASC']]
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Employee Directory');

        // Define columns
        worksheet.columns = [
            { header: 'ID', key: 'employee_number', width: 15 },
            { header: 'First Name', key: 'first_name', width: 20 },
            { header: 'Last Name', key: 'last_name', width: 20 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Phone', key: 'phone', width: 15 },
            { header: 'Department', key: 'department', width: 25 },
            { header: 'Position', key: 'position', width: 25 },
            { header: 'Manager', key: 'manager', width: 25 },
            { header: 'Hire Date', key: 'hire_date', width: 15 },
            { header: 'Status', key: 'status', width: 15 }
        ];

        // Style the header
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF3B82F6' } // Blue-500
        };

        // Add data
        employees.forEach(emp => {
            worksheet.addRow({
                employee_number: emp.employee_number,
                first_name: emp.User?.first_name,
                last_name: emp.User?.last_name,
                email: emp.User?.email,
                phone: emp.User?.phone,
                department: emp.Department?.name,
                position: emp.Position?.title,
                manager: emp.Manager ? `${emp.Manager.first_name} ${emp.Manager.last_name}` : 'N/A',
                hire_date: emp.hire_date,
                status: emp.employment_status
            });
        });

        // Set response headers
        const fileName = `employee_export_${new Date().toISOString().split('T')[0]}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        await logActivity(req.user.id, 'EXPORT', 'Employee', null, null, { recordCount: employees.length, format: 'xlsx' }, req);

        await workbook.xlsx.write(res);
        res.status(200).end();
    } catch (error) {
        console.error('Export Error:', error);
        res.status(500).json({ error: 'Failed to export employees', details: error.message });
    }
};
