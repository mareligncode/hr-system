import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Asset = sequelize.define('Asset', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    asset_tag: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    category: {
        type: DataTypes.ENUM('electronics', 'furniture', 'vehicle', 'uniform', 'other'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('available', 'assigned', 'maintenance', 'lost', 'retired'),
        defaultValue: 'available'
    },
    serial_number: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    specifications: {
        type: DataTypes.JSON, // e.g., { ram: '16GB', storage: '512GB' }
        allowNull: true
    },
    purchase_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    purchase_cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    }
}, {
    tableName: 'assets',
    timestamps: true,
    underscored: true
});

export default Asset;
