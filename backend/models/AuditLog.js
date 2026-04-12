import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const AuditLog = sequelize.define('AuditLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    action: {
        type: DataTypes.STRING(50), // CREATE, UPDATE, DELETE, LOGIN
        allowNull: false
    },
    model: {
        type: DataTypes.STRING(50), // Employee, Department, etc.
        allowNull: false
    },
    model_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    old_values: {
        type: DataTypes.JSON,
        allowNull: true
    },
    new_values: {
        type: DataTypes.JSON,
        allowNull: true
    },
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    user_agent: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'audit_logs',
    timestamps: true,
    updatedAt: false, // Audit logs are immutable
    createdAt: 'created_at'
});

export default AuditLog;
