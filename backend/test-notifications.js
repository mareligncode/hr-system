import { Notification, NotificationSetting, NotificationTemplate, User } from './models/index.js';
import sequelize from './config/database.js';

async function testNotifications() {
    try {
        console.log('Connecting to DB and syncing notification models...');
        await sequelize.authenticate();

        // Ensure models are created in the database
        await Notification.sync({ alter: true });
        await NotificationSetting.sync({ alter: true });
        await NotificationTemplate.sync({ alter: true });

        console.log('Sync complete.');

        // Find a random user to test with
        const user = await User.findOne();
        if (!user) {
            console.log('No user found to test with.');
            return;
        }

        console.log(`Testing with user: ${user.email} (ID: ${user.id})`);

        // 1. Create a notification setting
        const [setting, created] = await NotificationSetting.findOrCreate({
            where: { user_id: user.id },
            defaults: {
                email_notifications: true,
                push_notifications: true,
                in_app_notifications: true
            }
        });
        console.log(`Notification settings for user ${user.id} exist/created.`);

        // 2. Create a test notification
        const notification = await Notification.create({
            user_id: user.id,
            title: 'Test Notification',
            message: 'This is a test notification from the backend script.',
            type: 'info',
            link: '/dashboard'
        });
        console.log(`Created notification ID: ${notification.id}`);

        // 3. Query unread count
        const unreadCount = await Notification.count({
            where: { user_id: user.id, is_read: false }
        });
        console.log(`Unread count for user ${user.id}: ${unreadCount}`);

        // 4. Mark as read
        await notification.update({ is_read: true });
        console.log(`Notification ID: ${notification.id} marked as read.`);

        console.log('Tests finished successfully.');
        process.exit(0);

    } catch (error) {
        console.error('Error during testing:', error);
        process.exit(1);
    }
}

testNotifications();
