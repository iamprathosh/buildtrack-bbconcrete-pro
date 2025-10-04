'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { InventoryItem } from './InventoryView'
import { ItemDetailsSheet } from './ItemDetailsSheet'
import { format } from 'date-fns'
import { 
  MoreHorizontal, 
  ArrowUpDown, 
  Eye, 
  Edit3, 
  Trash2,
  Package,
  ExternalLink
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface InventoryTableProps {
  inventory: InventoryItem[]
  selectedItems: string[]
  onSelectedItemsChange: (selectedItems: string[]) => void
  onItemUpdate: (itemId: string, updates: Partial<InventoryItem>) => void
  onRowClick?: (productId: string) => void
  onItemDelete?: (itemId: string) => Promise<void> | void
  onBulkDelete?: () => void
}

type SortField = keyof InventoryItem
type SortDirection = 'asc' | 'desc'

export function InventoryTable({
  inventory,
  selectedItems,
  onSelectedItemsChange,
  onItemUpdate,
  onRowClick,
  onItemDelete,
  onBulkDelete
}: InventoryTableProps) {
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedInventory = [...inventory].sort((a, b) => {
    const aVal = a[sortField]
    const bVal = b[sortField]
    
    // Handle null/undefined values
    if (aVal == null && bVal == null) return 0
    if (aVal == null) return 1
    if (bVal == null) return -1
    
    if (aVal === bVal) return 0
    
    const comparison = aVal < bVal ? -1 : 1
    return sortDirection === 'asc' ? comparison : -comparison
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectedItemsChange(inventory.map(item => item.id))
    } else {
      onSelectedItemsChange([])
    }
  }

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      onSelectedItemsChange([...selectedItems, itemId])
    } else {
      onSelectedItemsChange(selectedItems.filter(id => id !== itemId))
    }
  }

  const handleViewDetails = (item: InventoryItem) => {
    setSelectedItem(item)
    setIsDetailsSheetOpen(true)
  }

  const getStatusBadge = (status: InventoryItem['status']) => {
    const variants = {
      'in-stock': 'default',
      'low-stock': 'secondary', 
      'out-of-stock': 'destructive',
      'discontinued': 'outline'
    } as const
    
    return (
      <Badge variant={variants[status]}>
        {status.replace('-', ' ')}
      </Badge>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-0 font-medium hover:bg-transparent"
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  )

  const allSelected = inventory.length > 0 && selectedItems.length === inventory.length
  const someSelected = selectedItems.length > 0 && selectedItems.length < inventory.length

  return (
    <>
      <div className="space-y-4 w-full max-w-full">
        <div className="rounded-md border overflow-hidden">
          <div className="h-[600px] w-full overflow-auto">
            <Table className="w-full" style={{ minWidth: '1200px' }}>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] px-2">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    ref={(ref) => {
                      if (ref) {
                        const inputElement = ref.querySelector('input')
                        if (inputElement) inputElement.indeterminate = someSelected
                      }
                    }}
                  />
                </TableHead>
                <TableHead className="w-[300px] pr-1">
                  <SortableHeader field="name">Product</SortableHeader>
                </TableHead>
                <TableHead className="w-[140px] px-1">
                  <SortableHeader field="category">Category</SortableHeader>
                </TableHead>
                <TableHead className="w-[120px] px-2">
                  <SortableHeader field="currentStock">Stock</SortableHeader>
                </TableHead>
                <TableHead className="w-[100px] px-2">
                  <SortableHeader field="unitPrice">Price</SortableHeader>
                </TableHead>
                <TableHead className="w-[120px] px-2">
                  <SortableHeader field="totalValue">Value</SortableHeader>
                </TableHead>
                <TableHead className="w-[150px] px-2">
                  <SortableHeader field="location">Location</SortableHeader>
                </TableHead>
                <TableHead className="w-[100px] px-1">
                  <SortableHeader field="status">Status</SortableHeader>
                </TableHead>
                <TableHead className="w-[50px] px-1"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedInventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No inventory items found</p>
                  </TableCell>
                </TableRow>
              ) : (
                sortedInventory.map((item) => (
                  <TableRow 
                    key={item.id}
                    className={`${selectedItems.includes(item.id) ? 'bg-muted/50' : ''} ${
                      onRowClick ? 'cursor-pointer hover:bg-muted/30' : ''
                    }`}
                    onClick={(e) => {
                      // Don't trigger row click if clicking on checkbox, dropdown, or other interactive elements
                      const target = e.target as HTMLElement
                      if (target.closest('button') || target.closest('[role="checkbox"]') || target.closest('[role="menuitem"]')) {
                        return
                      }
                      onRowClick?.(item.id)
                    }}
                  >
                    <TableCell className="px-2">
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium overflow-hidden pr-1">
                      <div className="space-y-1 min-w-0">
                        <p className="font-semibold truncate" title={item.name}>{item.name}</p>
                        {item.supplier && (
                          <div className="text-xs text-muted-foreground truncate" title={item.supplier}>
                            {item.supplier}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm overflow-hidden px-1">
                      <span className="px-1 py-1 bg-muted/50 rounded text-xs block" title={item.category}>
                        {item.category}
                      </span>
                    </TableCell>
                    <TableCell className="overflow-hidden">
                      <div className="space-y-1">
                        <p className="font-medium text-sm truncate">
                          {item.currentStock} {item.unit}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          Min: {item.minLevel}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium overflow-hidden">
                      <span className="truncate block" title={formatCurrency(item.unitPrice)}>
                        {formatCurrency(item.unitPrice)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm font-semibold overflow-hidden">
                      <span className="truncate block" title={formatCurrency(item.totalValue)}>
                        {formatCurrency(item.totalValue)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm overflow-hidden">
                      <span className="truncate block" title={item.location}>
                        {item.location.length > 6 ? item.location.substring(0, 6) + '...' : item.location}
                      </span>
                    </TableCell>
                    <TableCell className="overflow-hidden">
                      <Badge 
                        variant={item.status === 'in-stock' ? 'default' : item.status === 'low-stock' ? 'secondary' : 'destructive'}
                        className="text-[10px] px-1 py-0 h-5 shrink-0"
                        title={item.status.replace('-', ' ')}
                      >
                        {item.status === 'in-stock' ? 'In' : item.status === 'low-stock' ? 'Low' : 'Out'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-7 w-7 p-0">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewDetails(item)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
<DropdownMenuItem onClick={() => onRowClick?.(item.id)}>
                            <Edit3 className="mr-2 h-4 w-4" />
                            Edit Item
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View in Operations
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
<DropdownMenuItem className="text-destructive" onClick={() => onItemDelete?.(item.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Item
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            </Table>
          </div>
        </div>

        {/* Selection Summary */}
        {selectedItems.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
            </p>
            <div className="flex items-center space-x-2">
<Button variant="outline" size="sm">
                Export Selected
              </Button>
              <Button variant="destructive" size="sm" onClick={() => onBulkDelete?.()}>
                Delete Selected
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Item Details Sheet */}
      <ItemDetailsSheet
        item={selectedItem}
        isOpen={isDetailsSheetOpen}
        onClose={() => {
          setIsDetailsSheetOpen(false)
          setSelectedItem(null)
        }}
        onItemUpdate={onItemUpdate}
      />
    </>
  )
}