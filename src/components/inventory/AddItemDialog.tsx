'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { InventoryItem } from './InventoryView'
import { Plus, Loader2 } from 'lucide-react'

const itemSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  currentStock: z.number().min(0, 'Stock must be 0 or greater'),
  minLevel: z.number().min(0, 'Minimum level must be 0 or greater'),
  maxLevel: z.number().min(1, 'Maximum level must be greater than 0'),
  unit: z.string().min(1, 'Unit is required'),
  unitPrice: z.number().min(0, 'Unit price must be 0 or greater'),
  location: z.string().min(1, 'Location is required'),
  supplier: z.string().min(1, 'Supplier is required'),
  description: z.string().optional(),
  reorderPoint: z.number().min(0, 'Reorder point must be 0 or greater'),
  averageUsage: z.number().min(0, 'Average usage must be 0 or greater'),
  leadTime: z.number().min(1, 'Lead time must be at least 1 day'),
  tags: z.string().optional()
})

type ItemFormData = z.infer<typeof itemSchema>

interface AddItemDialogProps {
  isOpen: boolean
  onClose: () => void
  onItemAdded: (item: InventoryItem) => void
}

export function AddItemDialog({ isOpen, onClose, onItemAdded }: AddItemDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: '',
      sku: '',
      category: '',
      currentStock: 0,
      minLevel: 0,
      maxLevel: 100,
      unit: '',
      unitPrice: 0,
      location: '',
      supplier: '',
      description: '',
      reorderPoint: 0,
      averageUsage: 0,
      leadTime: 7,
      tags: ''
    }
  })

  const watchMaxLevel = form.watch('maxLevel')
  const watchMinLevel = form.watch('minLevel')
  const watchCurrentStock = form.watch('currentStock')
  const watchUnitPrice = form.watch('unitPrice')

  const totalValue = watchCurrentStock * watchUnitPrice

  const onSubmit = async (data: ItemFormData) => {
    setIsSubmitting(true)
    
    try {
      // Generate ID and process data
      const newItem: InventoryItem = {
        id: Date.now().toString(),
        ...data,
        totalValue: data.currentStock * data.unitPrice,
        lastUpdated: new Date(),
        status: data.currentStock === 0 ? 'out-of-stock' : 
               data.currentStock <= data.minLevel ? 'low-stock' : 'in-stock',
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onItemAdded(newItem)
      
      toast({
        title: 'Item Added Successfully',
        description: `${data.name} has been added to your inventory.`
      })
      
      form.reset()
      onClose()
      
    } catch (error) {
      toast({
        title: 'Failed to Add Item',
        description: 'There was an error adding the item. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset()
      onClose()
    }
  }

  // Predefined options
  const categories = [
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
  ]

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Inventory Item
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new item to your inventory.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
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
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit *</FormLabel>
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

            {/* Stock Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm">Stock Information</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="currentStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Stock *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
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
                  name="minLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Level *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
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
                  name="maxLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Level *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
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

            {/* Financial Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm">Financial Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Price ($) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
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

            {/* Location & Supplier */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
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

              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., ABC Cement Co." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Additional Information */}
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="reorderPoint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reorder Point</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
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
                name="averageUsage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avg. Monthly Usage</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
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
                name="leadTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead Time (days)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., construction, foundation, concrete (comma-separated)"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Separate multiple tags with commas
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || watchMinLevel >= watchMaxLevel}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Adding...' : 'Add Item'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}