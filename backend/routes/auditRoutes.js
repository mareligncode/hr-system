import express from 'express';
import { getAuditLogs, exportAuditLogs } from '../services/auditService.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'hr')); // Only admins and HR can view audit logs

router.get('/', getAuditLogs);
router.get('/export', exportAuditLogs);

export default router;
