import dotenv from 'dotenv';
dotenv.config();
import sequelize from './config/database.js';

async function inspectSchema() {
    try {
        const results = await sequelize.getQueryInterface().describeTable('employees');
        console.log('Employees Table Schema:');
        console.table(results);
    } catch (error) {
        console.error('FAILED to inspect schema:', error);
    } finally {
        await sequelize.close();
    }
}

inspectSchema();
