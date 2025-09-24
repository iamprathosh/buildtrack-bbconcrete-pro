'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProcurementTable } from './ProcurementTable'
import { AddPurchaseOrderDialog } from './AddPurchaseOrderDialog'
import { useUser } from '@clerk/nextjs'
import { 
  Plus,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Package
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


      {/* Main Content: Purchase Orders only */}
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