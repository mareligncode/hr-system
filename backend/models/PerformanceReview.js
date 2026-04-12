import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PerformanceReview = sequelize.define('PerformanceReview', {
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
    reviewer_id: {
        type: DataTypes.INTEGER,
        allowNull: false, // In 360 feedback, this can be peer, subordinate, or manager
        references: {
            model: 'users',
            key: 'id'
        }
    },
    type: {
        type: DataTypes.ENUM('self', 'manager', 'peer', 'subordinate'),
        allowNull: false
    },
    period_name: {
        type: DataTypes.STRING(50),
        allowNull: false, // e.g., 'Q1 2024', 'Annual 2023'
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: true, // 1-5 or 1-10
    },
    strengths: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    areas_for_improvement: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    general_comments: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('draft', 'submitted', 'finalized'),
        allowNull: false,
        defaultValue: 'draft'
    }
}, {
    tableName: 'performance_reviews',
    timestamps: true,
    underscored: true
});

export default PerformanceReview;
