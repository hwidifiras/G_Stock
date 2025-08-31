/**
 * Analytics Hooks
 * Custom React hooks for fetching and managing analytics data
 */

import { useState, useEffect, useCallback } from 'react'
import { analyticsService, DashboardAnalytics, MovementsAnalytics, ActivityItem, ReportsAnalytics } from '../services/api'

// Hook for dashboard analytics
export const useDashboardAnalytics = (autoRefresh: boolean = true) => {
  const [data, setData] = useState<DashboardAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await analyticsService.getDashboardAnalytics()
      
      if (response.success && response.data) {
        setData(response.data)
      } else {
        setError(response.message || 'Failed to fetch dashboard analytics')
      }
    } catch (err) {
      console.error('Error fetching dashboard analytics:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()

    // Auto-refresh every 30 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchData, 30000)
      return () => clearInterval(interval)
    }
  }, [fetchData, autoRefresh])

  return {
    data,
    loading,
    error,
    refetch: fetchData
  }
}

// Hook for movements analytics
export const useMovementsAnalytics = (timeframe: string = '7d', autoRefresh: boolean = false) => {
  const [data, setData] = useState<MovementsAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await analyticsService.getMovementsAnalytics(timeframe)
      
      if (response.success && response.data) {
        setData(response.data)
      } else {
        setError(response.message || 'Failed to fetch movements analytics')
      }
    } catch (err) {
      console.error('Error fetching movements analytics:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }, [timeframe])

  useEffect(() => {
    fetchData()

    // Auto-refresh every 60 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchData, 60000)
      return () => clearInterval(interval)
    }
  }, [fetchData, autoRefresh])

  return {
    data,
    loading,
    error,
    refetch: fetchData
  }
}

// Hook for recent activity
export const useRecentActivity = (limit: number = 10, autoRefresh: boolean = true) => {
  const [data, setData] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await analyticsService.getRecentActivity(limit)
      
      if (response.success && response.data) {
        setData(response.data)
      } else {
        setError(response.message || 'Failed to fetch recent activity')
      }
    } catch (err) {
      console.error('Error fetching recent activity:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchData()

    // Auto-refresh every 15 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchData, 15000)
      return () => clearInterval(interval)
    }
  }, [fetchData, autoRefresh])

  return {
    data,
    loading,
    error,
    refetch: fetchData
  }
}

// Hook for reports analytics
export const useReportsAnalytics = (
  timeframe: string = 'year', 
  category: string = 'all', 
  autoRefresh: boolean = false
) => {
  const [data, setData] = useState<ReportsAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await analyticsService.getReportsAnalytics(timeframe, category)
      
      if (response.success && response.data) {
        setData(response.data)
      } else {
        setError(response.message || 'Failed to fetch reports analytics')
      }
    } catch (err) {
      console.error('Error fetching reports analytics:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }, [timeframe, category])

  useEffect(() => {
    fetchData()

    // Auto-refresh every 2 minutes if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchData, 120000)
      return () => clearInterval(interval)
    }
  }, [fetchData, autoRefresh])

  return {
    data,
    loading,
    error,
    refetch: fetchData
  }
}

// Combined hook for all analytics data
export const useAnalytics = (options: {
  dashboardAutoRefresh?: boolean
  movementsTimeframe?: string
  movementsAutoRefresh?: boolean
  activityLimit?: number
  activityAutoRefresh?: boolean
} = {}) => {
  const {
    dashboardAutoRefresh = true,
    movementsTimeframe = '7d',
    movementsAutoRefresh = false,
    activityLimit = 10,
    activityAutoRefresh = true
  } = options

  const dashboard = useDashboardAnalytics(dashboardAutoRefresh)
  const movements = useMovementsAnalytics(movementsTimeframe, movementsAutoRefresh)
  const activity = useRecentActivity(activityLimit, activityAutoRefresh)

  const isLoading = dashboard.loading || movements.loading || activity.loading
  const hasError = dashboard.error || movements.error || activity.error

  const refetchAll = useCallback(() => {
    dashboard.refetch()
    movements.refetch()
    activity.refetch()
  }, [dashboard.refetch, movements.refetch, activity.refetch])

  return {
    dashboard,
    movements,
    activity,
    isLoading,
    hasError,
    refetchAll
  }
}
