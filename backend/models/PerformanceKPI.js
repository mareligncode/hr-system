import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PerformanceKPI = sequelize.define('PerformanceKPI', {
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
    category: {
        type: DataTypes.ENUM('efficiency', 'quality', 'compliance', 'behavioral', 'custom'),
        allowNull: false,
        defaultValue: 'custom'
    },
    target_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    unit: {
        type: DataTypes.STRING(20),
        allowNull: true, // e.g., 'minutes', 'rating', '%'
        defaultValue: 'rating'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    department_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'departments',
            key: 'id'
        }
    }
}, {
    tableName: 'performance_kpis',
    timestamps: true,
    underscored: true
});

export default PerformanceKPI;
