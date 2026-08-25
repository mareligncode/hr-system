import dotenv from 'dotenv';
dotenv.config();
import sequelize from './config/database.js';

async function inspectTable() {
    try {
        const results = await sequelize.getQueryInterface().describeTable('positions');
        console.log('Positions Table Schema:');
        console.table(results);
    } catch (error) {
        console.error('FAILED to inspect table:', error);
    } finally {
        await sequelize.close();
    }
}

inspectTable();
