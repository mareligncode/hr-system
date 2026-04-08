import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const LeaveBalance = sequelize.define('LeaveBalance', {
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
    year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: new Date().getFullYear()
    },
    accrued_days: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0
    },
    carried_forward: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0
    },
    used_days: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0
    },
    encashed_days: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0
    },
    balance: {
        type: DataTypes.VIRTUAL,
        get() {
            return parseFloat(this.accrued_days) + parseFloat(this.carried_forward) - parseFloat(this.used_days) - parseFloat(this.encashed_days);
        }
    },
    last_accrual_date: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'leave_balances',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['employee_id', 'leave_type_id', 'year']
        }
    ]
});

export default LeaveBalance;
