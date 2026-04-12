import cron from 'node-cron';
import { Op } from 'sequelize';
import { ShiftAssignment, ShiftType, Attendance, User, Employee, Department, Notification } from '../models/index.js';


export const checkNoShows = async () => {
    try {
        const now = new Date();
        const today = now.toISOString().split('T')[0];

        const shifts = await ShiftAssignment.findAll({
            where: {
                assignment_date: today,
                status: 'scheduled',
                no_show_notified: false
            },
            include: [
                { model: ShiftType },
                {
                    model: Employee,
                    include: [{ model: User }, { model: Department }]
                }
            ]
        });

        for (const shift of shifts) {
            const startTimeStr = shift.start_time || shift.ShiftType.start_time;
            if (!startTimeStr) continue;

            const [hours, minutes] = startTimeStr.split(':').map(Number);
            const scheduledStart = new Date(now);
            scheduledStart.setHours(hours, minutes, 0, 0);

            const diffMinutes = (now - scheduledStart) / (1000 * 60);

            if (diffMinutes > 10) {
                const attendance = await Attendance.findOne({
                    where: {
                        user_id: shift.Employee.user_id,
                        clock_in: {
                            [Op.gte]: scheduledStart
                        }
                    }
                });

                if (!attendance) {
                    // 3. Notify the manager of the department
                    const managerId = shift.Employee.Department?.manager_id;
                    if (managerId) {
                        const employeeName = `${shift.Employee.User.first_name} ${shift.Employee.User.last_name}`;

                        await Notification.create({
                            user_id: managerId,
                            title: 'No-Show Alert',
                            message: `Employee ${employeeName} has not clocked in for their shift starting at ${startTimeStr}. (Shift ID: ${shift.id})`,
                            type: 'alert',
                            related_entity_type: 'ShiftAssignment',
                            related_entity_id: shift.id
                        });

                        // 4. Mark as notified so we don't spam
                        await shift.update({ no_show_notified: true });
                        console.log(`[Cron] Sent No-Show alert for ${employeeName} to Manager ${managerId}`);
                    }
                }
            }
        }
    } catch (error) {
        console.error('No-Show Check Job Failed:', error);
    }
};

// Start the cron job: runs every 10 minutes
export const initCronJobs = () => {
    cron.schedule('*/10 * * * *', () => {
        console.log('[Cron] Checking for no-shows...');
        checkNoShows();
    });
    console.log('Cron jobs initialized');
};
