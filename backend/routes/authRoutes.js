import express from 'express';
import {
    register,
    login,
    logout,
    refresh,
    forgotPassword,
    resetPassword,
    changePassword,
    verifyEmail,
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.post('/refresh', protect, refresh);
router.post('/change-password', protect, changePassword);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-email/:token', verifyEmail);

export default router;
