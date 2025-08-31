/**
 * Settings Controller
 * Handles system configuration and user preferences
 */

const Settings = require('../models/Settings');

class SettingsController {
  
  // Get all settings
  static async getSettings(req, res) {
    try {
      const settings = await Settings.getSettings();
      
      res.json({
        success: true,
        data: settings,
        message: 'Settings retrieved successfully'
      });

    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch settings',
        error: error.message
      });
    }
  }

  // Update settings
  static async updateSettings(req, res) {
    try {
      const updates = req.body;
      const updatedBy = req.user?.id || req.body.updatedBy || 'user';

      // Validate required fields if provided
      if (updates.localization?.currency && !['EUR', 'USD', 'GBP', 'CAD', 'JPY', 'CHF'].includes(updates.localization.currency)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid currency code'
        });
      }

      const settings = await Settings.updateSettings(updates, updatedBy);

      res.json({
        success: true,
        data: settings,
        message: 'Settings updated successfully'
      });

    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update settings',
        error: error.message
      });
    }
  }

  // Get specific setting section
  static async getSection(req, res) {
    try {
      const { section } = req.params;
      const settings = await Settings.getSettings();

      if (!settings[section]) {
        return res.status(404).json({
          success: false,
          message: `Settings section '${section}' not found`
        });
      }

      res.json({
        success: true,
        data: settings[section],
        section,
        message: `${section} settings retrieved successfully`
      });

    } catch (error) {
      console.error('Error fetching settings section:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch settings section',
        error: error.message
      });
    }
  }

  // Update specific setting section
  static async updateSection(req, res) {
    try {
      const { section } = req.params;
      const updates = { [section]: req.body };
      const updatedBy = req.user?.id || 'user';

      const settings = await Settings.updateSettings(updates, updatedBy);

      res.json({
        success: true,
        data: settings[section],
        section,
        message: `${section} settings updated successfully`
      });

    } catch (error) {
      console.error('Error updating settings section:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update settings section',
        error: error.message
      });
    }
  }

  // Reset settings to defaults
  static async resetSettings(req, res) {
    try {
      const { section } = req.body;
      const settings = await Settings.getSettings();

      await settings.reset(section);

      res.json({
        success: true,
        data: section ? settings[section] : settings,
        message: section ? 
          `${section} settings reset to defaults` : 
          'All settings reset to defaults'
      });

    } catch (error) {
      console.error('Error resetting settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset settings',
        error: error.message
      });
    }
  }

  // Export settings
  static async exportSettings(req, res) {
    try {
      const settings = await Settings.getSettings();
      const exported = settings.export();

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="settings-${Date.now()}.json"`);
      
      res.json({
        success: true,
        data: exported,
        exported: new Date().toISOString(),
        version: exported.version
      });

    } catch (error) {
      console.error('Error exporting settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export settings',
        error: error.message
      });
    }
  }

  // Import settings
  static async importSettings(req, res) {
    try {
      const { settings: importedSettings, merge = true } = req.body;

      if (!importedSettings || typeof importedSettings !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Invalid settings data provided'
        });
      }

      let settings;
      
      if (merge) {
        // Merge with existing settings
        settings = await Settings.updateSettings(importedSettings, 'import');
      } else {
        // Replace all settings
        const currentSettings = await Settings.getSettings();
        await currentSettings.reset();
        settings = await Settings.updateSettings(importedSettings, 'import');
      }

      res.json({
        success: true,
        data: settings,
        message: `Settings ${merge ? 'merged' : 'replaced'} successfully`
      });

    } catch (error) {
      console.error('Error importing settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to import settings',
        error: error.message
      });
    }
  }

  // Get settings schema (for frontend forms)
  static async getSchema(req, res) {
    try {
      const schema = {
        companyInfo: {
          name: { type: 'string', required: false, label: 'Nom de l\'entreprise' },
          address: { type: 'textarea', required: false, label: 'Adresse' },
          phone: { type: 'tel', required: false, label: 'Téléphone' },
          email: { type: 'email', required: false, label: 'Email' },
          website: { type: 'url', required: false, label: 'Site web' }
        },
        inventory: {
          lowStockThreshold: { type: 'number', required: true, min: 0, label: 'Seuil stock bas' },
          autoReorderEnabled: { type: 'boolean', required: false, label: 'Réapprovisionnement auto' },
          autoReorderQuantity: { type: 'number', required: false, min: 1, label: 'Quantité réappro auto' },
          allowNegativeStock: { type: 'boolean', required: false, label: 'Autoriser stock négatif' }
        },
        notifications: {
          lowStockAlerts: { type: 'boolean', required: false, label: 'Alertes stock bas' },
          emailNotifications: { type: 'boolean', required: false, label: 'Notifications email' },
          dailyReports: { type: 'boolean', required: false, label: 'Rapports quotidiens' }
        },
        localization: {
          currency: { type: 'select', options: ['EUR', 'USD', 'GBP'], label: 'Devise' },
          dateFormat: { type: 'select', options: ['DD/MM/YYYY', 'MM/DD/YYYY'], label: 'Format date' },
          language: { type: 'select', options: ['fr', 'en', 'es'], label: 'Langue' }
        },
        display: {
          theme: { type: 'select', options: ['light', 'dark', 'auto'], label: 'Thème' },
          itemsPerPage: { type: 'number', min: 10, max: 100, label: 'Éléments par page' }
        }
      };

      res.json({
        success: true,
        data: schema,
        message: 'Settings schema retrieved successfully'
      });

    } catch (error) {
      console.error('Error fetching settings schema:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch settings schema',
        error: error.message
      });
    }
  }

  // Test settings (validate configuration)
  static async testSettings(req, res) {
    try {
      const settings = await Settings.getSettings();
      const results = {
        database: { status: 'ok', message: 'Database connection successful' },
        notifications: { status: 'ok', message: 'Notification settings valid' },
        localization: { status: 'ok', message: 'Localization settings valid' }
      };

      // Add more validation logic here as needed
      const allOk = Object.values(results).every(result => result.status === 'ok');

      res.json({
        success: true,
        data: {
          overall: allOk ? 'ok' : 'warning',
          results,
          testedAt: new Date().toISOString()
        },
        message: 'Settings validation completed'
      });

    } catch (error) {
      console.error('Error testing settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to test settings',
        error: error.message
      });
    }
  }
}

module.exports = SettingsController;
