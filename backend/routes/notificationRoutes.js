import express from 'express';
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationSettings,
    updateNotificationSettings,
    getTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate
} from '../controllers/notificationController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Notifications Routes
router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);

// Settings Routes
router.get('/settings', getNotificationSettings);
router.put('/settings', updateNotificationSettings);

// Admin Template Routes
// Must be an admin or hr to manage templates
router.use('/templates', authorize('admin', 'hr'));
router.get('/templates', getTemplates);
router.post('/templates', createTemplate);
router.put('/templates/:id', updateTemplate);
router.delete('/templates/:id', deleteTemplate);

export default router;
