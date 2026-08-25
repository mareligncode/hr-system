import express from 'express';
import {
    register,
    login,
    logout,
    refresh,
    refreshToken,
    forgotPassword,
    resetPassword,
    changePassword,
    verifyEmail,
    setupMfa,
    verifyMfa,
    disableMfa,
    getSessions,
    revokeSession,
    revokeAllSessions,
    seedAdmin,
    activateUser
} from '../controllers/authController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', login);
router.post('/logout', protect, logout);
router.post('/refresh', refreshToken); // No auth required - uses cookie
router.post('/refresh-legacy', protect, refresh); // Legacy endpoint
router.post('/change-password', protect, changePassword);

// MFA endpoints
router.post('/mfa/setup', protect, setupMfa);
router.post('/mfa/verify', protect, verifyMfa);
router.post('/mfa/disable', protect, disableMfa);

// Session management
router.get('/sessions', protect, getSessions);
router.delete('/sessions/:sessionId', protect, revokeSession);
router.post('/sessions/revoke-all', protect, revokeAllSessions);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Temporary endpoints for Render deployment (remove in production)
router.post('/seed-admin', seedAdmin);
router.post('/activate-user', activateUser);

export default router;
