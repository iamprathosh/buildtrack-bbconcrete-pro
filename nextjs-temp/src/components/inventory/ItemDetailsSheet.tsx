'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { InventoryItem } from './InventoryView'
import { format } from 'date-fns'
import { 
  Package,
  MapPin,
  DollarSign,
  Calendar,
  Truck,
  Clock,
  TrendingDown,
  Edit3,
  ExternalLink,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react'

interface ItemDetailsSheetProps {
  item: InventoryItem | null
  isOpen: boolean
  onClose: () => void
  onItemUpdate: (itemId: string, updates: Partial<InventoryItem>) => void
}

export function ItemDetailsSheet({ item, isOpen, onClose, onItemUpdate }: ItemDetailsSheetProps) {
  const [isEditing, setIsEditing] = useState(false)

  if (!item) return null

  const getStatusColor = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in-stock':
        return 'text-green-600'
      case 'low-stock':
        return 'text-orange-600'
      case 'out-of-stock':
        return 'text-red-600'
      default:
        return 'text-muted-foreground'
    }
  }

  const getStatusIcon = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in-stock':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'low-stock':
      case 'out-of-stock':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      default:
        return <Package className="h-4 w-4 text-muted-foreground" />
    }
  }

  const stockPercentage = (item.currentStock / item.maxLevel) * 100
  const reorderNeeded = item.currentStock <= item.reorderPoint
  const daysUntilEmpty = item.averageUsage > 0 ? Math.floor(item.currentStock / item.averageUsage) : 0

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <SheetTitle className="text-xl">{item.name}</SheetTitle>
              <SheetDescription>
                <code className="text-sm">{item.sku}</code> • {item.category}
              </SheetDescription>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(item.status)}
              <Badge variant={
                item.status === 'in-stock' ? 'default' :
                item.status === 'low-stock' ? 'secondary' :
                item.status === 'out-of-stock' ? 'destructive' : 'outline'
              }>
                {item.status.replace('-', ' ')}
              </Badge>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Stock Level Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" />
                Stock Level
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current Stock</span>
                  <span className="font-medium">
                    {item.currentStock} / {item.maxLevel} {item.unit}
                  </span>
                </div>
                <Progress 
                  value={stockPercentage} 
                  className={`h-2 ${
                    item.status === 'out-of-stock' ? '[&>div]:bg-red-500' :
                    item.status === 'low-stock' ? '[&>div]:bg-orange-500' :
                    '[&>div]:bg-green-500'
                  }`}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Min: {item.minLevel}</span>
                  <span>Reorder: {item.reorderPoint}</span>
                </div>
              </div>

              {reorderNeeded && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <p className="text-sm text-orange-700 font-medium">
                      Reorder recommended
                    </p>
                  </div>
                  {daysUntilEmpty > 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      Estimated {daysUntilEmpty} days remaining at current usage
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Unit Price</p>
                  <p className="font-medium">{formatCurrency(item.unitPrice)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="font-medium text-lg">{formatCurrency(item.totalValue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location & Supplier */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location & Supplier
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Storage Location</p>
                <p className="font-medium">{item.location}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Supplier</p>
                <p className="font-medium">{item.supplier}</p>
              </div>
            </CardContent>
          </Card>

          {/* Usage & Lead Time */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Usage & Lead Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Usage</p>
                  <p className="font-medium">{item.averageUsage} {item.unit}/month</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lead Time</p>
                  <p className="font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {item.leadTime} days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description & Tags */}
          {(item.description || item.tags.length > 0) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {item.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-sm">{item.description}</p>
                  </div>
                )}
                
                {item.tags.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Last Updated */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Last Updated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {format(item.lastUpdated, 'EEEE, MMMM dd, yyyy \'at\' HH:mm')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 border-t pt-6">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline">
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Item
            </Button>
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              View in Operations
            </Button>
          </div>
          
          {reorderNeeded && (
            <Button className="w-full">
              <Truck className="h-4 w-4 mr-2" />
              Create Reorder Request
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}