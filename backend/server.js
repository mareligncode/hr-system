import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import logger from './utils/logger.js';
import { requestId } from './middlewares/requestId.js';
import { connectDB } from './config/database.js';
import sequelize from './config/database.js';
import { apiLimiter, authLimiter } from './middlewares/rateLimiter.js';
import './models/index.js';

// ─── Route imports ────────────────────────────────────────────────────────────
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import positionRoutes from './routes/positionRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import certificationRoutes from './routes/certificationRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import shiftRoutes from './routes/shiftRoutes.js';
import jobPostingRoutes from './routes/jobPostingRoutes.js';
import jobApplicationRoutes from './routes/jobApplicationRoutes.js';
import applicantRoutes from './routes/applicantRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import offerRoutes from './routes/offerRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import performanceRoutes from './routes/performanceRoutes.js';
import lmsRoutes from './routes/lmsRoutes.js';
import welfareRoutes from './routes/welfareRoutes.js';
import recruitmentRoutes from './routes/recruitmentRoutes.js';
import financialRoutes from './routes/financialRoutes.js';

import { setupSwagger } from './config/swagger.js';
import { checkAndNotifyExpiries } from './services/notificationService.js';
import { initCronJobs } from './services/cronService.js';

if (process.env.DOCKER !== 'true') {
    const { default: dotenv } = await import('dotenv');
    dotenv.config();
}

const app = express();

app.use(requestId);

// ─── HTTP request logging via pino-http ───────────────────────────────────────
app.use(
    pinoHttp({
        logger,
        genReqId: (req) => req.id,
        autoLogging: {
            ignore: (req) =>
                process.env.NODE_ENV === 'production' &&
                req.url === '/api/health',
        },
        customLogLevel: (_req, res, err) => {
            if (err || res.statusCode >= 500) return 'error';
            if (res.statusCode >= 400) return 'warn';
            return 'info';
        },
    }),
);

// ─── Security headers ─────────────────────────────────────────────────────────
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                'img-src': ["'self'", 'data:', 'https://*.cloudinary.com'],
                'connect-src': ["'self'"],
                'frame-src': ["'self'"],
                'object-src': ["'none'"],
            },
        },
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
);

const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push(
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
    );
}

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow non-browser requests (Postman, server-to-server, health checks)
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, true);
            logger.warn({ origin }, 'CORS: blocked request from disallowed origin');
            callback(new Error(`CORS: origin '${origin}' not allowed`));
        },
        credentials: true,
    }),
);

// ─── Body parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Static files ─────────────────────────────────────────────────────────────
app.use('/uploads', express.static('uploads'));

// ─── Rate limiting — disabled for development ─────────────────────────────────
// Uncomment these lines before going to production
// app.use('/api/auth', authLimiter);
// app.use('/api', apiLimiter);

setupSwagger(app);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/job-postings', jobPostingRoutes);
app.use('/api/job-applications', jobApplicationRoutes);
app.use('/api/applicants', applicantRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/lms', lmsRoutes);
app.use('/api/welfare', welfareRoutes);
app.use('/api/recruitment', recruitmentRoutes);
app.use('/api/finance', financialRoutes);

app.get('/api/health', async (_req, res) => {
    try {
        await sequelize.authenticate();
        res.status(200).json({
            status: 'ok',
            db: 'connected',
            uptime: Math.floor(process.uptime()),
            timestamp: new Date().toISOString(),
            env: process.env.NODE_ENV || 'development',
        });
    } catch (err) {
        logger.error({ err }, 'Health check: database unreachable');
        res.status(503).json({
            status: 'error',
            db: 'disconnected',
            message: 'Database connection failed',
            timestamp: new Date().toISOString(),
        });
    }
});

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global error handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    logger.error({ err, requestId: req.id }, 'Unhandled error');
    res.status(status).json({
        success: false,
        message: err.message || 'Internal Server Error',
        requestId: req.id,
        // Stack trace only in development — never expose in production
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
});

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 5000;

await connectDB();

const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

setTimeout(() => {
    checkAndNotifyExpiries().catch((err) =>
        logger.error({ err }, 'Initial expiry check failed'),
    );
    initCronJobs();
}, 10_000);

// Re-run expiry check every 24 hours
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
setInterval(() => {
    checkAndNotifyExpiries().catch((err) =>
        logger.error({ err }, 'Scheduled expiry check failed'),
    );
}, TWENTY_FOUR_HOURS);
// ─── Graceful shutdown ────────────────────────────────────────────────────────
const shutdown = async (signal) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
        logger.info('HTTP server closed');
        try {
            await sequelize.close();
            logger.info('Database pool closed');
        } catch (err) {
            logger.error({ err }, 'Error closing database pool');
        }
        process.exit(0);
    });

    // Force exit after 15s if graceful shutdown hangs
    setTimeout(() => {
        logger.error('Graceful shutdown timed out — forcing exit');
        process.exit(1);
    }, 15_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Catch unhandled promise rejections — log and exit so the process restarts
process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled promise rejection');
    process.exit(1);
});

export default app;
