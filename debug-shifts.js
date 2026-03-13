import { ShiftAssignment, ShiftType, Employee, User } from './backend/models/index.js';

async function debug() {
    try {
        const assignments = await ShiftAssignment.findAll({
            include: [{ model: ShiftType }, { model: Employee, include: [User] }]
        });
        console.log(`Found ${assignments.length} assignments`);
        assignments.forEach(a => {
            console.log(`- ID: ${a.id}, Date: ${a.assignment_date}, EmpID: ${a.employee_id}, DeptID: ${a.Employee?.department_id}, TypeDept: ${a.ShiftType?.department_id}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
debug();
