const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ CRITICAL ERROR: DATABASE_URL environment variable is missing.');
    console.error('📝 Create a .env file with: DATABASE_URL=postgresql://user:password@host:port/database');
    // In dev, we might not want to exit immediately if running without DB, but for this app it seems critical.
    // However, to allow build steps on Render (which might not have DB env during build), we should be careful.
    // But this is runtime.
    if (process.env.NODE_ENV !== 'production') {
        // console.warn('Warning: No DATABASE_URL found.');
    } else {
        process.exit(1);
    }
}

const pool = new Pool({
    connectionString: connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};
