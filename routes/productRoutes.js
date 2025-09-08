const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET all products with filtering, sorting, and pagination
router.get('/', productController.getProducts);

// GET a single product by ID
router.get('/:id', productController.getProductById);

// POST a new product (admin only)
router.post('/', productController.createProduct);

// Update a product by ID
router.put('/:id', productController.updateProduct);

// DELETE a product by ID
router.delete('/:id', productController.deleteProduct);

// AI Insights
router.post('/ai-insights', productController.getAiInsights);

module.exports = router;
