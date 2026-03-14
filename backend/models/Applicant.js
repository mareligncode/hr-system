import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Applicant = sequelize.define('Applicant', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    first_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    address: {
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
    country: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    postal_code: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    gender: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    nationality: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    current_job_title: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    current_company: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    experience_years: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    education_level: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    field_of_study: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    portfolio_url: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    linkedin_url: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    github_url: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    source: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    source_channel_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    referral_employee_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'employees',
            key: 'user_id'
        }
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: 'new'
    },
    rating: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'applicants',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Applicant;
