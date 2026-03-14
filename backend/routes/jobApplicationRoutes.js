import express from 'express';
import {
    submitApplication,
    getAllApplications,
    getApplicationById,
    updateApplicationStatus,
    getApplicationTimeline
} from '../controllers/jobApplicationController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import upload from '../services/uploadService.js';

const router = express.Router();

// Public route to submit application
router.post('/submit', upload.single('resume'), submitApplication);

// Protected routes
router.use(protect);
router.get('/', authorize('hr', 'admin'), getAllApplications);
router.get('/:id', authorize('hr', 'admin'), getApplicationById);
router.get('/:id/timeline', authorize('hr', 'admin'), getApplicationTimeline);
router.put('/:id/status', authorize('hr', 'admin'), updateApplicationStatus);

export default router;
