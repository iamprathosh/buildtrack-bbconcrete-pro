'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { InventoryItem } from './InventoryView'
import { useUser } from '@clerk/nextjs'
import { ImageUpload } from '@/components/ui/image-upload'
import { Plus, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const itemSchema = z.object({
  isNewItem: z.boolean().default(true),
  existingProductId: z.string().optional(),

  // Fields for brand new item creation (matching products table schema)
  name: z.string().min(1, 'Product name is required').optional(),
  sku: z.string().min(1, 'SKU is required').optional(),
  category: z.string().optional(), // Optional - simple text category or preset
  custom_category: z.string().optional(), // Used when "Other" is selected
  unit_of_measure: z.string().min(1, 'Unit of measure is required').optional(),
  mauc: z.number().min(0, 'Unit cost must be 0 or greater').optional(),
  min_stock_level: z.number().min(0, 'Minimum stock level must be 0 or greater').optional(),
  max_stock_level: z.number().min(1, 'Maximum stock level must be greater than 0').optional(),
  description: z.string().optional(),
  supplier: z.string().optional(),
  image_file: z.any().optional(), // File object for new images
  image_url: z.string().optional(), // URL for existing images
  location: z.string().optional(),
  location_id: z.string().optional(),
  is_active: z.boolean().default(true),

  // Common fields used for both flows
  current_stock: z.number().min(0, 'Stock must be 0 or greater'),
  notes: z.string().optional()
}).refine((data) => {
  // If not new item, we must have existingProductId
  if (!data.isNewItem) return !!data.existingProductId
  // If new item, required creation fields must be present
  return !!(data.name && data.sku && data.unit_of_measure)
}, {
  message: 'Please fill in required fields based on your selection',
  path: ['isNewItem']
})

type ItemFormData = z.infer<typeof itemSchema>

interface ProductOption { id: string; name: string; sku: string; category?: string; image_url?: string }

interface AddItemDialogProps {
  isOpen: boolean
  onClose: () => void
  onItemAdded: (item: InventoryItem) => void
}

export function AddItemDialog({ isOpen, onClose, onItemAdded }: AddItemDialogProps) {
  const { toast } = useToast()
  const { user } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [products, setProducts] = useState<ProductOption[]>([])
  const [lastTransaction, setLastTransaction] = useState<any | null>(null)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)

  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      isNewItem: true,
      existingProductId: undefined,
      // new item defaults (matching products table schema)
      name: '',
      sku: '',
      category: '',
      custom_category: '',
      unit_of_measure: '',
      mauc: 0,
      min_stock_level: 0,
      max_stock_level: 100,
      description: '',
      supplier: '',
      image_file: null,
      image_url: '',
      location: '',
      location_id: undefined,
      is_active: true,
      // common
      current_stock: 0,
      notes: ''
    }
  })

  const watchIsNew = form.watch('isNewItem')
  const watchMaxLevel = form.watch('max_stock_level')
  const watchMinLevel = form.watch('min_stock_level')
  const watchCurrentStock = form.watch('current_stock')
  const watchMauc = form.watch('mauc')
  const watchCategory = form.watch('category')

  const totalValue = watchCurrentStock * (watchMauc || 0)

  // Load products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products for existing item flow
        const productsRes = await fetch('/api/products')
        if (productsRes.ok) {
          const productsBody = await productsRes.json()
setProducts((productsBody.products || []).map((p: any) => ({ 
            id: p.id, 
            name: p.name, 
            sku: p.sku, 
            category: p.category,
            image_url: p.image_url
          })))
        }
      } catch (e) {
        console.warn('Failed to fetch data:', e)
      }
    }
    fetchData()
  }, [])

  const onSubmit = async (data: ItemFormData) => {
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
    
    try {
      if (data.isNewItem) {
        // Handle image upload first if there's a file
        let imageUrl = data.image_url || null
        
        if (selectedImageFile) {
          try {
            // Convert file to base64 for simple storage (in production, use a proper file upload service)
            const base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () => resolve(reader.result as string)
              reader.onerror = reject
              reader.readAsDataURL(selectedImageFile)
            })
            imageUrl = base64
          } catch (imageError) {
            console.warn('Failed to process image:', imageError)
            toast({
              title: 'Image Upload Warning',
              description: 'Product will be created without image.',
              variant: 'default'
            })
          }
        }

        // Create the product
        const categoryValue = (data.category === 'Other' ? data.custom_category : data.category) || null

        const productData = {
          name: data.name,
          sku: data.sku,
          category: categoryValue,
          unit_of_measure: data.unit_of_measure,
          min_stock_level: data.min_stock_level,
          max_stock_level: data.max_stock_level,
          mauc: data.mauc,
          description: data.description || null,
          supplier: data.supplier || null,
          image_url: imageUrl,
          location: data.location || null,
          location_id: data.location_id || null,
          is_active: data.is_active,
          // Automatically filled "done by" fields
          created_by: user.fullName || user.firstName || 'Unknown User',
          created_by_id: user.id,
          created_by_email: user.emailAddresses?.[0]?.emailAddress || ''
        }
        
        console.log('AddItemDialog: About to create product with data:', productData)
        console.log('AddItemDialog: Form data received:', data)
      
        const productResponse = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(productData)
        })
        
        if (!productResponse.ok) {
          const errorText = await productResponse.text()
          console.error('Product creation failed:', {
            status: productResponse.status,
            statusText: productResponse.statusText,
            response: errorText
          })
          
          let errorMessage = 'Failed to create product'
          try {
            const errorData = JSON.parse(errorText)
            errorMessage = errorData.error || errorMessage
          } catch {
            errorMessage = errorText || errorMessage
          }
          
          throw new Error(errorMessage)
        }
        
        const productResult = await productResponse.json()
        const newProduct = productResult.product
      
        // If there's initial stock, create an inventory transaction
        if (data.current_stock > 0) {
          const transactionData = {
            transaction_type: 'IN',
            product_id: newProduct.id,
            quantity: data.current_stock,
            reason: 'Initial stock entry for new product',
            project_name: null,
            unit_cost: data.mauc || undefined
          }
        
          const transactionResponse = await fetch('/api/simple-transactions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(transactionData)
          })
          
          if (!transactionResponse.ok) {
            console.warn('Product created but initial stock transaction failed')
          } else {
            const tx = await transactionResponse.json()
            setLastTransaction(tx.transaction || tx)
          }
        }
        
        // Create InventoryItem for UI compatibility
        const newItem: InventoryItem = {
          id: newProduct.id,
          name: newProduct.name,
          sku: newProduct.sku,
          category: newProduct.category || '', // Direct text category
          currentStock: data.current_stock,
          minLevel: data.min_stock_level || 0,
          maxLevel: data.max_stock_level || 0,
          unit: data.unit_of_measure || '',
          unitPrice: data.mauc || 0,
          totalValue: data.current_stock * (data.mauc || 0),
          location: data.location || '',
          supplier: data.supplier || '',
          description: data.description || '',
          reorderPoint: 0, // Not in current schema
          averageUsage: 0, // Not in current schema
          leadTime: 0, // Not in current schema
          tags: [], // Not in current schema
          lastUpdated: new Date(),
          status: data.current_stock === 0 ? 'out-of-stock' : 
                 data.current_stock <= (data.min_stock_level || 0) ? 'low-stock' : 'in-stock'
        }
        
        onItemAdded(newItem)
        
        toast({
          title: 'Item Added Successfully',
          description: `${data.name} has been added to your inventory${data.current_stock > 0 ? ' with initial stock.' : '.'}`
        })
        
        form.reset()
        setSelectedImageFile(null)
        // Keep dialog open to show transaction details if present
        // onClose()
      
      } else {
        // Existing item: create IN transaction only
        const transactionData = {
          transaction_type: 'IN',
          product_id: data.existingProductId,
          quantity: data.current_stock,
          reason: data.notes || 'Stock added to existing product',
          project_name: null,
          unit_cost: data.mauc || undefined
        }

        const transactionResponse = await fetch('/api/simple-transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transactionData)
        })

        if (!transactionResponse.ok) {
          const err = await transactionResponse.json()
          throw new Error(err.error || 'Failed to create transaction')
        }

        const tx = await transactionResponse.json()
        setLastTransaction(tx.transaction || tx)

        toast({
          title: 'Stock Added',
          description: 'Stock added to existing product successfully.'
        })
      }

    } catch (error) {
      console.error('Add item error:', error)
      toast({
        title: 'Failed to Add Item',
        description: error instanceof Error ? error.message : 'There was an error adding the item. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset()
      setLastTransaction(null)
      setSelectedImageFile(null)
      onClose()
    }
  }

  // Predefined options

  const units = [
    'pieces',
    'bags',
    'tons',
    'cubic meters',
    'square meters',
    'linear meters',
    'liters',
    'gallons',
    'kilograms',
    'pounds'
  ]

  const locations = [
    'Warehouse A',
    'Warehouse B',
    'Storage Yard',
    'Aggregate Area',
    'Plant Area',
    'Tool Shed',
    'Office Storage',
    'Vehicle Bay'
  ]

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Inventory Item
          </DialogTitle>
          <DialogDescription>
            Create a new product or add stock to an existing product.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Item Type Switch */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label className="text-sm font-medium">Is this a brand new item?</Label>
                <p className="text-xs text-muted-foreground">If not, select an existing product to add stock.</p>
              </div>
              <FormField
                control={form.control}
                name="isNewItem"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Existing Product Selection */}
            {!watchIsNew && (
              <FormField
                control={form.control}
                name="existingProductId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Existing Product</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a product" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
{products.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            <div className="flex items-center gap-3 w-full">
<Avatar className="size-10">
                                {p.image_url ? (
                                  <AvatarImage src={p.image_url} alt={p.name} />
                                ) : (
                                  <AvatarFallback>{p.name?.[0]?.toUpperCase() || 'P'}</AvatarFallback>
                                )}
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="truncate">{p.name}</span>
<div className="flex items-center gap-2 shrink-0">
                                    <span className="text-xs text-muted-foreground">{p.sku}</span>
                                  </div>
                                </div>
                                {p.category && (
                                  <div className="text-xs text-muted-foreground truncate">{p.category}</div>
                                )}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Basic Information */}
            {watchIsNew && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Portland Cement" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., CEM-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category (Optional)</FormLabel>
                        <Select onValueChange={(val) => {
                          field.onChange(val)
                          if (val !== 'Other') {
                            form.setValue('custom_category', '')
                          }
                        }} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category or choose Other" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[
                              'Cement',
                              'Steel', 
                              'Concrete',
                              'Aggregate',
                              'Lumber',
                              'Insulation',
                              'Roofing',
                              'Electrical',
                              'Plumbing',
                              'Tools',
                              'Safety Equipment',
                              'Other'
                            ].map(category => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {watchCategory === 'Other' && (
                          <div className="mt-2">
                            <FormField
                              control={form.control}
                              name="custom_category"
                              render={({ field: customField }) => (
                                <FormItem>
                                  <FormLabel>Custom Category</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter category name" {...customField} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unit_of_measure"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit of Measure *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {units.map(unit => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {/* Stock Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Stock Information</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="current_stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Stock *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.001"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="min_stock_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Stock Level</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.001"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_stock_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Stock Level</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          step="0.001"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                      {watchMinLevel >= watchMaxLevel && (
                        <p className="text-xs text-destructive">
                          Maximum level must be greater than minimum level
                        </p>
                      )}
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Financial Information (only for brand new item) */}
            {watchIsNew && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Financial Information</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="mauc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Moving Average Unit Cost ($)</FormLabel>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <Label>Total Value</Label>
                    <div className="flex items-center h-10 px-3 py-2 text-sm bg-muted rounded-md">
                      ${totalValue.toFixed(2)}
                    </div>
                  </div>
                </div>
            </div>
            )}

            {/* Location & Supplier */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations.map(location => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchIsNew && (
                <FormField
                  control={form.control}
                  name="supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., ABC Cement Co." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Done By Information (automatically filled) */}
            {user && (
              <div className="rounded-lg border p-4 bg-muted/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full" />
                  <p className="text-sm font-medium text-muted-foreground">Created By (Automatically Filled)</p>
                </div>
                <div className="text-sm space-y-1">
                  <p><strong>Name:</strong> {user.fullName || user.firstName || 'Unknown User'}</p>
                  <p><strong>Email:</strong> {user.emailAddresses?.[0]?.emailAddress || 'No email'}</p>
                  <p><strong>User ID:</strong> {user.id}</p>
                </div>
              </div>
            )}

            {/* Product Image Upload (only for brand new item) */}
            {watchIsNew && (
              <div className="space-y-2">
                <ImageUpload
                  value={selectedImageFile || form.watch('image_url')}
                  onChange={(file) => {
                    setSelectedImageFile(file)
                    form.setValue('image_file', file)
                  }}
                  disabled={isSubmitting}
                  label="Product Image (Optional)"
                  placeholder="Drop product image here or click to browse"
                  maxSizeKB={5120} // 5MB limit
                  acceptedFormats={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
                  className="w-full"
                />
              </div>
            )}

            {/* Additional Information (only for brand new item) */}
            {watchIsNew && (
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Optional description of the product..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Notes (applies to transaction) */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any notes pertaining to this stock addition" rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Transaction Result */}
            {lastTransaction && (
              <div className="rounded-lg border p-4 bg-muted/50">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  <p className="text-sm font-semibold">Transaction Created Successfully</p>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  #{lastTransaction.transaction_number || lastTransaction.id} • {lastTransaction.transaction_type} • Qty: {lastTransaction.quantity}
                </p>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                {lastTransaction ? 'Close' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || (watchIsNew && watchMinLevel >= watchMaxLevel)}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {lastTransaction ? 'Add Another' : (isSubmitting ? 'Processing...' : (watchIsNew ? 'Create Product' : 'Add Stock'))}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
</Dialog>
  )
}
