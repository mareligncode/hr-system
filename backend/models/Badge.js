import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Badge = sequelize.define('Badge', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    icon: {
        type: DataTypes.STRING(100), // Lucide icon name or URL
        allowNull: true,
        defaultValue: 'Award'
    },
    color_code: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: '#3b82f6'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    tableName: 'badges',
    timestamps: true,
    underscored: true
});

export default Badge;
