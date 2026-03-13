import dotenv from 'dotenv';
dotenv.config();
import sequelize from './config/database.js';

async function listAllSwaps() {
    try {
        const query = `
            SELECT 
                ssr.id, ssr.status, ssr.requesting_employee_id, ssr.target_employee_id,
                u_req.first_name as requester_name,
                u_tar.first_name as target_name
            FROM shift_swap_requests ssr
            JOIN users u_req ON ssr.requesting_employee_id = u_req.id
            JOIN users u_tar ON ssr.target_employee_id = u_tar.id
        `;
        const [results] = await sequelize.query(query);
        console.log('All Swaps in DB:');
        console.table(results);
    } catch (error) {
        console.error('FAILED to list swaps:', error);
    } finally {
        await sequelize.close();
    }
}

listAllSwaps();
