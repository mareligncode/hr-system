import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Attendance = sequelize.define('Attendance', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    clock_in: {
        type: DataTypes.DATE,
        allowNull: false
    },
    clock_out: {
        type: DataTypes.DATE,
        allowNull: true
    },
    work_hours: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    overtime_hours: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: 'pending',
        validate: {
            isIn: [['pending', 'approved', 'rejected']]
        }
    },
    location_in: {
        type: DataTypes.JSON,
        allowNull: true
    },
    location_out: {
        type: DataTypes.JSON,
        allowNull: true
    },
    selfie_in: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    selfie_out: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    verified_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    admin_comment: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'attendance',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Attendance;
