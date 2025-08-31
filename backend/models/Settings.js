/**
 * Settings Model
 * Stores system configuration and user preferences
 */

const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // System Settings
  companyInfo: {
    name: {
      type: String,
      default: 'Mon Entreprise'
    },
    address: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    },
    website: {
      type: String,
      default: ''
    },
    logo: {
      type: String,
      default: ''
    }
  },

  // Inventory Settings
  inventory: {
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: 0
    },
    autoReorderEnabled: {
      type: Boolean,
      default: false
    },
    autoReorderQuantity: {
      type: Number,
      default: 50,
      min: 1
    },
    trackExpiryDates: {
      type: Boolean,
      default: false
    },
    trackSerialNumbers: {
      type: Boolean,
      default: false
    },
    allowNegativeStock: {
      type: Boolean,
      default: false
    }
  },

  // Notification Settings
  notifications: {
    lowStockAlerts: {
      type: Boolean,
      default: true
    },
    emailNotifications: {
      type: Boolean,
      default: false
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    dailyReports: {
      type: Boolean,
      default: false
    },
    weeklyReports: {
      type: Boolean,
      default: false
    }
  },

  // Currency and Localization
  localization: {
    currency: {
      type: String,
      default: 'EUR',
      enum: ['EUR', 'USD', 'GBP', 'CAD', 'JPY', 'CHF']
    },
    currencySymbol: {
      type: String,
      default: '€'
    },
    dateFormat: {
      type: String,
      default: 'DD/MM/YYYY',
      enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']
    },
    timeFormat: {
      type: String,
      default: '24h',
      enum: ['12h', '24h']
    },
    language: {
      type: String,
      default: 'fr',
      enum: ['fr', 'en', 'es', 'de', 'it']
    },
    timezone: {
      type: String,
      default: 'Europe/Paris'
    }
  },

  // Security Settings
  security: {
    sessionTimeout: {
      type: Number,
      default: 60, // minutes
      min: 5,
      max: 480
    },
    passwordRequirements: {
      minLength: {
        type: Number,
        default: 8,
        min: 6,
        max: 32
      },
      requireUppercase: {
        type: Boolean,
        default: true
      },
      requireNumbers: {
        type: Boolean,
        default: true
      },
      requireSpecialChars: {
        type: Boolean,
        default: false
      }
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    loginAttempts: {
      max: {
        type: Number,
        default: 5
      },
      lockoutDuration: {
        type: Number,
        default: 15 // minutes
      }
    }
  },

  // Display Settings
  display: {
    theme: {
      type: String,
      default: 'light',
      enum: ['light', 'dark', 'auto']
    },
    sidebarCollapsed: {
      type: Boolean,
      default: false
    },
    itemsPerPage: {
      type: Number,
      default: 20,
      min: 10,
      max: 100
    },
    showGridLines: {
      type: Boolean,
      default: true
    },
    compactMode: {
      type: Boolean,
      default: false
    }
  },

  // Backup Settings
  backup: {
    autoBackupEnabled: {
      type: Boolean,
      default: false
    },
    backupFrequency: {
      type: String,
      default: 'weekly',
      enum: ['daily', 'weekly', 'monthly']
    },
    backupLocation: {
      type: String,
      default: 'local'
    },
    retentionDays: {
      type: Number,
      default: 30
    }
  },

  // Tax Settings
  tax: {
    defaultTaxRate: {
      type: Number,
      default: 20.0,
      min: 0,
      max: 100
    },
    taxIncluded: {
      type: Boolean,
      default: true
    },
    taxRegions: [{
      name: String,
      rate: Number
    }]
  },

  // API Settings
  api: {
    rateLimit: {
      enabled: {
        type: Boolean,
        default: true
      },
      requestsPerMinute: {
        type: Number,
        default: 100
      }
    },
    cors: {
      enabled: {
        type: Boolean,
        default: true
      },
      allowedOrigins: [{
        type: String
      }]
    }
  },

  // System Metadata
  version: {
    type: String,
    default: '1.0.0'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: String,
    default: 'system'
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

// Index for performance
settingsSchema.index({ lastUpdated: -1 });

// Static methods
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

settingsSchema.statics.updateSettings = async function(updates, updatedBy = 'user') {
  const settings = await this.getSettings();
  
  // Deep merge updates
  const mergeObjects = (target, source) => {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        mergeObjects(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  };

  mergeObjects(settings.toObject(), updates);
  
  // Update metadata
  settings.lastUpdated = new Date();
  settings.updatedBy = updatedBy;
  
  return await settings.save();
};

// Instance methods
settingsSchema.methods.reset = function(section) {
  if (section) {
    // Reset specific section to defaults
    const defaults = new this.constructor();
    this[section] = defaults[section];
  } else {
    // Reset all to defaults
    const defaults = new this.constructor();
    Object.keys(defaults.toObject()).forEach(key => {
      if (key !== '_id' && key !== '__v') {
        this[key] = defaults[key];
      }
    });
  }
  
  this.lastUpdated = new Date();
  return this.save();
};

settingsSchema.methods.export = function() {
  const exported = this.toObject();
  delete exported._id;
  delete exported.__v;
  delete exported.createdAt;
  delete exported.updatedAt;
  return exported;
};

// Pre-save middleware
settingsSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('Settings', settingsSchema);
