/**
 * Settings Hooks
 * React Query hooks for settings management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';

const API_BASE_URL = 'http://localhost:3001/api';

// Types
export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo: string;
}

export interface InventorySettings {
  lowStockThreshold: number;
  autoReorderEnabled: boolean;
  autoReorderQuantity: number;
  trackExpiryDates: boolean;
  trackSerialNumbers: boolean;
  allowNegativeStock: boolean;
}

export interface NotificationSettings {
  lowStockAlerts: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  dailyReports: boolean;
  weeklyReports: boolean;
}

export interface LocalizationSettings {
  currency: 'EUR' | 'USD' | 'GBP' | 'CAD' | 'JPY' | 'CHF';
  currencySymbol: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  language: 'fr' | 'en' | 'es' | 'de' | 'it';
  timezone: string;
}

export interface DisplaySettings {
  theme: 'light' | 'dark' | 'auto';
  sidebarCollapsed: boolean;
  itemsPerPage: number;
  showGridLines: boolean;
  compactMode: boolean;
}

export interface Settings {
  id: string;
  companyInfo: CompanyInfo;
  inventory: InventorySettings;
  notifications: NotificationSettings;
  localization: LocalizationSettings;
  display: DisplaySettings;
  version: string;
  lastUpdated: string;
  updatedBy: string;
}

export interface SettingsUpdate {
  companyInfo?: Partial<CompanyInfo>;
  inventory?: Partial<InventorySettings>;
  notifications?: Partial<NotificationSettings>;
  localization?: Partial<LocalizationSettings>;
  display?: Partial<DisplaySettings>;
}

// API functions
const settingsAPI = {
  // Get all settings
  getSettings: async (): Promise<{ success: boolean; data: Settings }> => {
    const response = await fetch(`${API_BASE_URL}/settings`);
    if (!response.ok) {
      throw new Error('Failed to fetch settings');
    }
    return response.json();
  },

  // Update settings
  updateSettings: async (updates: SettingsUpdate): Promise<{ success: boolean; data: Settings }> => {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error('Failed to update settings');
    }
    return response.json();
  },

  // Get specific section
  getSection: async (section: string): Promise<{ success: boolean; data: any }> => {
    const response = await fetch(`${API_BASE_URL}/settings/section/${section}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${section} settings`);
    }
    return response.json();
  },

  // Update specific section
  updateSection: async (section: string, data: any): Promise<{ success: boolean; data: any }> => {
    const response = await fetch(`${API_BASE_URL}/settings/section/${section}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to update ${section} settings`);
    }
    return response.json();
  },

  // Reset settings
  resetSettings: async (section?: string): Promise<{ success: boolean; data: any }> => {
    const response = await fetch(`${API_BASE_URL}/settings/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ section }),
    });
    if (!response.ok) {
      throw new Error('Failed to reset settings');
    }
    return response.json();
  },

  // Export settings
  exportSettings: async (): Promise<{ success: boolean; data: any }> => {
    const response = await fetch(`${API_BASE_URL}/settings/export`);
    if (!response.ok) {
      throw new Error('Failed to export settings');
    }
    return response.json();
  },

  // Import settings
  importSettings: async (settings: any, merge: boolean = true): Promise<{ success: boolean; data: Settings }> => {
    const response = await fetch(`${API_BASE_URL}/settings/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ settings, merge }),
    });
    if (!response.ok) {
      throw new Error('Failed to import settings');
    }
    return response.json();
  },

  // Test settings
  testSettings: async (): Promise<{ success: boolean; data: any }> => {
    const response = await fetch(`${API_BASE_URL}/settings/test`);
    if (!response.ok) {
      throw new Error('Failed to test settings');
    }
    return response.json();
  },
};

// Query Keys
export const SETTINGS_QUERY_KEYS = {
  settings: ['settings'] as const,
  section: (section: string) => ['settings', 'section', section] as const,
} as const;

// Hooks
export const useSettings = () => {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEYS.settings,
    queryFn: settingsAPI.getSettings,
    staleTime: 300000, // 5 minutes
  });
};

export const useSettingsSection = (section: string) => {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEYS.section(section),
    queryFn: () => settingsAPI.getSection(section),
    enabled: !!section,
    staleTime: 300000,
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: settingsAPI.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEYS.settings });
      
      toast({
        title: 'Succès',
        description: 'Paramètres mis à jour avec succès',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });
};

export const useUpdateSettingsSection = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ section, data }: { section: string; data: any }) =>
      settingsAPI.updateSection(section, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEYS.settings });
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEYS.section(variables.section) });
      
      toast({
        title: 'Succès',
        description: 'Paramètres mis à jour avec succès',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });
};

export const useResetSettings = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: settingsAPI.resetSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEYS.settings });
      
      toast({
        title: 'Succès',
        description: 'Paramètres réinitialisés aux valeurs par défaut',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });
};

export const useExportSettings = () => {
  const toast = useToast();

  return useMutation({
    mutationFn: settingsAPI.exportSettings,
    onSuccess: (data) => {
      // Create and download file
      const blob = new Blob([JSON.stringify(data.data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `settings-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Succès',
        description: 'Paramètres exportés avec succès',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });
};

export const useImportSettings = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ settings, merge }: { settings: any; merge: boolean }) =>
      settingsAPI.importSettings(settings, merge),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEYS.settings });
      
      toast({
        title: 'Succès',
        description: 'Paramètres importés avec succès',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });
};

export const useTestSettings = () => {
  const toast = useToast();

  return useMutation({
    mutationFn: settingsAPI.testSettings,
    onSuccess: (data) => {
      const isSuccess = data.data.overall === 'ok';
      
      toast({
        title: isSuccess ? 'Test réussi' : 'Test avec avertissements',
        description: isSuccess ? 
          'Tous les paramètres sont valides' : 
          'Certains paramètres nécessitent votre attention',
        status: isSuccess ? 'success' : 'warning',
        duration: 5000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });
};
