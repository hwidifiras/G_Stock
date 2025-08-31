/**
 * Stock Movements Controller
 * Handles all stock movement operations and analytics
 */

const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');

class StockMovementController {
  
  // Create a new stock movement
  static async createMovement(req, res) {
    try {
      const {
        productId,
        type,
        quantity,
        unitPrice,
        reason,
        description,
        reference,
        batchNumber,
        supplier,
        customer,
        location,
        movementDate
      } = req.body;

      // Validate product exists
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Validate stock availability for exits
      if ((type === 'exit' || (type === 'adjustment' && quantity < 0)) 
          && product.quantity < Math.abs(quantity)) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock available',
          currentStock: product.quantity,
          requestedQuantity: Math.abs(quantity)
        });
      }

      const movement = new StockMovement({
        product: productId,
        type,
        quantity: type === 'exit' ? -Math.abs(quantity) : quantity,
        unitPrice: unitPrice || product.price,
        reason,
        description,
        reference,
        batchNumber,
        supplier,
        customer,
        location,
        movementDate: movementDate || new Date(),
        createdBy: req.user?.id || 'system',
        metadata: {
          source: 'api',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });

      await movement.save();
      
      // Populate product details for response
      await movement.populate('product', 'name reference category');

      res.status(201).json({
        success: true,
        message: 'Stock movement created successfully',
        data: movement
      });

    } catch (error) {
      console.error('Error creating stock movement:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create stock movement',
        error: error.message
      });
    }
  }

  // Get all stock movements with filtering and pagination
  static async getMovements(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        productId,
        reason,
        status,
        startDate,
        endDate,
        sortBy = 'movementDate',
        sortOrder = 'desc'
      } = req.query;

      // Build filter object
      const filter = {};
      
      if (type) filter.type = type;
      if (productId) filter.product = productId;
      if (reason) filter.reason = reason;
      if (status) filter.status = status;
      
      if (startDate || endDate) {
        filter.movementDate = {};
        if (startDate) filter.movementDate.$gte = new Date(startDate);
        if (endDate) filter.movementDate.$lte = new Date(endDate);
      }

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute query
      const [movements, total] = await Promise.all([
        StockMovement.find(filter)
          .populate('product', 'name reference category sku')
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit)),
        StockMovement.countDocuments(filter)
      ]);

      res.json({
        success: true,
        data: {
          movements,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalItems: total,
            itemsPerPage: parseInt(limit),
            hasNextPage: skip + movements.length < total,
            hasPrevPage: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Error fetching stock movements:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch stock movements',
        error: error.message
      });
    }
  }

  // Get movements for a specific product
  static async getProductMovements(req, res) {
    try {
      const { productId } = req.params;
      const { limit = 50 } = req.query;

      const movements = await StockMovement.getMovementsByProduct(productId, parseInt(limit));

      res.json({
        success: true,
        data: movements
      });

    } catch (error) {
      console.error('Error fetching product movements:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product movements',
        error: error.message
      });
    }
  }

  // Get movement analytics and statistics
  static async getMovementAnalytics(req, res) {
    try {
      const { timeframe = '30d' } = req.query;
      const days = parseInt(timeframe.replace('d', ''));
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get movement summary
      const [summary, recentMovements, topProducts, dailyMovements] = await Promise.all([
        StockMovement.getMovementsSummary(timeframe),
        
        // Recent movements
        StockMovement.find({
          movementDate: { $gte: startDate },
          status: 'completed'
        })
        .populate('product', 'name reference category')
        .sort({ movementDate: -1 })
        .limit(10),

        // Top products by movement frequency
        StockMovement.aggregate([
          {
            $match: {
              movementDate: { $gte: startDate },
              status: 'completed'
            }
          },
          {
            $group: {
              _id: '$product',
              totalMovements: { $sum: 1 },
              totalQuantity: { $sum: { $abs: '$quantity' } },
              totalValue: { $sum: '$totalValue' }
            }
          },
          {
            $lookup: {
              from: 'products',
              localField: '_id',
              foreignField: '_id',
              as: 'product'
            }
          },
          {
            $unwind: '$product'
          },
          {
            $sort: { totalMovements: -1 }
          },
          {
            $limit: 10
          }
        ]),

        // Daily movement trends
        StockMovement.aggregate([
          {
            $match: {
              movementDate: { $gte: startDate },
              status: 'completed'
            }
          },
          {
            $group: {
              _id: {
                date: { $dateToString: { format: '%Y-%m-%d', date: '$movementDate' } },
                type: '$type'
              },
              count: { $sum: 1 },
              totalQuantity: { $sum: { $abs: '$quantity' } },
              totalValue: { $sum: '$totalValue' }
            }
          },
          {
            $sort: { '_id.date': 1 }
          }
        ])
      ]);

      // Process summary data
      const processedSummary = {
        totalMovements: summary.reduce((acc, curr) => acc + curr.count, 0),
        totalValue: summary.reduce((acc, curr) => acc + curr.totalValue, 0),
        byType: summary.reduce((acc, curr) => {
          acc[curr._id] = {
            count: curr.count,
            totalQuantity: curr.totalQuantity,
            totalValue: curr.totalValue,
            avgQuantity: curr.avgQuantity
          };
          return acc;
        }, {})
      };

      res.json({
        success: true,
        data: {
          summary: processedSummary,
          recentMovements,
          topProducts,
          dailyTrends: dailyMovements,
          timeframe: {
            days,
            startDate,
            endDate: new Date()
          }
        }
      });

    } catch (error) {
      console.error('Error fetching movement analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch movement analytics',
        error: error.message
      });
    }
  }

  // Update movement status
  static async updateMovement(req, res) {
    try {
      const { id } = req.params;
      const { status, description } = req.body;

      const movement = await StockMovement.findById(id);
      if (!movement) {
        return res.status(404).json({
          success: false,
          message: 'Stock movement not found'
        });
      }

      if (status) movement.status = status;
      if (description) movement.description = description;

      await movement.save();
      await movement.populate('product', 'name reference category');

      res.json({
        success: true,
        message: 'Stock movement updated successfully',
        data: movement
      });

    } catch (error) {
      console.error('Error updating stock movement:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update stock movement',
        error: error.message
      });
    }
  }

  // Delete/Cancel movement
  static async deleteMovement(req, res) {
    try {
      const { id } = req.params;
      const { reason = 'Deleted by user' } = req.body;

      const movement = await StockMovement.findById(id);
      if (!movement) {
        return res.status(404).json({
          success: false,
          message: 'Stock movement not found'
        });
      }

      // If movement is completed, cancel instead of delete
      if (movement.status === 'completed') {
        await movement.cancel(reason);
        res.json({
          success: true,
          message: 'Stock movement cancelled successfully'
        });
      } else {
        await StockMovement.findByIdAndDelete(id);
        res.json({
          success: true,
          message: 'Stock movement deleted successfully'
        });
      }

    } catch (error) {
      console.error('Error deleting stock movement:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete stock movement',
        error: error.message
      });
    }
  }

  // Bulk create movements (for imports)
  static async bulkCreateMovements(req, res) {
    try {
      const { movements } = req.body;

      if (!Array.isArray(movements) || movements.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Movements array is required'
        });
      }

      const results = {
        successful: [],
        failed: []
      };

      for (const movementData of movements) {
        try {
          const movement = new StockMovement({
            ...movementData,
            createdBy: req.user?.id || 'bulk_import',
            metadata: {
              source: 'bulk_import',
              ipAddress: req.ip
            }
          });

          await movement.save();
          await movement.populate('product', 'name reference');
          results.successful.push(movement);

        } catch (error) {
          results.failed.push({
            movement: movementData,
            error: error.message
          });
        }
      }

      res.json({
        success: true,
        message: `Bulk import completed. ${results.successful.length} successful, ${results.failed.length} failed.`,
        data: results
      });

    } catch (error) {
      console.error('Error in bulk create movements:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process bulk movements',
        error: error.message
      });
    }
  }
}

module.exports = StockMovementController;
