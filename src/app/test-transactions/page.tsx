'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { 
  Database, 
  Package, 
  TrendingUp, 
  TrendingDown, 
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Play,
  Activity
} from 'lucide-react'

export default function TestTransactionsPage() {
  const [migrationStatus, setMigrationStatus] = useState<'loading' | 'pending' | 'completed' | 'error'>('loading')
  const [products, setProducts] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [transactionType, setTransactionType] = useState<'IN' | 'OUT' | 'RETURN'>('IN')
  const [quantity, setQuantity] = useState<string>('')
  const [unitCost, setUnitCost] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)

  // Check migration status
  useEffect(() => {
    checkMigrationStatus()
    loadProducts()
    loadRecentTransactions()
  }, [])

  const checkMigrationStatus = async () => {
    try {
      const response = await fetch('/api/migrations/inventory-transactions')
      const data = await response.json()
      
      if (response.ok) {
        setMigrationStatus(data.table_exists ? 'completed' : 'pending')
      } else {
        setMigrationStatus('error')
        console.error('Migration status check failed:', data)
      }
    } catch (error) {
      console.error('Error checking migration status:', error)
      setMigrationStatus('error')
    }
  }

  const runMigration = async () => {
    try {
      const response = await fetch('/api/migrations/inventory-transactions', {
        method: 'POST'
      })
      const data = await response.json()
      
      if (response.ok) {
        setMigrationStatus('completed')
        toast.success('Migration completed successfully!')
      } else {
        toast.error(`Migration failed: ${data.error}`)
        console.error('Migration failed:', data)
      }
    } catch (error) {
      console.error('Error running migration:', error)
      toast.error('Migration failed: Network error')
    }
  }

  const loadProducts = async () => {
    try {
      // Use the existing products hook or API
      const response = await fetch('/api/products?limit=20') // Assuming this exists
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  const loadRecentTransactions = async () => {
    try {
      setIsLoadingTransactions(true)
      const response = await fetch('/api/operations/transactions?limit=10')
      
      if (response.ok) {
        const data = await response.json()
        setRecentTransactions(data.transactions || [])
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setIsLoadingTransactions(false)
    }
  }

  const submitTransaction = async () => {
    if (!selectedProduct || !quantity) {
      toast.error('Please select a product and enter quantity')
      return
    }

    try {
      setIsSubmitting(true)
      
      const response = await fetch('/api/operations/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: selectedProduct,
          quantity: parseFloat(quantity),
          transactionType: transactionType.toLowerCase(),
          unitCost: unitCost ? parseFloat(unitCost) : undefined,
          notes: notes || undefined,
          referenceNumber: `TEST-${Date.now()}`
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Transaction created! ${data.transaction?.transaction_number}`)
        // Reset form
        setQuantity('')
        setUnitCost('')
        setNotes('')
        // Reload transactions
        loadRecentTransactions()
      } else {
        toast.error(`Transaction failed: ${data.error}`)
      }

    } catch (error) {
      console.error('Error creating transaction:', error)
      toast.error('Transaction failed: Network error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'IN': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'OUT': return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'RETURN': return <RotateCcw className="h-4 w-4 text-blue-600" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      pending: 'secondary',
      cancelled: 'destructive',
      reversed: 'outline'
    } as const
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Transaction System Test</h1>
          <p className="text-muted-foreground">
            Test the new inventory transaction system with automatic stock updates
          </p>
        </div>
      </div>

      {/* Migration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Migration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {migrationStatus === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
              {migrationStatus === 'completed' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
              {migrationStatus === 'pending' && <AlertCircle className="h-5 w-5 text-yellow-600" />}
              {migrationStatus === 'error' && <XCircle className="h-5 w-5 text-red-600" />}
              
              <span className="font-medium">
                {migrationStatus === 'loading' && 'Checking migration status...'}
                {migrationStatus === 'completed' && 'Migration completed - Ready to test!'}
                {migrationStatus === 'pending' && 'Migration required - Run migration first'}
                {migrationStatus === 'error' && 'Migration check failed'}
              </span>
            </div>
            
            {migrationStatus === 'pending' && (
              <Button onClick={runMigration}>
                <Play className="h-4 w-4 mr-2" />
                Run Migration
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Form */}
      {migrationStatus === 'completed' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Create Test Transaction</CardTitle>
              <CardDescription>
                Test the inventory transaction system by creating sample transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="product">Product</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.sku}) - Stock: {product.current_stock}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="transaction-type">Transaction Type</Label>
                <Select value={transactionType} onValueChange={(value: 'IN' | 'OUT' | 'RETURN') => setTransactionType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN">Stock In</SelectItem>
                    <SelectItem value="OUT">Stock Out</SelectItem>
                    <SelectItem value="RETURN">Return</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Enter quantity"
                  />
                </div>
                <div>
                  <Label htmlFor="unit-cost">Unit Cost (optional)</Label>
                  <Input
                    id="unit-cost"
                    type="number"
                    step="0.01"
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                    placeholder="Enter cost per unit"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter transaction notes"
                  rows={3}
                />
              </div>

              <Button 
                onClick={submitTransaction} 
                disabled={isSubmitting || !selectedProduct || !quantity}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Transaction...
                  </>
                ) : (
                  <>
                    <Activity className="h-4 w-4 mr-2" />
                    Create Transaction
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Latest inventory transactions</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={loadRecentTransactions}>
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingTransactions ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : recentTransactions.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentTransactions.map((transaction, index) => (
                    <div key={transaction.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <p className="font-medium">{transaction.product}</p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.sku} • {transaction.user}
                          </p>
                          {transaction.transaction_number && (
                            <p className="text-xs text-muted-foreground">
                              #{transaction.transaction_number}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {transaction.type === 'OUT' ? '-' : '+'}{transaction.quantity} {transaction.unit}
                        </p>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(transaction.status)}
                        </div>
                        {transaction.stock_after !== undefined && (
                          <p className="text-xs text-muted-foreground">
                            Stock: {transaction.stock_after}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}