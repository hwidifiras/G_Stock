/**
 * API Service Layer
 * Handles all communication with the backend API
 */

import axios from 'axios'

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api'

// Create axios instance with default configuration
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 seconds timeout
})

// Request interceptor for logging and auth (if needed later)
api.interceptors.request.use(
  (config) => {
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('❌ API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Types for API responses
export interface Product {
  _id: string
  name: string
  reference: string
  quantity: number
  price: number
  description?: string
  category?: string
  minStock?: number
  unit?: string
  status?: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
  // Virtual fields from enhanced model
  stockStatus?: 'in-stock' | 'low-stock' | 'out-of-stock' | 'medium-stock'
  totalValue?: number
  isAvailable?: boolean
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  count?: number
  total?: number
  page?: number
  pages?: number
}

export interface CreateProductData {
  name: string
  reference: string
  quantity: number
  price: number
  description?: string
  category?: string
  minStock?: number
  unit?: string
  status?: 'active' | 'inactive'
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export interface ProductFilters {
  category?: string
  status?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
}

// Analytics types
export interface DashboardAnalytics {
  totalProducts: {
    value: number
    growth: string
    label: string
  }
  totalValue: {
    value: string
    growth: string
    label: string
  }
  lowStock: {
    value: number
    growth: string
    label: string
  }
  totalQuantity: {
    value: number
    growth: string
    label: string
  }
  categoryDistribution: Array<{
    _id: string
    count: number
    totalQuantity: number
    totalValue: number
  }>
  stockStatus: {
    inStock: number
    lowStock: number
    outOfStock: number
    total: number
  }
}

export interface MovementsAnalytics {
  stockMovements: Array<{
    name: string
    data: number[]
  }>
  categories: string[]
  summary: {
    totalEntries: number
    totalExits: number
    netMovement: number
  }
}

export interface ActivityItem {
  id: string
  type: string
  title: string
  description: string
  timestamp: string
  icon: string
  data: any
}

export interface ReportsAnalytics {
  inventoryValue: {
    data: Array<{
      name: string
      data: number[]
    }>
    categories: string[]
  }
  topProducts: {
    data: Array<{
      name: string
      data: number[]
    }>
    categories: string[]
  }
  categoryDistribution: {
    data: number[]
    labels: string[]
  }
  kpis: {
    totalProducts: number
    totalValue: number
    avgProductValue: number
    lowStockCount: number
    stockTurnover: number
    profitMargin: number
  }
}

// Product API Service
export const productService = {
  // Get all products with optional filtering
  getAll: async (filters?: ProductFilters): Promise<ApiResponse<Product[]>> => {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }
    
    const response = await api.get(`/products?${params.toString()}`)
    return response.data
  },

  // Get product by ID
  getById: async (id: string): Promise<ApiResponse<Product>> => {
    const response = await api.get(`/products/${id}`)
    return response.data
  },

  // Create new product
  create: async (productData: CreateProductData): Promise<ApiResponse<Product>> => {
    const response = await api.post('/products', productData)
    return response.data
  },

  // Update product
  update: async (id: string, productData: UpdateProductData): Promise<ApiResponse<Product>> => {
    const response = await api.put(`/products/${id}`, productData)
    return response.data
  },

  // Delete product
  delete: async (id: string): Promise<ApiResponse<Product>> => {
    const response = await api.delete(`/products/${id}`)
    return response.data
  },

  // Get low stock products
  getLowStock: async (): Promise<ApiResponse<Product[]>> => {
    const response = await api.get('/products/low-stock')
    return response.data
  },

  // Update stock quantity
  updateStock: async (
    id: string, 
    quantity: number, 
    operation: 'set' | 'add' | 'subtract' = 'set'
  ): Promise<ApiResponse<Product>> => {
    const response = await api.patch(`/products/${id}/stock`, { quantity, operation })
    return response.data
  }
}

// Analytics API Service
export const analyticsService = {
  // Get dashboard analytics
  getDashboardAnalytics: async (): Promise<ApiResponse<DashboardAnalytics>> => {
    const response = await api.get('/analytics/dashboard')
    return response.data
  },

  // Get movements analytics
  getMovementsAnalytics: async (
    timeframe: string = '7d'
  ): Promise<ApiResponse<MovementsAnalytics>> => {
    const response = await api.get(`/analytics/movements?timeframe=${timeframe}`)
    return response.data
  },

  // Get recent activity
  getRecentActivity: async (
    limit: number = 10
  ): Promise<ApiResponse<ActivityItem[]>> => {
    const response = await api.get(`/analytics/activity?limit=${limit}`)
    return response.data
  },

  // Get reports analytics
  getReportsAnalytics: async (
    timeframe: string = 'year',
    category: string = 'all'
  ): Promise<ApiResponse<ReportsAnalytics>> => {
    const response = await api.get(`/analytics/reports?timeframe=${timeframe}&category=${category}`)
    return response.data
  }
}

// Health check service
export const healthService = {
  check: async () => {
    const response = await api.get('/health')
    return response.data
  }
}

export default api
