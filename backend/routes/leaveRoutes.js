import express from 'express';
import {
    createLeaveType,
    getLeaveTypes,
    requestLeave,
    getMyLeaveRequests,
    getPendingApprovals,
    approveLeave
} from '../controllers/leaveController.js';
import {
    createBlackoutDate,
    getBlackoutDates,
    deleteBlackoutDate,
    runAccrual,
    requestEncashment,
    getEncashmentRequests,
    approveEncashment,
    getMyLeaveBalances
} from '../controllers/leavePolicyController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Leave Types
router.post('/types', authorize('admin', 'hr'), createLeaveType);
router.get('/types', getLeaveTypes);

// Leave Requests
router.post('/requests', requestLeave);
router.get('/my', getMyLeaveRequests);
router.get('/balances/my', getMyLeaveBalances);

// Approvals
router.get('/pending', authorize('admin', 'hr', 'manager'), getPendingApprovals);
router.put('/requests/:id/approve', authorize('admin', 'hr', 'manager'), approveLeave);

// Blackout Dates
router.post('/blackout', authorize('admin', 'hr'), createBlackoutDate);
router.get('/blackout', getBlackoutDates);
router.delete('/blackout/:id', authorize('admin', 'hr'), deleteBlackoutDate);

// Accruals
router.post('/accrual/run', authorize('admin', 'hr'), runAccrual);

// Encashments
router.post('/encashment', requestEncashment);
router.get('/encashment', authorize('admin', 'hr', 'finance'), getEncashmentRequests);
router.put('/encashment/:id/approve', authorize('admin', 'hr', 'finance'), approveEncashment);

export default router;
