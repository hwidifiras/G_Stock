/**
 * Settings Routes
 * API endpoints for system configuration management
 */

const express = require('express');
const router = express.Router();
const SettingsController = require('../controllers/settingsController');

// Main settings routes
router.get('/', SettingsController.getSettings);
router.put('/', SettingsController.updateSettings);
router.post('/reset', SettingsController.resetSettings);

// Specific section routes
router.get('/section/:section', SettingsController.getSection);
router.put('/section/:section', SettingsController.updateSection);

// Import/Export routes
router.get('/export', SettingsController.exportSettings);
router.post('/import', SettingsController.importSettings);

// Utility routes
router.get('/schema', SettingsController.getSchema);
router.get('/test', SettingsController.testSettings);

module.exports = router;
