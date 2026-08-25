import pg from 'pg';

const maxAttempts = 30;
let attempts = 0;

const waitForDb = async () => {
    console.log(`⏳ Waiting for database... (attempt ${attempts + 1}/${maxAttempts})`);
    
    const client = new pg.Client({
        host: process.env.DB_HOST || 'db',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'hr_user',
        password: process.env.DB_PASSWORD || 'hr_password',
        database: process.env.DB_NAME || 'hr_database',
        connectTimeoutMillis: 5000,
    });

    try {
        await client.connect();
        await client.query('SELECT 1');
        await client.end();
        console.log('✅ Database is ready!');
        return true;
    } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
            console.error('❌ Database is not ready after maximum attempts');
            console.error('Last error:', error.message);
            process.exit(1);
        }
        // Wait 2 seconds before next attempt
        await new Promise(resolve => setTimeout(resolve, 2000));
        return waitForDb();
    }
};

waitForDb();