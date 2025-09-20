'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProcurementTable } from './ProcurementTable'
import { ProcurementFilters } from './ProcurementFilters'
import { AddPurchaseOrderDialog } from './AddPurchaseOrderDialog'
import { useUser } from '@clerk/nextjs'
import { format } from 'date-fns'
import { 
  Plus,
  ShoppingCart,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Package,
  Truck
} from 'lucide-react'

export interface PurchaseOrder {
  id: string
  orderNumber: string
  supplier: string
  project: string
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  orderDate: Date
  expectedDelivery: Date
  actualDelivery?: Date
  totalAmount: number
  paidAmount: number
  items: Array<{
    id: string
    name: string
    quantity: number
    unit: string
    unitPrice: number
    totalPrice: number
  }>
  approvedBy?: string
  notes: string
  lastUpdated: Date
}

export interface ProcurementFilters {
  search: string
  status: string
  priority: string
  supplier: string
  project: string
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
}

export function ProcurementView() {
  const { user } = useUser()
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<PurchaseOrder[]>([])
  const [filters, setFilters] = useState<ProcurementFilters>({
    search: '',
    status: 'all',
    priority: 'all',
    supplier: 'all',
    project: 'all',
    dateRange: { from: undefined, to: undefined }
  })
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    approvedOrders: 0,
    totalValue: 0,
    totalPaid: 0,
    avgOrderValue: 0
  })

  // Fetch data from API
  useEffect(() => {
    fetchProcurementData()
  }, [])

  // Fetch data when filters change
  useEffect(() => {
    fetchProcurementData()
  }, [filters])

  const fetchProcurementData = async () => {
    setLoading(true)
    try {
      const searchParams = new URLSearchParams()
      
      if (filters.search) searchParams.append('search', filters.search)
      if (filters.status !== 'all') searchParams.append('status', filters.status)
      if (filters.priority !== 'all') searchParams.append('priority', filters.priority)
      if (filters.supplier !== 'all') searchParams.append('supplier', filters.supplier)
      if (filters.project !== 'all') searchParams.append('project', filters.project)
      if (filters.dateRange.from) searchParams.append('dateFrom', filters.dateRange.from.toISOString())
      if (filters.dateRange.to) searchParams.append('dateTo', filters.dateRange.to.toISOString())

      const response = await fetch(`/api/procurement?${searchParams.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch procurement data')
      }

      const data = await response.json()
      
      // Convert date strings back to Date objects
      const ordersWithDates = data.purchaseOrders.map((order: any) => ({
        ...order,
        orderDate: new Date(order.orderDate),
        expectedDelivery: new Date(order.expectedDelivery),
        actualDelivery: order.actualDelivery ? new Date(order.actualDelivery) : undefined,
        lastUpdated: new Date(order.lastUpdated)
      }))
      
      setPurchaseOrders(ordersWithDates)
      setFilteredOrders(ordersWithDates)
      setStats(data.stats)
    } catch (error) {
      console.error('Error fetching procurement data:', error)
      // Set fallback empty state
      setPurchaseOrders([])
      setFilteredOrders([])
    } finally {
      setLoading(false)
    }
  }

  // Update order via API
  const handleOrderUpdate = async (orderId: string, updates: Partial<PurchaseOrder>) => {
    try {
      const response = await fetch(`/api/procurement/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update purchase order')
      }

      const { purchaseOrder: updatedOrder } = await response.json()
      
      // Convert date strings back to Date objects
      const orderWithDates = {
        ...updatedOrder,
        orderDate: new Date(updatedOrder.orderDate),
        expectedDelivery: new Date(updatedOrder.expectedDelivery),
        actualDelivery: updatedOrder.actualDelivery ? new Date(updatedOrder.actualDelivery) : undefined,
        lastUpdated: new Date(updatedOrder.lastUpdated)
      }
      
      // Update local state
      setPurchaseOrders(prev => prev.map(order => 
        order.id === orderId ? orderWithDates : order
      ))
      setFilteredOrders(prev => prev.map(order => 
        order.id === orderId ? orderWithDates : order
      ))
      
      // Refresh stats
      fetchProcurementData()
    } catch (error) {
      console.error('Error updating purchase order:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Purchase Order
          </Button>
          
          {selectedOrders.length > 0 && (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {selectedOrders.length} selected
              </Badge>
              <Button variant="outline" size="sm">
                Bulk Approve
              </Button>
              <Button variant="outline" size="sm">
                Export Selected
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 w-full max-w-full">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">All purchase orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approvedOrders}</div>
            <p className="text-xs text-muted-foreground">Ready to order</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">All orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalPaid)}</div>
            <p className="text-xs text-muted-foreground">Payments made</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.avgOrderValue)}</div>
            <p className="text-xs text-muted-foreground">Average value</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <ProcurementFilters
        filters={filters}
        onFiltersChange={setFilters}
        purchaseOrders={purchaseOrders}
      />

      {/* Main Content */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="approval">Approval Queue</TabsTrigger>
          <TabsTrigger value="tracking">Delivery Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-muted-foreground">Loading purchase orders...</span>
            </div>
          ) : (
            <ProcurementTable
              purchaseOrders={filteredOrders}
              selectedOrders={selectedOrders}
              onSelectedOrdersChange={setSelectedOrders}
              onOrderUpdate={handleOrderUpdate}
            />
          )}
        </TabsContent>

        <TabsContent value="approval" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 w-full max-w-full">
            {filteredOrders
              .filter(order => order.status === 'pending')
              .map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                        <CardDescription>
                          {order.supplier} • {order.project}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          order.priority === 'urgent' ? 'destructive' :
                          order.priority === 'high' ? 'secondary' : 'outline'
                        }>
                          {order.priority}
                        </Badge>
                        <Badge variant="outline" className="bg-orange-100 text-orange-800">
                          Pending
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Order Date</p>
                          <p className="font-medium">{format(order.orderDate, 'MMM dd, yyyy')}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Expected Delivery</p>
                          <p className="font-medium">{format(order.expectedDelivery, 'MMM dd, yyyy')}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Amount</p>
                          <p className="font-medium text-lg">{formatCurrency(order.totalAmount)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Items</p>
                          <p className="font-medium">{order.items.length} items</p>
                        </div>
                      </div>
                      
                      {order.notes && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm"><strong>Notes:</strong> {order.notes}</p>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleOrderUpdate(order.id, { status: 'approved' })}
                          disabled={loading}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Review Details
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleOrderUpdate(order.id, { status: 'cancelled' })}
                          disabled={loading}
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {filteredOrders.filter(order => order.status === 'pending').length === 0 && (
            <Card>
              <CardContent className="flex items-center justify-center py-10">
                <div className="text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  <p className="text-lg font-medium text-muted-foreground">No pending approvals</p>
                  <p className="text-sm text-muted-foreground">
                    All purchase orders have been processed
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 w-full max-w-full">
            {filteredOrders
              .filter(order => ['approved', 'ordered', 'received'].includes(order.status))
              .map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                        <p className="text-muted-foreground">{order.supplier}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          order.status === 'received' ? 'default' :
                          order.status === 'ordered' ? 'secondary' : 'outline'
                        }>
                          {order.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatCurrency(order.totalAmount)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Order Progress</span>
                        <span className="text-sm font-medium">
                          {order.status === 'received' ? '100%' : 
                           order.status === 'ordered' ? '66%' : '33%'}
                        </span>
                      </div>
                      <Progress 
                        value={order.status === 'received' ? 100 : 
                               order.status === 'ordered' ? 66 : 33} 
                        className="h-2" 
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="font-medium">Approved</p>
                          <p className="text-muted-foreground">
                            {format(order.orderDate, 'MMM dd')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {order.status === 'ordered' || order.status === 'received' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-medium">Ordered</p>
                          <p className="text-muted-foreground">
                            {order.status === 'ordered' || order.status === 'received' ? 
                             format(order.orderDate, 'MMM dd') : 'Pending'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {order.status === 'received' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <Truck className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-medium">Delivered</p>
                          <p className="text-muted-foreground">
                            {order.actualDelivery ? 
                             format(order.actualDelivery, 'MMM dd') : 
                             format(order.expectedDelivery, 'MMM dd (exp)')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Purchase Order Dialog */}
      <AddPurchaseOrderDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onOrderAdded={(newOrder) => {
          setPurchaseOrders(prev => [...prev, newOrder])
          setIsAddDialogOpen(false)
        }}
      />
    </div>
  )
}