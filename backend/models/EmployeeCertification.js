import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Employee from './Employee.js';
import User from './User.js';

const EmployeeCertification = sequelize.define('EmployeeCertification', {
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
    certification_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    certification_code: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    issuing_body: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    issue_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    expiry_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    certificate_number: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    file_path: {
        type: DataTypes.STRING(500),
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
    reminder_days_before: {
        type: DataTypes.INTEGER,
        defaultValue: 30
    },
    reminder_sent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'employee_certifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default EmployeeCertification;
