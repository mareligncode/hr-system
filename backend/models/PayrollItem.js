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
    tax_deduction: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
    },
    tip_amount: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
    },
    expenses_reimbursed: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
    },
    other_deductions: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
    },
    net_pay: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
    },
    payment_currency: {
        type: DataTypes.STRING(3),
        defaultValue: 'USD'
    },
    exchange_rate: {
        type: DataTypes.DECIMAL(10, 4),
        defaultValue: 1.0000
    },
    is_off_cycle: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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
