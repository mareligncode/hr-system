import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EmployeeBadge = sequelize.define('EmployeeBadge', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'employees',
            key: 'user_id'
        }
    },
    badge_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'badges',
            key: 'id'
        }
    },
    nominated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('nominated', 'awarded', 'rejected'),
        allowNull: false,
        defaultValue: 'awarded'
    },
    awarded_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'employee_badges',
    timestamps: true,
    underscored: true
});

export default EmployeeBadge;
