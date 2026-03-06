import Position from '../models/Position.js';
import Department from '../models/Department.js';
import sequelize from '../config/database.js';

// Get all positions with advanced filtering
export const getAllPositions = async (req, res) => {
    try {
        const { department_id, is_management, is_active, grade } = req.query;
        const whereClause = {};

        if (department_id) whereClause.department_id = department_id;
        if (is_management !== undefined) whereClause.is_management = is_management === 'true';
        if (is_active !== undefined) whereClause.is_active = is_active === 'true';
        if (grade) whereClause.grade = grade;

        const positions = await Position.findAll({
            where: whereClause,
            include: {
                model: Department,
                attributes: ['id', 'name', 'code', 'location']
            },
            order: [['grade', 'ASC'], ['title', 'ASC']]
        });
        res.status(200).json(positions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch positions', details: error.message });
    }
};

// Get position by ID
export const getPositionById = async (req, res) => {
    try {
        const position = await Position.findByPk(req.params.id, {
            include: { model: Department }
        });
        if (!position) return res.status(404).json({ error: 'Position not found' });
        res.status(200).json(position);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching position details', details: error.message });
    }
};

// Create position
export const createPosition = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const position = await Position.create(req.body, { transaction: t });
        await t.commit();
        res.status(201).json(position);
    } catch (error) {
        await t.rollback();
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ error: 'Validation Error', details: error.errors.map(e => e.message) });
        }
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

// Update position
export const updatePosition = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const position = await Position.findByPk(req.params.id);
        if (!position) {
            await t.rollback();
            return res.status(404).json({ error: 'Position not found' });
        }

        await position.update(req.body, { transaction: t });
        await t.commit();

        const updatedPosition = await Position.findByPk(req.params.id, { include: [Department] });
        res.status(200).json(updatedPosition);
    } catch (error) {
        await t.rollback();
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ error: 'Validation Error', details: error.errors.map(e => e.message) });
        }
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

// Soft delete position
export const deletePosition = async (req, res) => {
    try {
        const position = await Position.findByPk(req.params.id);
        if (!position) return res.status(404).json({ error: 'Position not found' });

        await position.destroy();
        res.status(200).json({ message: 'Position soft-deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete position', details: error.message });
    }
};

// Restore position
export const restorePosition = async (req, res) => {
    try {
        const position = await Position.findByPk(req.params.id, { paranoid: false });
        if (!position) return res.status(404).json({ error: 'Position not found' });

        await position.restore();
        res.status(200).json({ message: 'Position restored successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to restore position', details: error.message });
    }
};

// Get positions by department
export const getPositionsByDepartment = async (req, res) => {
    try {
        const positions = await Position.findAll({
            where: { department_id: req.params.departmentId },
            include: { model: Department, attributes: ['name'] }
        });
        res.status(200).json(positions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch positions for department', details: error.message });
    }
};
