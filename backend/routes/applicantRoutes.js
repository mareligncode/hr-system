import express from 'express';
import {
    getAllApplicants,
    getApplicantById,
    updateApplicant
} from '../controllers/applicantController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('hr', 'admin'));

router.get('/', getAllApplicants);
router.get('/:id', getApplicantById);
router.put('/:id', updateApplicant);

export default router;
