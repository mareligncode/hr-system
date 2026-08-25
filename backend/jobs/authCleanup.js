import cron from 'node-cron';
import { AuthService } from '../services/authService.js';
import logger from '../utils/logger.js';

/**
 * Clean up expired refresh tokens and sessions every hour
 */
export const initAuthCleanup = () => {
    // Run every hour at minute 0
    cron.schedule('0 * * * *', async () => {
        try {
            logger.info('Starting auth token cleanup job');
            await AuthService.cleanupExpiredTokens();
            logger.info('Auth token cleanup completed');
        } catch (error) {
            logger.error({ err: error }, 'Auth token cleanup failed');
        }
    }, {
        timezone: 'UTC'
    });

    logger.info('Auth cleanup job scheduled');
};