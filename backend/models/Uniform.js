import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Uniform = sequelize.define('Uniform', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    item_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    gender: {
        type: DataTypes.ENUM('male', 'female', 'unisex'),
        defaultValue: 'unisex'
    },
    size: {
        type: DataTypes.STRING(10), // XS, S, M, L, XL, XXL, etc.
        allowNull: false
    },
    stock_quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    reorder_level: {
        type: DataTypes.INTEGER,
        defaultValue: 5
    },
    cost_per_unit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    }
}, {
    tableName: 'uniforms',
    timestamps: true,
    underscored: true
});

export default Uniform;
