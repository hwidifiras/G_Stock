/**
 * Integration Status Hook
 * Monitors the completion status of frontend-backend integration
 */

import { useProducts } from './useProducts'
import { useMovements } from './useStockMovements'
import { useSettings } from './useSettings'
import { useDashboardAnalytics } from './useAnalytics'

export interface IntegrationModuleStatus {
  name: string
  status: 'completed' | 'partial' | 'failed' | 'loading'
  progress: number
  description: string
  hasData: boolean
  lastUpdated?: string
}

export interface IntegrationStatus {
  overall: 'completed' | 'partial' | 'failed' | 'loading'
  overallProgress: number
  modules: IntegrationModuleStatus[]
  summary: string
}

export const useIntegrationStatus = (): IntegrationStatus => {
  // Hook data
  const { data: productsData, isLoading: productsLoading, error: productsError } = useProducts()
  const { data: movementsData, isLoading: movementsLoading, error: movementsError } = useMovements()
  const { data: settingsData, isLoading: settingsLoading, error: settingsError } = useSettings()
  const dashboardAnalytics = useDashboardAnalytics()

  // Calculate module statuses
  const modules: IntegrationModuleStatus[] = [
    {
      name: 'Products',
      status: productsLoading ? 'loading' : productsError ? 'failed' : 'completed',
      progress: productsLoading ? 50 : productsError ? 0 : 100,
      description: productsError ? 'API connection failed' : 'Fully integrated with real API',
      hasData: !!productsData?.data?.length,
      lastUpdated: productsData?.data?.[0]?.updatedAt
    },
    {
      name: 'Stock Movements',
      status: movementsLoading ? 'loading' : movementsError ? 'failed' : 'completed',
      progress: movementsLoading ? 50 : movementsError ? 0 : 100,
      description: movementsError ? 'API connection failed' : 'Fully integrated with real API',
      hasData: !!movementsData?.data?.length,
      lastUpdated: movementsData?.data?.[0]?.createdAt
    },
    {
      name: 'Settings',
      status: settingsLoading ? 'loading' : settingsError ? 'failed' : 'completed',
      progress: settingsLoading ? 50 : settingsError ? 0 : 100,
      description: settingsError ? 'API connection failed' : 'Fully integrated with real API',
      hasData: !!settingsData?.data,
      lastUpdated: settingsData?.data?.lastUpdated
    },
    {
      name: 'Analytics',
      status: dashboardAnalytics.loading ? 'loading' : dashboardAnalytics.error ? 'failed' : 'completed',
      progress: dashboardAnalytics.loading ? 50 : dashboardAnalytics.error ? 0 : 100,
      description: dashboardAnalytics.error ? 'API connection failed' : 'Fully integrated with real API',
      hasData: !!dashboardAnalytics.data,
      lastUpdated: new Date().toISOString() // Analytics is calculated data
    }
  ]

  // Calculate overall status
  const totalProgress = modules.reduce((sum, module) => sum + module.progress, 0)
  const overallProgress = Math.round(totalProgress / modules.length)

  const failedModules = modules.filter(m => m.status === 'failed').length
  const loadingModules = modules.filter(m => m.status === 'loading').length
  const completedModules = modules.filter(m => m.status === 'completed').length

  let overall: 'completed' | 'partial' | 'failed' | 'loading'
  let summary: string

  if (loadingModules > 0) {
    overall = 'loading'
    summary = `Loading ${loadingModules} module${loadingModules > 1 ? 's' : ''}...`
  } else if (failedModules > 0) {
    overall = 'failed'
    summary = `${failedModules} module${failedModules > 1 ? 's' : ''} failed to connect to API`
  } else if (completedModules === modules.length) {
    overall = 'completed'
    summary = 'All modules successfully integrated with backend API'
  } else {
    overall = 'partial'
    summary = `${completedModules}/${modules.length} modules integrated`
  }

  return {
    overall,
    overallProgress,
    modules,
    summary
  }
}
