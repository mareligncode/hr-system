import dotenv from 'dotenv';
dotenv.config();
import sequelize from './config/database.js';

async function diagnoseShifts() {
    try {
        console.log('--- Shift Diagnostics ---');

        // 1. Count by employee
        const [counts] = await sequelize.query(`
            SELECT sa.employee_id, u.first_name, u.last_name, COUNT(*) as count, e.department_id
            FROM shift_assignments sa
            JOIN employees e ON sa.employee_id = e.user_id
            JOIN users u ON e.user_id = u.id
            GROUP BY sa.employee_id, u.first_name, u.last_name, e.department_id
            HAVING count > 0
            ORDER BY count DESC
        `);
        console.log('Shift counts per employee:');
        console.table(counts);

        // 2. Check creation source
        const [sources] = await sequelize.query(`
            SELECT sa.created_by, u.first_name, u.last_name, COUNT(*) as total_created
            FROM shift_assignments sa
            LEFT JOIN users u ON sa.created_by = u.id
            GROUP BY sa.created_by, u.first_name, u.last_name
        `);
        console.log('Creation sources:');
        console.table(sources);

        // 3. Check for recent bulk creation (same minute)
        const [bulk] = await sequelize.query(`
            SELECT DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as minute, COUNT(*) as count
            FROM shift_assignments
            GROUP BY minute
            HAVING count > 5
        `);
        console.log('Potential bulk creation events:');
        console.table(bulk);

        // 4. Date range of shifts
        const [ranges] = await sequelize.query(`
            SELECT MIN(assignment_date) as start, MAX(assignment_date) as end, COUNT(*) as count
            FROM shift_assignments
        `);
        console.log('Overall Date Range of Shifts:');
        console.table(ranges);

        // 5. Check for rotations
        const [rotations] = await sequelize.query(`SELECT id, name, department_id, is_active FROM shift_rotations`);
        console.log('Active Rotations:');
        console.table(rotations);

    } catch (error) {
        console.error('FAILED diagnostics:', error);
    } finally {
        await sequelize.close();
    }
}

diagnoseShifts();
