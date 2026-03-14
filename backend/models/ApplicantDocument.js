import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ApplicantDocument = sequelize.define('ApplicantDocument', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    applicant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'applicants',
            key: 'id'
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
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    uploaded_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
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
    tableName: 'applicant_documents',
    timestamps: false
});

export default ApplicantDocument;
