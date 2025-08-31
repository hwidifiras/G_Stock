/**
 * React Query Hooks for Product Management
 * Custom hooks that integrate with the API service
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@chakra-ui/react'
import { productService, type CreateProductData, type UpdateProductData, type ProductFilters } from '../services/api'

// Query Keys
export const QUERY_KEYS = {
  products: ['products'] as const,
  product: (id: string) => ['products', id] as const,
  lowStockProducts: ['products', 'low-stock'] as const,
} as const

// Custom Hooks

/**
 * Hook to fetch all products with optional filtering
 */
export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.products, filters],
    queryFn: () => productService.getAll(filters),
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  })
}

/**
 * Hook to fetch a single product by ID
 */
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.product(id),
    queryFn: () => productService.getById(id),
    enabled: !!id,
    staleTime: 60000, // 1 minute
  })
}

/**
 * Hook to fetch low stock products
 */
export const useLowStockProducts = () => {
  return useQuery({
    queryKey: QUERY_KEYS.lowStockProducts,
    queryFn: () => productService.getLowStock(),
    staleTime: 60000, // 1 minute
  })
}

/**
 * Hook to create a new product
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: (productData: CreateProductData) => productService.create(productData),
    onSuccess: (data) => {
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products })
      
      toast({
        title: 'Produit créé',
        description: `${data.data?.name} a été ajouté avec succès`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Erreur lors de la création du produit',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    },
  })
}

/**
 * Hook to update a product
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductData }) => 
      productService.update(id, data),
    onSuccess: (data, variables) => {
      // Update the specific product in cache
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.product(variables.id) })
      // Invalidate products list to refresh
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products })
      
      toast({
        title: 'Produit mis à jour',
        description: `${data.data?.name} a été modifié avec succès`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Erreur lors de la mise à jour du produit',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    },
  })
}

/**
 * Hook to delete a product
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: (data) => {
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lowStockProducts })
      
      toast({
        title: 'Produit supprimé',
        description: `${data.data?.name} a été supprimé avec succès`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Erreur lors de la suppression du produit',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    },
  })
}

/**
 * Hook to update product stock
 */
export const useUpdateProductStock = () => {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: ({ 
      id, 
      quantity, 
      operation = 'set' 
    }: { 
      id: string
      quantity: number
      operation?: 'set' | 'add' | 'subtract'
    }) => productService.updateStock(id, quantity, operation),
    onSuccess: (data, variables) => {
      // Update caches
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.product(variables.id) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lowStockProducts })
      
      toast({
        title: 'Stock mis à jour',
        description: `Stock de ${data.data?.name} mis à jour`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Erreur lors de la mise à jour du stock',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    },
  })
}
