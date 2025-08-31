/**
 * Stock Movements Routes
 * API endpoints for stock movement operations
 */

const express = require('express');
const router = express.Router();
const StockMovementController = require('../controllers/stockMovementController');

// Base routes for stock movements
router.get('/', StockMovementController.getMovements);
router.post('/', StockMovementController.createMovement);
router.post('/bulk', StockMovementController.bulkCreateMovements);
router.get('/analytics', StockMovementController.getMovementAnalytics);

// Product-specific movements
router.get('/product/:productId', StockMovementController.getProductMovements);

// Individual movement operations
router.get('/:id', async (req, res) => {
  try {
    const StockMovement = require('../models/StockMovement');
    const movement = await StockMovement.findById(req.params.id)
      .populate('product', 'name reference category sku');
    
    if (!movement) {
      return res.status(404).json({
        success: false,
        message: 'Stock movement not found'
      });
    }

    res.json({
      success: true,
      data: movement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock movement',
      error: error.message
    });
  }
});

router.put('/:id', StockMovementController.updateMovement);
router.delete('/:id', StockMovementController.deleteMovement);

module.exports = router;
