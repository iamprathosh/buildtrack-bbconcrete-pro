'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { 
  Search,
  Filter,
  Download,
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Eye,
  MoreHorizontal,
  Package2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Transaction {
  id: string
  type: 'IN' | 'OUT' | 'RETURN'
  product: string
  sku: string
  quantity: number
  unit: string
  project: string
  user: string
  timestamp: Date
  status: 'completed' | 'pending' | 'cancelled'
  notes?: string
  location?: string
}

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<{from: Date | undefined, to: Date | undefined}>({
    from: undefined,
    to: undefined
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (typeFilter !== 'all') params.set('type', typeFilter)
        if (dateRange.from) params.set('startDate', dateRange.from.toISOString())
        if (dateRange.to) params.set('endDate', dateRange.to.toISOString())
        if (searchTerm) params.set('search', searchTerm)
        const res = await fetch(`/api/operations/transactions?${params.toString()}`)
        if (!res.ok) throw new Error('Failed to load transactions')
        const json = await res.json()
        const txs: Transaction[] = (json.transactions || []).map((t: any) => ({
          id: t.id,
          type: (t.type || 'IN') as 'IN' | 'OUT' | 'RETURN',
          product: t.product || 'Unknown',
          sku: t.sku || 'N/A',
          quantity: t.quantity || 0,
          unit: t.unit || 'units',
          project: t.project || 'No Project',
          user: t.user || 'Unknown',
          timestamp: t.timestamp ? new Date(t.timestamp) : new Date(),
          status: 'completed',
          notes: t.notes,
        }))
        setTransactions(txs)
        setFilteredTransactions(txs)
      } catch (e) {
        // keep UI usable even if request fails
        setTransactions([])
        setFilteredTransactions([])
      } finally {
        setIsLoading(false)
      }
    }
    load()
    // re-load when filters change
  }, [typeFilter, dateRange.from, dateRange.to, searchTerm])

  // Filter transactions based on search and filters
  useEffect(() => {
    const filtered = transactions.filter(transaction => {
      const matchesSearch = 
        transaction.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.user.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = typeFilter === 'all' || transaction.type === typeFilter
      const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter

      const matchesDateRange = (!dateRange.from || transaction.timestamp >= dateRange.from) &&
                              (!dateRange.to || transaction.timestamp <= dateRange.to)

      return matchesSearch && matchesType && matchesStatus && matchesDateRange
    })

    setFilteredTransactions(filtered)
  }, [transactions, searchTerm, typeFilter, statusFilter, dateRange])

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

  const getTypeDisplay = (type: string) => {
    const displays = {
      IN: { label: 'Stock In', color: 'text-green-700 bg-green-50 border-green-200' },
      OUT: { label: 'Stock Out', color: 'text-red-700 bg-red-50 border-red-200' },
      RETURN: { label: 'Return', color: 'text-blue-700 bg-blue-50 border-blue-200' }
    }
    return displays[type as keyof typeof displays] || { label: type, color: 'text-gray-700 bg-gray-50 border-gray-200' }
  }

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting transactions...', filteredTransactions)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setTypeFilter('all')
    setStatusFilter('all')
    setDateRange({ from: undefined, to: undefined })
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transaction History</span>
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardTitle>
          <CardDescription>
            View and filter all inventory transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="IN">Stock In</SelectItem>
                <SelectItem value="OUT">Stock Out</SelectItem>
                <SelectItem value="RETURN">Return</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Range */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          {(searchTerm || typeFilter !== 'all' || statusFilter !== 'all' || dateRange.from) && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </p>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      <Package2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No transactions found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => {
                    const typeDisplay = getTypeDisplay(transaction.type)
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getTransactionIcon(transaction.type)}
                            <Badge variant="outline" className={typeDisplay.color}>
                              {typeDisplay.label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{transaction.product}</p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.sku}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {transaction.type === 'OUT' ? '-' : '+'}
                            {transaction.quantity} {transaction.unit}
                          </span>
                        </TableCell>
                        <TableCell>{transaction.project}</TableCell>
                        <TableCell>{transaction.user}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {format(transaction.timestamp, 'MMM dd, yyyy')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(transaction.timestamp, 'HH:mm')}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(transaction.status)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                Copy Transaction ID
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}