import dotenv from 'dotenv';
dotenv.config();
import sequelize from './config/database.js';

async function inspectTable() {
    try {
        const [results] = await sequelize.query('DESCRIBE positions');
        console.log('Positions Table Schema:');
        results.forEach(row => console.log(JSON.stringify(row)));
    } catch (error) {
        console.error('FAILED to inspect table:', error);
    } finally {
        await sequelize.close();
    }
}

inspectTable();
