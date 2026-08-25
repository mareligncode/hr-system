import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const LoginAttempt = sequelize.define('LoginAttempt', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Email attempted (may not exist in users table)'
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        comment: 'NULL if email not found'
    },
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: false
    },
    user_agent: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    success: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    failure_reason: {
        type: DataTypes.ENUM(
            'user_not_found',
            'invalid_password',
            'account_locked',
            'account_inactive',
            'mfa_required',
            'mfa_failed'
        ),
        allowNull: true
    },
    location: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Geolocation data from IP'
    },
    attempted_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'login_attempts',
    timestamps: false,
    indexes: [
        {
            fields: ['email']
        },
        {
            fields: ['user_id']
        },
        {
            fields: ['ip_address']
        },
        {
            fields: ['attempted_at']
        },
        {
            fields: ['email', 'attempted_at']
        }
    ]
});

export default LoginAttempt;