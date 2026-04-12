import { PayrollPeriod, PayrollItem, Employee, User } from '../../models/index.js';
import sequelize from '../../config/database.js';

export const createPeriod = async (req, res) => {
    try {
        const { start_date, end_date, description } = req.body;
        const period = await PayrollPeriod.create({
            start_date,
            end_date,
            description,
            created_by: req.user.id
        });
        res.status(201).json(period);
    } catch (error) {
        console.error('Error creating payroll period:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getPeriods = async (req, res) => {
    try {
        const periods = await PayrollPeriod.findAll({
            include: [{ model: User, as: 'Creator', attributes: ['id', 'first_name', 'last_name'] }],
            order: [['start_date', 'DESC']]
        });
        res.json(periods);
    } catch (error) {
        console.error('Error fetching payroll periods:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getPayrollItemsByPeriod = async (req, res) => {
    try {
        const { period_id } = req.params;
        const items = await PayrollItem.findAll({
            where: { payroll_period_id: period_id },
            include: [{
                model: User,
                attributes: ['id', 'first_name', 'last_name'],
                include: [{
                    model: Employee,
                    attributes: ['employee_number', 'base_salary', 'hourly_rate']
                }]
            }]
        });
        res.json(items);
    } catch (error) {
        console.error('Error fetching payroll items:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const processPayrollPeriod = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { period_id } = req.params;
        const period = await PayrollPeriod.findByPk(period_id);

        if (!period) {
            return res.status(404).json({ error: 'Payroll period not found' });
        }
        if (period.status !== 'open') {
            return res.status(400).json({ error: 'Payroll period is not open' });
        }

        const employees = await Employee.findAll({
            where: { employment_status: 'active' },
            include: [{ model: User, attributes: ['id'] }]
        });

        // Basic implementation: Create items with snapshots of salary
        // In a real scenario, this would involve complex calculations (attendance, leaves, deductions)
        const payrollItems = employees.map(emp => {
            const baseSalary = parseFloat(emp.base_salary || 0);
            return {
                payroll_period_id: period.id,
                user_id: emp.user_id,
                base_salary_snapshot: baseSalary,
                hourly_rate_snapshot: emp.hourly_rate || 0,
                // Simplified dummy calculation for gross pay
                gross_pay: baseSalary,
                net_pay: baseSalary * 0.8, // Assuming 20% flat tax for demonstration
                status: 'draft'
            };
        });

        await PayrollItem.bulkCreate(payrollItems, { transaction });

        await period.update({ status: 'processing' }, { transaction });

        await transaction.commit();
        res.json({ message: 'Payroll period processing initiated successfully' });

    } catch (error) {
        await transaction.rollback();
        console.error('Error processing payroll:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
