import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const WelfareRequest = sequelize.define('WelfareRequest', {
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
    request_type: {
        type: DataTypes.ENUM('mental_health', 'financial_aid', 'grievance', 'internal_transfer', 'other'),
        allowNull: false
    },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
        defaultValue: 'low'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    supporting_document: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'under_review', 'approved', 'rejected', 'resolved'),
        defaultValue: 'pending'
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    handled_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'welfare_requests',
    timestamps: true,
    underscored: true
});

export default WelfareRequest;
