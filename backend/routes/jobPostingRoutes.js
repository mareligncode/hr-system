import express from 'express';
import {
    createJobPosting,
    getAllJobPostings,
    getJobPostingById,
    updateJobPosting,
    deleteJobPosting,
    publishJobPosting,
    getPublicPostings,
    restoreJobPosting
} from '../controllers/jobPostingController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes for job listing
router.get('/public', getPublicPostings);
router.get('/public/:id', getJobPostingById);

// Protected routes
router.get('/', protect, getAllJobPostings);
router.get('/:id', protect, getJobPostingById);
router.post('/', protect, authorize('hr', 'admin'), createJobPosting);
router.put('/:id', protect, authorize('hr', 'admin'), updateJobPosting);
router.delete('/:id', protect, authorize('hr', 'admin'), deleteJobPosting);
router.post('/:id/restore', protect, authorize('hr', 'admin'), restoreJobPosting);
router.put('/:id/publish', protect, authorize('hr', 'admin'), publishJobPosting);

export default router;
