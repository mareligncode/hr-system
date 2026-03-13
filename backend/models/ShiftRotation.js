/**
 * ShiftRotation Model
 * 
 * Represents a rotational shift pattern that can be applied to employees
 * within a department. The rotation_pattern is a JSON array of shift_type_ids
 * representing the cycle order. Employees rotate through these shift types
 * over the specified cycle_days period.
 * 
 * Example rotation_pattern: [1, 2, 3, null]
 *   → Day 1: Morning shift (id=1)
 *   → Day 2: Evening shift (id=2) 
 *   → Day 3: Night shift (id=3)
 *   → Day 4: Day off (null)
 *   → Repeat...
 */

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ShiftRotation = sequelize.define('ShiftRotation', {
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
        type: DataTypes.STRING(100),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    rotation_pattern: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'Array of shift_type_ids in cycle order. null = day off.'
    },
    cycle_days: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 7,
        comment: 'Number of days in one complete rotation cycle'
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'When this rotation was first applied'
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
    tableName: 'shift_rotations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default ShiftRotation;
