import jwt from 'jsonwebtoken';
import { User, Role, Permission, Department } from '../models/index.js';

export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password_hash'] },
                include: [
                    {
                        model: Role,
                        include: [{ model: Permission }]
                    }
                ]
            });

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // Flatten permissions for easier checking
            const permissions = new Set();

            // Get from Base string role
            const primaryRole = await Role.findOne({
                where: { code: req.user.role },
                include: [Permission]
            });
            primaryRole?.Permissions?.forEach(p => permissions.add(p.code));

            // Get from joined roles
            req.user.Roles?.forEach(role => {
                role.Permissions?.forEach(permission => {
                    permissions.add(permission.code);
                });
            });
            req.user.permissions = Array.from(permissions);

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Middleware to restrict access by role (Legacy / Simple check)
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role '${req.user.role}' is not authorized to access this resource`
            });
        }
        next();
    };
};

// Advanced middleware to check specific permissions
export const hasPermission = (permissionCode) => {
    return (req, res, next) => {
        if (req.user.role === 'admin' || req.user.permissions.includes(permissionCode)) {
            return next();
        }
        return res.status(403).json({
            message: `You do not have the required permission: ${permissionCode}`
        });
    };
};

// Middleware to check if user has access to a specific department or its sub-departments
export const checkDepartmentScope = async (req, res, next) => {
    try {
        const { department_id } = req.body || req.query || req.params;

        if (!department_id) return next();
        if (req.user.role === 'admin' || req.user.role === 'hr') return next();

        // Check if user has a role scoped to this department
        const scopedRole = req.user.Roles.find(role => {
            const assignment = role.UserRole; // Sequelize pivot data
            return assignment && assignment.department_id === parseInt(department_id);
        });

        if (scopedRole) return next();

        // Check if user is the manager of the department
        const department = await Department.findByPk(department_id);
        if (department && department.manager_id === req.user.id) return next();

        return res.status(403).json({
            message: 'Access denied: You are not authorized to manage this department'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
