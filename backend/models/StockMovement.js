/**
 * Stock Movement Model
 * Tracks all inventory movements (entries, exits, adjustments)
 */

const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  // Movement Type
  type: {
    type: String,
    enum: ['entry', 'exit', 'adjustment', 'transfer'],
    required: [true, 'Movement type is required'],
    index: true
  },
  
  // Product Reference
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required'],
    index: true
  },
  
  // Movement Details
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    validate: {
      validator: function(v) {
        return v !== 0;
      },
      message: 'Quantity cannot be zero'
    }
  },
  
  // Financial Information
  unitPrice: {
    type: Number,
    min: [0, 'Unit price cannot be negative'],
    default: 0
  },
  
  totalValue: {
    type: Number,
    default: function() {
      return Math.abs(this.quantity) * (this.unitPrice || 0);
    }
  },
  
  // Movement Context
  reason: {
    type: String,
    required: [true, 'Movement reason is required'],
    enum: [
      'purchase', 'sale', 'return', 'damage', 'loss', 'theft',
      'correction', 'transfer_in', 'transfer_out', 'initial_stock',
      'promotion', 'expired', 'quality_control', 'other'
    ]
  },
  
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    trim: true
  },
  
  // References and Tracking
  reference: {
    type: String,
    unique: true,
    default: function() {
      return `MOV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
  },
  
  batchNumber: {
    type: String,
    trim: true
  },
  
  supplier: {
    name: String,
    reference: String,
    contact: String
  },
  
  customer: {
    name: String,
    reference: String,
    contact: String
  },
  
  // Location Information
  location: {
    warehouse: {
      type: String,
      default: 'main'
    },
    zone: String,
    shelf: String,
    bin: String
  },
  
  // User and System Tracking
  createdBy: {
    type: String,
    default: 'system'
  },
  
  approvedBy: String,
  
  status: {
    type: String,
    enum: ['pending', 'approved', 'completed', 'cancelled'],
    default: 'completed'
  },
  
  // Timestamps
  movementDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  processedAt: {
    type: Date,
    default: Date.now
  },
  
  // Previous stock level (for audit trail)
  previousStock: {
    type: Number,
    min: 0
  },
  
  newStock: {
    type: Number,
    min: 0
  },
  
  // Additional metadata
  metadata: {
    source: {
      type: String,
      default: 'manual'
    },
    ipAddress: String,
    userAgent: String,
    correlationId: String
  }
  
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for performance
stockMovementSchema.index({ product: 1, movementDate: -1 });
stockMovementSchema.index({ type: 1, status: 1 });
stockMovementSchema.index({ createdAt: -1 });
stockMovementSchema.index({ reason: 1 });
stockMovementSchema.index({ 'supplier.name': 1 });
stockMovementSchema.index({ 'customer.name': 1 });

// Virtual fields
stockMovementSchema.virtual('isEntry').get(function() {
  return this.type === 'entry' || (this.type === 'adjustment' && this.quantity > 0);
});

stockMovementSchema.virtual('isExit').get(function() {
  return this.type === 'exit' || (this.type === 'adjustment' && this.quantity < 0);
});

stockMovementSchema.virtual('absoluteQuantity').get(function() {
  return Math.abs(this.quantity);
});

// Static methods
stockMovementSchema.statics.getMovementsByProduct = function(productId, limit = 50) {
  return this.find({ product: productId })
    .sort({ movementDate: -1 })
    .limit(limit)
    .populate('product', 'name reference');
};

stockMovementSchema.statics.getMovementsByDateRange = function(startDate, endDate) {
  return this.find({
    movementDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }).sort({ movementDate: -1 });
};

stockMovementSchema.statics.getMovementsSummary = function(timeframe = '30d') {
  const days = parseInt(timeframe);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        movementDate: { $gte: startDate },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: '$type',
        totalQuantity: { $sum: '$absoluteQuantity' },
        totalValue: { $sum: '$totalValue' },
        count: { $sum: 1 },
        avgQuantity: { $avg: '$absoluteQuantity' }
      }
    }
  ]);
};

// Instance methods
stockMovementSchema.methods.approve = function() {
  this.status = 'approved';
  this.approvedBy = 'current_user'; // In real app, get from auth context
  return this.save();
};

stockMovementSchema.methods.cancel = function(reason) {
  this.status = 'cancelled';
  this.description = `${this.description} | Cancelled: ${reason}`;
  return this.save();
};

// Pre-save middleware
stockMovementSchema.pre('save', function(next) {
  // Calculate total value if not set
  if (!this.totalValue && this.unitPrice) {
    this.totalValue = Math.abs(this.quantity) * this.unitPrice;
  }
  
  // Set processed timestamp
  if (this.status === 'completed' && !this.processedAt) {
    this.processedAt = new Date();
  }
  
  next();
});

// Post-save middleware to update product stock
stockMovementSchema.post('save', async function(doc) {
  if (doc.status === 'completed') {
    try {
      const Product = mongoose.model('Product');
      const product = await Product.findById(doc.product);
      
      if (product) {
        // Update stock based on movement type
        let newQuantity = product.quantity;
        
        if (doc.type === 'entry') {
          newQuantity += doc.quantity;
        } else if (doc.type === 'exit') {
          newQuantity -= Math.abs(doc.quantity);
        } else if (doc.type === 'adjustment') {
          newQuantity += doc.quantity; // Can be positive or negative
        }
        
        // Ensure stock doesn't go negative
        newQuantity = Math.max(0, newQuantity);
        
        // Update the document with stock levels
        doc.previousStock = product.quantity;
        doc.newStock = newQuantity;
        
        // Update product stock
        await Product.findByIdAndUpdate(doc.product, { 
          quantity: newQuantity,
          lastUpdated: new Date()
        });
      }
    } catch (error) {
      console.error('Error updating product stock after movement:', error);
    }
  }
});

module.exports = mongoose.model('StockMovement', stockMovementSchema);
