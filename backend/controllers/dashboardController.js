import { Employee, Department, Position, EmployeeDocument, EmployeeCertification, User, AuditLog } from '../models/index.js';
import { Op } from 'sequelize';

export const getDashboardStats = async (req, res) => {
    try {
        let whereClause = {};
        let managerDeptId = null;

        if (req.user.role === 'manager') {
            const managerEmployee = await Employee.findOne({ where: { user_id: req.user.id } });
            if (managerEmployee) {
                managerDeptId = managerEmployee.department_id;
                whereClause = { department_id: managerDeptId };
            }
        }

        const totalEmployees = await Employee.count({ where: whereClause });
        const totalDepartments = managerDeptId ? 1 : await Department.count();

        // Filter positions by department if manager
        const positionWhere = managerDeptId ? { department_id: managerDeptId } : {};
        const totalPositions = await Position.count({ where: positionWhere });

        // Count active certifications (scoped if manager)
        const activeCertifications = await EmployeeCertification.count({
            where: {
                expiry_date: { [Op.gt]: new Date() }
            },
            include: managerDeptId ? [{
                model: Employee,
                where: { department_id: managerDeptId },
                attributes: []
            }] : []
        });

        // Get counts by department (only own department if manager)
        const deptStatsWhere = managerDeptId ? { id: managerDeptId } : {};
        const deptStats = await Department.findAll({
            where: deptStatsWhere,
            attributes: ['name', [Employee.sequelize.fn('COUNT', Employee.sequelize.col('Employees.user_id')), 'employee_count']],
            include: [{
                model: Employee,
                attributes: []
            }],
            group: ['Department.id']
        });

        // Contract Distribution (Permanent vs Temporary) - useful for HR/Admin/Finance
        const contractStats = await Employee.findAll({
            where: whereClause,
            attributes: ['contract_type', [Employee.sequelize.fn('COUNT', Employee.sequelize.col('user_id')), 'count']],
            group: ['contract_type']
        });

        res.status(200).json({
            metrics: {
                totalEmployees,
                totalDepartments,
                totalPositions,
                activeCertifications
            },
            departmentDistribution: deptStats,
            contractDistribution: contractStats,
            isScoped: !!managerDeptId
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};

export const getExpiringAssets = async (req, res) => {
    try {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        let managerDeptId = null;
        if (req.user.role === 'manager') {
            const managerEmployee = await Employee.findOne({ where: { user_id: req.user.id } });
            if (managerEmployee) {
                managerDeptId = managerEmployee.department_id;
            }
        }

        const employeeInclude = {
            model: Employee,
            include: [{ model: User, attributes: ['first_name', 'last_name', 'email'] }]
        };

        if (managerDeptId) {
            employeeInclude.where = { department_id: managerDeptId };
        }

        const expiringDocs = await EmployeeDocument.findAll({
            where: {
                expiry_date: {
                    [Op.between]: [new Date(), thirtyDaysFromNow]
                }
            },
            include: [employeeInclude]
        });

        const expiringCerts = await EmployeeCertification.findAll({
            where: {
                expiry_date: {
                    [Op.between]: [new Date(), thirtyDaysFromNow]
                }
            },
            include: [employeeInclude]
        });

        res.status(200).json({
            documents: expiringDocs,
            certifications: expiringCerts
        });
    } catch (error) {
        console.error('Expiring Assets Error:', error);
        res.status(500).json({ error: 'Failed to fetch expiring assets' });
    }
};

export const getRecentActivity = async (req, res) => {
    try {
        const recentLogs = await AuditLog.findAll({
            limit: 10,
            order: [['created_at', 'DESC']],
            include: [{ model: User, attributes: ['first_name', 'last_name', 'profile_picture'] }]
        });
        res.status(200).json(recentLogs);
    } catch (error) {
        console.error('Recent Activity Error:', error);
        res.status(500).json({ error: 'Failed to fetch recent activity' });
    }
};

export const getEmployeeDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        const employee = await Employee.findOne({
            where: { user_id: userId },
            include: [
                { model: Department, attributes: ['id', 'name', 'code'] },
                { model: Position, attributes: ['id', 'title', 'code', 'job_description'] },
                { model: User, as: 'Manager', attributes: ['id', 'first_name', 'last_name', 'email'] }
            ]
        });

        if (!employee) {
            return res.status(404).json({ error: 'Employee profile not found' });
        }

        // Get document stats
        const documentStats = await EmployeeDocument.findAll({
            where: { employee_id: userId },
            attributes: ['id', 'document_name', 'document_type', 'expiry_date', 'is_verified']
        });

        // Get certification stats
        const certificationStats = await EmployeeCertification.findAll({
            where: { employee_id: userId },
            attributes: ['id', 'certification_name', 'expiry_date', 'is_verified']
        });

        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const expiringDocsCount = documentStats.filter(d =>
            d.expiry_date && new Date(d.expiry_date) > new Date() && new Date(d.expiry_date) <= thirtyDaysFromNow
        ).length;

        const expiringCertsCount = certificationStats.filter(c =>
            c.expiry_date && new Date(c.expiry_date) > new Date() && new Date(c.expiry_date) <= thirtyDaysFromNow
        ).length;

        res.status(200).json({
            profile: {
                employee_number: employee.employee_number,
                hire_date: employee.hire_date,
                employment_status: employee.employment_status,
                contract_type: employee.contract_type
            },
            organization: {
                department: employee.Department || employee.department,
                position: employee.Position || employee.position,
                manager: employee.Manager || employee.manager
            },
            stats: {
                totalDocuments: documentStats.length,
                verifiedDocuments: documentStats.filter(d => d.is_verified).length,
                expiringDocuments: expiringDocsCount,
                totalCertifications: certificationStats.length,
                verifiedCertifications: certificationStats.filter(c => c.is_verified).length,
                expiringCertifications: expiringCertsCount
            }
        });
    } catch (error) {
        console.error('Employee Dashboard Error:', error);
        res.status(500).json({ error: 'Failed to fetch employee dashboard data' });
    }
};
