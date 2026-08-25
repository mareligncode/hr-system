import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UserSession = sequelize.define('UserSession', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    session_token: {
        type: DataTypes.STRING(500),
        allowNull: false,
        unique: true
    },
    device_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    device_type: {
        type: DataTypes.ENUM('desktop', 'mobile', 'tablet', 'unknown'),
        defaultValue: 'unknown'
    },
    browser_name: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    browser_version: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    os_name: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    os_version: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: false
    },
    location: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'City, country, lat/lng from IP geolocation'
    },
    is_current: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Only one session can be current per user'
    },
    last_activity_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    terminated_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'user_sessions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['user_id']
        },
        {
            fields: ['session_token'],
            unique: true
        },
        {
            fields: ['last_activity_at']
        },
        {
            fields: ['expires_at']
        }
    ]
});

export default UserSession;