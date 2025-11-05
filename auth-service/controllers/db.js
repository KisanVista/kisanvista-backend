// auth-service/controllers/db.js
const { Pool } = require('pg');
const dotenv = require('dotenv');

// dotenv.config();

const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
    
});

pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL Database');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
    // In production, you would handle connection pooling errors gracefully
    // process.exit(-1); 
});


pool.connect()
    .then(client => {
        client.release(); // Release client back to the pool
        console.log('✅ PostgreSQL Pool connection successful.');
    })
    .catch(err => {
        // This is the CRITICAL catch for immediate connection failure
        console.error('❌ FATAL: Immediate PostgreSQL connection test failed:', err.message);
        // Throwing here will be caught by the try/catch in server.js
        throw new Error("PostgreSQL connection failed. Check credentials/server status.");
    });

module.exports = {
    // Export a function to run direct queries
    query: (text, params) => pool.query(text, params),
    // Export the pool instance for migrations
    pool, 
};