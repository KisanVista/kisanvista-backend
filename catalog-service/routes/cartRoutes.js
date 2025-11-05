const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../../auth-service/middleware/authMiddleware'); // Import your auth middleware

// All routes require authentication
router.use(protect);

// GET user's cart (Part 2 requirement)
router.get('/', cartController.getUserCart); 

// POST add product to cart (Part 1 requirement)
router.post('/add', cartController.addToCart); 

// PUT update item quantity
router.put('/update-quantity', cartController.updateQuantity); 

// DELETE remove item from cart
router.delete('/remove-item/:id', cartController.removeItem); 

module.exports = router;