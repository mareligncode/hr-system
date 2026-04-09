import express from 'express';
import {
    getJobPostings,
    createJobPosting,
    getApplicants,
    updateApplicationStatus,
    scheduleInterview,
    getInterviews
} from '../controllers/recruitmentController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Jobs
router.get('/jobs', getJobPostings);
router.post('/jobs', authorize('admin', 'hr'), createJobPosting);

// Applicants & ATS
router.get('/applicants', authorize('admin', 'hr'), getApplicants);
router.put('/applications/:id/status', authorize('admin', 'hr', 'manager'), updateApplicationStatus);

// Interviews
router.get('/interviews', getInterviews);
router.post('/interviews', authorize('admin', 'hr'), scheduleInterview);

export default router;
