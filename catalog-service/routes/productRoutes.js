const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// GET all products with filtering, sorting, and pagination
router.get('/', productController.getProducts);

// GET a single product by ID
router.get('/:id', productController.getProductById);


// --- PROTECTED ADMIN ROUTES ---

// POST a new product (admin only)
router.post('/', protect, admin, productController.createProduct);

// DELETE a product by ID
router.delete('/:id', protect, admin, productController.deleteProduct);

// Update a product by ID (using PUT for full replacements)
router.put('/:id',protect, admin, productController.updateProduct);

// Update a product by ID (using PATCH for partial updates)
router.patch('/:id', protect, admin, productController.updateProduct);


// AI Insights
router.post('/ai-insights', productController.getAiInsights);

module.exports = router;
