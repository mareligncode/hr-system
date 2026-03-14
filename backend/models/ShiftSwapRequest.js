import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ShiftSwapRequest = sequelize.define('ShiftSwapRequest', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    requesting_employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'employees',
            key: 'user_id'
        }
    },
    target_employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'employees',
            key: 'user_id'
        }
    },
    shift_assignment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'shift_assignments',
            key: 'id'
        }
    },
    requested_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: 'pending',
        validate: {
            isIn: [['pending', 'approved', 'rejected', 'cancelled']]
        }
    },
    approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    approved_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'shift_swap_requests',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default ShiftSwapRequest;
