import { Notification, NotificationSetting, NotificationTemplate, User } from '../models/index.js';

export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { user_id: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

export const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.count({
            where: {
                user_id: req.user.id,
                is_read: false
            }
        });
        res.json({ unreadCount: count });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ error: 'Failed to fetch unread count' });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findOne({
            where: { id, user_id: req.user.id }
        });

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        await notification.update({ is_read: true });
        res.json({ message: 'Notification marked as read', notification });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to mark as read' });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        await Notification.update(
            { is_read: true },
            { where: { user_id: req.user.id, is_read: false } }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ error: 'Failed to mark all as read' });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findOne({
            where: { id, user_id: req.user.id }
        });

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        await notification.destroy();
        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
};

export const getNotificationSettings = async (req, res) => {
    try {
        let settings = await NotificationSetting.findOne({
            where: { user_id: req.user.id }
        });

        if (!settings) {
            settings = await NotificationSetting.create({ user_id: req.user.id });
        }

        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch notification settings' });
    }
};

export const updateNotificationSettings = async (req, res) => {
    try {
        const { email_notifications, push_notifications, in_app_notifications, notify_on_leave_status, notify_on_payroll, notify_on_shift_swap } = req.body;

        let settings = await NotificationSetting.findOne({
            where: { user_id: req.user.id }
        });

        if (!settings) {
            settings = await NotificationSetting.create({ user_id: req.user.id, ...req.body });
        } else {
            await settings.update({
                email_notifications: email_notifications !== undefined ? email_notifications : settings.email_notifications,
                push_notifications: push_notifications !== undefined ? push_notifications : settings.push_notifications,
                in_app_notifications: in_app_notifications !== undefined ? in_app_notifications : settings.in_app_notifications,
                notify_on_leave_status: notify_on_leave_status !== undefined ? notify_on_leave_status : settings.notify_on_leave_status,
                notify_on_payroll: notify_on_payroll !== undefined ? notify_on_payroll : settings.notify_on_payroll,
                notify_on_shift_swap: notify_on_shift_swap !== undefined ? notify_on_shift_swap : settings.notify_on_shift_swap
            });
        }

        res.json({ message: 'Settings updated successfully', settings });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update notification settings' });
    }
};

// Admin Endpoints for Templates
export const getTemplates = async (req, res) => {
    try {
        const templates = await NotificationTemplate.findAll();
        res.json(templates);
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ error: 'Failed to fetch notification templates' });
    }
};

export const createTemplate = async (req, res) => {
    try {
        const { name, subject, body, channels, variables, is_active } = req.body;

        const template = await NotificationTemplate.create({
            name,
            subject,
            body,
            channels,
            variables,
            is_active
        });

        res.status(201).json({ message: 'Template created successfully', template });
    } catch (error) {
        console.error('Error creating template:', error);
        res.status(500).json({ error: 'Failed to create notification template' });
    }
};

export const updateTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const template = await NotificationTemplate.findByPk(id);

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        await template.update(req.body);
        res.json({ message: 'Template updated successfully', template });
    } catch (error) {
        console.error('Error updating template:', error);
        res.status(500).json({ error: 'Failed to update notification template' });
    }
};

export const deleteTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const template = await NotificationTemplate.findByPk(id);

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        await template.destroy();
        res.json({ message: 'Template deleted successfully' });
    } catch (error) {
        console.error('Error deleting template:', error);
        res.status(500).json({ error: 'Failed to delete notification template' });
    }
};
