import { Attendance, User, Employee, Department } from './models/index.js';
import sequelize from './config/database.js';

async function test() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected');
        await sequelize.sync({ alter: true });
        console.log('DB Synced with Alter');

        const attendance = await Attendance.findAll({
            limit: 1
        });
        console.log('Attendance Query OK:', attendance.length);

        process.exit(0);
    } catch (err) {
        console.error('Test Error:', err);
        process.exit(1);
    }
}

test();
