import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Interview = sequelize.define('Interview', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    job_application_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'job_applications',
            key: 'id'
        }
    },
    interviewer_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    interview_type: {
        type: DataTypes.STRING(50),
        defaultValue: 'in_person',
        validate: {
            isIn: [['in_person', 'online', 'phone']]
        }
    },
    interview_round: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    scheduled_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    duration_minutes: {
        type: DataTypes.INTEGER,
        defaultValue: 60
    },
    location: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    meeting_link: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: 'scheduled',
        validate: {
            isIn: [['scheduled', 'completed', 'cancelled', 'rescheduled']]
        }
    },
    reschedule_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
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
    tableName: 'interviews',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Interview;
