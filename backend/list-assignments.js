import dotenv from 'dotenv';
dotenv.config();
import sequelize from './config/database.js';

async function listAssignments() {
    try {
        const query = `
            SELECT 
                sa.id, sa.employee_id, sa.assignment_date, sa.status,
                u.first_name, u.last_name, e.department_id
            FROM shift_assignments sa
            LEFT JOIN employees e ON sa.employee_id = e.user_id
            LEFT JOIN users u ON e.user_id = u.id
            ORDER BY sa.assignment_date DESC
            LIMIT 50
        `;
        const [results] = await sequelize.query(query);
        console.log('--- Shift Assignments (Recent) ---');
        console.table(results);

        const [count] = await sequelize.query('SELECT COUNT(*) as total FROM shift_assignments');
        console.log('Total Assignments:', count[0].total);

    } catch (error) {
        console.error('FAILED to list assignments:', error);
    } finally {
        await sequelize.close();
    }
}

listAssignments();
