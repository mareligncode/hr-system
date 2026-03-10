import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });
import { Position, Department } from './backend/models/index.js';
import sequelize from './backend/config/database.js';

async function test() {
    try {
        console.log('Testing Position.findAll()...');
        const positions = await Position.findAll({
            include: {
                model: Department,
                attributes: ['id', 'name', 'code', 'location']
            },
            order: [['grade', 'ASC'], ['title', 'ASC']]
        });
        console.log(`Success! Found ${positions.length} positions.`);
    } catch (error) {
        console.error('FAILED to fetch positions:');
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

test();
