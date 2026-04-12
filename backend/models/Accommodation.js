import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Accommodation = sequelize.define('Accommodation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    building_name: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    room_number: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    room_type: {
        type: DataTypes.ENUM('single', 'shared', 'studio', 'apartment'),
        defaultValue: 'shared'
    },
    capacity: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    occupancy_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    monthly_rent_charge: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('available', 'full', 'maintenance', 'reserved'),
        defaultValue: 'available'
    },
    features: {
        type: DataTypes.JSON, // e.g., { ac: true, wifi: true, kitchen: false }
        allowNull: true
    }
}, {
    tableName: 'accommodations',
    timestamps: true,
    underscored: true
});

export default Accommodation;
