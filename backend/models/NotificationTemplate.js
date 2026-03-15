import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const NotificationTemplate = sequelize.define('NotificationTemplate', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        // e.g., 'leave_approved', 'welcome_email'
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    subject: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    body: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    channels: {
        // JSON array of channels this template applies to: ['email', 'in_app']
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: ['in_app']
    },
    variables: {
        // Description of available variables e.g., '{"user_name": "First Name"}'
        type: DataTypes.JSON,
        allowNull: true,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
}, {
    tableName: 'notification_templates',
    timestamps: true,
});

export default NotificationTemplate;
