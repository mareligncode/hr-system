import express from 'express';
import {
    clockIn,
    clockOut,
    getMyAttendance,
    getTodayAttendance,
    getTeamAttendance,
    approveAttendance,
    approveCorrection,
    requestCorrection,
    getAttendanceSummary,
    getAttendanceReports,
    exportAttendance,
    getCorrectionRequests,
    startBreak,
    endBreak,
    generateMyPDFReport,
    generateDepartmentPDFReport,
    generateCompanyPDFReport,
    generateCustomPDFReport
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// ─── Employee routes ──────────────────────────────────────────────────────────
router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.get('/my', getMyAttendance);
router.get('/history', getMyAttendance);           // Alias for /my
router.get('/summary', getAttendanceSummary);
router.post('/correction', requestCorrection);

// Break Management
router.post('/break/start', startBreak);
router.post('/break/end', endBreak);

// ─── Export — employees get own data, managers/hr get team/all ───────────────
// BUG FIX: was missing 'employee' role — now employees can export own records
router.get('/export', authorize('admin', 'hr', 'manager', 'finance', 'employee'), exportAttendance);

// ─── PDF Reports — Beautiful, structured PDF exports ─────────────────────────
router.get('/reports/pdf/my', generateMyPDFReport);
router.get('/reports/pdf/department/:departmentId', authorize('admin', 'hr', 'manager'), generateDepartmentPDFReport);
router.get('/reports/pdf/company', authorize('admin', 'hr'), generateCompanyPDFReport);
router.post('/reports/pdf/custom', authorize('admin', 'hr', 'manager'), generateCustomPDFReport);

// ─── Manager / HR / Admin routes ─────────────────────────────────────────────
router.get('/today', authorize('admin', 'hr', 'manager'), getTodayAttendance);
router.get('/team', authorize('admin', 'hr', 'manager'), getTeamAttendance);
router.get('/corrections', authorize('admin', 'hr', 'manager'), getCorrectionRequests);
router.get('/reports', authorize('admin', 'hr', 'manager', 'finance'), getAttendanceReports);

// Approve / Reject individual attendance record
router.put('/:id/approve', authorize('admin', 'hr', 'manager'), approveAttendance);
// Explicit reject route (maps to same controller with preset status)
router.put('/:id/reject', authorize('admin', 'hr', 'manager'), (req, res, next) => {
    req.presetStatus = 'rejected';
    next();
}, approveAttendance);

// Approve / Reject correction requests
router.put('/correction/:id/approve', authorize('admin', 'hr', 'manager'), approveCorrection);

export default router;
