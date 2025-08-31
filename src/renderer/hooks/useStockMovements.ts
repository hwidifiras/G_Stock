/**
 * Stock Movements Hooks
 * React Query hooks for stock movement operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';

const API_BASE_URL = 'http://localhost:3001/api';

// Types
export interface StockMovement {
  id: string;
  type: 'entry' | 'exit' | 'adjustment' | 'transfer';
  product: {
    id: string;
    name: string;
    reference: string;
    category: string;
    sku?: string;
  };
  quantity: number;
  unitPrice: number;
  totalValue: number;
  reason: string;
  description?: string;
  reference: string;
  batchNumber?: string;
  supplier?: {
    name: string;
    reference: string;
    contact: string;
  };
  customer?: {
    name: string;
    reference: string;
    contact: string;
  };
  location: {
    warehouse: string;
    zone?: string;
    shelf?: string;
    bin?: string;
  };
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  movementDate: string;
  createdBy: string;
  previousStock?: number;
  newStock?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MovementAnalytics {
  summary: {
    totalMovements: number;
    totalValue: number;
    byType: {
      [key: string]: {
        count: number;
        totalQuantity: number;
        totalValue: number;
        avgQuantity: number;
      };
    };
  };
  recentMovements: StockMovement[];
  topProducts: Array<{
    _id: string;
    totalMovements: number;
    totalQuantity: number;
    totalValue: number;
    product: {
      name: string;
      reference: string;
      category: string;
    };
  }>;
  dailyTrends: Array<{
    _id: {
      date: string;
      type: string;
    };
    count: number;
    totalQuantity: number;
    totalValue: number;
  }>;
  timeframe: {
    days: number;
    startDate: string;
    endDate: string;
  };
}

export interface MovementFilters {
  page?: number;
  limit?: number;
  type?: string;
  productId?: string;
  reason?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateMovementData {
  productId: string;
  type: 'entry' | 'exit' | 'adjustment' | 'transfer';
  quantity: number;
  unitPrice?: number;
  reason: string;
  description?: string;
  reference?: string;
  batchNumber?: string;
  supplier?: {
    name: string;
    reference?: string;
    contact?: string;
  };
  customer?: {
    name: string;
    reference?: string;
    contact?: string;
  };
  location?: {
    warehouse?: string;
    zone?: string;
    shelf?: string;
    bin?: string;
  };
  movementDate?: string;
}

// API functions
const movementAPI = {
  // Get all movements with filters
  getMovements: async (filters: MovementFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const response = await fetch(`${API_BASE_URL}/movements?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch movements');
    }
    return response.json();
  },

  // Get movement analytics
  getAnalytics: async (timeframe: string = '30d') => {
    const response = await fetch(`${API_BASE_URL}/movements/analytics?timeframe=${timeframe}`);
    if (!response.ok) {
      throw new Error('Failed to fetch movement analytics');
    }
    return response.json();
  },

  // Get movements for specific product
  getProductMovements: async (productId: string, limit: number = 50) => {
    const response = await fetch(`${API_BASE_URL}/movements/product/${productId}?limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch product movements');
    }
    return response.json();
  },

  // Get single movement
  getMovement: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/movements/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch movement');
    }
    return response.json();
  },

  // Create new movement
  createMovement: async (data: CreateMovementData) => {
    const response = await fetch(`${API_BASE_URL}/movements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create movement');
    }
    return response.json();
  },

  // Update movement
  updateMovement: async (id: string, data: Partial<CreateMovementData>) => {
    const response = await fetch(`${API_BASE_URL}/movements/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update movement');
    }
    return response.json();
  },

  // Delete movement
  deleteMovement: async (id: string, reason?: string) => {
    const response = await fetch(`${API_BASE_URL}/movements/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });
    if (!response.ok) {
      throw new Error('Failed to delete movement');
    }
    return response.json();
  },

  // Bulk create movements
  bulkCreateMovements: async (movements: CreateMovementData[]) => {
    const response = await fetch(`${API_BASE_URL}/movements/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ movements }),
    });
    if (!response.ok) {
      throw new Error('Failed to bulk create movements');
    }
    return response.json();
  },
};

// Hooks
export const useMovements = (filters: MovementFilters = {}) => {
  return useQuery({
    queryKey: ['movements', filters],
    queryFn: () => movementAPI.getMovements(filters),
    staleTime: 30000, // 30 seconds
  });
};

export const useMovementAnalytics = (timeframe: string = '30d') => {
  return useQuery({
    queryKey: ['movementAnalytics', timeframe],
    queryFn: () => movementAPI.getAnalytics(timeframe),
    staleTime: 60000, // 1 minute
  });
};

export const useProductMovements = (productId: string, limit: number = 50) => {
  return useQuery({
    queryKey: ['productMovements', productId, limit],
    queryFn: () => movementAPI.getProductMovements(productId, limit),
    enabled: !!productId,
    staleTime: 30000,
  });
};

export const useMovement = (id: string) => {
  return useQuery({
    queryKey: ['movement', id],
    queryFn: () => movementAPI.getMovement(id),
    enabled: !!id,
  });
};

export const useCreateMovement = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: movementAPI.createMovement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['movementAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardAnalytics'] });
      
      toast({
        title: 'Success',
        description: 'Stock movement created successfully',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });
};

export const useUpdateMovement = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateMovementData> }) =>
      movementAPI.updateMovement(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['movement', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['movementAnalytics'] });
      
      toast({
        title: 'Success',
        description: 'Stock movement updated successfully',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });
};

export const useDeleteMovement = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      movementAPI.deleteMovement(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['movementAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      toast({
        title: 'Success',
        description: 'Stock movement deleted successfully',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });
};

export const useBulkCreateMovements = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: movementAPI.bulkCreateMovements,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['movementAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      const { successful, failed } = data.data;
      toast({
        title: 'Bulk Import Complete',
        description: `${successful.length} movements created, ${failed.length} failed`,
        status: successful.length > 0 ? 'success' : 'warning',
        duration: 5000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });
};
