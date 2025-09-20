'use client'

import { useState, useEffect } from 'react'
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
import { 
  Package, 
  Plus, 
  Minus, 
  Search,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Loader2
} from 'lucide-react'

const transactionSchema = z.object({
  type: z.enum(['IN', 'OUT', 'RETURN']),
  productId: z.string().min(1, 'Please select a product'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  projectId: z.string().min(1, 'Please select a project'),
  notes: z.string().optional(),
  location: z.string().optional()
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
}

interface Project {
  id: string
  name: string
  status: string
  manager: string
}

export function OperationsForm() {
  const { user } = useUser()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'OUT',
      quantity: 1,
      notes: '',
      location: ''
    }
  })

  const watchType = form.watch('type')
  const watchQuantity = form.watch('quantity')

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Portland Cement',
        sku: 'CEM-001',
        currentStock: 120,
        unit: 'bags',
        minLevel: 20,
        category: 'Cement'
      },
      {
        id: '2',
        name: 'Steel Rebar 12mm',
        sku: 'REB-012',
        currentStock: 250,
        unit: 'pieces',
        minLevel: 50,
        category: 'Steel'
      },
      {
        id: '3',
        name: 'Concrete Mix',
        sku: 'CON-001',
        currentStock: 8,
        unit: 'cubic meters',
        minLevel: 10,
        category: 'Concrete'
      }
    ]

    const mockProjects: Project[] = [
      {
        id: '1',
        name: 'Residential Complex A',
        status: 'active',
        manager: 'John Doe'
      },
      {
        id: '2',
        name: 'Bridge Construction',
        status: 'active',
        manager: 'Jane Smith'
      },
      {
        id: '3',
        name: 'Office Building B',
        status: 'planning',
        manager: 'Mike Johnson'
      }
    ]

    setProducts(mockProducts)
    setProjects(mockProjects)
  }, [])

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId)
    setSelectedProduct(product || null)
    form.setValue('productId', productId)
  }

  const handleQuantityChange = (delta: number) => {
    const currentQuantity = form.getValues('quantity') || 0
    const newQuantity = Math.max(1, currentQuantity + delta)
    form.setValue('quantity', newQuantity)
  }

  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('Transaction data:', data)
      
      toast({
        title: 'Transaction Completed',
        description: `${data.type.toLowerCase()} transaction for ${selectedProduct?.name} has been processed successfully.`,
        variant: 'default'
      })
      
      // Reset form
      form.reset()
      setSelectedProduct(null)
      
    } catch (error) {
      toast({
        title: 'Transaction Failed',
        description: 'There was an error processing your transaction. Please try again.',
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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

              {/* Product Search & Selection */}
              <div className="space-y-3">
                <Label>Product</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products by name or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <div className="max-h-40 overflow-y-auto space-y-2 border rounded-lg p-2">
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product)
                    const Icon = stockStatus.icon
                    
                    return (
                      <div
                        key={product.id}
                        className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedProduct?.id === product.id ? 'bg-primary/10 border-primary' : ''
                        }`}
                        onClick={() => handleProductSelect(product.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              SKU: {product.sku} • {product.category}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Icon className={`h-4 w-4 ${stockStatus.color}`} />
                            <span className="text-sm font-medium">
                              {product.currentStock} {product.unit}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Quantity */}
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

              {/* Project Selection */}
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{project.name}</span>
                              <Badge variant="outline" className="ml-2">
                                {project.status}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location (Optional) */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (Optional)</FormLabel>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input
                          placeholder="Storage location or site area"
                          {...field}
                          className="pl-9"
                        />
                      </FormControl>
                    </div>
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
                {isSubmitting ? 'Processing...' : `Process ${watchType} Transaction`}
              </Button>

              {watchType === 'OUT' && selectedProduct && watchQuantity > selectedProduct.currentStock && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-700">
                    Insufficient stock. Available: {selectedProduct.currentStock} {selectedProduct.unit}
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
  )
}