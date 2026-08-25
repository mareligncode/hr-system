// Load env vars BEFORE importing any models or config.
// When running inside Docker via "docker compose exec", DOCKER=true is not
// automatically inherited — so we check explicitly and load the right config.
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Only load .env when not in Docker (i.e. running locally outside containers)
if (process.env.DOCKER !== 'true') {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

import { User, Role } from '../models/index.js';
import sequelize from '../config/database.js';

const initAdmin = async () => {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Connected. Syncing schema...');
        await sequelize.sync({ alter: true });
        console.log('Schema ready. Initializing Super Admin...\n');

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
        const adminEmail    = 'admin@hotel.com';
        const adminPassword = 'Admin@1234';   // stronger default

        const [adminUser, created] = await User.findOrCreate({
            where: { email: adminEmail },
            defaults: {
                employee_id:       'SYSTEM001',
                email:             adminEmail,
                password_hash:     adminPassword,   // hashed by User beforeCreate hook
                first_name:        'System',
                last_name:         'Administrator',
                role:              'admin',
                status:            'active',
                email_verified_at: new Date()
            }
        });

        if (created) {
            console.log('✅ Super Admin created!');
            console.log('   Email:    ' + adminEmail);
            console.log('   Password: ' + adminPassword);
            console.log('\n⚠️  Change this password after your first login!\n');
        } else {
            console.log('ℹ️  Admin user already exists (' + adminEmail + ')');
            await adminUser.update({ role: 'admin', status: 'active' });
            console.log('   Role and status refreshed.\n');
        }

        // Seed all standard roles
        console.log('Seeding standard roles...');
        const standardRoles = [
            { code: 'hr',       name: 'HR Manager' },
            { code: 'manager',  name: 'Department Manager' },
            { code: 'finance',  name: 'Finance Officer' },
            { code: 'employee', name: 'Employee' },
            { code: 'gm',       name: 'General Manager' },
        ];

        for (const r of standardRoles) {
            const [, roleCreated] = await Role.findOrCreate({
                where: { code: r.code },
                defaults: { name: r.name, code: r.code, is_system: true }
            });
            console.log('   ' + (roleCreated ? '✅ Created' : '✔  Exists ') + '  ' + r.name);
        }

        console.log('\n✅ Setup completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Setup failed:', error.message);
        console.error(error);
        process.exit(1);
    }
};

initAdmin();
