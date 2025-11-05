// C:\Users\Kishan B M\Desktop\kisanvista-backend\order-service\server.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// --- Service-Specific Imports ---
const connectDB = require('./controllers/database'); // DB connection for Order Service
const orderRoutes = require('./routes/orderRoutes'); 
const { protect } = require('./middleware/authMiddleware'); // Import middleware

dotenv.config();

const app = express();
// --- CRITICAL: Set Port 5003 for the Order Service ---
const PORT = process.env.ORDER_SERVICE_PORT || 5003; 

// Connect to MongoDB (Order Service needs its own connection)
connectDB(); 

// Middleware
app.use(cors());
app.use(express.json()); // Allows parsing of JSON request bodies

// --- AUTHENTICATION GATEWAY ---
// Apply the protect middleware globally or on specific routes to validate JWTs.
// Since all Order routes are protected, we apply it here.
app.use(protect);

// --- ORDER SERVICE ROUTES ---
app.use('/', orderRoutes); // All order routes start here

// Catch-all for undefined routes in this service
app.use((req, res) => {
    res.status(404).json({ message: 'Order Service: Endpoint not found.' });
});


app.listen(PORT, () => {
    console.log(`📦 Order Service running on Port ${PORT}`);
    console.log(`(DB Connection: Separate Order Database)`);
});