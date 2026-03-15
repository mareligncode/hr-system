import {
    PayrollPeriod,
    PayrollItem,
    User,
    Employee,
    Attendance,
    Position,
    Department
} from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import { logActivity } from '../services/auditService.js';

// Get all payroll periods
export const getAllPeriods = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows } = await PayrollPeriod.findAndCountAll({
            include: [{ model: User, as: 'Creator', attributes: ['first_name', 'last_name'] }],
            order: [['start_date', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.status(200).json({
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            periods: rows
        });
    } catch (error) {
        console.error('Get All Periods Error:', error);
        res.status(500).json({ error: 'Failed to fetch payroll periods' });
    }
};

// Create a new payroll period
export const createPeriod = async (req, res) => {
    try {
        const { start_date, end_date, description } = req.body;

        if (!start_date || !end_date) {
            return res.status(400).json({ error: 'Start and end dates are required' });
        }

        const period = await PayrollPeriod.create({
            start_date,
            end_date,
            description,
            created_by: req.user.id
        });

        await logActivity(req.user.id, 'CREATE_PAYROLL_PERIOD', 'PayrollPeriod', period.id, null, period.toJSON(), req);

        res.status(201).json({ message: 'Payroll period created successfully', period });
    } catch (error) {
        console.error('Create Period Error:', error);
        res.status(500).json({ error: 'Failed to create payroll period' });
    }
};

// Get period details and items
export const getPeriodById = async (req, res) => {
    try {
        const { id } = req.params;

        const period = await PayrollPeriod.findByPk(id, {
            include: [
                { model: User, as: 'Creator', attributes: ['first_name', 'last_name'] },
                {
                    model: PayrollItem,
                    include: [
                        {
                            model: User,
                            attributes: ['id', 'first_name', 'last_name', 'email'],
                            include: [{
                                model: Employee,
                                include: [{ model: Position, attributes: ['title'] }, { model: Department, attributes: ['name'] }]
                            }]
                        }
                    ]
                }
            ]
        });

        if (!period) {
            return res.status(404).json({ error: 'Payroll period not found' });
        }

        res.status(200).json(period);
    } catch (error) {
        console.error('Get Period Detail Error:', error);
        res.status(500).json({ error: 'Failed to fetch payroll period details' });
    }
};

// Calculate Payroll Engine
export const calculatePayroll = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const period = await PayrollPeriod.findByPk(id);

        if (!period) {
            return res.status(404).json({ error: 'Payroll period not found' });
        }

        if (period.status === 'completed' || period.status === 'approved') {
            return res.status(400).json({ error: 'Cannot recalculate a completed or approved payroll' });
        }

        await period.update({ status: 'processing' }, { transaction });

        const employees = await Employee.findAll({
            where: { employment_status: 'active' },
            include: [{ model: User, attributes: ['id', 'first_name', 'last_name'] }]
        });

        const payrollItems = [];

        for (const emp of employees) {
            // Aggregate approved attendance for this employee in this period
            const attendances = await Attendance.findAll({
                where: {
                    user_id: emp.user_id,
                    status: 'approved',
                    clock_in: { [Op.between]: [new Date(period.start_date), new Date(new Date(period.end_date).setHours(23, 59, 59))] }
                }
            });

            const totalHours = attendances.reduce((sum, a) => sum + (a.work_hours || 0), 0);
            const overtimeHours = attendances.reduce((sum, a) => sum + (a.overtime_hours || 0), 0);

            let grossPay = 0;
            const baseSalary = parseFloat(emp.base_salary) || 0;
            const hourlyRate = parseFloat(emp.hourly_rate) || 0;

            if (emp.contract_type === 'permanent') {
                grossPay = baseSalary;
            } else {
                grossPay = totalHours * hourlyRate;
            }

            // Add overtime (1.5x)
            const overtimePay = overtimeHours * hourlyRate * 1.5;
            grossPay += overtimePay;

            // Upsert PayrollItem
            const [item, created] = await PayrollItem.findOrCreate({
                where: {
                    payroll_period_id: period.id,
                    user_id: emp.user_id
                },
                defaults: {
                    base_salary_snapshot: baseSalary,
                    hourly_rate_snapshot: hourlyRate,
                    total_hours: totalHours,
                    overtime_hours: overtimeHours,
                    gross_pay: grossPay,
                    net_pay: grossPay, // Initial simplification: no deductions in Phase 10
                    status: 'draft'
                },
                transaction
            });

            if (!created) {
                await item.update({
                    base_salary_snapshot: baseSalary,
                    hourly_rate_snapshot: hourlyRate,
                    total_hours: totalHours,
                    overtime_hours: overtimeHours,
                    gross_pay: grossPay,
                    net_pay: grossPay,
                    status: 'draft'
                }, { transaction });
            }

            payrollItems.push(item);
        }

        await transaction.commit();
        res.status(200).json({ message: 'Payroll calculated successfully', itemsCount: payrollItems.length });
    } catch (error) {
        await transaction.rollback();
        console.error('Calculate Payroll Error:', error);
        res.status(500).json({ error: 'Failed to calculate payroll', details: error.message });
    }
};

// Review Payroll (Mark as reviewed)
export const reviewPayroll = async (req, res) => {
    try {
        const { id } = req.params;
        const period = await PayrollPeriod.findByPk(id);

        if (!period) return res.status(404).json({ error: 'Period not found' });

        await period.update({ status: 'completed' });

        // Mark all items as reviewed
        await PayrollItem.update({ status: 'reviewed' }, { where: { payroll_period_id: id, status: 'draft' } });

        await logActivity(req.user.id, 'REVIEW_PAYROLL', 'PayrollPeriod', id, null, { status: 'completed' }, req);

        res.status(200).json({ message: 'Payroll marked as reviewed/completed' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to review payroll' });
    }
};

// Approve Payroll
export const approvePayroll = async (req, res) => {
    try {
        const { id } = req.params;
        const period = await PayrollPeriod.findByPk(id);

        if (!period) return res.status(404).json({ error: 'Period not found' });

        await period.update({ status: 'approved' });

        // Finalize all items
        await PayrollItem.update({ status: 'approved' }, { where: { payroll_period_id: id } });

        await logActivity(req.user.id, 'APPROVE_PAYROLL', 'PayrollPeriod', id, null, { status: 'approved' }, req);

        res.status(200).json({ message: 'Payroll approved successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to approve payroll' });
    }
};

// Get My Payslip
export const getMyPayslips = async (req, res) => {
    try {
        const userId = req.user.id;
        const payslips = await PayrollItem.findAll({
            where: { user_id: userId, status: 'approved' },
            include: [{ model: PayrollPeriod, attributes: ['start_date', 'end_date', 'description'] }],
            order: [[PayrollPeriod, 'end_date', 'DESC']]
        });

        res.status(200).json(payslips);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch payslips' });
    }
};
