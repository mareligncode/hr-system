import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AttendanceBreak = sequelize.define('AttendanceBreak', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    attendance_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'attendance',
            key: 'id'
        }
    },
    type: {
        type: DataTypes.STRING(20),
        defaultValue: 'lunch', // lunch, coffee, short
        validate: {
            isIn: [['lunch', 'coffee', 'short', 'other']]
        }
    },
    start_time: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    duration_minutes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'attendance_breaks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default AttendanceBreak;
