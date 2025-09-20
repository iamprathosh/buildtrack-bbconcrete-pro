'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { 
  Search,
  Package,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Filter,
  RefreshCw,
  ShoppingCart,
  Eye,
  Edit3,
  BarChart3
} from 'lucide-react'

interface StockItem {
  id: string
  name: string
  sku: string
  category: string
  currentStock: number
  minLevel: number
  maxLevel: number
  unit: string
  value: number
  location: string
  supplier: string
  lastUpdated: Date
  reorderPoint: number
  averageUsage: number
}

export function StockLevel() {
  const { toast } = useToast()
  const [stockItems, setStockItems] = useState<StockItem[]>([])
  const [filteredItems, setFilteredItems] = useState<StockItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isReorderDialogOpen, setIsReorderDialogOpen] = useState(false)
  const [reorderQuantity, setReorderQuantity] = useState('')
  const [reorderNotes, setReorderNotes] = useState('')

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockStockItems: StockItem[] = [
      {
        id: '1',
        name: 'Portland Cement',
        sku: 'CEM-001',
        category: 'Cement',
        currentStock: 120,
        minLevel: 20,
        maxLevel: 200,
        unit: 'bags',
        value: 12000,
        location: 'Warehouse A',
        supplier: 'ABC Cement Co.',
        lastUpdated: new Date(),
        reorderPoint: 30,
        averageUsage: 15
      },
      {
        id: '2',
        name: 'Steel Rebar 12mm',
        sku: 'REB-012',
        category: 'Steel',
        currentStock: 250,
        minLevel: 50,
        maxLevel: 500,
        unit: 'pieces',
        value: 75000,
        location: 'Storage Yard B',
        supplier: 'XYZ Steel Ltd.',
        lastUpdated: new Date(),
        reorderPoint: 75,
        averageUsage: 25
      },
      {
        id: '3',
        name: 'Concrete Mix',
        sku: 'CON-001',
        category: 'Concrete',
        currentStock: 8,
        minLevel: 10,
        maxLevel: 50,
        unit: 'cubic meters',
        value: 2400,
        location: 'Plant Area',
        supplier: 'Ready Mix Corp.',
        lastUpdated: new Date(),
        reorderPoint: 15,
        averageUsage: 5
      },
      {
        id: '4',
        name: 'Sand - Fine',
        sku: 'SAN-001',
        category: 'Aggregate',
        currentStock: 2,
        minLevel: 5,
        maxLevel: 25,
        unit: 'tons',
        value: 400,
        location: 'Aggregate Area',
        supplier: 'Local Quarry',
        lastUpdated: new Date(),
        reorderPoint: 8,
        averageUsage: 3
      }
    ]
    setStockItems(mockStockItems)
    setFilteredItems(mockStockItems)
  }, [])

  // Filter stock items
  useEffect(() => {
    const filtered = stockItems.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
      
      let matchesStatus = true
      if (statusFilter === 'low') {
        matchesStatus = item.currentStock <= item.minLevel
      } else if (statusFilter === 'critical') {
        matchesStatus = item.currentStock < item.minLevel * 0.5
      } else if (statusFilter === 'good') {
        matchesStatus = item.currentStock > item.minLevel * 1.5
      }

      return matchesSearch && matchesCategory && matchesStatus
    })

    setFilteredItems(filtered)
  }, [stockItems, searchTerm, categoryFilter, statusFilter])

  const getStockStatus = (item: StockItem) => {
    const percentage = (item.currentStock / item.maxLevel) * 100
    
    if (item.currentStock <= item.minLevel * 0.5) {
      return {
        status: 'critical',
        label: 'Critical',
        color: 'text-red-700 bg-red-50 border-red-200',
        icon: AlertTriangle,
        percentage
      }
    } else if (item.currentStock <= item.minLevel) {
      return {
        status: 'low',
        label: 'Low Stock',
        color: 'text-orange-700 bg-orange-50 border-orange-200',
        icon: AlertTriangle,
        percentage
      }
    } else if (item.currentStock <= item.minLevel * 1.5) {
      return {
        status: 'medium',
        label: 'Medium',
        color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
        icon: Package,
        percentage
      }
    }
    
    return {
      status: 'good',
      label: 'Good',
      color: 'text-green-700 bg-green-50 border-green-200',
      icon: CheckCircle2,
      percentage
    }
  }

  const handleReorder = async () => {
    if (!selectedItem || !reorderQuantity) return

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: 'Reorder Request Submitted',
        description: `Request for ${reorderQuantity} ${selectedItem.unit} of ${selectedItem.name} has been submitted.`
      })
      
      setIsReorderDialogOpen(false)
      setReorderQuantity('')
      setReorderNotes('')
      setSelectedItem(null)
      
    } catch (error) {
      toast({
        title: 'Reorder Failed',
        description: 'There was an error submitting your reorder request.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getCategories = () => {
    const categories = [...new Set(stockItems.map(item => item.category))]
    return categories.sort()
  }

  const getTotalValue = () => {
    return filteredItems.reduce((total, item) => total + item.value, 0)
  }

  const getLowStockCount = () => {
    return stockItems.filter(item => item.currentStock <= item.minLevel).length
  }

  const getCriticalStockCount = () => {
    return stockItems.filter(item => item.currentStock <= item.minLevel * 0.5).length
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockItems.length}</div>
            <p className="text-xs text-muted-foreground">
              {filteredItems.length} filtered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${getTotalValue().toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Current inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {getLowStockCount()}
            </div>
            <p className="text-xs text-muted-foreground">Items need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {getCriticalStockCount()}
            </div>
            <p className="text-xs text-muted-foreground">Urgent attention needed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Levels</CardTitle>
          <CardDescription>Monitor and manage inventory levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {getCategories().map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="good">Good Stock</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stock Items */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => {
          const stockStatus = getStockStatus(item)
          const Icon = stockStatus.icon
          
          return (
            <Card key={item.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription>
                      {item.sku} • {item.category}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className={stockStatus.color}>
                    <Icon className="h-3 w-3 mr-1" />
                    {stockStatus.label}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Stock Level Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Stock</span>
                    <span className="font-medium">
                      {item.currentStock} / {item.maxLevel} {item.unit}
                    </span>
                  </div>
                  <Progress 
                    value={stockStatus.percentage} 
                    className={`h-2 ${
                      stockStatus.status === 'critical' ? '[&>div]:bg-red-500' :
                      stockStatus.status === 'low' ? '[&>div]:bg-orange-500' :
                      '[&>div]:bg-green-500'
                    }`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Min: {item.minLevel}</span>
                    <span>Reorder: {item.reorderPoint}</span>
                  </div>
                </div>

                {/* Item Details */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-medium">{item.location}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Value</p>
                    <p className="font-medium">${item.value.toLocaleString()}</p>
                  </div>
                </div>

                {/* Usage Info */}
                <div className="text-sm">
                  <p className="text-muted-foreground">Avg. Usage</p>
                  <p className="font-medium">{item.averageUsage} {item.unit}/month</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedItem(item)
                      setIsReorderDialogOpen(true)
                    }}
                    disabled={stockStatus.status === 'good'}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Reorder
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No stock items found</p>
          </CardContent>
        </Card>
      )}

      {/* Reorder Dialog */}
      <Dialog open={isReorderDialogOpen} onOpenChange={setIsReorderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reorder Item</DialogTitle>
            <DialogDescription>
              Submit a reorder request for {selectedItem?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedItem && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Package className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">{selectedItem.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Current: {selectedItem.currentStock} {selectedItem.unit} | 
                      Min: {selectedItem.minLevel} {selectedItem.unit}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity to Order</Label>
              <Input
                id="quantity"
                type="number"
                placeholder={`Recommended: ${selectedItem?.reorderPoint || 0}`}
                value={reorderQuantity}
                onChange={(e) => setReorderQuantity(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Recommended reorder quantity: {selectedItem?.reorderPoint} {selectedItem?.unit}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any special requirements or notes..."
                value={reorderNotes}
                onChange={(e) => setReorderNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReorderDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleReorder} disabled={isLoading || !reorderQuantity}>
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Reorder'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}