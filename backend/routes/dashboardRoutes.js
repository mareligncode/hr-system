import express from 'express';
import { getDashboardStats, getExpiringAssets, getRecentActivity, getEmployeeDashboard } from '../controllers/dashboardController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // All dashboard routes require authentication

router.get('/stats', authorize('admin', 'hr', 'manager', 'finance'), getDashboardStats);
router.get('/employee', getEmployeeDashboard);
router.get('/expiring', authorize('admin', 'hr', 'manager'), getExpiringAssets);
router.get('/activity', authorize('admin', 'hr'), getRecentActivity);

export default router;
