

// C:\Users\Kishan B M\Desktop\kisanvista-backend\server.js

const express = require('express');
const proxy = require('http-proxy-middleware');
const createProxyMiddleware = proxy.createProxyMiddleware; // (Should be here)
const cors = require('cors');
const dotenv = require('dotenv');
const { buffer } = require('stream/consumers');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
// app.use(express.json());

// --- 1. PROXY: AUTH/USER SERVICE (Port 5001) ---
const authProxyOptions = {
    target: 'http://auth-service:5001', 
    changeOrigin: true,
    
};
const authProxy = createProxyMiddleware(authProxyOptions); 
app.use('/api/auth', authProxy);

const adminRegisterProxyOptions = {
    // Target the Auth Service base path (Port 5001)
    target: 'http://auth-service:5001', 
    changeOrigin: true,
};

// Apply the proxy specifically to the /admin path
const adminProxy = createProxyMiddleware(adminRegisterProxyOptions); 
app.use('/admin', adminProxy);


// --- 2. PROXY: CART/INVENTORY SERVICE (Port 5002) ---

// NOTE: We must pass the options object to createProxyMiddleware
// AND NOT the array of contexts if we want to follow the previous pattern
const cartProxyOptions = {
    target: 'http://catalog-service:5002', 
    changeOrigin: true,
    logLevel: 'debug',
    // buffer: true, 
};
const catalogProxy = createProxyMiddleware(cartProxyOptions); // Renamed from cartProxy to catalogProxy
app.use(['/api/products', '/api/cart', '/api/chatbot'], catalogProxy); // Context array in app.use is fine

// --- 3. PROXY: ORDER SERVICE (Port 5003) ---

const orderProxyOptions = {
    target: 'http://order-service:5003', // THIS IS THE BLOCK WE JUST EDITED
    changeOrigin: true,
    logLevel: 'debug',
    // buffer: true, 
};

// Pass ONLY the options object
const orderProxy = createProxyMiddleware(orderProxyOptions); 

// Specify the path in app.use()
app.use('/api/orders', orderProxy);

// --- NEW PROXY: LOGISTICS SERVICE (Port 5004) ---
const logisticsProxyOptions = {
    target: 'http://logistics-service:5004', // Use Docker service name
    changeOrigin: true,
};
const logisticsProxy = createProxyMiddleware(logisticsProxyOptions);
app.use('/api/logistics', logisticsProxy);

// Catch-all for non-proxied/non-local routes
app.use((req, res) => {
    res.status(404).json({ message: 'Gateway: Endpoint not found or service unavailable.' });
});


app.listen(PORT, () => {
    console.log(`🌐 API Gateway running on Port ${PORT}`);
    console.log(`(Proxies /api/auth to Port 5001)`);
});