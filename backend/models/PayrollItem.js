import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PayrollItem = sequelize.define('PayrollItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    payroll_period_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'payroll_periods',
            key: 'id'
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    base_salary_snapshot: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
    },
    hourly_rate_snapshot: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    total_hours: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    overtime_hours: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    gross_pay: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
    },
    net_pay: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('draft', 'reviewed', 'approved'),
        defaultValue: 'draft'
    }
}, {
    tableName: 'payroll_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default PayrollItem;
