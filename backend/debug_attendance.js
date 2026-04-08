import { Attendance, AttendanceBreak, User } from './models/index.js';
import sequelize from './config/database.js';

async function test() {
    try {
        await sequelize.authenticate();
        const user = await User.findOne();
        if (!user) {
            console.log('No users found in database!');
            return;
        }
        console.log(`Testing for user ${user.id} (${user.email})`);

        const summary = await Attendance.findAll({
            where: { user_id: user.id }
        });
        console.log(`History count: ${summary.length}`);

        const withBreaks = await Attendance.findAll({
            where: { user_id: user.id },
            include: [{ model: AttendanceBreak }]
        });
        console.log(`History with breaks count: ${withBreaks.length}`);

    } catch (error) {
        console.error('DEBUG ERROR:', error);
    } finally {
        await sequelize.close();
    }
}

test();
