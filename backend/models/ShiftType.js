import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ShiftType = sequelize.define('ShiftType', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    department_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'departments',
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    code: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: false
    },
    start_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    end_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    break_duration_minutes: {
        type: DataTypes.INTEGER,
        defaultValue: 60
    },
    is_overnight: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    overtime_threshold_hours: {
        type: DataTypes.DECIMAL(3, 1),
        defaultValue: 8.0
    },
    grace_period_minutes: {
        type: DataTypes.INTEGER,
        defaultValue: 15
    },
    color_code: {
        type: DataTypes.STRING(7),
        defaultValue: '#3788d8'
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
    tableName: 'shift_types',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default ShiftType;
