import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

if (process.env.DOCKER !== 'true') {
    dotenv.config();
}

dotenv.config();

const isTestEnv = process.env.NODE_ENV === 'test';
const isProdEnv = process.env.NODE_ENV === 'production';

// Connection pool — larger in production, minimal in development
const poolConfig = {
    max:     isProdEnv ? 20 : 5,
    min:     isProdEnv ? 2  : 0,
    acquire: 30000,
    idle:    10000,
};

const isHostedDB =
    (process.env.DB_HOST && (
        process.env.DB_HOST.includes('supabase') ||
        process.env.DB_HOST.includes('neon')     ||
        process.env.DB_HOST.includes('rds')      ||
        process.env.DB_HOST.includes('amazonaws')
    ));

const sslOptions = isHostedDB
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {};

// ── Build the Sequelize instance ─────────────────────────────────────────────

let sequelize;

if (isTestEnv) {
    // SQLite in-memory for unit tests — no real DB needed
    sequelize = new Sequelize('sqlite::memory:', { logging: false });

} else if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '') {
    // Full connection URL — used for hosted DBs (Supabase, Neon, etc.)
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: false,
        pool: poolConfig,
        dialectOptions: sslOptions,
    });

} else {
    // Individual env vars — used for local Docker postgres
    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host:    process.env.DB_HOST     || 'localhost',
            dialect: process.env.DB_DIALECT  || 'postgres',
            port:    Number(process.env.DB_PORT) || 5432,
            logging: false,
            pool:    poolConfig,
            dialectOptions: sslOptions,
        },
    );
}

// ── Connect & optionally sync schema ─────────────────────────────────────────

export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        logger.info({ host: process.env.DB_HOST || 'local' }, 'Database connection established.');

        if (!isProdEnv && !isTestEnv) {
            await sequelize.sync({ alter: true });
            logger.info('Database schema synced (development mode — alter:true).');
        }

    } catch (error) {
        logger.error({ err: error }, 'Unable to connect to the database. Exiting.');
        process.exit(1);
    }
};

export default sequelize;
