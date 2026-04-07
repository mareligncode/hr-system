import dotenv from 'dotenv';
dotenv.config();
import sequelize from './config/database.js';

async function inspectSwapsDetailed() {
    try {
        const query = `
            SELECT 
                ssr.id, ssr.status, ssr.requesting_employee_id, ssr.target_employee_id,
                req_u.first_name as req_fn, req_u.last_name as req_ln,
                tar_u.first_name as tar_fn, tar_u.last_name as tar_ln,
                dept.name as dept_name
            FROM shift_swap_requests ssr
            JOIN employees req_e ON ssr.requesting_employee_id = req_e.user_id
            JOIN users req_u ON req_e.user_id = req_u.id
            JOIN employees tar_e ON ssr.target_employee_id = tar_e.user_id
            JOIN users tar_u ON tar_e.user_id = tar_u.id
            JOIN departments dept ON req_e.department_id = dept.id
        `;
        const [results] = await sequelize.query(query);
        console.log('--- Detailed Swaps ---');
        console.table(results);
    } catch (error) {
        console.error('FAILED to inspect detailed swaps:', error);
    } finally {
        await sequelize.close();
    }
}

inspectSwapsDetailed();
