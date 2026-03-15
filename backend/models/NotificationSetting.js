import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const NotificationSetting = sequelize.define('NotificationSetting', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true, // A user has exactly one settings profile
    },
    email_notifications: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    push_notifications: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    in_app_notifications: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    // Granular preferences (could be expanded later)
    notify_on_leave_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    notify_on_payroll: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    notify_on_shift_swap: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
}, {
    tableName: 'notification_settings',
    timestamps: true,
});

export default NotificationSetting;
