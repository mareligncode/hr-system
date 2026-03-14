import { User, Employee } from './backend/models/index.js';

async function check() {
    try {
        const users = await User.findAll({ attributes: ['id', 'email', 'first_name'] });
        console.log('Users in DB:');
        users.forEach(u => console.log(`${u.id}: ${u.first_name} (${u.email})`));

        const emps = await Employee.findAll({ attributes: ['user_id', 'department_id'] });
        console.log('\nEmployees in DB:');
        emps.forEach(e => console.log(`UserID: ${e.user_id}, DeptID: ${e.department_id}`));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
check();
