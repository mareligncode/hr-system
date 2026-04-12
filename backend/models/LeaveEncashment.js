import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const LeaveEncashment = sequelize.define('LeaveEncashment', {
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
    leave_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'leave_types',
            key: 'id'
        }
    },
    request_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    days_to_encash: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false
    },
    amount_per_day: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'paid'),
        allowNull: false,
        defaultValue: 'pending'
    },
    approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    approved_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    comments: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'leave_encashments',
    timestamps: true,
    underscored: true
});

export default LeaveEncashment;
