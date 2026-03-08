import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcrypt';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    employee_id: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    first_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING(20)
    },
    profile_picture: {
        type: DataTypes.STRING(255)
    },
    language_preference: {
        type: DataTypes.STRING(10),
        defaultValue: 'en'
    },
    role: {
        type: DataTypes.ENUM('admin', 'hr', 'manager', 'finance', 'employee', 'recruiter'),
        defaultValue: 'employee'
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: 'pending'
    },
    email_verified_at: {
        type: DataTypes.DATE
    },
    last_login_at: {
        type: DataTypes.DATE
    },
    last_login_ip: {
        type: DataTypes.STRING(45)
    },
    reset_code: {
        type: DataTypes.STRING(6),
        allowNull: true
    },
    reset_code_expires_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'users',
    timestamps: true,
    paranoid: true, // Enables deleted_at
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    hooks: {
        beforeCreate: async (user) => {
            if (user.password_hash) {
                user.password_hash = await bcrypt.hash(user.password_hash, 10);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password_hash')) {
                user.password_hash = await bcrypt.hash(user.password_hash, 10);
            }
        }
    }
});

// Instance method to check password validity
User.prototype.validPassword = async function (password) {
    return await bcrypt.compare(password, this.password_hash);
};

export default User;
