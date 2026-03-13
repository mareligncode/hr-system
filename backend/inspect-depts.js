import dotenv from 'dotenv';
dotenv.config();
import sequelize from './config/database.js';

async function inspectDepartments() {
    try {
        const [results] = await sequelize.query('SELECT id, name, manager_id FROM departments');
        console.log('Departments:');
        console.table(results);
    } catch (error) {
        console.error('FAILED to inspect departments:', error);
    } finally {
        await sequelize.close();
    }
}

inspectDepartments();
