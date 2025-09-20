'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { PurchaseOrder, type ProcurementFilters } from './ProcurementView'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Search,
  Filter,
  X,
  CalendarIcon
} from 'lucide-react'
import { format } from 'date-fns'
import { DateRange } from 'react-day-picker'

interface ProcurementFiltersProps {
  filters: ProcurementFilters
  onFiltersChange: (filters: ProcurementFilters) => void
  purchaseOrders: PurchaseOrder[]
}

export function ProcurementFilters({
  filters,
  onFiltersChange,
  purchaseOrders
}: ProcurementFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Get unique values for filter options
  const uniqueSuppliers = [...new Set(purchaseOrders.map(o => o.supplier))].sort()
  const uniqueProjects = [...new Set(purchaseOrders.map(o => o.project))].sort()

  const handleFilterChange = (key: keyof ProcurementFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      priority: 'all',
      supplier: 'all',
      project: 'all',
      dateRange: { from: undefined, to: undefined }
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.status !== 'all') count++
    if (filters.priority !== 'all') count++
    if (filters.supplier !== 'all') count++
    if (filters.project !== 'all') count++
    if (filters.dateRange.from || filters.dateRange.to) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search and Filter Toggle */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders, suppliers, projects..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              className="relative"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {/* Expanded Filters */}
          {isExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="ordered">Ordered</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={filters.priority}
                  onValueChange={(value) => handleFilterChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Supplier Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Supplier</label>
                <Select
                  value={filters.supplier}
                  onValueChange={(value) => handleFilterChange('supplier', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All suppliers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Suppliers</SelectItem>
                    {uniqueSuppliers.map((supplier) => (
                      <SelectItem key={supplier} value={supplier}>
                        {supplier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Project Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Project</label>
                <Select
                  value={filters.project}
                  onValueChange={(value) => handleFilterChange('project', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {uniqueProjects.map((project) => (
                      <SelectItem key={project} value={project}>
                        {project}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Order Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${
                        !filters.dateRange.from && !filters.dateRange.to && "text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.from ? (
                        filters.dateRange.to ? (
                          <>
                            {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                            {format(filters.dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(filters.dateRange.from, "LLL dd, y")
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
                      defaultMonth={filters.dateRange.from}
                      selected={{
                        from: filters.dateRange.from,
                        to: filters.dateRange.to
                      } as DateRange}
                      onSelect={(range) => {
                        handleFilterChange('dateRange', {
                          from: range?.from,
                          to: range?.to
                        })
                      }}
                      numberOfMonths={2}
                    />
                    <div className="p-3 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFilterChange('dateRange', { from: undefined, to: undefined })}
                        className="w-full"
                      >
                        Clear dates
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              
              {filters.search && (
                <Badge variant="secondary" className="text-xs">
                  Search: "{filters.search}"
                  <button
                    onClick={() => handleFilterChange('search', '')}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filters.status !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Status: {filters.status}
                  <button
                    onClick={() => handleFilterChange('status', 'all')}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filters.priority !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Priority: {filters.priority}
                  <button
                    onClick={() => handleFilterChange('priority', 'all')}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filters.supplier !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Supplier: {filters.supplier}
                  <button
                    onClick={() => handleFilterChange('supplier', 'all')}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filters.project !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Project: {filters.project}
                  <button
                    onClick={() => handleFilterChange('project', 'all')}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {(filters.dateRange.from || filters.dateRange.to) && (
                <Badge variant="secondary" className="text-xs">
                  Date: {filters.dateRange.from ? format(filters.dateRange.from, 'MMM dd') : 'Start'} - {filters.dateRange.to ? format(filters.dateRange.to, 'MMM dd') : 'End'}
                  <button
                    onClick={() => handleFilterChange('dateRange', { from: undefined, to: undefined })}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}