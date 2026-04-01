import { User, Role, Permission } from '../models/index.js';
import sequelize from '../config/database.js';

const initAdmin = async () => {
    try {
        console.log('Initializing Super Admin...');

        const [adminRole] = await Role.findOrCreate({
            where: { code: 'admin' },
            defaults: { name: 'Admin', code: 'admin', description: 'Full system access', is_system: true }
        });

        const adminEmail = 'admin@hotel.com';
        const adminPassword = 'admin_password123'; 
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
            console.log(`\nSUCCESS: Super Admin created!`);
            console.log(`Email: ${adminEmail}`);
            console.log(`Password: ${adminPassword}`);
        } else {
            console.log(`\nINFO: Admin user already exists (Email: ${adminEmail})`);
            await adminUser.update({ role: 'admin', status: 'active' });
        }

        console.log('\nSeeding standard roles...');
        const otherRoles = ['hr', 'manager', 'finance', 'employee', 'gm'];
        for (const roleCode of otherRoles) {
            await Role.findOrCreate({
                where: { code: roleCode },
                defaults: { name: roleCode.toUpperCase(), code: roleCode, is_system: true }
            });
        }

        console.log('\nSetup completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('\nSetup failed:', error);
        process.exit(1);
    }
};

initAdmin();
