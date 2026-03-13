/**
 * Shift Management Routes
 * 
 * All routes require authentication via `protect` middleware.
 * Role-based authorization via `authorize` middleware.
 * 
 * Route groups:
 *   /shifts/types          — Shift type CRUD
 *   /shifts/assignments    — Shift assignment CRUD + conflict check
 *   /shifts/swaps          — Shift swap requests
 *   /shifts/templates      — Shift template CRUD + apply
 *   /shifts/rotations      — Rotational shift patterns
 *   /shifts/reports        — Shift reports (coverage, overtime, summary)
 */

import express from 'express';
import {
    // Shift Types
    getShiftTypes,
    createShiftType,
    updateShiftType,
    deleteShiftType,
    // Shift Assignments
    getShiftAssignments,
    createShiftAssignment,
    bulkCreateAssignments,
    checkConflict,
    updateShiftAssignment,
    deleteShiftAssignment,
    getMyShifts,
    // Shift Swaps
    getShiftSwaps,
    getMySwaps,
    createShiftSwap,
    approveShiftSwap,
    rejectShiftSwap,
    // Shift Templates
    getShiftTemplates,
    createShiftTemplate,
    updateShiftTemplate,
    deleteShiftTemplate,
    applyShiftTemplate,
    // Shift Rotations
    getShiftRotations,
    createShiftRotation,
    applyShiftRotation,
    // Reports
    getShiftReports
} from '../controllers/shiftController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All shift routes require authentication
router.use(protect);

// --- Shift Types ---
router.get('/types', getShiftTypes);
router.post('/types', authorize('admin', 'hr', 'manager'), createShiftType);
router.put('/types/:id', authorize('admin', 'hr', 'manager'), updateShiftType);
router.delete('/types/:id', authorize('admin', 'hr'), deleteShiftType);

// --- Shift Assignments ---
// Note: /assignments/my and /assignments/check-conflict must come BEFORE /assignments/:id
router.get('/assignments/my', getMyShifts);
router.post('/assignments/check-conflict', authorize('admin', 'hr', 'manager'), checkConflict);
router.get('/assignments', authorize('admin', 'hr', 'manager', 'employee'), getShiftAssignments);
router.post('/assignments', authorize('admin', 'hr', 'manager'), createShiftAssignment);
router.post('/assignments/bulk', authorize('admin', 'hr', 'manager'), bulkCreateAssignments);
router.put('/assignments/:id', authorize('admin', 'hr', 'manager'), updateShiftAssignment);
router.delete('/assignments/:id', authorize('admin', 'hr', 'manager'), deleteShiftAssignment);

// --- Shift Swaps ---
router.get('/swaps/my', getMySwaps);
router.get('/swaps', authorize('admin', 'hr', 'manager'), getShiftSwaps);
router.post('/swaps', createShiftSwap);
router.put('/swaps/:id/approve', authorize('admin', 'hr', 'manager'), approveShiftSwap);
router.put('/swaps/:id/reject', authorize('admin', 'hr', 'manager'), rejectShiftSwap);

// --- Shift Templates ---
router.get('/templates', authorize('admin', 'hr', 'manager'), getShiftTemplates);
router.post('/templates', authorize('admin', 'hr', 'manager'), createShiftTemplate);
router.put('/templates/:id', authorize('admin', 'hr', 'manager'), updateShiftTemplate);
router.delete('/templates/:id', authorize('admin', 'hr', 'manager'), deleteShiftTemplate);
router.post('/templates/:id/apply', authorize('admin', 'hr', 'manager'), applyShiftTemplate);

// --- Shift Rotations ---
router.get('/rotations', authorize('admin', 'hr', 'manager'), getShiftRotations);
router.post('/rotations', authorize('admin', 'hr', 'manager'), createShiftRotation);
router.post('/rotations/:id/apply', authorize('admin', 'hr', 'manager'), applyShiftRotation);

// --- Shift Reports ---
router.get('/reports', authorize('admin', 'hr', 'manager', 'finance'), getShiftReports);

export default router;
