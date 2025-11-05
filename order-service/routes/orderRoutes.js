// orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware'); // Import middleware

// All order routes require JWT authentication
router.use(protect); 

// Create a new order (Used by Farmer after checkout)
router.post('/', orderController.createOrder);

// Get orders based on user role (Admin gets all, Supplier gets their assigned, Farmer gets own)
router.get('/', orderController.getOrders);

// Update order status (Used by Supplier/DP/Admin)
router.patch('/status/:id', orderController.updateOrderStatus);

// NOTE: Specific role checks (e.g., only Admin can view all) will be handled inside orderController.getOrders

module.exports = router;