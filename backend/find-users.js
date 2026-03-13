import dotenv from 'dotenv';
dotenv.config();
import sequelize from './config/database.js';

async function findUser() {
    try {
        const [results] = await sequelize.query("SELECT id, first_name, last_name, role FROM users WHERE first_name LIKE '%marelign%' OR last_name LIKE '%yimer%' OR first_name LIKE '%leul%'");
        console.log('Users:');
        console.table(results);
    } catch (error) {
        console.error('FAILED to find user:', error);
    } finally {
        await sequelize.close();
    }
}

findUser();
