import express from 'express';
import interviewController from '../controllers/interviewController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('admin', 'hr', 'hr_manager', 'dept_manager'), interviewController.scheduleInterview);
router.get('/', authorize('admin', 'hr', 'hr_manager', 'dept_manager'), interviewController.getInterviews);
router.get('/my', interviewController.getInterviews); // Uses requester ID from query handled in controller
router.get('/:id', interviewController.getInterviewById);
router.put('/:id', authorize('admin', 'hr', 'hr_manager', 'dept_manager'), interviewController.updateInterview);
router.post('/:id/feedback', authorize('admin', 'hr', 'hr_manager', 'dept_manager'), interviewController.submitFeedback);

export default router;
