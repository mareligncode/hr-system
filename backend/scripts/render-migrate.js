import sequelize from '../config/database.js';
import logger from '../utils/logger.js';

// Import all models to ensure they're registered
import '../models/index.js';
import { User, Role } from '../models/index.js';

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

        // Seed admin user and roles
        logger.info('Seeding admin user and roles...');

        // Create admin role
        const [adminRole] = await Role.findOrCreate({
            where: { code: 'admin' },
            defaults: {
                name: 'Admin',
                code: 'admin',
                description: 'Full system access',
                is_system: true
            }
        });

        // Create admin user
        const adminEmail = 'admin@hotel.com';
        const adminPassword = 'Admin@1234';

        const [adminUser, created] = await User.findOrCreate({
            where: { email: adminEmail },
            defaults: {
                employee_id: 'SYSTEM001',
                email: adminEmail,
                password_hash: adminPassword,
                first_name: 'System',
                last_name: 'Administrator',
                role: 'admin',
                status: 'active',
                email_verified_at: new Date()
            }
        });

        if (created) {
            logger.info('Super Admin created!');
            logger.info(`Email: ${adminEmail}`);
            logger.info(`Password: ${adminPassword}`);
        } else {
            logger.info('Admin user already exists, refreshing role and status');
            await adminUser.update({ role: 'admin', status: 'active' });
        }

        // Seed standard roles
        const standardRoles = [
            { code: 'hr', name: 'HR Manager' },
            { code: 'manager', name: 'Department Manager' },
            { code: 'finance', name: 'Finance Officer' },
            { code: 'employee', name: 'Employee' },
            { code: 'gm', name: 'General Manager' },
        ];

        for (const r of standardRoles) {
            await Role.findOrCreate({
                where: { code: r.code },
                defaults: { name: r.name, code: r.code, is_system: true }
            });
        }

        logger.info('Seeding completed successfully.');

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