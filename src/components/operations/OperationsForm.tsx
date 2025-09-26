'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { useUser } from '@clerk/nextjs'
import { AddItemDialog } from '@/components/inventory/AddItemDialog'
import { InventoryItem } from '@/components/inventory/InventoryView'
import { 
  Package, 
  Plus, 
  Minus, 
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Check
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const transactionSchema = z.object({
  type: z.enum(['IN', 'OUT', 'RETURN']),
  productId: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  projectId: z.string().optional(),
  notes: z.string().optional(),
  location: z.string().optional(),
  unitCost: z.number().optional() // Only relevant for IN
}).refine((data) => {
  // For OUT and RETURN, productId is required
  if (data.type === 'OUT' || data.type === 'RETURN') {
    return !!data.productId
  }
  return true
}, {
  message: 'Please select a product for stock out and return operations',
  path: ['productId']
})

type TransactionFormData = z.infer<typeof transactionSchema>

interface Product {
  id: string
  name: string
  sku: string
  currentStock: number
  unit: string
  minLevel: number
  category: string
  imageUrl?: string
}

interface Project {
  id: string
  name: string
  status: string
  manager: string
}

export function OperationsForm({ initialType = 'OUT' }: { initialType?: 'IN' | 'OUT' | 'RETURN' }) {
  const { user } = useUser()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [showAddItemDialog, setShowAddItemDialog] = useState(false)

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: initialType,
      quantity: 1,
      notes: '',
      location: '',
      unitCost: undefined
    }
  })

  // Keep form type in sync when initialType changes (e.g., when opening from different cards)
  useEffect(() => {
    form.setValue('type', initialType)
  }, [initialType])

  const watchType = form.watch('type')
  const watchQuantity = form.watch('quantity')
  const watchUnitCost = form.watch('unitCost')

  // Fetch products and projects from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingProjects(true)
        setLoadingProducts(true)
        // Fetch products
        const productsResponse = await fetch('/api/products')
        if (productsResponse.ok) {
          const productsData = await productsResponse.json()
const mappedProducts: Product[] = (productsData.products || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            currentStock: p.current_stock || 0,
            unit: p.unit_of_measure,
            minLevel: p.min_stock_level || 0,
            category: p.category || 'Uncategorized',
            imageUrl: p.image_url || undefined
          }))
          setProducts(mappedProducts)
        }

        // Fetch projects  
        const projectsResponse = await fetch('/api/projects')
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json()
          setProjects(projectsData.projects || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load products and projects.',
          variant: 'destructive'
        })
      } finally {
        setLoadingProjects(false)
        setLoadingProducts(false)
      }
    }

    fetchData()
  }, [])

  const handleNewItemAdded = (newItem: InventoryItem) => {
    // Convert InventoryItem to Product format
const newProduct: Product = {
      id: newItem.id,
      name: newItem.name,
      sku: newItem.sku,
      currentStock: newItem.currentStock,
      unit: newItem.unit,
      minLevel: newItem.minLevel,
      category: newItem.category,
      imageUrl: newItem.imageUrl
    }
    
    // Add to products list and select it
    setProducts(prev => [newProduct, ...prev])
    setSelectedProduct(newProduct)
    form.setValue('productId', newProduct.id)
    
    // Close the dialog
    setShowAddItemDialog(false)
    
    toast({
      title: 'Product Added',
      description: `${newProduct.name} has been added and selected.`,
      variant: 'default'
    })
  }



  const handleQuantityChange = (delta: number) => {
    const currentQuantity = form.getValues('quantity') || 0
    const newQuantity = Math.max(1, currentQuantity + delta)
    form.setValue('quantity', newQuantity)
  }

  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true)
    
    if (!user) {
      toast({
        title: 'Error',
        description: 'Please ensure you are logged in.',
        variant: 'destructive'
      })
      setIsSubmitting(false)
      return
    }

    // For OUT and RETURN operations, a product must be selected
    if ((data.type === 'OUT' || data.type === 'RETURN') && !selectedProduct) {
      toast({
        title: 'Error',
        description: 'Please select a product for this operation.',
        variant: 'destructive'
      })
      setIsSubmitting(false)
      return
    }
    
    try {
      // Prepare simple transaction data for new API
      const selectedProject = projects.find(p => p.id === (data.projectId || ''))
      const transactionData = {
        transaction_type: data.type,
        product_id: selectedProduct?.id || data.productId,
        quantity: data.quantity,
        project_name: selectedProject?.name || undefined,
        reason: data.notes || undefined,
        unit_cost: data.type === 'IN' ? (data.unitCost ?? undefined) : undefined,
      }
      
      const response = await fetch('/api/simple-transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transactionData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process transaction')
      }
      
      const result = await response.json()
      
      const valueText = result?.transaction?.total_value != null ? ` • Value: $${Number(result.transaction.total_value).toFixed(2)}` : ''
      toast({
        title: 'Transaction Completed',
        description: `${data.type.toLowerCase()} transaction for ${selectedProduct?.name} processed successfully.${valueText}`,
        variant: 'default'
      })
      
      // Reset form and refresh product data
      form.reset({ type: initialType, quantity: 1, notes: '', location: '' })
      setSelectedProduct(null)
      
      // Refresh products to get updated stock levels
      const productsResponse = await fetch('/api/products')
      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
const mappedProducts: Product[] = (productsData.products || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          currentStock: p.current_stock || 0,
          unit: p.unit_of_measure,
          minLevel: p.min_stock_level || 0,
          category: p.category || 'Uncategorized',
          imageUrl: p.image_url || undefined
        }))
        setProducts(mappedProducts)
      }
      
    } catch (error) {
      console.error('Transaction error:', error)
      toast({
        title: 'Transaction Failed',
        description: error instanceof Error ? error.message : 'There was an error processing your transaction. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStockStatus = (product: Product) => {
    if (product.currentStock <= product.minLevel) {
      return { status: 'low', color: 'text-red-600', icon: AlertTriangle }
    } else if (product.currentStock <= product.minLevel * 1.5) {
      return { status: 'medium', color: 'text-orange-600', icon: AlertTriangle }
    }
    return { status: 'good', color: 'text-green-600', icon: CheckCircle2 }
  }

  const canPerformTransaction = () => {
    if (!selectedProduct || !watchQuantity) return true
    
    if (watchType === 'OUT') {
      return selectedProduct.currentStock >= watchQuantity
    }
    return true
  }

  return (
    <>
    <div className="grid gap-6 md:grid-cols-2">
      {/* Transaction Form */}
      <Card>
        <CardHeader>
          <CardTitle>New Transaction</CardTitle>
          <CardDescription>
            Record inventory movements for projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Transaction Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select transaction type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="IN">Stock In</SelectItem>
                        <SelectItem value="OUT">Stock Out</SelectItem>
                        <SelectItem value="RETURN">Return</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Product Dropdown Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Product</Label>
                  {watchType === 'IN' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddItemDialog(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Item
                    </Button>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Product</FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val)
                          const p = products.find(pr => pr.id === val)
                          setSelectedProduct(p || null)
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={watchType === 'IN' ? 'Select product (or add new)' : 'Select product'} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-64 overflow-y-auto">
                          {loadingProducts ? (
                            Array.from({ length: 6 }).map((_, i) => (
                              <div key={i} className="px-3 py-2">
                                <Skeleton className="h-4 w-48 mb-1" />
                                <Skeleton className="h-3 w-36" />
                              </div>
                            ))
                          ) : (
products.map((product) => (
<SelectItem key={product.id} value={product.id}>
                                <div className="flex items-center gap-3 w-full">
                                  <Avatar className="size-10">
                                    {product.imageUrl ? (
                                      <AvatarImage src={product.imageUrl} alt={product.name} />
                                    ) : (
                                      <AvatarFallback>{product.name?.[0]?.toUpperCase() || 'P'}</AvatarFallback>
                                    )}
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="truncate">{product.name}</span>
                                      <Badge variant="outline" className="shrink-0">SKU: {product.sku}</Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">{product.category}</div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedProduct && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium">Selected: {selectedProduct.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Current stock: {selectedProduct.currentStock} {selectedProduct.unit}
                    </p>
                  </div>
                )}
              </div>

              {/* Quantity & Unit Cost (for IN) */}
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={field.value <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="text-center"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {selectedProduct && (
                      <p className="text-sm text-muted-foreground">
                        Unit: {selectedProduct.unit}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Unit Cost (only for IN, optional) */}
              {watchType === 'IN' && (
                <FormField
                  control={form.control}
                  name="unitCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Cost (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      {watchQuantity && watchUnitCost ? (
                        <p className="text-xs text-muted-foreground">Total value: ${(watchQuantity * (watchUnitCost || 0)).toFixed(2)}</p>
                      ) : null}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Project Selection */}
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Project {watchType !== 'IN' && <span className="text-red-500">*</span>}
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={watchType === 'IN' ? 'Select project (optional)' : 'Select project'} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-64 overflow-y-auto">
                        {loadingProjects ? (
                          Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="px-3 py-2">
                              <Skeleton className="h-4 w-40" />
                            </div>
                          ))
                        ) : (
                          projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{project.name}</span>
                                <Badge variant="outline" className="ml-2">
                                  {project.status}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes about this transaction..."
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !canPerformTransaction()}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Processing...' : 
                 watchType === 'IN' ? (selectedProduct ? 'Record Stock In' : 'Create & Stock In') :
                 watchType === 'OUT' ? 'Record Stock Out' :
                 'Record Return'
                }
              </Button>

              {/* Validation Messages */}
              {(watchType === 'OUT' || watchType === 'RETURN') && !selectedProduct && (
                <div className="flex items-center space-x-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <p className="text-sm text-orange-700">
                    Please select a product to proceed with {watchType.toLowerCase()} operation.
                  </p>
                </div>
              )}
              
              {watchType === 'OUT' && selectedProduct && watchQuantity > selectedProduct.currentStock && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-700">
                    Insufficient stock. Available: {selectedProduct.currentStock} {selectedProduct.unit}
                  </p>
                </div>
              )}
              
              {watchType === 'IN' && !selectedProduct && (
                <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-blue-700">
                    Select an existing product or create a new one for stock in.
                  </p>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Transaction Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedProduct ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Package className="h-8 w-8 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">{selectedProduct.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    SKU: {selectedProduct.sku}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Stock:</span>
                  <span className="font-medium">
                    {selectedProduct.currentStock} {selectedProduct.unit}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction:</span>
                  <span className="font-medium">
                    {watchType === 'OUT' ? '-' : '+'}{watchQuantity || 0} {selectedProduct.unit}
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span className="font-medium">Projected Stock:</span>
                  <span className="font-bold">
                    {watchType === 'OUT' 
                      ? selectedProduct.currentStock - (watchQuantity || 0)
                      : selectedProduct.currentStock + (watchQuantity || 0)
                    } {selectedProduct.unit}
                  </span>
                </div>

                {/* Stock Level Warning */}
                {watchType === 'OUT' && (selectedProduct.currentStock - (watchQuantity || 0)) <= selectedProduct.minLevel && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <p className="text-sm text-orange-700 font-medium">
                        Stock will be below minimum level
                      </p>
                    </div>
                    <p className="text-xs text-orange-600 mt-1">
                      Minimum level: {selectedProduct.minLevel} {selectedProduct.unit}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Select a product to see transaction summary</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    
    {/* Add Item Dialog for Stock In operations */}
    <AddItemDialog
      isOpen={showAddItemDialog}
      onClose={() => setShowAddItemDialog(false)}
      onItemAdded={handleNewItemAdded}
    />
{/* Add Item Dialog for Stock In operations */}
    <AddItemDialog
      isOpen={showAddItemDialog}
      onClose={() => setShowAddItemDialog(false)}
      onItemAdded={handleNewItemAdded}
    />
  </>
  )
}
