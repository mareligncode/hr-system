import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    type: {
        // e.g., 'info', 'alert', 'success', 'warning'
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'info',
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    link: {
        // Optional deep link for frontend navigation
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    related_entity_type: {
        // e.g., 'LeaveRequest', 'JobApplication'
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    related_entity_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
    }
}, {
    tableName: 'notifications',
    timestamps: true,
});

export default Notification;
