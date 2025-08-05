/**
 * Utility Functions
 * Common helper functions used across the application
 */

/**
 * Async Handler Wrapper
 * Wraps async functions to handle errors automatically
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Generate Random String
 * Creates a random string of specified length
 * @param {Number} length - Length of the string
 * @returns {String} - Random string
 */
const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Format Currency
 * Formats a number as currency
 * @param {Number} amount - Amount to format
 * @param {String} currency - Currency code (default: EUR)
 * @param {String} locale - Locale (default: fr-FR)
 * @returns {String} - Formatted currency string
 */
const formatCurrency = (amount, currency = 'EUR', locale = 'fr-FR') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Validate Email
 * Checks if an email address is valid
 * @param {String} email - Email to validate
 * @returns {Boolean} - True if valid, false otherwise
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize String
 * Removes HTML tags and special characters from a string
 * @param {String} str - String to sanitize
 * @returns {String} - Sanitized string
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  
  return str
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"&]/g, '') // Remove potentially dangerous characters
    .trim();
};

/**
 * Calculate Pagination
 * Calculates pagination values
 * @param {Number} page - Current page number
 * @param {Number} limit - Items per page
 * @param {Number} total - Total number of items
 * @returns {Object} - Pagination object
 */
const calculatePagination = (page = 1, limit = 10, total = 0) => {
  const currentPage = Math.max(1, parseInt(page));
  const itemsPerPage = Math.max(1, parseInt(limit));
  const totalPages = Math.ceil(total / itemsPerPage);
  const skip = (currentPage - 1) * itemsPerPage;
  
  return {
    currentPage,
    itemsPerPage,
    totalPages,
    total,
    skip,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
    nextPage: currentPage < totalPages ? currentPage + 1 : null,
    prevPage: currentPage > 1 ? currentPage - 1 : null
  };
};

/**
 * Generate Product Reference
 * Creates a unique product reference code
 * @param {String} category - Product category
 * @param {String} name - Product name
 * @returns {String} - Generated reference
 */
const generateProductReference = (category = '', name = '') => {
  const categoryPrefix = category.substring(0, 3).toUpperCase();
  const namePrefix = name.substring(0, 3).toUpperCase();
  const randomSuffix = generateRandomString(4);
  const timestamp = Date.now().toString().slice(-4);
  
  return `${categoryPrefix}${namePrefix}${timestamp}${randomSuffix}`;
};

/**
 * Calculate Stock Value
 * Calculates total value of stock items
 * @param {Array} products - Array of products
 * @returns {Object} - Stock statistics
 */
const calculateStockValue = (products = []) => {
  const stats = products.reduce((acc, product) => {
    const itemValue = product.quantity * product.price;
    
    acc.totalValue += itemValue;
    acc.totalQuantity += product.quantity;
    acc.totalProducts += 1;
    
    if (product.quantity <= product.minStock) {
      acc.lowStockItems += 1;
    }
    
    if (product.quantity === 0) {
      acc.outOfStockItems += 1;
    }
    
    return acc;
  }, {
    totalValue: 0,
    totalQuantity: 0,
    totalProducts: 0,
    lowStockItems: 0,
    outOfStockItems: 0
  });
  
  stats.averageValue = stats.totalProducts > 0 ? stats.totalValue / stats.totalProducts : 0;
  
  return stats;
};

/**
 * Validate Product Data
 * Validates product data before saving
 * @param {Object} productData - Product data to validate
 * @returns {Object} - Validation result
 */
const validateProductData = (productData) => {
  const errors = [];
  
  // Required fields validation
  if (!productData.name || productData.name.trim().length === 0) {
    errors.push('Product name is required');
  }
  
  if (!productData.reference || productData.reference.trim().length === 0) {
    errors.push('Product reference is required');
  }
  
  if (typeof productData.price !== 'number' || productData.price < 0) {
    errors.push('Valid price is required');
  }
  
  if (typeof productData.quantity !== 'number' || productData.quantity < 0) {
    errors.push('Valid quantity is required');
  }
  
  // Optional field validation
  if (productData.minStock && (typeof productData.minStock !== 'number' || productData.minStock < 0)) {
    errors.push('Minimum stock must be a positive number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sleep Function
 * Creates a delay for testing purposes
 * @param {Number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after delay
 */
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

module.exports = {
  asyncHandler,
  generateRandomString,
  formatCurrency,
  validateEmail,
  sanitizeString,
  calculatePagination,
  generateProductReference,
  calculateStockValue,
  validateProductData,
  sleep
};
