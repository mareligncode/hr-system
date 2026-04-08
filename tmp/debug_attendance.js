import Attendance from '../backend/models/Attendance.js';
import AttendanceBreak from '../backend/models/AttendanceBreak.js';
import { Op } from 'sequelize';
import sequelize from '../backend/config/database.js';

async function test() {
    try {
        console.log('Connecting...');
        await sequelize.authenticate();
        console.log('Checking records for a known user (ID 1 if exists)...');

        const attendance = await Attendance.findAll({
            limit: 5,
            include: [{ model: AttendanceBreak }]
        });

        console.log('Success! Found records:', attendance.length);
    } catch (error) {
        console.error('DEBUG ERROR:', error);
    } finally {
        await sequelize.close();
    }
}

test();
