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
    unique: true,
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

// Create and export the Product model
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
