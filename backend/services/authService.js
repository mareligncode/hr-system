import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import UAParser from 'ua-parser-js';
import { User, RefreshToken, UserSession, LoginAttempt, UserMfa } from '../models/index.js';
import logger from '../utils/logger.js';
import { Op } from 'sequelize';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || '7d';
const MAX_LOGIN_ATTEMPTS = Number(process.env.MAX_LOGIN_ATTEMPTS) || 5;
const LOCKOUT_DURATION = Number(process.env.LOCKOUT_DURATION) || 30; // minutes

export class AuthService {
    /**
     * Generate JWT access token (short-lived)
     */
    static generateAccessToken(user) {
        return jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
    }

    /**
     * Generate refresh token (long-lived)
     */
    static async generateRefreshToken(user, deviceInfo, ipAddress) {
        const token = crypto.randomBytes(64).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        await RefreshToken.create({
            user_id: user.id,
            token,
            expires_at: expiresAt,
            device_info: deviceInfo,
            ip_address: ipAddress
        });

        return token;
    }

    /**
     * Parse device information from User-Agent
     */
    static parseDeviceInfo(userAgent) {
        const parser = new UAParser(userAgent);
        const result = parser.getResult();

        return {
            device: {
                name: result.device.model || 'Unknown Device',
                type: result.device.type || 'desktop'
            },
            browser: {
                name: result.browser.name || 'Unknown Browser',
                version: result.browser.version || ''
            },
            os: {
                name: result.os.name || 'Unknown OS',
                version: result.os.version || ''
            }
        };
    }

    /**
     * Create user session
     */
    static async createSession(user, deviceInfo, ipAddress, location = null) {
        const sessionToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

        // Mark previous sessions as not current
        await UserSession.update(
            { is_current: false },
            { where: { user_id: user.id } }
        );

        const session = await UserSession.create({
            user_id: user.id,
            session_token: sessionToken,
            device_name: deviceInfo.device.name,
            device_type: deviceInfo.device.type,
            browser_name: deviceInfo.browser.name,
            browser_version: deviceInfo.browser.version,
            os_name: deviceInfo.os.name,
            os_version: deviceInfo.os.version,
            ip_address: ipAddress,
            location,
            is_current: true,
            expires_at: expiresAt
        });

        return session;
    }

    /**
     * Log login attempt
     */
    static async logLoginAttempt(email, userId, ipAddress, userAgent, success, failureReason = null, location = null) {
        return await LoginAttempt.create({
            email,
            user_id: userId,
            ip_address: ipAddress,
            user_agent: userAgent,
            success,
            failure_reason: failureReason,
            location
        });
    }

    /**
     * Check if account is locked
     */
    static async isAccountLocked(user) {
        if (!user.locked_until) return false;
        if (new Date() < user.locked_until) return true;

        // Unlock expired lockout
        await user.update({
            locked_until: null,
            failed_login_attempts: 0
        });
        return false;
    }

    /**
     * Handle failed login attempt
     */
    static async handleFailedLogin(user) {
        const attempts = (user.failed_login_attempts || 0) + 1;
        const updates = { failed_login_attempts: attempts };

        if (attempts >= MAX_LOGIN_ATTEMPTS) {
            const lockUntil = new Date();
            lockUntil.setMinutes(lockUntil.getMinutes() + LOCKOUT_DURATION);
            updates.locked_until = lockUntil;

            logger.warn({
                userId: user.id,
                email: user.email,
                attempts,
                lockUntil
            }, 'Account locked due to failed login attempts');
        }

        await user.update(updates);
        return attempts;
    }

    /**
     * Reset failed login attempts on successful login
     */
    static async resetFailedAttempts(user) {
        if (user.failed_login_attempts > 0) {
            await user.update({
                failed_login_attempts: 0,
                locked_until: null,
                last_login_at: new Date()
            });
        }
    }

    /**
     * Generate MFA secret and QR code
     */
    static async generateMfaSecret(user) {
        const secret = speakeasy.generateSecret({
            name: `HR System (${user.email})`,
            issuer: 'HR System',
            length: 32
        });

        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

        return {
            secret: secret.base32,
            qrCode: qrCodeUrl,
            manualEntryKey: secret.base32
        };
    }

    /**
     * Verify TOTP token
     */
    static verifyTotpToken(secret, token, window = 2) {
        return speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token,
            window // Allow 2 time steps before/after
        });
    }

    /**
     * Generate backup codes for MFA recovery
     */
    static async generateBackupCodes() {
        const codes = [];
        for (let i = 0; i < 10; i++) {
            const code = crypto.randomBytes(4).toString('hex').toUpperCase();
            codes.push(code);
        }
        return codes;
    }

    /**
     * Verify refresh token
     */
    static async verifyRefreshToken(token) {
        const refreshToken = await RefreshToken.findOne({
            where: { token, is_revoked: false },
            include: [{ model: User }]
        });

        if (!refreshToken) return null;
        if (new Date() > refreshToken.expires_at) {
            await refreshToken.update({ is_revoked: true });
            return null;
        }

        return refreshToken;
    }

    /**
     * Revoke refresh token
     */
    static async revokeRefreshToken(token) {
        return await RefreshToken.update(
            { is_revoked: true, revoked_at: new Date() },
            { where: { token } }
        );
    }

    /**
     * Revoke all user sessions
     */
    static async revokeAllUserSessions(userId) {
        await Promise.all([
            RefreshToken.update(
                { is_revoked: true, revoked_at: new Date() },
                { where: { user_id: userId, is_revoked: false } }
            ),
            UserSession.update(
                { terminated_at: new Date() },
                { where: { user_id: userId, terminated_at: null } }
            )
        ]);
    }

    /**
     * Clean up expired tokens and sessions
     */
    static async cleanupExpiredTokens() {
        const now = new Date();
        
        await Promise.all([
            RefreshToken.destroy({
                where: {
                    expires_at: { [Op.lt]: now }
                }
            }),
            UserSession.update(
                { terminated_at: now },
                {
                    where: {
                        expires_at: { [Op.lt]: now },
                        terminated_at: null
                    }
                }
            )
        ]);
    }
}