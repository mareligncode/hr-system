import dotenv from 'dotenv';
dotenv.config();
import { Employee, User, Role } from './models/index.js';
import sequelize from './config/database.js';

async function testDuplicateEmployees() {
    try {
        const employees = await Employee.findAll({
            include: [
                {
                    model: User,
                    include: [
                        {
                            model: Role,
                            through: { attributes: ['department_id'] }
                        }
                    ]
                }
            ]
        });

        console.log('Total Results from findAll:', employees.length);

        const ids = employees.map(e => e.user_id);
        const uniqueIds = new Set(ids);
        console.log('Unique Employee IDs:', uniqueIds.size);

        if (employees.length > uniqueIds.size) {
            console.log('DUPLICATES DETECTED!');
            // Find which one is duplicated
            const counts = {};
            ids.forEach(id => counts[id] = (counts[id] || 0) + 1);
            Object.keys(counts).forEach(id => {
                if (counts[id] > 1) {
                    const emp = employees.find(e => e.user_id == id);
                    console.log(`User ID ${id} (${emp.User?.first_name}) appears ${counts[id]} times.`);
                    console.log('Roles:', emp.User?.Roles?.map(r => r.name));
                }
            });
        }

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await sequelize.close();
    }
}

testDuplicateEmployees();
