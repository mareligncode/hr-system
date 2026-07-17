import { Role, Permission, User, UserRole } from '../models/index.js';
import { logActivity } from '../services/auditService.js';

export const createRole = async (req, res) => {
    try {
        const { name, code, description, permissionIds } = req.body;
        const role = await Role.create({ name, code, description });

        if (permissionIds && permissionIds.length > 0) {
            await role.setPermissions(permissionIds);
        }

        await logActivity(req.user.id, 'CREATE', 'Role', role.id, null, role.toJSON(), req);
        res.status(201).json(role);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getRoles = async (req, res) => {
    try {
        const roles = await Role.findAll({
            include: [{ model: Permission }]
        });
        res.status(200).json(roles);
    } catch (error) {
        console.error('Fetch Roles Error:', error);
        res.status(500).json({
            message: 'Failed to fetch roles',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const updateRole = async (req, res) => {
    try {
        const role = await Role.findByPk(req.params.id);
        if (!role) return res.status(404).json({ error: 'Role not found' });

        const oldValues = role.toJSON();
        await role.update(req.body);

        if (req.body.permissionIds) {
            await role.setPermissions(req.body.permissionIds);
        }

        await logActivity(req.user.id, 'UPDATE', 'Role', role.id, oldValues, role.toJSON(), req);
        res.status(200).json(role);
    } catch (error) {
        console.error('Update Role Error:', error);
        res.status(400).json({
            message: 'Failed to update role',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const deleteRole = async (req, res) => {
    try {
        const role = await Role.findByPk(req.params.id);
        if (!role) return res.status(404).json({ error: 'Role not found' });
        if (role.is_system) return res.status(400).json({ error: 'Cannot delete system roles' });

        const oldValues = role.toJSON();
        await role.destroy();
        await logActivity(req.user.id, 'DELETE', 'Role', req.params.id, oldValues, null, req);
        res.status(200).json({ message: 'Role deleted' });
    } catch (error) {
        console.error('Delete Role Error:', error);
        res.status(500).json({
            message: 'Failed to delete role',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const assignRoleToUser = async (req, res) => {
    try {
        const { userId, roleId, departmentId } = req.body;
        const user = await User.findByPk(userId);
        const role = await Role.findByPk(roleId);

        if (!user || !role) return res.status(404).json({ error: 'User or Role not found' });

        // Check if already assigned
        const existingAssignment = await UserRole.findOne({ where: { user_id: userId, role_id: roleId } });
        if (existingAssignment) return res.status(400).json({ error: 'Role already assigned to user' });

        await UserRole.create({ user_id: userId, role_id: roleId, department_id: departmentId });

        await logActivity(req.user.id, 'ASSIGN_ROLE', 'User', userId, null, { roleId, departmentId }, req);
        res.status(200).json({ message: 'Role assigned successfully' });
    } catch (error) {
        console.error('Assign Role Error:', error);
        res.status(400).json({
            message: 'Failed to assign role',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const unassignRoleFromUser = async (req, res) => {
    try {
        const { userId, roleId } = req.body;

        if (!userId || !roleId) {
            return res.status(400).json({ error: 'userId and roleId are required' });
        }

        const assignment = await UserRole.findOne({ where: { user_id: userId, role_id: roleId } });
        if (!assignment) return res.status(404).json({ error: 'Role assignment not found' });

        await assignment.destroy();
        await logActivity(req.user.id, 'UNASSIGN_ROLE', 'User', userId, { roleId }, null, req);
        res.status(200).json({ message: 'Role unassigned successfully' });
    } catch (error) {
        console.error('Unassign Role Error:', error);
        res.status(500).json({
            message: 'Failed to unassign role',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const getPermissions = async (req, res) => {
    try {
        const permissions = await Permission.findAll();
        res.status(200).json(permissions);
    } catch (error) {
        console.error('Fetch Permissions Error:', error);
        res.status(500).json({
            message: 'Failed to fetch permissions',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
