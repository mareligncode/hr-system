import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TipPool = sequelize.define('TipPool', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    department_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'departments',
            key: 'id'
        }
    },
    total_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'distributed'),
        defaultValue: 'pending'
    },
    distributed_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'tip_pools',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default TipPool;
