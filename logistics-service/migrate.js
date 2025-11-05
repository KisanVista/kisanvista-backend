// logistics-service/migrate.js (SIMPLIFIED and CORRECTED)
const dotenv = require('dotenv');
const { execSync } = require('child_process');

dotenv.config();

// Construct the URL using environment variables
// IMPORTANT: The PG_HOST must be the Docker service name (postgres_db)
const DATABASE_URL = `postgres://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.LOGISTICS_DB_NAME}`;

// Set the DATABASE_URL environment variable for npx to use
process.env.DATABASE_URL = DATABASE_URL;
const MIGRATION_DIR = './migrations';

console.log(`\n🗺️ Starting PostGIS migrations for DB: ${process.env.LOGISTICS_DB_NAME}`);

try {
    // Run the npx command, which now automatically uses process.env.DATABASE_URL
    execSync(`npx pg-migrate --dir ${MIGRATION_DIR} up`, { stdio: 'inherit' });
    
    console.log('✅ Migrations completed successfully.');
} catch (error) {
    console.error('❌ Migration failed. Check DB connection and credentials in .env.');
    // The error output from pg-migrate will be visible due to stdio: 'inherit'
}