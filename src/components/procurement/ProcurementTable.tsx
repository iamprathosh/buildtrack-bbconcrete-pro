'use client'

import { useState, Fragment } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format } from 'date-fns'
import { PurchaseOrder } from './ProcurementView'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ProcurementTableProps {
  purchaseOrders: PurchaseOrder[]
  selectedOrders: string[]
  onSelectedOrdersChange: (selected: string[]) => void
  onOrderUpdate: (orderId: string, updates: Partial<PurchaseOrder>) => void
}

export function ProcurementTable({
  purchaseOrders,
  selectedOrders,
  onSelectedOrdersChange,
  onOrderUpdate
}: ProcurementTableProps) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectedOrdersChange(purchaseOrders.map(order => order.id))
    } else {
      onSelectedOrdersChange([])
    }
  }

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      onSelectedOrdersChange([...selectedOrders, orderId])
    } else {
      onSelectedOrdersChange(selectedOrders.filter(id => id !== orderId))
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'outline',
      pending: 'secondary',
      approved: 'default',
      ordered: 'secondary',
      received: 'default',
      cancelled: 'destructive'
    } as const

    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-orange-100 text-orange-800',
      approved: 'bg-green-100 text-green-800',
      ordered: 'bg-blue-100 text-blue-800',
      received: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    } as const

    return (
      <Badge 
        variant={variants[status as keyof typeof variants] || 'outline'} 
        className={colors[status as keyof typeof colors]}
      >
        {status}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    } as const

    return (
      <Badge 
        variant="outline" 
        className={colors[priority as keyof typeof colors]}
      >
        {priority}
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (purchaseOrders.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">No purchase orders found</p>
            <p className="text-sm text-muted-foreground">
              Create your first purchase order to get started
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Orders</CardTitle>
        <CardDescription>
          Manage and track your procurement orders
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <ScrollArea className="w-full">
            <div className="min-w-[1000px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedOrders.length === purchaseOrders.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="min-w-[120px]">Order #</TableHead>
                    <TableHead className="min-w-[150px]">Supplier</TableHead>
                    <TableHead className="min-w-[150px]">Project</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[90px]">Priority</TableHead>
                    <TableHead className="min-w-[120px]">Order Date</TableHead>
                    <TableHead className="min-w-[120px]">Expected</TableHead>
                    <TableHead className="min-w-[100px]">Amount</TableHead>
                    <TableHead className="min-w-[90px]">Items</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrders.map((order) => (
                    <Fragment key={order.id}>
                      <TableRow className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <Checkbox
                            checked={selectedOrders.includes(order.id)}
                            onCheckedChange={(checked) => 
                              handleSelectOrder(order.id, checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <Button 
                            variant="link" 
                            className="p-0 h-auto"
                            onClick={() => setExpandedOrder(
                              expandedOrder === order.id ? null : order.id
                            )}
                          >
                            {order.orderNumber}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.supplier}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{order.project}</p>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(order.status)}
                        </TableCell>
                        <TableCell>
                          {getPriorityBadge(order.priority)}
                        </TableCell>
                        <TableCell>
                          {format(order.orderDate, 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(order.expectedDelivery, 'MMM dd, yyyy')}
                            {order.actualDelivery && (
                              <div className="text-xs text-green-600">
                                Delivered {format(order.actualDelivery, 'MMM dd')}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
                            {order.paidAmount > 0 && (
                              <p className="text-xs text-green-600">
                                Paid: {formatCurrency(order.paidAmount)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{order.items.length}</span>
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
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Order
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {order.status === 'pending' && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => onOrderUpdate(order.id, { status: 'approved' })}
                                  >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => onOrderUpdate(order.id, { status: 'cancelled' })}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              {order.status === 'approved' && (
                                <DropdownMenuItem 
                                  onClick={() => onOrderUpdate(order.id, { status: 'ordered' })}
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Mark as Ordered
                                </DropdownMenuItem>
                              )}
                              {order.status === 'ordered' && (
                                <DropdownMenuItem 
                                  onClick={() => onOrderUpdate(order.id, { 
                                    status: 'received',
                                    actualDelivery: new Date()
                                  })}
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Mark as Received
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Row */}
                      {expandedOrder === order.id && (
                        <TableRow>
                          <TableCell colSpan={11} className="p-0">
                            <div className="p-4 bg-muted/20 border-t">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Order Items</h4>
                                  <div className="space-y-2">
                                    {order.items.map((item) => (
                                      <div key={item.id} className="flex justify-between items-center text-sm">
                                        <div>
                                          <p className="font-medium">{item.name}</p>
                                          <p className="text-muted-foreground">
                                            {item.quantity} {item.unit} @ {formatCurrency(item.unitPrice)} each
                                          </p>
                                        </div>
                                        <p className="font-medium">{formatCurrency(item.totalPrice)}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Additional Information</h4>
                                  <div className="space-y-2 text-sm">
                                    {order.approvedBy && (
                                      <div>
                                        <p className="text-muted-foreground">Approved by</p>
                                        <p className="font-medium">{order.approvedBy}</p>
                                      </div>
                                    )}
                                    <div>
                                      <p className="text-muted-foreground">Last updated</p>
                                      <p className="font-medium">{format(order.lastUpdated, 'MMM dd, yyyy HH:mm')}</p>
                                    </div>
                                    {order.notes && (
                                      <div>
                                        <p className="text-muted-foreground">Notes</p>
                                        <p className="font-medium">{order.notes}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}