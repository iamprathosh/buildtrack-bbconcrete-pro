'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { PurchaseOrder } from './ProcurementView'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Plus,
  Trash2,
  CalendarIcon,
  Save,
  X
} from 'lucide-react'
import { format } from 'date-fns'

interface AddPurchaseOrderDialogProps {
  isOpen: boolean
  onClose: () => void
  onOrderAdded: (order: PurchaseOrder) => void
}

interface OrderItem {
  id: string
  name: string
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
}

export function AddPurchaseOrderDialog({
  isOpen,
  onClose,
  onOrderAdded
}: AddPurchaseOrderDialogProps) {
  const [formData, setFormData] = useState({
    orderNumber: '',
    supplier: '',
    project: '',
    priority: 'medium' as const,
    expectedDelivery: undefined as Date | undefined,
    notes: ''
  })

  const [items, setItems] = useState<OrderItem[]>([
    {
      id: '1',
      name: '',
      quantity: 1,
      unit: '',
      unitPrice: 0,
      totalPrice: 0
    }
  ])

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const updatedItems = [...items]
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    }

    // Recalculate total price for this item
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].totalPrice = updatedItems[index].quantity * updatedItems[index].unitPrice
    }

    setItems(updatedItems)
  }

  const addItem = () => {
    const newItem: OrderItem = {
      id: Date.now().toString(),
      name: '',
      quantity: 1,
      unit: '',
      unitPrice: 0,
      totalPrice: 0
    }
    setItems(prev => [...prev, newItem])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index))
    }
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.orderNumber.trim()) {
      newErrors.orderNumber = 'Order number is required'
    }
    if (!formData.supplier.trim()) {
      newErrors.supplier = 'Supplier is required'
    }
    if (!formData.project.trim()) {
      newErrors.project = 'Project is required'
    }
    if (!formData.expectedDelivery) {
      newErrors.expectedDelivery = 'Expected delivery date is required'
    }

    // Validate items
    const hasValidItems = items.some(item => 
      item.name.trim() && item.quantity > 0 && item.unitPrice > 0
    )
    
    if (!hasValidItems) {
      newErrors.items = 'At least one valid item is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      return
    }

    // Filter out empty items
    const validItems = items.filter(item => 
      item.name.trim() && item.quantity > 0 && item.unitPrice > 0
    )

    const newOrder: PurchaseOrder = {
      id: Date.now().toString(),
      orderNumber: formData.orderNumber,
      supplier: formData.supplier,
      project: formData.project,
      status: 'draft',
      priority: formData.priority,
      orderDate: new Date(),
      expectedDelivery: formData.expectedDelivery!,
      totalAmount: calculateTotal(),
      paidAmount: 0,
      items: validItems,
      notes: formData.notes,
      lastUpdated: new Date()
    }

    onOrderAdded(newOrder)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      orderNumber: '',
      supplier: '',
      project: '',
      priority: 'medium',
      expectedDelivery: undefined,
      notes: ''
    })
    setItems([{
      id: '1',
      name: '',
      quantity: 1,
      unit: '',
      unitPrice: 0,
      totalPrice: 0
    }])
    setErrors({})
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Purchase Order</DialogTitle>
          <DialogDescription>
            Add a new purchase order with items and delivery details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orderNumber">Order Number *</Label>
                  <Input
                    id="orderNumber"
                    placeholder="PO-2024-001"
                    value={formData.orderNumber}
                    onChange={(e) => handleInputChange('orderNumber', e.target.value)}
                    className={errors.orderNumber ? 'border-destructive' : ''}
                  />
                  {errors.orderNumber && (
                    <p className="text-sm text-destructive">{errors.orderNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier *</Label>
                  <Input
                    id="supplier"
                    placeholder="Supplier name"
                    value={formData.supplier}
                    onChange={(e) => handleInputChange('supplier', e.target.value)}
                    className={errors.supplier ? 'border-destructive' : ''}
                  />
                  {errors.supplier && (
                    <p className="text-sm text-destructive">{errors.supplier}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project">Project *</Label>
                  <Input
                    id="project"
                    placeholder="Project name"
                    value={formData.project}
                    onChange={(e) => handleInputChange('project', e.target.value)}
                    className={errors.project ? 'border-destructive' : ''}
                  />
                  {errors.project && (
                    <p className="text-sm text-destructive">{errors.project}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleInputChange('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Expected Delivery *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          !formData.expectedDelivery && "text-muted-foreground"
                        } ${errors.expectedDelivery ? 'border-destructive' : ''}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.expectedDelivery ? (
                          format(formData.expectedDelivery, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.expectedDelivery}
                        onSelect={(date) => handleInputChange('expectedDelivery', date)}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.expectedDelivery && (
                    <p className="text-sm text-destructive">{errors.expectedDelivery}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes or requirements..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Order Items</CardTitle>
                <Button onClick={addItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
                    <div className="md:col-span-2 space-y-2">
                      <Label>Item Name</Label>
                      <Input
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Unit</Label>
                      <Input
                        placeholder="pcs, kg, etc."
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Unit Price</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Total</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={formatCurrency(item.totalPrice)}
                          readOnly
                          className="bg-muted"
                        />
                        {items.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {errors.items && (
                  <p className="text-sm text-destructive">{errors.items}</p>
                )}

                <div className="flex justify-end pt-4 border-t">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-2xl font-bold">{formatCurrency(calculateTotal())}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2">
            <Button variant="outline" onClick={handleClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              <Save className="h-4 w-4 mr-2" />
              Create Order
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}