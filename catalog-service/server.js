// catalog-service/server.js (Runs on Port 5002)
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./controllers/database'); // Make sure this path is correct

dotenv.config();

const app = express();
const PORT = process.env.CATALOG_PORT || 5002;

connectDB(); // Connect to MongoDB

// Middleware
app.use(cors());
app.use(express.json());

// Routes (Load the product and cart routes)
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');

// Products: These routes are public/admin-only and should be secured internally.
app.use('/products', productRoutes); 

// Cart: These routes require JWT authentication.
app.use('/cart', cartRoutes);

app.listen(PORT, () => {
    console.log(`📦 Catalog/Inventory Service running on Port ${PORT}`);
});