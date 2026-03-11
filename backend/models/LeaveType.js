import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const LeaveType = sequelize.define('LeaveType', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    days_per_year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    carry_forward_limit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    min_notice_days: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    max_consecutive_days: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 30
    },
    requires_approval: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    requires_document: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    is_paid: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    applicable_gender: {
        type: DataTypes.ENUM('all', 'male', 'female'),
        allowNull: false,
        defaultValue: 'all'
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'leave_types',
    timestamps: true,
    underscored: true
});

export default LeaveType;
