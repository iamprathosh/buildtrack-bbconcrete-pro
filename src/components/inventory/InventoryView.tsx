'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InventoryStats } from './InventoryStats'
import { InventoryTable } from './InventoryTable'
import { InventoryFilters } from './InventoryFilters'
import { AddItemDialog } from './AddItemDialog'
import { ProductDetailsModal } from './ProductDetailsModal'
import { useUser } from '@clerk/nextjs'
import { useProducts, UseProductsOptions } from '@/hooks/useProducts'
import { ProductWithDetails } from '@/services/ProductService'
import { toast } from 'sonner'
import { 
  Package,
  Plus,
  Download,
  Upload,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Loader2,
  Image as ImageIcon
} from 'lucide-react'

// Convert ProductWithDetails to InventoryItem for backward compatibility
function productToInventoryItem(product: ProductWithDetails): InventoryItem {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    category: product.category?.name || 'Uncategorized',
    currentStock: product.current_stock || 0,
    minLevel: product.min_stock_level || 0,
    maxLevel: product.max_stock_level || 0,
    unit: product.unit_of_measure,
    unitPrice: product.mauc || 0,
    totalValue: product.total_value || 0,
    location: product.location?.name || 'Unknown',
    supplier: product.supplier || 'Unknown',
    description: product.description || undefined,
    lastUpdated: new Date(product.updated_at || product.created_at || new Date()),
    status: product.stock_status || 'in-stock',
    reorderPoint: product.min_stock_level || 0,
    averageUsage: 0, // Not tracked in current schema
    leadTime: 0, // Not tracked in current schema
    tags: [], // Not tracked in current schema
    imageUrl: product.image_url || undefined
  }
}

export interface InventoryItem {
  id: string
  name: string
  sku: string
  category: string
  currentStock: number
  minLevel: number
  maxLevel: number
  unit: string
  unitPrice: number
  totalValue: number
  location: string
  supplier: string
  description?: string
  lastUpdated: Date
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'discontinued'
  reorderPoint: number
  averageUsage: number
  leadTime: number // days
  tags: string[]
  imageUrl?: string
}

export interface InventoryFilters {
  search: string
  category: string
  location: string
  status: string
  supplier: string
  priceRange: [number, number]
  stockRange: [number, number]
}

export function InventoryView() {
  const { user } = useUser()
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([])
  const [filters, setFilters] = useState<InventoryFilters>({
    search: '',
    category: 'all',
    location: 'all',
    status: 'all',
    supplier: 'all',
    priceRange: [0, 10000],
    stockRange: [0, 1000]
  })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)

  // Use the real database hook
  const {
    products,
    stats,
    loading,
    error,
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    refresh,
    isReady
  } = useProducts()

  // Convert database products to inventory items and apply filters
  useEffect(() => {
    if (!products) return
    
    // Convert products to inventory items
    const inventoryItems = products.map(productToInventoryItem)
    
    // Apply filters
    const filtered = inventoryItems.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.sku.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.description?.toLowerCase().includes(filters.search.toLowerCase())

      const matchesCategory = filters.category === 'all' || item.category === filters.category
      const matchesLocation = filters.location === 'all' || item.location === filters.location
      const matchesStatus = filters.status === 'all' || item.status === filters.status
      const matchesSupplier = filters.supplier === 'all' || item.supplier === filters.supplier
      
      const matchesPriceRange = item.unitPrice >= filters.priceRange[0] && item.unitPrice <= filters.priceRange[1]
      const matchesStockRange = item.currentStock >= filters.stockRange[0] && item.currentStock <= filters.stockRange[1]

      return matchesSearch && matchesCategory && matchesLocation && matchesStatus && 
             matchesSupplier && matchesPriceRange && matchesStockRange
    })

    setFilteredInventory(filtered)
  }, [products, filters])

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(`Database Error: ${error}`)
    }
  }, [error])

  // Load products with current filter options
  const handleFiltersChange = async (newFilters: InventoryFilters) => {
    setFilters(newFilters)
    
    // Convert filters to UseProductsOptions
    const options: UseProductsOptions = {
      search: newFilters.search || undefined,
      category: newFilters.category !== 'all' ? newFilters.category : undefined,
      location: newFilters.location !== 'all' ? newFilters.location : undefined,
      status: newFilters.status !== 'all' ? newFilters.status : undefined
    }
    
    await loadProducts(options)
  }

  const handleExportInventory = () => {
    // Implement export functionality
    const csvData = filteredInventory.map(item => ({
      sku: item.sku,
      name: item.name,
      category: item.category,
      currentStock: item.currentStock,
      unitPrice: item.unitPrice,
      totalValue: item.totalValue,
      location: item.location,
      supplier: item.supplier,
      status: item.status
    }))
    
    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportInventory = () => {
    // Implement import functionality
    toast.info('Import functionality coming soon')
  }

  const handleBulkAction = async (action: string) => {
    if (selectedItems.length === 0) return
    
    if (action === 'delete') {
      const confirmed = window.confirm(`Are you sure you want to delete ${selectedItems.length} items?`)
      if (!confirmed) return
      
      try {
        const promises = selectedItems.map(id => deleteProduct(id))
        const results = await Promise.all(promises)
        
        const successful = results.filter(Boolean).length
        toast.success(`Successfully deleted ${successful} items`)
        
        if (successful < selectedItems.length) {
          toast.warning(`Failed to delete ${selectedItems.length - successful} items`)
        }
        
        setSelectedItems([])
      } catch (error) {
        toast.error('Failed to delete selected items')
      }
    } else if (action === 'export') {
      handleExportInventory()
    }
  }

  const handleRowClick = (productId: string) => {
    setSelectedProductId(productId)
    setIsProductModalOpen(true)
  }

  const handleProductUpdate = async (productId: string) => {
    // Refresh the products after an update
    await refresh()
  }

  // Show loading state
  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Connecting to database...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Responsive container ensures no horizontal scroll */}
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
          
          {selectedItems.length > 0 && (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {selectedItems.length} selected
              </Badge>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('delete')}>
                Delete
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('export')}>
                Export Selected
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleImportInventory}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" onClick={handleExportInventory}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <InventoryStats stats={stats} loading={loading} />

      {/* Filters */}
      <InventoryFilters 
        filters={filters}
        onFiltersChange={handleFiltersChange}
        inventory={products.map(productToInventoryItem)}
      />

      {/* Main Content */}
      <Tabs defaultValue="table" className="space-y-4">
        <TabsList>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="cards">Card View</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading products...</span>
            </div>
          ) : (
            <InventoryTable 
              inventory={filteredInventory}
              selectedItems={selectedItems}
              onSelectedItemsChange={setSelectedItems}
              onRowClick={handleRowClick}
              onItemUpdate={async (itemId, updates) => {
                // Convert InventoryItem updates back to ProductUpdate
                const productUpdates = {
                  name: updates.name,
                  sku: updates.sku,
                  description: updates.description,
                  current_stock: updates.currentStock,
                  min_stock_level: updates.minLevel,
                  max_stock_level: updates.maxLevel,
                  unit_of_measure: updates.unit,
                  supplier: updates.supplier
                }
                
                const success = await updateProduct(itemId, productUpdates)
                if (success) {
                  toast.success('Product updated successfully')
                } else {
                  toast.error('Failed to update product')
                }
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="cards" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredInventory.map((item) => (
              <Card 
                key={item.id} 
                className="relative cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleRowClick(item.id)}
              >
                {/* Product Image */}
                <div className="aspect-video bg-muted/30 rounded-t-lg overflow-hidden">
                  {item.imageUrl ? (
                    <>
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const fallback = target.nextElementSibling as HTMLElement
                          if (fallback) fallback.style.display = 'flex'
                        }}
                      />
                      <div className="hidden w-full h-full flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No image</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No image</p>
                      </div>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 min-w-0 flex-1">
                      <CardTitle className="text-lg truncate">{item.name}</CardTitle>
                      <CardDescription className="truncate">
                        {item.sku} • {item.category}
                      </CardDescription>
                    </div>
                    <Badge variant={
                      item.status === 'in-stock' ? 'default' :
                      item.status === 'low-stock' ? 'secondary' :
                      item.status === 'out-of-stock' ? 'destructive' : 'outline'
                    } className="ml-2 shrink-0">
                      {item.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Stock</p>
                      <p className="font-medium">{item.currentStock} {item.unit}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Value</p>
                      <p className="font-medium">${item.totalValue.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium truncate">{item.location}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Unit Price</p>
                      <p className="font-medium">${item.unitPrice.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  {/* Supplier and Description */}
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Supplier</p>
                      <p className="font-medium truncate">{item.supplier}</p>
                    </div>
                    {item.description && (
                      <div>
                        <p className="text-muted-foreground">Description</p>
                        <p className="text-xs text-muted-foreground overflow-hidden" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical' as const
                        }}>
                          {item.description}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {item.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{item.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Stock Status Distribution</CardTitle>
                <CardDescription>Items by stock status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['in-stock', 'low-stock', 'out-of-stock'].map(status => {
                    const count = filteredInventory.filter(item => item.status === status).length
                    const percentage = filteredInventory.length > 0 ? (count / filteredInventory.length) * 100 : 0
                    
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <span className="capitalize text-sm">{status.replace('-', ' ')}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                status === 'in-stock' ? 'bg-green-500' :
                                status === 'low-stock' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8">{count}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Value by Category</CardTitle>
                <CardDescription>Total inventory value by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...new Set(filteredInventory.map(item => item.category))].map(category => {
                    const categoryItems = filteredInventory.filter(item => item.category === category)
                    const totalValue = categoryItems.reduce((sum, item) => sum + item.totalValue, 0)
                    const maxValue = Math.max(...[...new Set(filteredInventory.map(item => item.category))]
                      .map(cat => filteredInventory.filter(item => item.category === cat)
                        .reduce((sum, item) => sum + item.totalValue, 0)))
                    const percentage = maxValue > 0 ? (totalValue / maxValue) * 100 : 0
                    
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm">{category}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-blue-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-16">${totalValue.toFixed(0)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Item Dialog */}
      <AddItemDialog 
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onItemAdded={async (newItem) => {
          // Convert InventoryItem to ProductInsert
          const productData = {
            sku: newItem.sku,
            name: newItem.name,
            description: newItem.description,
            unit_of_measure: newItem.unit,
            current_stock: newItem.currentStock,
            min_stock_level: newItem.minLevel,
            max_stock_level: newItem.maxLevel,
            supplier: newItem.supplier,
            is_active: true
          }
          
          const success = await createProduct(productData)
          if (success) {
            toast.success('Product added successfully')
            setIsAddDialogOpen(false)
          } else {
            toast.error('Failed to add product')
          }
        }}
      />

      {/* Product Details Modal */}
      <ProductDetailsModal
        productId={selectedProductId}
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false)
          setSelectedProductId(null)
        }}
        onProductUpdate={handleProductUpdate}
      />
    </div>
  )
}