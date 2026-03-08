import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const isTestEnv = process.env.NODE_ENV === 'test';

const sequelize = isTestEnv
    ? new Sequelize('sqlite::memory:', { logging: false })
    : new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            dialect: process.env.DB_DIALECT || 'mysql',
            port: process.env.DB_PORT || 3306,
            logging: false, // Set to console.log to see SQL queries
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
