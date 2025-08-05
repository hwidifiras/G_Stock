/**
 * 📚 LEARNING EXERCISE 1.2: Advanced Product Controller
 * 
 * OBJECTIVE: Master advanced controller patterns and error handling
 * TIME: 3-4 hours
 * 
 * WHAT YOU'LL LEARN:
 * - Advanced query building and filtering
 * - File upload handling
 * - Comprehensive error handling
 * - Response standardization
 * - Performance optimization techniques
 * 
 * TASKS TO COMPLETE:
 * 1. Implement advanced filtering and search
 * 2. Add image upload functionality
 * 3. Create bulk operations
 * 4. Add caching mechanisms
 * 5. Implement data export features
 */

const Product = require('../models/Product');
const { validateProductData, calculatePagination } = require('../utils/helpers');

/**
 * 🎯 TASK 1: Enhanced getAllProducts with advanced filtering
 * LEARN: Building complex database queries dynamically
 */
const getAllProducts = async (req, res) => {
  try {
    const { 
      // Filtering
      category, 
      status = 'active', 
      stockStatus, // 'low-stock', 'out-of-stock', 'in-stock'
      priceMin,
      priceMax,
      search,
      tags,
      
      // Pagination
      page = 1, 
      limit = 10,
      
      // Sorting
      sortBy = 'createdAt',
      sortOrder = 'desc',
      
      // Special queries
      includeInactive = false,
      lowStockOnly = false
    } = req.query;

    // 🔍 LEARN: Building dynamic filter objects
    const filter = {};
    
    // Basic filters
    if (category) filter.category = new RegExp(category, 'i');
    if (!includeInactive) filter.status = status;
    
    // Price range filter
    if (priceMin || priceMax) {
      filter.price = {};
      if (priceMin) filter.price.$gte = parseFloat(priceMin);
      if (priceMax) filter.price.$lte = parseFloat(priceMax);
    }
    
    // Stock status filter
    if (stockStatus) {
      switch (stockStatus) {
        case 'out-of-stock':
          filter.quantity = 0;
          break;
        case 'low-stock':
          filter.$expr = { $lte: ['$quantity', '$minStock'] };
          filter.quantity = { $gt: 0 };
          break;
        case 'in-stock':
          filter.$expr = { $gt: ['$quantity', '$minStock'] };
          break;
      }
    }
    
    // Low stock only
    if (lowStockOnly === 'true') {
      filter.$expr = { $lte: ['$quantity', '$minStock'] };
    }
    
    // Tags filter
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagArray.map(tag => new RegExp(tag, 'i')) };
    }
    
    // Search filter
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { reference: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // 🔍 LEARN: Pagination calculations
    const pagination = calculatePagination(page, limit);
    
    // 🔍 LEARN: Dynamic sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // 🎯 TASK 2: Execute optimized query with aggregation
    const pipeline = [
      { $match: filter },
      { $sort: sort },
      { $skip: pagination.skip },
      { $limit: pagination.itemsPerPage },
      {
        $addFields: {
          isLowStock: { $lte: ['$quantity', '$minStock'] },
          stockStatus: {
            $switch: {
              branches: [
                { case: { $eq: ['$quantity', 0] }, then: 'out-of-stock' },
                { case: { $lte: ['$quantity', '$minStock'] }, then: 'low-stock' }
              ],
              default: 'in-stock'
            }
          },
          totalValue: { $multiply: ['$quantity', '$price'] }
        }
      }
    ];

    const products = await Product.aggregate(pipeline);
    const total = await Product.countDocuments(filter);

    // 🔍 LEARN: Comprehensive response with metadata
    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        ...pagination,
        total,
        totalPages: Math.ceil(total / pagination.itemsPerPage)
      },
      filters: {
        applied: Object.keys(req.query).length,
        category,
        status,
        stockStatus,
        search,
        priceRange: priceMin || priceMax ? { min: priceMin, max: priceMax } : null
      },
      metadata: {
        queryTime: Date.now() - req.startTime, // Add timing middleware
        cacheHit: false // For future caching implementation
      }
    });

  } catch (error) {
    console.error('Error in getAllProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * 🎯 TASK 3: Enhanced getProductById with view tracking
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const { incrementView = true } = req.query;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        code: 'PRODUCT_NOT_FOUND'
      });
    }

    // 🔍 LEARN: Optional view tracking
    if (incrementView === 'true') {
      await product.incrementView();
    }

    // 🔍 LEARN: Include related data
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      status: 'active'
    }).limit(5).select('name reference price image');

    res.status(200).json({
      success: true,
      data: product,
      related: relatedProducts,
      metadata: {
        viewed: incrementView === 'true',
        fetchedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in getProductById:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
        code: 'INVALID_ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching product',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * 🎯 TASK 4: Enhanced createProduct with file upload support
 */
const createProduct = async (req, res) => {
  try {
    let productData = req.body;

    // 🔍 LEARN: Handle file upload if present
    if (req.file) {
      productData.image = {
        url: `/uploads/${req.file.filename}`, // Adjust based on your file storage
        filename: req.file.filename,
        size: req.file.size,
        uploadDate: new Date()
      };
    }

    // 🔍 LEARN: Data validation before saving
    const validation = validateProductData(productData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
        code: 'VALIDATION_ERROR'
      });
    }

    // 🔍 LEARN: Check for duplicate reference
    const existingProduct = await Product.findOne({ 
      reference: productData.reference?.toUpperCase() 
    });
    
    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: 'Product reference already exists',
        code: 'DUPLICATE_REFERENCE',
        conflictingId: existingProduct._id
      });
    }

    const product = new Product(productData);
    const savedProduct = await product.save();

    // 🔍 LEARN: Generate activity log entry
    console.log(`📦 New product created: ${savedProduct.name} (${savedProduct.reference})`);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: savedProduct,
      metadata: {
        generatedReference: !productData.reference,
        hasImage: !!productData.image,
        createdAt: savedProduct.createdAt
      }
    });

  } catch (error) {
    console.error('Error in createProduct:', error);

    // 🔍 LEARN: Specific error handling
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors,
        code: 'VALIDATION_ERROR'
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `Duplicate value for field: ${field}`,
        code: 'DUPLICATE_KEY_ERROR',
        field,
        value: error.keyValue[field]
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating product',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * 🎯 TASK 5: Bulk operations for efficiency
 */
const createMultipleProducts = async (req, res) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Products array is required',
        code: 'INVALID_INPUT'
      });
    }

    if (products.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 100 products can be created at once',
        code: 'BATCH_SIZE_EXCEEDED'
      });
    }

    // 🔍 LEARN: Validate all products before inserting any
    const validationResults = products.map((product, index) => ({
      index,
      product,
      validation: validateProductData(product)
    }));

    const invalidProducts = validationResults.filter(result => !result.validation.isValid);

    if (invalidProducts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some products have validation errors',
        errors: invalidProducts.map(result => ({
          index: result.index,
          errors: result.validation.errors
        })),
        code: 'BULK_VALIDATION_ERROR'
      });
    }

    // 🔍 LEARN: Use insertMany for better performance
    const savedProducts = await Product.insertMany(products, { 
      ordered: false, // Continue on error
      rawResult: true 
    });

    res.status(201).json({
      success: true,
      message: `${savedProducts.insertedCount} products created successfully`,
      data: {
        insertedCount: savedProducts.insertedCount,
        insertedIds: savedProducts.insertedIds
      },
      metadata: {
        totalSubmitted: products.length,
        successful: savedProducts.insertedCount,
        failed: products.length - savedProducts.insertedCount
      }
    });

  } catch (error) {
    console.error('Error in createMultipleProducts:', error);

    if (error.writeErrors) {
      // Handle partial success
      const successCount = error.result.insertedCount;
      const errors = error.writeErrors.map(err => ({
        index: err.index,
        error: err.errmsg
      }));

      return res.status(207).json({ // 207 Multi-Status
        success: false,
        message: 'Partial success in bulk creation',
        data: {
          successCount,
          totalCount: req.body.products.length,
          errors
        },
        code: 'PARTIAL_SUCCESS'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during bulk creation',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * 🎯 TASK 6: Advanced product analytics
 */
const getProductAnalytics = async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;

    // Calculate date range
    const days = parseInt(timeRange.replace('d', '')) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 🔍 LEARN: MongoDB aggregation pipeline for analytics
    const analytics = await Product.aggregate([
      {
        $facet: {
          // Total statistics
          totalStats: [
            {
              $group: {
                _id: null,
                totalProducts: { $sum: 1 },
                totalValue: { $sum: { $multiply: ['$quantity', '$price'] } },
                averagePrice: { $avg: '$price' },
                totalQuantity: { $sum: '$quantity' }
              }
            }
          ],
          
          // Category distribution
          categoryStats: [
            {
              $group: {
                _id: '$category',
                count: { $sum: 1 },
                totalValue: { $sum: { $multiply: ['$quantity', '$price'] } },
                averagePrice: { $avg: '$price' }
              }
            },
            { $sort: { count: -1 } }
          ],
          
          // Stock status distribution
          stockStatus: [
            {
              $group: {
                _id: {
                  $switch: {
                    branches: [
                      { case: { $eq: ['$quantity', 0] }, then: 'out-of-stock' },
                      { case: { $lte: ['$quantity', '$minStock'] }, then: 'low-stock' }
                    ],
                    default: 'in-stock'
                  }
                },
                count: { $sum: 1 }
              }
            }
          ],
          
          // Recent additions
          recentProducts: [
            { $match: { createdAt: { $gte: startDate } } },
            { $sort: { createdAt: -1 } },
            { $limit: 10 },
            { $project: { name: 1, reference: 1, createdAt: 1, category: 1 } }
          ],
          
          // Most viewed products
          topViewed: [
            { $sort: { viewCount: -1 } },
            { $limit: 10 },
            { $project: { name: 1, reference: 1, viewCount: 1, category: 1 } }
          ]
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: analytics[0],
      metadata: {
        timeRange: `${days} days`,
        generatedAt: new Date().toISOString(),
        dataFreshness: 'real-time'
      }
    });

  } catch (error) {
    console.error('Error in getProductAnalytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * 📝 LEARNING CHECKPOINT:
 * Test these enhanced endpoints:
 * 
 * 1. GET /api/products?category=Electronics&stockStatus=low-stock&page=1&limit=5
 * 2. POST /api/products/bulk (with array of products)
 * 3. GET /api/products/analytics?timeRange=7d
 * 
 * 💡 NEXT STEPS:
 * 1. Add these new routes to your router
 * 2. Test error handling with invalid data
 * 3. Implement file upload middleware
 * 4. Add request timing middleware
 */

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  createMultipleProducts,
  getProductAnalytics,
  
  // Your existing methods (update them gradually)
  updateProduct: require('./productController').updateProduct,
  deleteProduct: require('./productController').deleteProduct,
  getLowStockProducts: require('./productController').getLowStockProducts,
  updateProductStock: require('./productController').updateProductStock
};
