import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AssetAssignment = sequelize.define('AssetAssignment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    asset_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'assets',
            key: 'id'
        }
    },
    employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'employees',
            key: 'user_id'
        }
    },
    assigned_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    returned_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    condition_on_assign: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    condition_on_return: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'asset_assignments',
    timestamps: true,
    underscored: true
});

export default AssetAssignment;
