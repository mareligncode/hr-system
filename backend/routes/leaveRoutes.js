import express from 'express';
import {
    createLeaveType,
    getLeaveTypes,
    requestLeave,
    getMyLeaveRequests,
    getPendingApprovals,
    approveLeave
} from '../controllers/leaveController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Leave Types
router.post('/types', authorize('admin', 'hr'), createLeaveType);
router.get('/types', getLeaveTypes);

// Leave Requests
router.post('/requests', requestLeave);
router.get('/my', getMyLeaveRequests);

// Approvals
router.get('/pending', authorize('admin', 'hr', 'manager'), getPendingApprovals);
router.put('/requests/:id/approve', authorize('admin', 'hr', 'manager'), approveLeave);

export default router;
