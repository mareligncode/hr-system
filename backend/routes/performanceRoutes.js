import express from 'express';
import {
    getKPIs,
    recordKPIScore,
    getEmployeePerformanceSummary,
    requestFeedback,
    submitFeedback
} from '../controllers/performanceController.js';
import {
    getBadges,
    nominateColleague,
    awardBadge,
    getRecognitionWall
} from '../controllers/recognitionController.js';
import {
    issueWarning,
    getDisciplinaryHistory
} from '../controllers/disciplineController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Performance & KPIs
router.get('/kpis', getKPIs);
router.post('/kpis/score', authorize('admin', 'hr', 'manager'), recordKPIScore);
router.get('/summary/:id', getEmployeePerformanceSummary);

// 360 Feedback
router.post('/reviews/request', authorize('admin', 'hr', 'manager'), requestFeedback);
router.put('/reviews/:id/submit', submitFeedback);

// Recognition & Rewards
router.get('/badges', getBadges);
router.post('/nominate', nominateColleague);
router.post('/award', authorize('admin', 'hr', 'manager'), awardBadge);
router.get('/recognition-wall', getRecognitionWall);

// Disciplinary
router.post('/discipline', authorize('admin', 'hr', 'manager'), issueWarning);
router.get('/discipline/history', getDisciplinaryHistory);

export default router;
