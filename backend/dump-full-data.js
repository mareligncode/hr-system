import dotenv from 'dotenv';
dotenv.config();
import sequelize from './config/database.js';

async function dumpFullData() {
    try {
        const [swaps] = await sequelize.query('SELECT * FROM shift_swap_requests');
        console.log('--- Shift Swap Requests Full Dump ---');
        console.log(JSON.stringify(swaps, null, 2));

        const [employees] = await sequelize.query('SELECT * FROM employees');
        console.log('--- Employees Full Dump ---');
        console.log(JSON.stringify(employees, null, 2));
    } catch (error) {
        console.error('FAILED to dump full data:', error);
    } finally {
        await sequelize.close();
    }
}

dumpFullData();
