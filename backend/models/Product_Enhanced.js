/**
 * 📚 LEARNING EXERCISE 1.1: Enhanced Product Model
 * 
 * OBJECTIVE: Understand advanced MongoDB schema features
 * TIME: 2-3 hours
 * 
 * WHAT YOU'LL LEARN:
 * - MongoDB indexing for performance
 * - Virtual fields and computed properties
 * - Advanced validation with custom validators
 * - Instance and static methods
 * 
 * TASKS TO COMPLETE:
 * 1. Add image URL handling
 * 2. Add timestamps for tracking
 * 3. Create compound indexes
 * 4. Add virtual fields for calculated values
 * 5. Add custom validation methods
 */

const mongoose = require('mongoose');

/**
 * 🎯 TASK 1: Analyze this enhanced schema
 * Compare it with your existing model and understand each new feature
 */
const productSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters'],
    index: true // 🔍 LEARN: Text search optimization
  },
  
  reference: {
    type: String,
    required: [true, 'Product reference is required'],
    unique: true,
    trim: true,
    uppercase: true,
    index: true // 🔍 LEARN: Unique constraint with index
  },
  
  // Stock Information
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  
  // Pricing
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    // 🎯 TASK 2: Add a custom validator for realistic price ranges
    validate: {
      validator: function(v) {
        return v >= 0.01 && v <= 999999.99;
      },
      message: 'Price must be between €0.01 and €999,999.99'
    }
  },
  
  // Product Details
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    trim: true
  },
  
  // 🎯 TASK 3: Image handling - supports both File uploads and URLs
  image: {
    url: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true; // Optional field
          // Basic URL validation
          return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
        },
        message: 'Invalid image URL format'
      }
    },
    filename: String, // For uploaded files
    size: Number,     // File size in bytes
    uploadDate: {
      type: Date,
      default: Date.now
    }
  },
  
  // Categories and Classification
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    index: true // 🔍 LEARN: Category filtering optimization
  },
  
  // Additional Identifiers
  barcode: {
    type: String,
    sparse: true, // 🔍 LEARN: Allows multiple null values but unique non-null values
    index: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional
        // Basic barcode validation (adjust for your barcode format)
        return /^[0-9]{8,13}$/.test(v);
      },
      message: 'Barcode must be 8-13 digits'
    }
  },
  
  // Stock Management
  minStock: {
    type: Number,
    default: 5,
    min: [0, 'Minimum stock cannot be negative']
  },
  
  unit: {
    type: String,
    default: 'piece',
    enum: {
      values: ['piece', 'kg', 'liter', 'box', 'pack', 'meter', 'other'],
      message: 'Invalid unit type'
    }
  },
  
  // Product Status
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive', 'discontinued', 'draft'],
      message: 'Invalid status'
    },
    default: 'active',
    index: true
  },
  
  // 🎯 TASK 4: Add supplier information
  supplier: {
    name: String,
    contact: String,
    email: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Invalid email format'
      }
    }
  },
  
  // Analytics and Tracking
  viewCount: {
    type: Number,
    default: 0
  },
  
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  // 🎯 TASK 5: Add tags for better searchability
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
  
}, {
  timestamps: true, // 🔍 LEARN: Automatic createdAt and updatedAt
  
  // 🎯 TASK 6: Custom JSON transformation
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      
      // Add computed fields
      ret.isLowStock = ret.quantity <= ret.minStock;
      ret.stockStatus = ret.quantity === 0 ? 'out-of-stock' : 
                       ret.quantity <= ret.minStock ? 'low-stock' : 'in-stock';
      ret.totalValue = ret.quantity * ret.price;
      
      return ret;
    }
  }
});

/**
 * 🎯 TASK 7: Create compound indexes for common queries
 * LEARN: How to optimize database queries
 */
productSchema.index({ category: 1, status: 1 }); // Filter by category and status
productSchema.index({ name: 'text', description: 'text' }); // Full-text search
productSchema.index({ quantity: 1, minStock: 1 }); // Low stock queries
productSchema.index({ createdAt: -1 }); // Recent products

/**
 * 🎯 TASK 8: Virtual fields (computed properties)
 * LEARN: How to add calculated fields without storing them
 */
productSchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.minStock;
});

productSchema.virtual('stockStatus').get(function() {
  if (this.quantity === 0) return 'out-of-stock';
  if (this.quantity <= this.minStock) return 'low-stock';
  return 'in-stock';
});

productSchema.virtual('totalValue').get(function() {
  return this.quantity * this.price;
});

/**
 * 🎯 TASK 9: Instance methods
 * LEARN: Methods that work on individual documents
 */
productSchema.methods.updateStock = function(newQuantity, operation = 'set') {
  switch (operation) {
    case 'add':
      this.quantity += newQuantity;
      break;
    case 'subtract':
      this.quantity = Math.max(0, this.quantity - newQuantity);
      break;
    case 'set':
    default:
      this.quantity = Math.max(0, newQuantity);
      break;
  }
  this.lastUpdated = new Date();
  return this.save();
};

productSchema.methods.incrementView = function() {
  this.viewCount += 1;
  return this.save();
};

/**
 * 🎯 TASK 10: Static methods (work on the model)
 * LEARN: Methods that work on the entire collection
 */
productSchema.statics.findLowStock = function() {
  return this.find({
    $expr: { $lte: ['$quantity', '$minStock'] },
    status: 'active'
  });
};

productSchema.statics.findByCategory = function(category) {
  return this.find({ 
    category: new RegExp(category, 'i'),
    status: 'active'
  });
};

productSchema.statics.search = function(searchTerm) {
  return this.find({
    $or: [
      { name: new RegExp(searchTerm, 'i') },
      { description: new RegExp(searchTerm, 'i') },
      { reference: new RegExp(searchTerm, 'i') },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } }
    ],
    status: 'active'
  });
};

/**
 * 🎯 TASK 11: Pre/Post middleware
 * LEARN: How to run code before/after operations
 */
productSchema.pre('save', function(next) {
  // Auto-generate reference if not provided
  if (!this.reference && this.name && this.category) {
    const categoryCode = this.category.substring(0, 3).toUpperCase();
    const nameCode = this.name.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    this.reference = `${categoryCode}${nameCode}${timestamp}`;
  }
  
  // Update lastUpdated
  this.lastUpdated = new Date();
  
  next();
});

// 🎯 TASK 12: Post middleware for logging
productSchema.post('save', function(doc) {
  console.log(`📦 Product ${doc.name} has been saved with ID: ${doc._id}`);
});

productSchema.post('remove', function(doc) {
  console.log(`🗑️ Product ${doc.name} has been deleted`);
});

/**
 * 📝 LEARNING CHECKPOINT:
 * Before proceeding, make sure you understand:
 * 1. How indexes improve query performance
 * 2. The difference between virtual fields and stored fields
 * 3. When to use instance vs static methods
 * 4. How middleware can automate tasks
 * 
 * 💡 NEXT STEPS:
 * 1. Replace your existing Product model with this enhanced version
 * 2. Test the new features in your controller
 * 3. Add validation error handling in your API responses
 */

module.exports = mongoose.model('Product', productSchema);
