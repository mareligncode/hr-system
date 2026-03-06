import Department from '../models/Department.js';
import User from '../models/User.js';
import sequelize from '../config/database.js';

// Get all departments with related data
export const getAllDepartments = async (req, res) => {
    try {
        const { is_active } = req.query;
        const whereClause = {};
        if (is_active !== undefined) whereClause.is_active = is_active === 'true';

        const departments = await Department.findAll({
            where: whereClause,
            include: [
                { model: Department, as: 'ParentDepartment', attributes: ['id', 'name', 'code'] },
                { model: User, as: 'Manager', attributes: ['id', 'first_name', 'last_name', 'email'] }
            ],
            order: [['name', 'ASC']]
        });
        res.status(200).json(departments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch departments', details: error.message });
    }
};

// Recursive Hierarchy Builder
const buildHierarchy = (items, parentId = null) => {
    const branch = [];
    const children = items.filter(item => item.parent_department_id === parentId);

    for (const child of children) {
        const item = child.toJSON();
        const subDepartments = buildHierarchy(items, item.id);
        if (subDepartments.length > 0) {
            item.subDepartments = subDepartments;
        }
        branch.push(item);
    }
    return branch;
};

// Get department hierarchy
export const getDepartmentHierarchy = async (req, res) => {
    try {
        const allDepartments = await Department.findAll({
            include: [
                { model: User, as: 'Manager', attributes: ['id', 'first_name', 'last_name', 'profile_picture'] }
            ]
        });
        const hierarchy = buildHierarchy(allDepartments);
        res.status(200).json(hierarchy);
    } catch (error) {
        res.status(500).json({ error: 'Failed to build department hierarchy', details: error.message });
    }
};

// Create department with transaction
export const createDepartment = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const department = await Department.create(req.body, { transaction: t });
        await t.commit();
        res.status(201).json(department);
    } catch (error) {
        await t.rollback();
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Validation Error', details: error.errors.map(e => e.message) });
        }
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

// Get department by ID
export const getDepartmentById = async (req, res) => {
    try {
        const department = await Department.findByPk(req.params.id, {
            include: [
                { model: Department, as: 'ParentDepartment' },
                { model: Department, as: 'SubDepartments' },
                { model: User, as: 'Manager', attributes: ['id', 'first_name', 'last_name', 'email', 'phone'] }
            ]
        });
        if (!department) return res.status(404).json({ error: 'Department not found' });
        res.status(200).json(department);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching department details', details: error.message });
    }
};

// Update department
export const updateDepartment = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const department = await Department.findByPk(req.params.id);
        if (!department) {
            await t.rollback();
            return res.status(404).json({ error: 'Department not found' });
        }

        await department.update(req.body, { transaction: t });
        await t.commit();

        const updatedDepartment = await Department.findByPk(req.params.id, {
            include: [{ model: Department, as: 'ParentDepartment' }]
        });
        res.status(200).json(updatedDepartment);
    } catch (error) {
        await t.rollback();
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ error: 'Validation Error', details: error.errors.map(e => e.message) });
        }
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

// Soft delete department
export const deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findByPk(req.params.id);
        if (!department) return res.status(404).json({ error: 'Department not found' });

        // Check if there are sub-departments before deleting
        const subCount = await Department.count({ where: { parent_department_id: req.params.id } });
        if (subCount > 0) {
            return res.status(400).json({ error: 'Cannot delete department that has sub-departments' });
        }

        await department.destroy();
        res.status(200).json({ message: 'Department soft-deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete department', details: error.message });
    }
};

// Restore soft-deleted department
export const restoreDepartment = async (req, res) => {
    try {
        const department = await Department.findByPk(req.params.id, { paranoid: false });
        if (!department) return res.status(404).json({ error: 'Department not found' });

        await department.restore();
        res.status(200).json({ message: 'Department restored successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to restore department', details: error.message });
    }
};
