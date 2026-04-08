import sequelize from './config/database.js';

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');

        // Check and add columns to departments
        const [deptTable] = await sequelize.query("SHOW COLUMNS FROM departments LIKE 'latitude'");
        if (deptTable.length === 0) {
            console.log('Adding geofence columns to departments...');
            await sequelize.query("ALTER TABLE departments ADD COLUMN latitude DECIMAL(10, 8) DEFAULT 0.0");
            await sequelize.query("ALTER TABLE departments ADD COLUMN longitude DECIMAL(11, 8) DEFAULT 0.0");
            await sequelize.query("ALTER TABLE departments ADD COLUMN radius_meters INTEGER DEFAULT 100");
            await sequelize.query("ALTER TABLE departments ADD COLUMN is_geofencing_enabled BOOLEAN DEFAULT FALSE");
        }

        // Check and add columns to attendance
        const [attnTable] = await sequelize.query("SHOW COLUMNS FROM attendance LIKE 'total_break_minutes'");
        if (attnTable.length === 0) {
            console.log('Adding total_break_minutes to attendance...');
            await sequelize.query("ALTER TABLE attendance ADD COLUMN total_break_minutes INTEGER DEFAULT 0");
        }

        // Check and add columns to shift_assignments
        const [shiftTable] = await sequelize.query("SHOW COLUMNS FROM shift_assignments LIKE 'no_show_notified'");
        if (shiftTable.length === 0) {
            console.log('Adding no_show_notified to shift_assignments...');
            await sequelize.query("ALTER TABLE shift_assignments ADD COLUMN no_show_notified BOOLEAN DEFAULT FALSE");
        }

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
