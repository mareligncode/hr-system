import dotenv from 'dotenv';
dotenv.config();
import sequelize from './config/database.js';

async function inspectSwaps() {
    try {
        const [swaps] = await sequelize.query('SELECT * FROM shift_swap_requests');
        console.log('--- Shift Swap Requests ---');
        console.table(swaps);

        const [employees] = await sequelize.query('SELECT user_id, department_id FROM employees');
        console.log('--- Employees ---');
        console.table(employees);

        const [assignments] = await sequelize.query('SELECT id, employee_id, status FROM shift_assignments');
        console.log('--- Shift Assignments ---');
        console.table(assignments);

    } catch (error) {
        console.error('FAILED to inspect swaps:', error);
    } finally {
        await sequelize.close();
    }
}

inspectSwaps();
