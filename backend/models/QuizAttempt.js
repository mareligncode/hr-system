import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const QuizAttempt = sequelize.define('QuizAttempt', {
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
    score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false
    },
    passed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    attempt_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'quiz_attempts',
    timestamps: true,
    underscored: true
});

export default QuizAttempt;
