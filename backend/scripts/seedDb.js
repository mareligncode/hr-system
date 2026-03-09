import { Role, Permission, User } from '../models/index.js';
import sequelize from '../config/database.js';

const seedDatabase = async () => {
    try {
        console.log('Starting Seeding...');

        // 1. Create System Permissions
        const permissions = [
            // Employees
            { name: 'Manage Employees', code: 'manage_employees', category: 'Employees', description: 'Full access to employee data' },
            { name: 'View Employees', code: 'view_employees', category: 'Employees', description: 'Read-only access to employee data' },
            // Security
            { name: 'Manage Roles', code: 'manage_roles', category: 'Security', description: 'Manage system roles and permissions' },
            { name: 'View Audit Logs', code: 'view_audit_logs', category: 'Security', description: 'View system audit trails' },
            // Organization
            { name: 'Manage Org Structure', code: 'manage_org', category: 'Organization', description: 'Manage departments and positions' },
            // Payroll & Finance
            { name: 'Manage Payroll', code: 'manage_payroll', category: 'Finance', description: 'Process and manage payroll' },
            { name: 'View Payroll', code: 'view_payroll', category: 'Finance', description: 'View payroll records' },
            // Shifts
            { name: 'Manage Shifts', code: 'manage_shifts', category: 'Operations', description: 'Create and manage schedules' },
            { name: 'View Shifts', code: 'view_shifts', category: 'Operations', description: 'View schedule information' },
            // Recruitment
            { name: 'Manage Recruitment', code: 'manage_recruitment', category: 'HR', description: 'Post jobs and manage applicants' },
            // Analytics
            { name: 'View Analytics', code: 'view_analytics', category: 'Executive', description: 'Access strategic dashboards' },
        ];

        const createdPermissions = await Promise.all(
            permissions.map(p => Permission.findOrCreate({ where: { code: p.code }, defaults: p }))
        );
        const permMap = createdPermissions.reduce((acc, [p]) => {
            acc[p.code] = p.id;
            return acc;
        }, {});
        console.log('Permissions seeded.');

        // 2. Create System Roles
        const [adminRole] = await Role.findOrCreate({
            where: { code: 'admin' },
            defaults: { name: 'Admin', code: 'admin', description: 'Full system access', is_system: true }
        });

        const [hrRole] = await Role.findOrCreate({
            where: { code: 'hr' },
            defaults: { name: 'HR Manager', code: 'hr', description: 'HR and Employee management', is_system: true }
        });

        const [managerRole] = await Role.findOrCreate({
            where: { code: 'manager' },
            defaults: { name: 'Department Manager', code: 'manager', description: 'Team management', is_system: true }
        });

        const [financeRole] = await Role.findOrCreate({
            where: { code: 'finance' },
            defaults: { name: 'Finance Officer', code: 'finance', description: 'Payroll and payments', is_system: true }
        });

        const [employeeRole] = await Role.findOrCreate({
            where: { code: 'employee' },
            defaults: { name: 'Employee', code: 'employee', description: 'Staff member self-service', is_system: true }
        });

        const [gmRole] = await Role.findOrCreate({
            where: { code: 'gm' },
            defaults: { name: 'General Manager', code: 'gm', description: 'Executive oversight', is_system: true }
        });

        // 3. Assign Permissions to Roles
        await adminRole.setPermissions(Object.values(permMap));

        await hrRole.setPermissions([
            permMap.manage_employees,
            permMap.view_employees,
            permMap.manage_org,
            permMap.manage_recruitment,
            permMap.view_analytics
        ]);

        await managerRole.setPermissions([
            permMap.view_employees,
            permMap.manage_shifts,
            permMap.view_shifts
        ]);

        await financeRole.setPermissions([
            permMap.manage_payroll,
            permMap.view_payroll
        ]);

        await employeeRole.setPermissions([
            permMap.view_shifts
        ]);

        await gmRole.setPermissions([
            permMap.view_analytics,
            permMap.view_employees,
            permMap.view_payroll
        ]);

        // 4. Promote first user to admin for testing convenience
        const firstUser = await User.findOne();
        if (firstUser) {
            await firstUser.update({ role: 'admin' });
            console.log(`User ${firstUser.email} promoted to admin.`);
        }

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedDatabase();
