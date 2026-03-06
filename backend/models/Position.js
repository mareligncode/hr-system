import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Department from './Department.js';

const Position = sequelize.define('Position', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    department_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'departments',
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    code: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: false,
        validate: {
            isAlphanumeric: true,
            isUppercase: true
        }
    },
    grade: {
        type: DataTypes.STRING(10),
        defaultValue: '1'
    },
    job_description: {
        type: DataTypes.TEXT
    },
    requirements: {
        type: DataTypes.TEXT
    },
    salary_range_min: {
        type: DataTypes.DECIMAL(10, 2),
        validate: {
            min: 0
        }
    },
    salary_range_max: {
        type: DataTypes.DECIMAL(10, 2),
        validate: {
            isGreaterThanMin(value) {
                if (this.salary_range_min && parseFloat(value) < parseFloat(this.salary_range_min)) {
                    throw new Error('Maximum salary must be greater than or equal to minimum salary.');
                }
            }
        }
    },
    hourly_rate_default: {
        type: DataTypes.DECIMAL(8, 2),
        validate: {
            min: 0
        }
    },
    is_management: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    requires_certification: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'positions',
    timestamps: true,
    paranoid: true, // Soft deletes
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
});

Position.belongsTo(Department, { foreignKey: 'department_id' });
Department.hasMany(Position, { foreignKey: 'department_id' });

export default Position;
