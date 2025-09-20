'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { productService, ProductWithDetails } from '@/services/ProductService'
import { StockTransaction } from '@/types/database'
import { toast } from 'sonner'
import {
  Package,
  MapPin,
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Edit3,
  Save,
  X,
  Image as ImageIcon,
  History,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Building2
} from 'lucide-react'

interface ProductDetailsModalProps {
  productId: string | null
  isOpen: boolean
  onClose: () => void
  onProductUpdate?: (productId: string) => void
}

export function ProductDetailsModal({ 
  productId, 
  isOpen, 
  onClose, 
  onProductUpdate 
}: ProductDetailsModalProps) {
  const [product, setProduct] = useState<ProductWithDetails | null>(null)
  const [stockTransactions, setStockTransactions] = useState<StockTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProduct, setEditedProduct] = useState<Partial<ProductWithDetails>>({})

  // Load product details when modal opens
  useEffect(() => {
    if (isOpen && productId) {
      loadProductDetails()
    }
  }, [isOpen, productId])

  const loadProductDetails = async () => {
    if (!productId) return

    setLoading(true)
    try {
      const [productResult, transactionsResult] = await Promise.all([
        productService.getByIdWithDetails(productId),
        productService.getStockTransactions(productId, 100)
      ])

      if (productResult.error) {
        toast.error(`Failed to load product: ${productResult.error}`)
        onClose()
        return
      }

      if (productResult.data) {
        setProduct(productResult.data)
        setEditedProduct(productResult.data)
      }

      if (transactionsResult.data) {
        setStockTransactions(transactionsResult.data)
      }
    } catch (error) {
      toast.error('Failed to load product details')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!product || !editedProduct) return

    try {
      const updates = {
        name: editedProduct.name,
        description: editedProduct.description,
        current_stock: editedProduct.current_stock,
        min_stock_level: editedProduct.min_stock_level,
        max_stock_level: editedProduct.max_stock_level,
        supplier: editedProduct.supplier
      }

      const result = await productService.updateProduct(product.id, updates)
      
      if (result.error) {
        toast.error(`Failed to update product: ${result.error}`)
        return
      }

      toast.success('Product updated successfully')
      setIsEditing(false)
      await loadProductDetails() // Reload to get fresh data
      onProductUpdate?.(product.id)
    } catch (error) {
      toast.error('Failed to update product')
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'in-stock':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'low-stock':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'out-of-stock':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'receive':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'pull':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'return':
        return <Package className="h-4 w-4 text-blue-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  if (!product && !loading) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              {loading ? (
                <span>Loading product details...</span>
              ) : (
                <span>{product?.name}</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {product && (
                <Badge className={getStatusColor(product.stock_status)}>
                  {product.stock_status?.replace('-', ' ')}
                </Badge>
              )}
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
              {isEditing && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false)
                      setEditedProduct(product || {})
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveEdit}>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground animate-pulse mb-4" />
              <p className="text-muted-foreground">Loading product details...</p>
            </div>
          </div>
        ) : product ? (
          <ScrollArea className="max-h-[calc(90vh-8rem)]">
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="stock">Stock History</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Stock Status Card */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Package className="h-4 w-4 mr-2" />
                        Current Stock
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {product.current_stock} {product.unit_of_measure}
                      </div>
                      <div className="flex items-center mt-2 text-sm text-muted-foreground">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Min: {product.min_stock_level} | Max: {product.max_stock_level}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Value Card */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Total Value
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(product.total_value || 0)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        @ {formatCurrency(product.mauc || 0)} per {product.unit_of_measure}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Location Card */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        Location
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-medium">
                        {product.location?.name || 'Not specified'}
                      </div>
                      {product.location?.city && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {product.location.city}, {product.location.state}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                {/* Quick Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">SKU:</span>
                    <p className="font-medium">{product.sku}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <p className="font-medium">{product.category?.name || 'Uncategorized'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Supplier:</span>
                    <p className="font-medium">{product.supplier || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Updated:</span>
                    <p className="font-medium">
                      {formatDate(product.updated_at || product.created_at || '')}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {product.description && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {product.description}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Information</CardTitle>
                    <CardDescription>
                      {isEditing ? 'Edit product details' : 'Detailed product information'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Product Name</Label>
                        {isEditing ? (
                          <Input
                            id="name"
                            value={editedProduct.name || ''}
                            onChange={(e) => setEditedProduct(prev => ({ ...prev, name: e.target.value }))}
                          />
                        ) : (
                          <p className="text-sm border rounded-md px-3 py-2 bg-muted">{product.name}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sku">SKU</Label>
                        <p className="text-sm border rounded-md px-3 py-2 bg-muted">{product.sku}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      {isEditing ? (
                        <Textarea
                          id="description"
                          value={editedProduct.description || ''}
                          onChange={(e) => setEditedProduct(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                        />
                      ) : (
                        <p className="text-sm border rounded-md px-3 py-2 bg-muted min-h-[80px]">
                          {product.description || 'No description provided'}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="current_stock">Current Stock</Label>
                        {isEditing ? (
                          <Input
                            id="current_stock"
                            type="number"
                            value={editedProduct.current_stock || 0}
                            onChange={(e) => setEditedProduct(prev => ({ 
                              ...prev, 
                              current_stock: parseInt(e.target.value) || 0 
                            }))}
                          />
                        ) : (
                          <p className="text-sm border rounded-md px-3 py-2 bg-muted">
                            {product.current_stock} {product.unit_of_measure}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="min_stock">Min Level</Label>
                        {isEditing ? (
                          <Input
                            id="min_stock"
                            type="number"
                            value={editedProduct.min_stock_level || 0}
                            onChange={(e) => setEditedProduct(prev => ({ 
                              ...prev, 
                              min_stock_level: parseInt(e.target.value) || 0 
                            }))}
                          />
                        ) : (
                          <p className="text-sm border rounded-md px-3 py-2 bg-muted">{product.min_stock_level}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max_stock">Max Level</Label>
                        {isEditing ? (
                          <Input
                            id="max_stock"
                            type="number"
                            value={editedProduct.max_stock_level || 0}
                            onChange={(e) => setEditedProduct(prev => ({ 
                              ...prev, 
                              max_stock_level: parseInt(e.target.value) || 0 
                            }))}
                          />
                        ) : (
                          <p className="text-sm border rounded-md px-3 py-2 bg-muted">{product.max_stock_level}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="supplier">Supplier</Label>
                        {isEditing ? (
                          <Input
                            id="supplier"
                            value={editedProduct.supplier || ''}
                            onChange={(e) => setEditedProduct(prev => ({ ...prev, supplier: e.target.value }))}
                          />
                        ) : (
                          <p className="text-sm border rounded-md px-3 py-2 bg-muted">
                            {product.supplier || 'Not specified'}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unit">Unit of Measure</Label>
                        <p className="text-sm border rounded-md px-3 py-2 bg-muted">{product.unit_of_measure}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="stock" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <History className="h-4 w-4 mr-2" />
                      Stock Transaction History
                    </CardTitle>
                    <CardDescription>
                      Recent stock movements for this product
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stockTransactions.length > 0 ? (
                      <div className="space-y-3">
                        {stockTransactions.map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              {getTransactionIcon(transaction.transaction_type)}
                              <div>
                                <p className="font-medium capitalize">
                                  {transaction.transaction_type.replace('_', ' ')} Transaction
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(transaction.created_at || '')}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                {transaction.transaction_type === 'pull' ? '-' : '+'}
                                {transaction.quantity} {product.unit_of_measure}
                              </p>
                              {transaction.unit_cost && (
                                <p className="text-sm text-muted-foreground">
                                  @ {formatCurrency(transaction.unit_cost)}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No stock transactions recorded yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="images" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Product Images
                    </CardTitle>
                    <CardDescription>
                      Visual documentation for this product
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {product.image_url ? (
                      <div className="space-y-4">
                        <div className="border rounded-lg overflow-hidden">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-64 object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className="hidden flex items-center justify-center h-64 bg-muted">
                            <div className="text-center text-muted-foreground">
                              <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                              <p>Image failed to load</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No images available</p>
                        <p className="text-sm">Add product images to enhance inventory management</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </ScrollArea>
        ) : (
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p className="text-lg">Product not found</p>
            <p className="text-sm text-muted-foreground">
              The requested product could not be loaded
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}