'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OperationsForm } from './OperationsForm'
import { TransactionHistory } from './TransactionHistory'
import { StockLevel } from './StockLevel'
import { useUser } from '@clerk/nextjs'
import { 
  Package2,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  AlertCircle,
  Activity
} from 'lucide-react'

interface StockMovement {
  id: string
  type: 'IN' | 'OUT' | 'RETURN'
  product: string
  quantity: number
  project: string
  timestamp: Date
  user: string
  status: 'completed' | 'pending' | 'cancelled'
}

export function OperationsView() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('new-transaction')
  const [recentTransactions, setRecentTransactions] = useState<StockMovement[]>([])
  const [stockAlerts, setStockAlerts] = useState<{product: string; currentStock: number; minLevel: number}[]>([])
  
  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate API call for recent transactions
    const mockTransactions: StockMovement[] = [
      {
        id: '1',
        type: 'OUT',
        product: 'Portland Cement - 50kg',
        quantity: 20,
        project: 'Residential Complex A',
        timestamp: new Date(),
        user: 'John Doe',
        status: 'completed'
      },
      {
        id: '2',
        type: 'IN',
        product: 'Steel Rebar - 12mm',
        quantity: 100,
        project: 'Bridge Construction',
        timestamp: new Date(Date.now() - 3600000),
        user: 'Jane Smith',
        status: 'completed'
      }
    ]
    setRecentTransactions(mockTransactions)

    // Mock stock alerts
    setStockAlerts([
      { product: 'Concrete Mix', currentStock: 5, minLevel: 10 },
      { product: 'Sand - Fine', currentStock: 2, minLevel: 5 }
    ])
  }, [])

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'IN': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'OUT': return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'RETURN': return <RotateCcw className="h-4 w-4 text-blue-600" />
      default: return <Package2 className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      pending: 'secondary',
      cancelled: 'destructive'
    } as const
    
    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from yesterday</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Outs</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Materials dispatched</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Ins</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">New inventory received</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockAlerts.length}</div>
            <p className="text-xs text-muted-foreground">Items need restocking</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="new-transaction">New Transaction</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
          <TabsTrigger value="stock-levels">Stock Levels</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="new-transaction" className="space-y-4">
          <OperationsForm />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <TransactionHistory />
        </TabsContent>

        <TabsContent value="stock-levels" className="space-y-4">
          <StockLevel />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock Level Alerts</CardTitle>
              <CardDescription>
                Items that are running low and need restocking
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stockAlerts.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No stock alerts at this time</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stockAlerts.map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-orange-50 border-orange-200">
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="font-medium">{alert.product}</p>
                          <p className="text-sm text-muted-foreground">
                            Current: {alert.currentStock} | Minimum: {alert.minLevel}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Reorder
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest inventory transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Package2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No recent transactions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTransactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <p className="font-medium">{transaction.product}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.project} • {transaction.user}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {transaction.type === 'OUT' ? '-' : '+'}{transaction.quantity}
                    </p>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}