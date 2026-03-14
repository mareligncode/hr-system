import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ShiftAssignment = sequelize.define('ShiftAssignment', {
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
    shift_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'shift_types',
            key: 'id'
        }
    },
    assignment_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    start_time: {
        type: DataTypes.TIME,
        allowNull: true
    },
    end_time: {
        type: DataTypes.TIME,
        allowNull: true
    },
    is_holiday: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_overtime: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: 'scheduled',
        validate: {
            isIn: [['scheduled', 'completed', 'missed', 'swapped']]
        },
        comment: 'Tracks assignment lifecycle: scheduled → completed/missed/swapped'
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'shift_assignments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default ShiftAssignment;
