import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DisciplinaryRecord = sequelize.define('DisciplinaryRecord', {
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
    incident_type: {
        type: DataTypes.STRING(100),
        allowNull: false, // e.g., 'Tardiness', 'Misconduct', 'Performance'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    action_taken: {
        type: DataTypes.ENUM('verbal_warning', 'written_warning', 'final_warning', 'suspension', 'pip', 'termination'),
        allowNull: false
    },
    incident_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    is_appealed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    appeal_notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('open', 'closed', 'under_review'),
        allowNull: false,
        defaultValue: 'open'
    },
    issued_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'disciplinary_records',
    timestamps: true,
    underscored: true
});

export default DisciplinaryRecord;
