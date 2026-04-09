import sequelize from './config/database.js';

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');

        const queryInterface = sequelize.getQueryInterface();

        // Check and add columns to departments
        const deptCols = await queryInterface.describeTable('departments').catch(() => ({}));
        if (!deptCols.latitude) {
            console.log('Adding geofence columns to departments...');
            await queryInterface.addColumn('departments', 'latitude', { type: sequelize.Sequelize.DECIMAL(10, 8), defaultValue: 0.0 });
            await queryInterface.addColumn('departments', 'longitude', { type: sequelize.Sequelize.DECIMAL(11, 8), defaultValue: 0.0 });
            await queryInterface.addColumn('departments', 'radius_meters', { type: sequelize.Sequelize.INTEGER, defaultValue: 100 });
            await queryInterface.addColumn('departments', 'is_geofencing_enabled', { type: sequelize.Sequelize.BOOLEAN, defaultValue: false });
        }

        // Check and add columns to attendance
        const attnCols = await queryInterface.describeTable('attendance').catch(() => ({}));
        if (!attnCols.total_break_minutes) {
            console.log('Adding total_break_minutes to attendance...');
            await queryInterface.addColumn('attendance', 'total_break_minutes', { type: sequelize.Sequelize.INTEGER, defaultValue: 0 });
        }

        // Check and add columns to shift_assignments
        const shiftCols = await queryInterface.describeTable('shift_assignments').catch(() => ({}));
        if (!shiftCols.no_show_notified) {
            console.log('Adding no_show_notified to shift_assignments...');
            await queryInterface.addColumn('shift_assignments', 'no_show_notified', { type: sequelize.Sequelize.BOOLEAN, defaultValue: false });
        }

        // Check and add columns to employees
        const empCols = await queryInterface.describeTable('employees').catch(() => ({}));
        if (!empCols.accommodation_id) {
            console.log('Adding accommodation_id to employees...');
            await queryInterface.addColumn('employees', 'accommodation_id', { type: sequelize.Sequelize.INTEGER, allowNull: true });
        }

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
