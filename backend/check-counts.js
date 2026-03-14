import dotenv from 'dotenv';
dotenv.config();
import sequelize from './config/database.js';

async function checkCounts() {
    try {
        const [users] = await sequelize.query('SELECT COUNT(*) as total FROM users');
        const [employees] = await sequelize.query('SELECT COUNT(*) as total FROM employees');
        console.log('Total Users:', users[0].total);
        console.log('Total Employees:', employees[0].total);

        const [todayShifts] = await sequelize.query("SELECT COUNT(*) as total FROM shift_assignments WHERE assignment_date = '2026-03-13'");
        console.log('Shifts for TODAY (2026-03-13):', todayShifts[0].total);

        const [distDates] = await sequelize.query("SELECT DISTINCT assignment_date FROM shift_assignments ORDER BY assignment_date ASC");
        console.log('Assignment Dates in DB:', distDates.map(d => d.assignment_date));

    } catch (error) {
        console.error('FAILED to check counts:', error);
    } finally {
        await sequelize.close();
    }
}

checkCounts();
