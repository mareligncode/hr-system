import dotenv from 'dotenv';
dotenv.config();
import sequelize from './config/database.js';

async function checkRoles() {
    try {
        const [results] = await sequelize.query('SELECT DISTINCT role FROM users');
        console.log('Distinct Roles in users table:');
        console.table(results);
    } catch (error) {
        console.error('FAILED to check roles:', error);
    } finally {
        await sequelize.close();
    }
}

checkRoles();
