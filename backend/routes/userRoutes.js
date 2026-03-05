import express from 'express';
import { getProfile, updateProfile } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);

export default router;
