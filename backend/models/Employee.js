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
    }
}, {
    tableName: 'employees',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

Employee.belongsTo(User, { foreignKey: 'user_id' });
Employee.belongsTo(Department, { foreignKey: 'department_id' });
Employee.belongsTo(Position, { foreignKey: 'position_id' });
Employee.belongsTo(User, { as: 'Manager', foreignKey: 'reports_to' });

User.hasOne(Employee, { foreignKey: 'user_id' });

export default Employee;
