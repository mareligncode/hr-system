import express from 'express';
import {
    getCourses,
    getCourseDetail,
    updateProgress,
    submitQuiz,
    createCourse,
    addQuizQuestions
} from '../controllers/lmsController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Courses
router.get('/courses', getCourses);
router.get('/courses/:id', getCourseDetail);
router.put('/courses/:id/progress', updateProgress);
router.post('/courses/:id/quiz', submitQuiz);

// Admin / HR
router.post('/courses', authorize('admin', 'hr'), createCourse);
router.post('/courses/:id/questions', authorize('admin', 'hr'), addQuizQuestions);

export default router;
