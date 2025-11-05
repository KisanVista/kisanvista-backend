// logistics-service/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // Assuming you'll need CORS

// --- NEW IMPORTS ---
const db = require('./controllers/db'); 
const dpRoutes = require('./routes/dpRoutes');
// -------------------

dotenv.config();

const app = express();
const PORT = process.env.LOGISTICS_PORT || 5004; 

// Middleware
app.use(cors());
app.use(express.json());

// Initialize DB connection pool (must be done before routes that use it)
// NOTE: Connection errors will be logged by the pool.on('error') handler in db.js
db.pool; 

// Basic Route for Health Check
app.get('/', (req, res) => {
    res.send('🚚 Logistics Service is running.');
});

// --- Logistics Routes ---
// The final external path will be /api/logistics/dp/location (Gateway prefix + /dp)
app.use('/dp', dpRoutes); 

// Start the server
app.listen(PORT, () => {
    console.log(`🚚 Logistics Service running on Port ${PORT}`);
});