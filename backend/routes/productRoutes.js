/**
 * Product Routes
 * Defines all API endpoints for product operations
 */

const express = require('express');
const router = express.Router();

// Import product controller functions
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  updateProductStock
} = require('../controllers/productController');

/**
 * @route   GET /api/products/low-stock
 * @desc    Get products with low stock
 * @access  Public
 * @note    This route must be BEFORE /:id route to avoid conflicts
 */
router.get('/low-stock', getLowStockProducts);

/**
 * @route   GET /api/products
 * @desc    Get all products with optional filtering and pagination
 * @access  Public
 * @query   category, status, page, limit, sortBy, sortOrder, search
 */
router.get('/', getAllProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 * @access  Public
 * @param   id - Product ObjectId
 */
router.get('/:id', getProductById);

/**
 * @route   POST /api/products
 * @desc    Create new product
 * @access  Public
 * @body    name, reference, quantity, price, description, category, minStock, unit, status
 */
router.post('/', createProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product by ID (full update)
 * @access  Public
 * @param   id - Product ObjectId
 * @body    Updated product fields
 */
router.put('/:id', updateProduct);

/**
 * @route   PATCH /api/products/:id/stock
 * @desc    Update product stock quantity
 * @access  Public
 * @param   id - Product ObjectId
 * @body    quantity, operation (set|add|subtract)
 */
router.patch('/:id/stock', updateProductStock);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product by ID
 * @access  Public
 * @param   id - Product ObjectId
 */
router.delete('/:id', deleteProduct);

module.exports = router;
