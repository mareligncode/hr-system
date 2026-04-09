import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const QuizQuestion = sequelize.define('QuizQuestion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'courses',
            key: 'id'
        }
    },
    question_text: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    options: {
        type: DataTypes.JSON, // Array of strings: ['Option A', 'Option B', ...]
        allowNull: false
    },
    correct_option_index: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    explanation: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'quiz_questions',
    timestamps: true,
    underscored: true
});

export default QuizQuestion;
