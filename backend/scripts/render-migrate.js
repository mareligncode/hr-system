import sequelize from '../config/database.js';
import logger from '../utils/logger.js';

// Import all models to ensure they're registered
import '../models/index.js';

async function runMigrations() {
    try {
        logger.info('Starting Render migration process...');
        
        // Test database connection
        await sequelize.authenticate();
        logger.info('Database connection established.');

        // Sync the models (in production, you should use proper migrations)
        logger.info('Syncing database models...');
        await sequelize.sync({ alter: true });
        logger.info('Database sync completed successfully.');

        // Close the connection
        await sequelize.close();
        logger.info('Migration process completed.');
        process.exit(0);
        
    } catch (error) {
        logger.error({ err: error }, 'Migration failed');
        process.exit(1);
    }
}

runMigrations();