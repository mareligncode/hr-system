import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from 'helmet';
import { connectDB } from './config/database.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import './models/index.js';

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

dotenv.config();

const app = express();

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "data:", "res.cloudinary.com"],
            "connect-src": ["'self'", "res.cloudinary.com"],
            "frame-src": ["'self'", "res.cloudinary.com"],
            "object-src": ["'self'", "res.cloudinary.com"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));

connectDB();

const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS: Origin '${origin}' not allowed`));
        }
    },
    credentials: true,
}));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});

app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

import { checkAndNotifyExpiries } from './services/notificationService.js';
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
setInterval(() => {
    checkAndNotifyExpiries().catch(err => console.error('Scheduled Expiry Check Failed:', err));
}, TWENTY_FOUR_HOURS);

setTimeout(() => {
    checkAndNotifyExpiries().catch(err => console.error('Initial Expiry Check Failed:', err));
}, 10000);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

