import express from 'express';
import {
    getAllPeriods,
    createPeriod,
    getPeriodById,
    calculatePayroll,
    reviewPayroll,
    approvePayroll,
    getMyPayslips,
    generateOffCyclePayroll
} from '../controllers/payrollController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Employee routes
router.get('/my-payslips', getMyPayslips);

// Admin/HR routes
router.get('/periods', authorize('admin', 'hr'), getAllPeriods);
router.post('/periods', authorize('admin', 'hr'), createPeriod);
router.get('/periods/:id', authorize('admin', 'hr'), getPeriodById);
router.post('/periods/:id/calculate', authorize('admin', 'hr'), calculatePayroll);
router.post('/periods/:id/review', authorize('admin', 'hr'), reviewPayroll);
router.post('/periods/:id/approve', authorize('admin', 'hr'), approvePayroll);
router.post('/off-cycle', authorize('admin', 'hr'), generateOffCyclePayroll);

export default router;
