import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Department from './Department.js';
import Position from './Position.js';

const Employee = sequelize.define('Employee', {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    employee_number: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    position_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'positions',
            key: 'id'
        }
    },
    department_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'departments',
            key: 'id'
        }
    },
    reports_to: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    hire_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    contract_type: {
        type: DataTypes.STRING(20),
        defaultValue: 'permanent',
        validate: {
            isIn: [['permanent', 'contract', 'intern', 'part_time']]
        }
    },
    employment_status: {
        type: DataTypes.STRING(20),
        defaultValue: 'active',
        validate: {
            isIn: [['active', 'inactive', 'on_leave', 'terminated']]
        }
    },
    termination_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    probation_end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    contract_end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    // Personal Info
    date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    gender: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    marital_status: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    nationality: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    // Identification
    id_number: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    id_type: {
        type: DataTypes.STRING(20),
        defaultValue: 'national_id'
    },
    id_expiry_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    // Financial Info
    bank_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    bank_account_number: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    bank_account_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    tax_id: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    social_security_number: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    termination_reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // Address Info
    address_line1: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    address_line2: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    state: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    postal_code: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    country: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    // Emergency Contact
    emergency_contact_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    emergency_contact_phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    emergency_contact_relation: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    // More Financial Info
    bank_iban: {
        type: DataTypes.STRING(34),
        allowNull: true
    },
    bank_swift: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    // Work Contact Info
    work_email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: { isEmail: true }
    },
    work_phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    office_location: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    accommodation_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'accommodations',
            key: 'id'
        }
    },
    base_salary: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0
    },
    hourly_rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'employees',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Employee;
