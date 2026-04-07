import sequelize from './config/database.js';
import { Attendance } from './models/index.js';

const fixSchema = async () => {
    try {
        console.log('Starting schema fix...');
        const queryInterface = sequelize.getQueryInterface();
        const tableDescription = await queryInterface.describeTable('attendance');

        if (!tableDescription.admin_comment) {
            console.log('Adding admin_comment column to attendance table...');
            await queryInterface.addColumn('attendance', 'admin_comment', {
                type: 'TEXT',
                allowNull: true
            });
            console.log('Column added successfully.');
        } else {
            console.log('admin_comment column already exists.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error fixing schema:', error);
        process.exit(1);
    }
};

fixSchema();
