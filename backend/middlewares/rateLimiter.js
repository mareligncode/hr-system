import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV !== 'production';

// General API rate limiter
// Development: effectively disabled (10,000 req/15min) so you never hit it during testing
// Production: 500 req/15min per IP — enough for normal HR app usage
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: isDev ? 10_000 : 500,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => isDev, // completely skip in development
    message: { message: 'Too many requests. Please try again later.' }
});

// Strict limiter for auth routes only (login, register, forgot-password)
// Protects against brute-force attacks
// Development: relaxed (100/hour) so you can test login flows freely
// Production: 20/hour per IP
export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: isDev ? 100 : 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many login attempts. Please try again after an hour.' }
});
