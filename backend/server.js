/**
 * Stock Management API Server
 * Main entry point for the Express.js application
 * 
 * This server provides RESTful API endpoints for managing product inventory
 * Features include: CRUD operations, stock tracking, low stock alerts, etc.
 */

// Import required dependencies
require('dotenv').config({ path: __dirname + '/.env' }); // Load environment variables from .env file with explicit path

// Debug environment variables
console.log('🔍 Environment Debug:');
console.log('📁 __dirname:', __dirname);
console.log('📁 process.cwd():', process.cwd());
console.log('🔗 MONGO_URI:', process.env.MONGO_URI);
console.log('🚪 PORT:', process.env.PORT);
console.log('');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

// Import custom modules
const connectDB = require('./config/db');
const apiRoutes = require('./routes/index');
const { 
  errorHandler, 
  notFound, 
  requestLogger, 
  responseTime, 
  securityHeaders 
} = require('./middlewares/errorMiddleware');

/**
 * Initialize Express Application
 */
const app = express();

/**
 * Connect to MongoDB Database
 * Establishes connection before starting the server
 */
connectDB();

/**
 * Security Middleware Configuration
 */

// Helmet - Sets various HTTP headers for security
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API
  crossOriginEmbedderPolicy: false
}));

// CORS - Enable Cross-Origin Resource Sharing
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] // Replace with your frontend URL in production
    : ['http://localhost:3000', 'http://localhost:5173'], // Development URLs
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Rate Limiting - Prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Limit each IP
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

/**
 * Middleware Configuration
 */

// Body Parsing Middleware
app.use(express.json({ 
  limit: '10mb' // Limit request body size
}));
app.use(express.urlencoded({ 
  extended: true,
  limit: '10mb'
}));

// Custom Security Headers
app.use(securityHeaders);

// Request Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Detailed logging in development
  app.use(requestLogger); // Custom request logger
} else {
  app.use(morgan('combined')); // Standard logging in production
}

// Response Time Tracking
app.use(responseTime);

/**
 * API Routes Configuration
 */

// Root endpoint - API information
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Stock Management API',
    version: '1.0.0',
    documentation: '/api',
    health: '/api/health',
    timestamp: new Date().toISOString()
  });
});

// API Routes - All routes prefixed with /api
app.use('/api', apiRoutes);

/**
 * Error Handling Middleware
 * These must be defined AFTER all routes
 */

// 404 Handler - Catch unmatched routes
app.use(notFound);

// Global Error Handler - Catch all errors
app.use(errorHandler);

/**
 * Server Configuration
 */
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Start Server
 * Only start if this file is run directly (not imported)
 */
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`
🚀 Stock Management API Server Started!
📍 Environment: ${NODE_ENV}
🌐 Server running on port ${PORT}
🔗 API URL: http://localhost:${PORT}
📚 API Documentation: http://localhost:${PORT}/api
❤️  Health Check: http://localhost:${PORT}/api/health
    `);
  });

  /**
   * Graceful Shutdown Handler
   * Handles process termination signals
   */
  const gracefulShutdown = (signal) => {
    console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`);
    
    server.close(() => {
      console.log('✅ HTTP server closed.');
      
      // Close database connection
      const mongoose = require('mongoose');
      mongoose.connection.close().then(() => {
        console.log('✅ MongoDB connection closed.');
        console.log('👋 Graceful shutdown completed.');
        process.exit(0);
      }).catch((err) => {
        console.error('❌ Error closing MongoDB connection:', err.message);
        process.exit(1);
      });
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error('❌ Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  // Listen for termination signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    gracefulShutdown('uncaughtException');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err);
    gracefulShutdown('unhandledRejection');
  });
}

// Export app for testing purposes
module.exports = app;
