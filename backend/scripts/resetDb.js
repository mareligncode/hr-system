import sequelize from '../config/database.js';

const cleanDatabase = async () => {
    try {
        console.log('Starting Database Cleanup...');

        // Disable foreign key checks to allow dropping tables
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

        // Sync with force: true to DROP and RECREATE everything
        // WARNING: THIS DELETES ALL DATA
        await sequelize.sync({ force: true });

        // Re-enable foreign key checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('Database has been completely reset and cleaned.');
        process.exit(0);
    } catch (error) {
        console.error('Cleanup Failed:', error);
        process.exit(1);
    }
};

cleanDatabase();
