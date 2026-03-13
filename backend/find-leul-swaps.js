import dotenv from 'dotenv';
dotenv.config();
import sequelize from './config/database.js';

async function findLeulSwaps() {
    try {
        const query = `
            SELECT * FROM shift_swap_requests 
            WHERE requesting_employee_id = 23 OR target_employee_id = 23
        `;
        const [results] = await sequelize.query(query);
        console.log('Swaps for User 23:');
        console.table(results);
    } catch (error) {
        console.error('FAILED to find swaps:', error);
    } finally {
        await sequelize.close();
    }
}

findLeulSwaps();
