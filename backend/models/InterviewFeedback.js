import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const InterviewFeedback = sequelize.define('InterviewFeedback', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    interview_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'interviews',
            key: 'id'
        }
    },
    interviewer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    feedback_text: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    strengths: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    weaknesses: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    technical_score: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: true
    },
    communication_score: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: true
    },
    cultural_fit_score: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: true
    },
    overall_score: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: true
    },
    recommendation: {
        type: DataTypes.STRING(50),
        allowNull: true,
        validate: {
            isIn: [['hire', 'not_hire', 'neutral', 'another_round']]
        }
    },
    submitted_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'interview_feedbacks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default InterviewFeedback;
