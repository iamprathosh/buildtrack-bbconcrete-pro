'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  PackageIcon,
  TruckIcon,
  ClipboardListIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  Clock
} from 'lucide-react'
import { format } from 'date-fns'

export interface ReportDataRow {
  id: string
  type: 'inventory' | 'equipment' | 'project'
  date: string
  name: string
  description?: string
  quantity?: number
  unit?: string
  cost?: number
  status: string
  maintenanceStatus?: 'good' | 'needs_maintenance' | 'under_maintenance' | 'out_of_order'
  location?: string
  project?: string
  category?: string
  createdAt: string
  updatedAt?: string
}

interface ReportsDataTableProps {
  data: ReportDataRow[]
  isLoading: boolean
  category: string
}

export function ReportsDataTable({ data, isLoading, category }: ReportsDataTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = data.slice(startIndex, endIndex)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'inventory':
        return <PackageIcon className="h-4 w-4 text-blue-600" />
      case 'equipment':
        return <TruckIcon className="h-4 w-4 text-orange-600" />
      case 'project':
        return <ClipboardListIcon className="h-4 w-4 text-green-600" />
      default:
        return null
    }
  }

  const getMaintenanceStatusBadge = (status?: string) => {
    if (!status) return null

    const variants = {
      'good': { variant: 'default' as const, className: 'bg-green-100 text-green-800', icon: <CheckCircleIcon className="h-3 w-3" /> },
      'needs_maintenance': { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800', icon: <AlertCircleIcon className="h-3 w-3" /> },
      'under_maintenance': { variant: 'secondary' as const, className: 'bg-blue-100 text-blue-800', icon: <Clock className="h-3 w-3" /> },
      'out_of_order': { variant: 'destructive' as const, className: 'bg-red-100 text-red-800', icon: <AlertCircleIcon className="h-3 w-3" /> }
    }

    const config = variants[status as keyof typeof variants]
    if (!config) return null

    const labels = {
      'good': 'Good',
      'needs_maintenance': 'Needs Maintenance',
      'under_maintenance': 'Under Maintenance', 
      'out_of_order': 'Out of Order'
    }

    return (
      <Badge variant={config.variant} className={config.className}>
        <span className="flex items-center gap-1">
          {config.icon}
          {labels[status as keyof typeof labels]}
        </span>
      </Badge>
    )
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy')
    } catch {
      return dateString
    }
  }

  const getCategoryTitle = () => {
    const titles = {
      'all': 'All Data',
      'inventory': 'Inventory Transactions',
      'equipment': 'Equipment Transactions',
      'projects': 'Project Tasks'
    }
    return titles[category as keyof typeof titles] || 'Report Data'
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Data...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{getCategoryTitle()}</CardTitle>
          <CardDescription>No data found for the selected filters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Try adjusting your filter criteria to see results.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{getCategoryTitle()}</span>
          <Badge variant="outline" className="ml-2">
            {data.length} {data.length === 1 ? 'record' : 'records'}
          </Badge>
        </CardTitle>
        <CardDescription>
          Showing {startIndex + 1}-{Math.min(endIndex, data.length)} of {data.length} results
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Maintenance</TableHead>
                <TableHead>Location/Project</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    {getTypeIcon(row.type)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {row.name}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={row.description}>
                      {row.description || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatDate(row.date)}
                  </TableCell>
                  <TableCell>
                    {row.quantity ? `${row.quantity}${row.unit ? ` ${row.unit}` : ''}` : '-'}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(row.cost)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {row.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getMaintenanceStatusBadge(row.maintenanceStatus)}
                  </TableCell>
                  <TableCell>
                    <div className="truncate max-w-xs" title={row.location || row.project}>
                      {row.location || row.project || '-'}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeftIcon className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}