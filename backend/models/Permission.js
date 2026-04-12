import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Permission = sequelize.define('Permission', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    code: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING(50), // e.g., 'employees', 'payroll', 'system'
        allowNull: false
    },
    description: {
        type: DataTypes.STRING(255)
    }
}, {
    tableName: 'permissions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Permission;
