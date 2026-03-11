import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const LeaveRequest = sequelize.define('LeaveRequest', {
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
    leave_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'leave_types',
            key: 'id'
        }
    },
    request_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    return_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    days_requested: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false
    },
    is_half_day: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    half_day_session: {
        type: DataTypes.ENUM('morning', 'afternoon'),
        allowNull: true
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    document_path: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    emergency_contact: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    handover_notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
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
    },
    comments: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'leave_requests',
    timestamps: true,
    underscored: true
});

export default LeaveRequest;
