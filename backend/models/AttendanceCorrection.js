import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AttendanceCorrection = sequelize.define('AttendanceCorrection', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    attendance_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'attendance',
            key: 'id'
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    requested_clock_in: {
        type: DataTypes.DATE,
        allowNull: true
    },
    requested_clock_out: {
        type: DataTypes.DATE,
        allowNull: true
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: 'pending',
        validate: {
            isIn: [['pending', 'approved', 'rejected']]
        }
    },
    manager_comment: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'attendance_corrections',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default AttendanceCorrection;
