/**
 * Product Model
 * Defines the schema for products in the stock management system
 */

const mongoose = require('mongoose');

/**
 * Product Schema Definition
 * Defines the structure and validation rules for product documents
 */
const productSchema = new mongoose.Schema({
  // Product name - required field
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  
  // Product reference/SKU - unique identifier
  reference: {
    type: String,
    required: [true, 'Product reference is required'],
    trim: true,
    uppercase: true
  },
  
  // Current stock quantity
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  
  // Product price
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  
  // Product description - optional
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    trim: true
  },
  
  // Product category
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  
  // Minimum stock alert threshold
  minStock: {
    type: Number,
    default: 5,
    min: [0, 'Minimum stock cannot be negative']
  },
  
  // Product unit (piece, kg, liter, etc.)
  unit: {
    type: String,
    default: 'piece',
    enum: ['piece', 'kg', 'liter', 'box', 'other']
  },
  
  // Product status
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active'
  }
}, {
  // Add timestamps (createdAt, updatedAt)
  timestamps: true,
  
  // Transform JSON output
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

/**
 * Database Indexes for Performance Optimization
 * These indexes speed up common queries
 */

// Compound index for category and status queries
productSchema.index({ category: 1, status: 1 });

// Text index for searching across name and description
productSchema.index({ 
  name: 'text', 
  description: 'text' 
}, { 
  weights: { 
    name: 10, 
    description: 5 
  } 
});

// Index for price range queries
productSchema.index({ price: 1 });

// Index for stock level queries
productSchema.index({ quantity: 1, minStock: 1 });

// Unique index for reference (already handled by unique: true, but explicit here)
productSchema.index({ reference: 1 }, { unique: true });

/**
 * Virtual Fields - Computed properties that don't get stored in the database
 */

// Virtual field for total stock value
productSchema.virtual('totalValue').get(function() {
  return this.quantity * this.price;
});

// Virtual field for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.quantity === 0) return 'out-of-stock';
  if (this.quantity <= this.minStock) return 'low-stock';
  if (this.quantity <= this.minStock * 2) return 'medium-stock';
  return 'in-stock';
});

// Virtual field to check if product is available for sale
productSchema.virtual('isAvailable').get(function() {
  return this.status === 'active' && this.quantity > 0;
});

// Make sure virtual fields are included in JSON output
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

/**
 * Pre-save middleware
 * Executed before saving a document
 */
productSchema.pre('save', function(next) {
  // Convert reference to uppercase
  if (this.reference) {
    this.reference = this.reference.toUpperCase();
  }
  next();
});

/**
 * Instance method to check if product is low in stock
 * @returns {Boolean} - True if quantity is below minimum stock
 */
productSchema.methods.isLowStock = function() {
  return this.quantity <= this.minStock;
};

/**
 * Instance method to update stock quantity
 * @param {Number} newQuantity - New stock quantity
 * @returns {Promise} - Promise resolving to updated product
 */
productSchema.methods.updateStock = function(newQuantity) {
  this.quantity = newQuantity;
  return this.save();
};

/**
 * Instance method to adjust stock (add or subtract)
 * @param {Number} adjustment - Amount to add (positive) or subtract (negative)
 * @param {String} reason - Reason for the adjustment
 * @returns {Promise} - Promise resolving to updated product
 */
productSchema.methods.adjustStock = function(adjustment, reason = 'Manual adjustment') {
  const newQuantity = this.quantity + adjustment;
  if (newQuantity < 0) {
    throw new Error('Insufficient stock for this adjustment');
  }
  this.quantity = newQuantity;
  // In Phase 2, we'll log this adjustment to StockMovement collection
  return this.save();
};

/**
 * Instance method to get stock status with color coding
 * @returns {Object} - Status object with status and color
 */
productSchema.methods.getStockStatusWithColor = function() {
  const status = this.stockStatus;
  const colors = {
    'out-of-stock': '#e53e3e',    // Red
    'low-stock': '#f56500',       // Orange  
    'medium-stock': '#ffd700',    // Gold
    'in-stock': '#38a169'         // Green
  };
  
  return {
    status,
    color: colors[status],
    quantity: this.quantity,
    minStock: this.minStock
  };
};

/**
 * Static method to find products by category
 * @param {String} category - Product category
 * @returns {Array} - Array of products in the category
 */
productSchema.statics.findByCategory = function(category) {
  return this.find({ category: new RegExp(category, 'i') });
};

/**
 * Static method to find low stock products
 * @returns {Array} - Array of products with low stock
 */
productSchema.statics.findLowStock = function() {
  return this.find({
    $expr: { $lte: ['$quantity', '$minStock'] }
  });
};

/**
 * Static method to get inventory analytics
 * @returns {Promise} - Promise resolving to analytics data
 */
productSchema.statics.getInventoryAnalytics = async function() {
  const analytics = await this.aggregate([
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        totalStockValue: { $sum: { $multiply: ['$quantity', '$price'] } },
        averagePrice: { $avg: '$price' },
        totalQuantity: { $sum: '$quantity' },
        lowStockCount: {
          $sum: {
            $cond: [{ $lte: ['$quantity', '$minStock'] }, 1, 0]
          }
        },
        outOfStockCount: {
          $sum: {
            $cond: [{ $eq: ['$quantity', 0] }, 1, 0]
          }
        }
      }
    }
  ]);
  
  return analytics[0] || {
    totalProducts: 0,
    totalStockValue: 0,
    averagePrice: 0,
    totalQuantity: 0,
    lowStockCount: 0,
    outOfStockCount: 0
  };
};

/**
 * Static method to get products by stock status
 * @param {String} status - Stock status ('low-stock', 'out-of-stock', 'in-stock')
 * @returns {Promise} - Promise resolving to array of products
 */
productSchema.statics.findByStockStatus = function(status) {
  switch(status) {
    case 'out-of-stock':
      return this.find({ quantity: 0 });
    case 'low-stock':
      return this.find({
        $expr: { 
          $and: [
            { $gt: ['$quantity', 0] },
            { $lte: ['$quantity', '$minStock'] }
          ]
        }
      });
    case 'in-stock':
      return this.find({
        $expr: { $gt: ['$quantity', '$minStock'] }
      });
    default:
      return this.find({});
  }
};

/**
 * Static method for advanced product search
 * @param {Object} searchParams - Search parameters
 * @returns {Promise} - Promise resolving to search results
 */
productSchema.statics.advancedSearch = function(searchParams) {
  const { 
    text, 
    category, 
    priceMin, 
    priceMax, 
    stockStatus, 
    status,
    sortBy = 'name',
    sortOrder = 'asc'
  } = searchParams;
  
  let query = {};
  
  // Text search
  if (text) {
    query.$text = { $search: text };
  }
  
  // Category filter
  if (category) {
    query.category = new RegExp(category, 'i');
  }
  
  // Price range filter
  if (priceMin !== undefined || priceMax !== undefined) {
    query.price = {};
    if (priceMin !== undefined) query.price.$gte = priceMin;
    if (priceMax !== undefined) query.price.$lte = priceMax;
  }
  
  // Status filter
  if (status) {
    query.status = status;
  }
  
  // Build the base query
  let searchQuery = this.find(query);
  
  // Add stock status filter using aggregation if needed
  if (stockStatus) {
    return this.aggregate([
      { $match: query },
      {
        $addFields: {
          stockStatus: {
            $switch: {
              branches: [
                { case: { $eq: ['$quantity', 0] }, then: 'out-of-stock' },
                { case: { $lte: ['$quantity', '$minStock'] }, then: 'low-stock' },
                { case: { $lte: ['$quantity', { $multiply: ['$minStock', 2] }] }, then: 'medium-stock' }
              ],
              default: 'in-stock'
            }
          }
        }
      },
      { $match: { stockStatus: stockStatus } },
      { $sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 } }
    ]);
  }
  
  // Apply sorting
  const sortObj = {};
  sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
  
  return searchQuery.sort(sortObj);
};

// Create and export the Product model
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
