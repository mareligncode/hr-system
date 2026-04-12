import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Employee from './Employee.js';
import User from './User.js';

const EmployeeDocument = sequelize.define('EmployeeDocument', {
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
    document_type: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    document_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    file_path: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    file_size: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    mime_type: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    issue_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    expiry_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    issuing_authority: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    document_number: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    verified_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    verified_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    reminder_sent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    file_url: {
        type: DataTypes.VIRTUAL,
        get() {
            const path = this.getDataValue('file_path');
            if (!path) return null;
            if (path.startsWith('http')) return path;
            const baseUrl = process.env.API_URL || 'http://localhost:5000';
            return `${baseUrl}/${path.replace(/\\/g, '/')}`;
        }
    }
}, {
    tableName: 'employee_documents',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default EmployeeDocument;
