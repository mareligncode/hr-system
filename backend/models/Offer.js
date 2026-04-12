import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Offer = sequelize.define('Offer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    job_application_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'job_applications',
            key: 'id'
        }
    },
    offer_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    expiry_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    joining_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    base_salary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    bonus_potential: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    benefits: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    offer_letter_path: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: 'draft',
        validate: {
            isIn: [['draft', 'sent', 'accepted', 'rejected', 'withdrawn']]
        }
    },
    sent_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    accepted_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    rejected_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'offers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Offer;
