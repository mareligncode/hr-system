import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PayrollPeriod = sequelize.define('PayrollPeriod', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('open', 'processing', 'completed', 'approved'),
        defaultValue: 'open'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'payroll_periods',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default PayrollPeriod;
