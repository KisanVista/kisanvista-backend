// C:\Users\Kishan B M\Desktop\kisanvista-backend\auth-service\server.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
// CRITICAL FIX 1: Import the PostgreSQL client's query function
let db;
try {
    // This executes db.js and creates the pool
    db = require('./controllers/db'); 
} catch (error) {
    console.error('❌ FATAL CRASH: Database module failed to initialize:', error.message);
    process.exit(1); // Exit immediately if the database import fails
}
const authRoutes = require('./routes/authRoutes');


const app = express();
// Set the port for the Auth Service (Port 5001)
const PORT = process.env.PORT || 5001; 

// CRITICAL FIX 2: Check PostgreSQL connection on startup
// The db.js file connects and logs connection status upon import/creation of the pool.
// We don't need a specific function call here, just the import ensures it's running.

// Middleware
app.use(cors());
app.use(express.json());

// --- AUTH SERVICE ROUTES ---
// NOTE: These are the local routes for the Auth Service itself
app.use('', authRoutes); 

// Catch-all for undefined routes in this service
app.use((req, res) => {
    res.status(404).json({ message: 'Auth Service: Endpoint not found.' });
});


app.listen(PORT, () => {
    console.log(`🔑 Auth Service running on Port ${PORT}`);
});