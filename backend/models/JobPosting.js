import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const JobPosting = sequelize.define('JobPosting', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    position_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'positions',
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    reference_code: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    requirements: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    responsibilities: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    qualifications: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    benefits: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    employment_type: {
        type: DataTypes.STRING(50),
        defaultValue: 'full_time',
        validate: {
            isIn: [['full_time', 'part_time', 'contract', 'intern', 'temporary']]
        }
    },
    experience_level: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    min_salary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    max_salary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    salary_currency: {
        type: DataTypes.STRING(3),
        defaultValue: 'USD'
    },
    location: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    is_remote: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    vacancies_count: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    applications_received: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    posting_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    closing_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: 'draft',
        validate: {
            isIn: [['draft', 'published', 'closed', 'archived']]
        }
    },
    published_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    closed_at: {
        type: DataTypes.DATE,
        allowNull: true
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
    tableName: 'job_postings',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
});

export default JobPosting;
