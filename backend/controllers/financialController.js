import { Expense, TipPool, Employee, Department, User } from '../models/index.js';
import { logActivity } from '../services/auditService.js';

// Expense Reimbursment
export const submitExpense = async (req, res) => {
    try {
        const { amount, category, description, receipt_url, expense_date } = req.body;

        const employee = await Employee.findOne({ where: { user_id: req.user.id } });
        if (!employee) return res.status(404).json({ error: 'Employee profile not found' });

        const expense = await Expense.create({
            employee_id: req.user.id,
            amount,
            category,
            description,
            receipt_url,
            expense_date,
            status: 'pending'
        });

        res.status(201).json({ message: 'Expense submitted successfully', expense });
    } catch (error) {
        console.error('Submit Expense Error:', error);
        res.status(500).json({ error: 'Failed to submit expense' });
    }
};

export const getMyExpenses = async (req, res) => {
    try {
        const expenses = await Expense.findAll({
            where: { employee_id: req.user.id },
            order: [['expense_date', 'DESC']]
        });
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
};

export const getAllPendingExpenses = async (req, res) => {
    try {
        const expenses = await Expense.findAll({
            where: { status: 'pending' },
            include: [{ model: Employee, include: [{ model: User, attributes: ['first_name', 'last_name'] }] }],
            order: [['expense_date', 'ASC']]
        });
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pending expenses' });
    }
};

export const approveExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'

        const expense = await Expense.findByPk(id);
        if (!expense) return res.status(404).json({ error: 'Expense not found' });

        await expense.update({ status, approved_by: req.user.id });
        await logActivity(req.user.id, `EXPENSE_${status.toUpperCase()}`, 'Expense', id, null, { status }, req);

        res.status(200).json({ message: `Expense ${status} successfully` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process expense' });
    }
};

// Tip Pool Management
export const createTipPool = async (req, res) => {
    try {
        const { date, department_id, total_amount } = req.body;

        const pool = await TipPool.create({
            date,
            department_id,
            total_amount,
            status: 'pending'
        });

        res.status(201).json({ message: 'Tip pool logged successfully', pool });
    } catch (error) {
        console.error('Create TipPool Error:', error);
        res.status(500).json({ error: 'Failed to log tips' });
    }
};

export const getTipPools = async (req, res) => {
    try {
        const pools = await TipPool.findAll({
            include: [{ model: Department, attributes: ['name'] }],
            order: [['date', 'DESC']]
        });
        res.status(200).json(pools);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tip pools' });
    }
};
