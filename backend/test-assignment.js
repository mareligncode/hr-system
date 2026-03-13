import dotenv from 'dotenv';
dotenv.config();
import sequelize from './config/database.js';

async function testSingleAssignment() {
    try {
        const [before] = await sequelize.query('SELECT COUNT(*) as count FROM shift_assignments');
        console.log('Count before:', before[0].count);

        // Simulate createShiftAssignment payload
        const employee_id = 31; // adino asch
        const shift_type_id = 1; // Assuming 1 exists
        const assignment_date = '2026-03-20';

        const [id] = await sequelize.query(`
            INSERT INTO shift_assignments (employee_id, shift_type_id, assignment_date, status, created_by, created_at, updated_at)
            VALUES (?, ?, ?, 'scheduled', 1, NOW(), NOW())
        `, { replacements: [employee_id, shift_type_id, assignment_date] });

        const [after] = await sequelize.query('SELECT COUNT(*) as count FROM shift_assignments');
        console.log('Count after:', after[0].count);

        if (after[0].count - before[0].count === 1) {
            console.log('PASS: Exactly one assignment created.');
        } else {
            console.log('FAIL: Created', after[0].count - before[0].count, 'assignments!');
        }

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await sequelize.close();
    }
}

testSingleAssignment();
