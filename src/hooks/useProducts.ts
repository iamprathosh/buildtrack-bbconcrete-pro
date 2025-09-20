'use client'

import { useState, useEffect, useCallback } from 'react'
import { productService, ProductWithDetails, InventoryStats } from '@/services/ProductService'
import { useDatabase } from '@/lib/database'
import { ProductInsert, ProductUpdate, StockTransactionInsert } from '@/types/database'

export interface UseProductsOptions {
  category?: string
  location?: string
  status?: string
  search?: string
  limit?: number
  autoLoad?: boolean
}

export interface UseProductsReturn {
  // Data
  products: ProductWithDetails[]
  stats: InventoryStats | null
  lowStockItems: ProductWithDetails[]
  
  // Loading states
  loading: boolean
  loadingStats: boolean
  loadingLowStock: boolean
  
  // Error states
  error: string | null
  statsError: string | null
  lowStockError: string | null
  
  // Actions
  loadProducts: (options?: UseProductsOptions) => Promise<void>
  loadStats: () => Promise<void>
  loadLowStockItems: () => Promise<void>
  createProduct: (data: ProductInsert) => Promise<boolean>
  updateProduct: (id: string, data: ProductUpdate) => Promise<boolean>
  deleteProduct: (id: string) => Promise<boolean>
  createStockTransaction: (data: StockTransactionInsert) => Promise<boolean>
  searchProducts: (searchTerm: string) => Promise<ProductWithDetails[]>
  
  // Utils
  refresh: () => Promise<void>
  isReady: boolean
}

export function useProducts(initialOptions?: UseProductsOptions): UseProductsReturn {
  const { isReady } = useDatabase()
  
  // State
  const [products, setProducts] = useState<ProductWithDetails[]>([])
  const [stats, setStats] = useState<InventoryStats | null>(null)
  const [lowStockItems, setLowStockItems] = useState<ProductWithDetails[]>([])
  
  // Loading states
  const [loading, setLoading] = useState(false)
  const [loadingStats, setLoadingStats] = useState(false)
  const [loadingLowStock, setLoadingLowStock] = useState(false)
  
  // Error states
  const [error, setError] = useState<string | null>(null)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [lowStockError, setLowStockError] = useState<string | null>(null)
  
  // Current options
  const [currentOptions, setCurrentOptions] = useState<UseProductsOptions>(initialOptions || {})

  // Load products
  const loadProducts = useCallback(async (options: UseProductsOptions = {}) => {
    if (!isReady) return
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await productService.getAllWithDetails(options)
      
      if (result.error) {
        setError(result.error)
      } else {
        setProducts(result.data || [])
        setCurrentOptions(options)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [isReady])

  // Load inventory stats
  const loadStats = useCallback(async () => {
    if (!isReady) return
    
    setLoadingStats(true)
    setStatsError(null)
    
    try {
      const result = await productService.getInventoryStats()
      
      if (result.error) {
        setStatsError(result.error)
      } else {
        setStats(result.data)
      }
    } catch (err) {
      setStatsError(err instanceof Error ? err.message : 'Failed to load stats')
    } finally {
      setLoadingStats(false)
    }
  }, [isReady])

  // Load low stock items
  const loadLowStockItems = useCallback(async () => {
    if (!isReady) return
    
    setLoadingLowStock(true)
    setLowStockError(null)
    
    try {
      const result = await productService.getLowStockItems()
      
      if (result.error) {
        setLowStockError(result.error)
      } else {
        setLowStockItems(result.data || [])
      }
    } catch (err) {
      setLowStockError(err instanceof Error ? err.message : 'Failed to load low stock items')
    } finally {
      setLoadingLowStock(false)
    }
  }, [isReady])

  // Create product
  const createProduct = useCallback(async (data: ProductInsert): Promise<boolean> => {
    if (!isReady) return false
    
    try {
      const result = await productService.createProduct(data)
      
      if (result.error) {
        setError(result.error)
        return false
      } else {
        // Refresh products and stats
        await Promise.all([
          loadProducts(currentOptions),
          loadStats()
        ])
        return true
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product')
      return false
    }
  }, [isReady, currentOptions, loadProducts, loadStats])

  // Update product
  const updateProduct = useCallback(async (id: string, data: ProductUpdate): Promise<boolean> => {
    if (!isReady) return false
    
    try {
      const result = await productService.updateProduct(id, data)
      
      if (result.error) {
        setError(result.error)
        return false
      } else {
        // Update local state optimistically
        setProducts(prev => prev.map(p => 
          p.id === id ? { ...p, ...data as Partial<ProductWithDetails> } : p
        ))
        
        // Refresh stats in background
        loadStats()
        return true
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product')
      return false
    }
  }, [isReady, loadStats])

  // Delete product
  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    if (!isReady) return false
    
    try {
      const result = await productService.deleteProduct(id)
      
      if (result.error) {
        setError(result.error)
        return false
      } else {
        // Remove from local state
        setProducts(prev => prev.filter(p => p.id !== id))
        
        // Refresh stats in background
        loadStats()
        return true
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product')
      return false
    }
  }, [isReady, loadStats])

  // Create stock transaction
  const createStockTransaction = useCallback(async (data: StockTransactionInsert): Promise<boolean> => {
    if (!isReady) return false
    
    try {
      const result = await productService.createStockTransaction(data)
      
      if (result.error) {
        setError(result.error)
        return false
      } else {
        // Refresh products and stats to reflect stock changes
        await Promise.all([
          loadProducts(currentOptions),
          loadStats(),
          loadLowStockItems()
        ])
        return true
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create stock transaction')
      return false
    }
  }, [isReady, currentOptions, loadProducts, loadStats, loadLowStockItems])

  // Search products
  const searchProducts = useCallback(async (searchTerm: string): Promise<ProductWithDetails[]> => {
    if (!isReady) return []
    
    try {
      const result = await productService.searchProducts(searchTerm)
      
      if (result.error) {
        setError(result.error)
        return []
      } else {
        return result.data || []
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search products')
      return []
    }
  }, [isReady])

  // Refresh all data
  const refresh = useCallback(async () => {
    await Promise.all([
      loadProducts(currentOptions),
      loadStats(),
      loadLowStockItems()
    ])
  }, [currentOptions, loadProducts, loadStats, loadLowStockItems])

  // Auto-load on mount and when database becomes ready
  useEffect(() => {
    if (isReady && (initialOptions?.autoLoad !== false)) {
      loadProducts(initialOptions)
    }
  }, [isReady, loadProducts, initialOptions])

  // Auto-load stats
  useEffect(() => {
    if (isReady) {
      loadStats()
    }
  }, [isReady, loadStats])

  return {
    // Data
    products,
    stats,
    lowStockItems,
    
    // Loading states
    loading,
    loadingStats,
    loadingLowStock,
    
    // Error states
    error,
    statsError,
    lowStockError,
    
    // Actions
    loadProducts,
    loadStats,
    loadLowStockItems,
    createProduct,
    updateProduct,
    deleteProduct,
    createStockTransaction,
    searchProducts,
    
    // Utils
    refresh,
    isReady
  }
}

// Specific hook for inventory stats only
export function useInventoryStats() {
  const { isReady } = useDatabase()
  const [stats, setStats] = useState<InventoryStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadStats = useCallback(async () => {
    if (!isReady) return
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await productService.getInventoryStats()
      
      if (result.error) {
        setError(result.error)
      } else {
        setStats(result.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats')
    } finally {
      setLoading(false)
    }
  }, [isReady])

  useEffect(() => {
    if (isReady) {
      loadStats()
    }
  }, [isReady, loadStats])

  return {
    stats,
    loading,
    error,
    refresh: loadStats,
    isReady
  }
}

// Hook for low stock alerts
export function useLowStockAlerts() {
  const { isReady } = useDatabase()
  const [lowStockItems, setLowStockItems] = useState<ProductWithDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadLowStock = useCallback(async () => {
    if (!isReady) return
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await productService.getLowStockItems()
      
      if (result.error) {
        setError(result.error)
      } else {
        setLowStockItems(result.data || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load low stock items')
    } finally {
      setLoading(false)
    }
  }, [isReady])

  useEffect(() => {
    if (isReady) {
      loadLowStock()
    }
  }, [isReady, loadLowStock])

  return {
    lowStockItems,
    loading,
    error,
    refresh: loadLowStock,
    isReady,
    alertCount: lowStockItems.length
  }
}