import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RefreshToken = sequelize.define('RefreshToken', {
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
    token: {
        type: DataTypes.STRING(500),
        allowNull: false,
        unique: true
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    device_info: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Device fingerprint, user agent, OS info'
    },
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    is_revoked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    revoked_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'refresh_tokens',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['user_id']
        },
        {
            fields: ['token'],
            unique: true
        },
        {
            fields: ['expires_at']
        }
    ]
});

export default RefreshToken;