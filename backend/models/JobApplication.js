import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const JobApplication = sequelize.define('JobApplication', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    job_posting_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'job_postings',
            key: 'id'
        }
    },
    applicant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'applicants',
            key: 'id'
        }
    },
    application_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    cover_letter: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    resume_path: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    portfolio_path: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: 'applied',
        validate: {
            isIn: [['applied', 'screening', 'interview', 'offer', 'hired', 'rejected', 'withdrawn']]
        }
    },
    status_history: {
        type: DataTypes.JSON,
        allowNull: true
    },
    current_stage: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    matching_score: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    resume_url: {
        type: DataTypes.VIRTUAL,
        get() {
            const path = this.getDataValue('resume_path');
            if (!path) return null;
            if (path.startsWith('http')) return path;
            const baseUrl = process.env.API_URL || 'http://localhost:5000';
            return `${baseUrl}/${path.replace(/\\/g, '/')}`;
        }
    }
}, {
    tableName: 'job_applications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default JobApplication;
