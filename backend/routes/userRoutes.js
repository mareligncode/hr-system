import express from 'express';
import { getProfile, updateProfile } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

import upload from '../services/uploadService.js';

const router = express.Router();

router.get('/me', protect, getProfile);
router.put('/me', protect, upload.single('profile_picture'), updateProfile);

export default router;
