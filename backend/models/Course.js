import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Course = sequelize.define('Course', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING(50), // e.g., 'Onboarding', 'Safety', 'Service'
        allowNull: false
    },
    department_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'departments',
            key: 'id'
        }
    },
    video_url: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    thumbnail_url: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    estimated_minutes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    is_mandatory: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
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
    tableName: 'courses',
    timestamps: true,
    underscored: true
});

export default Course;
