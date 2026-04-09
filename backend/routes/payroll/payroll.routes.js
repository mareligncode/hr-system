import express from 'express';
import { createPeriod, getPeriods, getPayrollItemsByPeriod, processPayrollPeriod } from '../../controllers/payroll/payrollController.js';
import { authMiddleware, checkPermission } from '../../middlewares/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/periods', checkPermission('manage_payroll'), createPeriod);
router.get('/periods', checkPermission('manage_payroll'), getPeriods);
router.get('/periods/:period_id/items', checkPermission('manage_payroll'), getPayrollItemsByPeriod);
router.post('/periods/:period_id/process', checkPermission('manage_payroll'), processPayrollPeriod);

export default router;
