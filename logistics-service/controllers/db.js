// logistics-service/controllers/db.js
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Configuration pulled from the .env file
const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.LOGISTICS_DB_NAME || 'logistics_db', // Default DB name
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT || 5432,
});

pool.on('connect', () => {
    console.log('🗺️ Connected to PostGIS Database');
});

// Optional: Error handling for idle clients
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle PG client', err);
    process.exit(-1);
});

module.exports = {
    // Export a helper function to run queries
    query: (text, params) => pool.query(text, params),
    // Export the pool directly if needed
    pool: pool,
};