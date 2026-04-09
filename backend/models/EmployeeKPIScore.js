import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EmployeeKPIScore = sequelize.define('EmployeeKPIScore', {
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
    kpi_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'performance_kpis',
            key: 'id'
        }
    },
    score: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    recorded_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    period_start: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    period_end: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    comments: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    recorded_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'employee_kpi_scores',
    timestamps: true,
    underscored: true
});

export default EmployeeKPIScore;
