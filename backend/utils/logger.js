import pino from 'pino';

const logger = pino({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    ...(process.env.NODE_ENV !== 'production' && {
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
            },
        },
    }),
    base: {
        env: process.env.NODE_ENV || 'development',
        service: 'hr-system-backend',
    },
    serializers: {
        err: pino.stdSerializers.err,
        req: pino.stdSerializers.req,
        res: pino.stdSerializers.res,
    },
    redact: {
        paths: [
            'req.headers.authorization',
            'req.body.password',
            'req.body.password_hash',
            'req.body.currentPassword',
            'req.body.newPassword',
        ],
        censor: '[REDACTED]',
    },
});

export default logger;
