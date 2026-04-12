import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CourseProgress = sequelize.define('CourseProgress', {
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
    course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'courses',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('not_started', 'in_progress', 'completed'),
        defaultValue: 'not_started'
    },
    percent_complete: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    completed_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'course_progress',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['employee_id', 'course_id']
        }
    ]
});

export default CourseProgress;
