import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ShiftTemplate = sequelize.define('ShiftTemplate', {
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
    pattern: {
        type: DataTypes.JSON,
        allowNull: false
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    is_recurring: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
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
    tableName: 'shift_templates',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default ShiftTemplate;
