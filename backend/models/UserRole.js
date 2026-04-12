import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UserRole = sequelize.define('UserRole', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'roles',
            key: 'id'
        }
    },
    department_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Scope role to a specific department (optional)
        references: {
            model: 'departments',
            key: 'id'
        }
    }
}, {
    tableName: 'user_roles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

export default UserRole;
