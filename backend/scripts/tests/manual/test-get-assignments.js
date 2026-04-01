import dotenv from 'dotenv';
dotenv.config();
import { ShiftAssignment, ShiftType, Employee, User, Department } from './models/index.js';
import { Op } from 'sequelize';
import sequelize from './config/database.js';

async function testGetAssignments() {
    try {
        // Simulation of Admin request for March 2026
        let employee_id = undefined;
        let from = '2026-03-01';
        let to = '2026-03-31';
        let department_id = undefined;

        const where = {};
        if (employee_id) where.employee_id = employee_id;

        if (from && to) {
            where.assignment_date = { [Op.between]: [from, to] };
        }

        const include = [
            { model: ShiftType },
            {
                model: Employee,
                include: [{ model: User, attributes: ['first_name', 'last_name', 'employee_id'] }],
                where: department_id ? { department_id } : undefined,
                required: !!department_id || !!employee_id
            }
        ];

        const assignments = await ShiftAssignment.findAll({
            where,
            include,
            order: [['assignment_date', 'ASC']]
        });

        console.log(`Found ${assignments.length} assignments for March 2026`);
        if (assignments.length > 0) {
            console.log('Sample assignment:', JSON.stringify(assignments[0], null, 2));
        }

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await sequelize.close();
    }
}

testGetAssignments();
