/**
 * Analytics Routes
 * Provides endpoints for dashboard statistics and chart data
 */

const express = require('express');
const router = express.Router();

// Import analytics controller functions
const {
  getDashboardAnalytics,
  getMovementsAnalytics,
  getRecentActivity,
  getReportsAnalytics
} = require('../controllers/analyticsController');

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get dashboard statistics and metrics
 * @access  Public
 * @returns Real-time dashboard data including totals, growth, and distributions
 */
router.get('/dashboard', getDashboardAnalytics);

/**
 * @route   GET /api/analytics/movements
 * @desc    Get stock movements analytics for charts
 * @access  Public
 * @query   period - Time period (12m, 6m, 3m)
 * @returns Stock movement data for line charts
 */
router.get('/movements', getMovementsAnalytics);

/**
 * @route   GET /api/analytics/activity
 * @desc    Get recent activity for dashboard
 * @access  Public
 * @query   limit - Number of activities to return (default: 10)
 * @returns Recent system activities and changes
 */
router.get('/activity', getRecentActivity);

/**
 * @route   GET /api/analytics/reports
 * @desc    Get comprehensive reports data for Reports page
 * @access  Public
 * @query   timeframe - Time period for reports (default: 'year')
 * @query   category - Filter by category (default: 'all')
 * @returns Advanced analytics for inventory reports, KPIs, and trends
 */
router.get('/reports', getReportsAnalytics);

module.exports = router;
