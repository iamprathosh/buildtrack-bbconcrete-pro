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
import { supabase } from '@/lib/database'
import { StockTransaction } from '@/types/database'
import { toast } from 'sonner'
import { useUser } from '@clerk/nextjs'
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
  const [uploading, setUploading] = useState(false)

  const ReplaceImageButton = ({ onUploaded, productId }: { onUploaded: (url: string) => void; productId: string }) => {
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      setUploading(true)
      try {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const path = `product-images/${productId}-${Date.now()}.${ext}`
        const { data, error } = await (supabase as any).storage.from('public').upload(path, file, {
          cacheControl: '3600',
          upsert: true,
        })
        if (error) throw error
        const { data: pub } = await (supabase as any).storage.from('public').getPublicUrl(path)
        const url = pub?.publicUrl
        if (url) onUploaded(url)
      } catch (err) {
        toast.error('Failed to upload image. Please try again or use a direct URL.')
      } finally {
        setUploading(false)
      }
    }

    return (
      <div className="flex items-center gap-2">
        <input id="file" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        <Label htmlFor="file" className="cursor-pointer">
          <Button type="button" variant="outline" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Replace Image'}
          </Button>
        </Label>
      </div>
    )
  }
  const { user } = useUser()
  const [product, setProduct] = useState<ProductWithDetails | null>(null)
  const [stockTransactions, setStockTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingTx, setLoadingTx] = useState(false)
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
      const [productResult, _] = await Promise.all([
        productService.getByIdWithDetails(productId),
        reloadTransactions(true)
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
        field_manager: editedProduct.field_manager,
        current_stock: editedProduct.current_stock,
        min_stock_level: editedProduct.min_stock_level,
        max_stock_level: editedProduct.max_stock_level,
        supplier: editedProduct.supplier,
        image_url: editedProduct.image_url,
      }

      const userInfo = user ? {
        name: user.fullName || user.firstName || 'Unknown User',
        id: user.id,
        email: user.emailAddresses?.[0]?.emailAddress || ''
      } : undefined

      const result = await productService.updateProduct(product.id, updates, userInfo)
      
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

  const reloadTransactions = async (silent = false) => {
    if (!productId) return
    if (!silent) setLoadingTx(true)
    try {
      const res = await fetch(`/api/simple-transactions?product_id=${productId}&limit=100`, { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        setStockTransactions(json.transactions || [])
      }
    } catch (e) {
      if (!silent) toast.error('Failed to refresh transactions')
    } finally {
      if (!silent) setLoadingTx(false)
    }
  }

  const getTransactionIcon = (type: string) => {
    const t = (type || '').toUpperCase()
    switch (t) {
      case 'RECEIVE':
      case 'IN':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'PULL':
      case 'OUT':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'RETURN':
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
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden">
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
            <Tabs defaultValue="stock" className="space-y-4">
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
<span className="text-muted-foreground">Category:</span>
                    <p className="font-medium">{product.category || 'Uncategorized'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Field Manager:</span>
                    <p className="font-medium">{product.field_manager || 'Not assigned'}</p>
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

                    {/* Image URL / Replace Image */}
                    <div className="space-y-2">
                      <Label htmlFor="image_url">Product Image</Label>
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            id="image_url"
                            placeholder="https://..."
                            value={editedProduct.image_url || ''}
                            onChange={(e) => setEditedProduct(prev => ({ ...prev, image_url: e.target.value }))}
                          />
                          <ReplaceImageButton onUploaded={(url) => setEditedProduct(prev => ({ ...prev, image_url: url }))} productId={product.id} />
                        </div>
                      ) : (
                        <div className="text-sm border rounded-md px-3 py-2 bg-muted flex items-center gap-3">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="h-10 w-10 object-cover rounded" />
                          ) : null}
                          <span className="truncate">{product.image_url || 'No image set'}</span>
                        </div>
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

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="field_manager">Field Manager</Label>
                        {isEditing ? (
                          <Input
                            id="field_manager"
                            value={editedProduct.field_manager || ''}
                            onChange={(e) => setEditedProduct(prev => ({ ...prev, field_manager: e.target.value }))}
                          />
                        ) : (
                          <p className="text-sm border rounded-md px-3 py-2 bg-muted">
                            {product.field_manager || 'Not assigned'}
                          </p>
                        )}
                      </div>
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
                        <Label htmlFor="unit">Quantity Type</Label>
                        <p className="text-sm border rounded-md px-3 py-2 bg-muted">{product.unit_of_measure}</p>
                      </div>
                    </div>

                    {/* User Tracking Information */}
                    <Separator />
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-base font-medium">User Tracking</Label>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Created By */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-green-500 rounded-full" />
                            <span className="text-sm font-medium text-muted-foreground">Created By</span>
                          </div>
                          <div className="pl-4 space-y-1">
                            <p className="text-sm font-medium">
                              {product.created_by || 'Unknown User'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {product.created_by_email || 'No email'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(product.created_at || '')}
                            </p>
                          </div>
                        </div>

                        {/* Updated By */}
                        {(product.updated_by || product.updated_at !== product.created_at) && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 bg-blue-500 rounded-full" />
                              <span className="text-sm font-medium text-muted-foreground">Last Updated By</span>
                            </div>
                            <div className="pl-4 space-y-1">
                              <p className="text-sm font-medium">
                                {product.updated_by || 'System Update'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {product.updated_by_email || 'No email'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(product.updated_at || '')}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="stock" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <History className="h-4 w-4 mr-2" />
                        Stock Transaction History
                      </CardTitle>
                      <Button variant="outline" size="sm" onClick={() => reloadTransactions()} disabled={loadingTx}>
                        {loadingTx ? 'Refreshing...' : 'Refresh'}
                      </Button>
                    </div>
                    <CardDescription>
                      Recent stock movements for this product
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stockTransactions.length > 0 ? (
                      <div className="space-y-3">
                        {stockTransactions.map((tx: any) => {
                          const tType = (tx.transaction_type || '').toUpperCase()
                          const isOut = tType === 'OUT' || tType === 'PULL'
                          const dateStr = tx.done_at || tx.transaction_date || tx.created_at || ''
                          return (
                            <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center space-x-3">
                                {getTransactionIcon(tx.transaction_type)}
                                <div>
                                  <p className="font-medium capitalize">
                                    {tType === 'IN' ? 'In' : tType === 'OUT' ? 'Out' : 'Return'} Transaction
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDate(dateStr)}
                                  </p>
                                  {(tx.reason || tx.done_by || tx.project_name) && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {tx.reason ? `${tx.reason}` : ''}
                                      {tx.reason && (tx.done_by || tx.project_name) ? ' • ' : ''}
                                      {tx.done_by ? `by ${tx.done_by}` : ''}
                                      {tx.project_name ? ` • ${tx.project_name}` : ''}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`font-medium ${isOut ? 'text-red-600' : 'text-green-600'}`}>
                                  {isOut ? '-' : '+'}{tx.quantity} {product.unit_of_measure}
                                </p>
                                {tx.unit_cost != null && (
                                  <p className="text-sm text-muted-foreground">
                                    @ {formatCurrency(tx.unit_cost)}
                                  </p>
                                )}
                                {tx.total_value != null && (
                                  <p className="text-xs text-muted-foreground">
                                    Total: {formatCurrency(tx.total_value)}
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        })}
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
                    <div className="space-y-4">
                      <div className="border rounded-lg overflow-hidden">
                        {product.image_url ? (
                          <img
                            src={editedProduct.image_url || product.image_url}
                            alt={product.name}
                            className="w-full h-64 object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className="hidden flex items-center justify-center h-64 bg-muted">
                          <div className="text-center text-muted-foreground">
                            <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>Image failed to load</p>
                          </div>
                        </div>
                      </div>
                      {isEditing && (
                        <div className="space-y-3">
                          <ReplaceImageButton onUploaded={(url) => setEditedProduct(prev => ({ ...prev, image_url: url }))} productId={product.id} />
                          <div className="flex items-center gap-2">
                            <Label htmlFor="image_url_inline">or set URL</Label>
                            <Input
                              id="image_url_inline"
                              placeholder="https://..."
                              value={editedProduct.image_url || ''}
                              onChange={(e) => setEditedProduct(prev => ({ ...prev, image_url: e.target.value }))}
                            />
                          </div>
                        </div>
                      )}
                      {!isEditing && !product.image_url && (
                        <div className="text-center py-12 text-muted-foreground">
                          <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg">No images available</p>
                          <p className="text-sm">Edit and upload an image to enhance inventory management</p>
                        </div>
                      )}
                    </div>
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