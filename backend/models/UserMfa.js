import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UserMfa = sequelize.define('UserMfa', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    secret_key: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Encrypted TOTP secret'
    },
    backup_codes: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array of hashed backup codes'
    },
    is_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    enabled_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    last_used_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    recovery_used_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Number of backup codes used'
    }
}, {
    tableName: 'user_mfa',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default UserMfa;