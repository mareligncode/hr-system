import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const isTestEnv = process.env.NODE_ENV === 'test';

const sequelize = isTestEnv
    ? new Sequelize('sqlite::memory:', { logging: false })
    : process.env.DATABASE_URL
        ? new Sequelize(process.env.DATABASE_URL, {
            dialect: 'postgres',
            logging: false,
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false
                }
            }
        })
        : new Sequelize(
            process.env.DB_NAME,
            process.env.DB_USER,
            process.env.DB_PASSWORD,
            {
                host: process.env.DB_HOST,
                dialect: process.env.DB_DIALECT || 'mysql',
                port: process.env.DB_PORT || (process.env.DB_DIALECT === 'postgres' ? 5432 : 3306),
                logging: false,
                dialectOptions: (process.env.DB_DIALECT === 'postgres' || (process.env.DB_HOST && process.env.DB_HOST.includes('supabase'))) ? {
                    ssl: {
                        require: true,
                        rejectUnauthorized: false
                    }
                } : {}
            }
        );

export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection to the database has been established successfully.');

        await sequelize.sync();
        console.log('Models synchronized with database.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

export default sequelize;
