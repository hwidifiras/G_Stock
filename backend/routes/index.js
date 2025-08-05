/**
 * Main Routes File
 * Centralizes all route definitions
 */

const express = require('express');
const router = express.Router();

// Import route modules
const productRoutes = require('./productRoutes');

/**
 * API Routes Configuration
 * All routes are prefixed with /api
 */

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running successfully',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Product routes - all product-related endpoints
router.use('/products', productRoutes);

// API documentation route
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Stock Management API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      products: {
        getAll: 'GET /api/products',
        getById: 'GET /api/products/:id',
        create: 'POST /api/products',
        update: 'PUT /api/products/:id',
        delete: 'DELETE /api/products/:id',
        lowStock: 'GET /api/products/low-stock',
        updateStock: 'PATCH /api/products/:id/stock'
      }
    }
  });
});

module.exports = router;
