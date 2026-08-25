import express from 'express';
import {
    getExecutiveDashboard,
    getHRDashboard,
    getManagerDashboard,
    getFinanceDashboard,
    exportReport,
    exportReportPDF,
    getReportData
} from '../controllers/reportController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard/executive', authorize('admin', 'hr', 'finance'), getExecutiveDashboard);
router.get('/dashboard/hr', authorize('admin', 'hr'), getHRDashboard);
router.get('/dashboard/manager', authorize('admin', 'hr', 'manager'), getManagerDashboard);
router.get('/dashboard/finance', authorize('admin', 'hr', 'finance'), getFinanceDashboard);

router.get('/data', authorize('admin', 'hr', 'manager', 'finance'), getReportData);

// Excel export
router.get('/export/:type', authorize('admin', 'hr', 'finance'), exportReport);

// PDF export
router.get('/export-pdf/:type', authorize('admin', 'hr', 'finance', 'manager'), exportReportPDF);

export default router;
