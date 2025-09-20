'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { DateRange } from 'react-day-picker'
import { 
  Filter,
  X,
  Calendar,
  BarChart3,
  DollarSign,
  Package,
  ShoppingCart,
  FileText
} from 'lucide-react'

interface ReportsFiltersProps {
  selectedDateRange?: DateRange
  selectedReportType?: string
  selectedCategory?: string
  selectedStatus?: string
  onDateRangeChange: (dateRange: DateRange | undefined) => void
  onReportTypeChange: (type: string) => void
  onCategoryChange: (category: string) => void
  onStatusChange: (status: string) => void
  onClearFilters: () => void
}

export function ReportsFilters({
  selectedDateRange,
  selectedReportType = 'all',
  selectedCategory = 'all',
  selectedStatus = 'all',
  onDateRangeChange,
  onReportTypeChange,
  onCategoryChange,
  onStatusChange,
  onClearFilters
}: ReportsFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'financial':
        return <DollarSign className="h-4 w-4" />
      case 'project':
        return <BarChart3 className="h-4 w-4" />
      case 'inventory':
        return <Package className="h-4 w-4" />
      case 'procurement':
        return <ShoppingCart className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const activeFiltersCount = [
    selectedDateRange && (selectedDateRange.from || selectedDateRange.to),
    selectedReportType !== 'all',
    selectedCategory !== 'all',
    selectedStatus !== 'all'
  ].filter(Boolean).length

  const hasActiveFilters = activeFiltersCount > 0

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Filter className="h-5 w-5" />
            <span>Report Filters</span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="text-muted-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Primary Filters - Always Visible */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <DatePickerWithRange
              date={selectedDateRange}
              onDateChange={onDateRangeChange}
              placeholder="Select date range..."
              className="w-full"
            />
          </div>

          {/* Report Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Report Type</label>
            <Select value={selectedReportType} onValueChange={onReportTypeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All reports" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>All Reports</span>
                  </div>
                </SelectItem>
                <SelectItem value="financial">
                  <div className="flex items-center space-x-2">
                    {getReportTypeIcon('financial')}
                    <span>Financial</span>
                  </div>
                </SelectItem>
                <SelectItem value="project">
                  <div className="flex items-center space-x-2">
                    {getReportTypeIcon('project')}
                    <span>Project</span>
                  </div>
                </SelectItem>
                <SelectItem value="inventory">
                  <div className="flex items-center space-x-2">
                    {getReportTypeIcon('inventory')}
                    <span>Inventory</span>
                  </div>
                </SelectItem>
                <SelectItem value="procurement">
                  <div className="flex items-center space-x-2">
                    {getReportTypeIcon('procurement')}
                    <span>Procurement</span>
                  </div>
                </SelectItem>
                <SelectItem value="custom">
                  <div className="flex items-center space-x-2">
                    {getReportTypeIcon('custom')}
                    <span>Custom</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="construction">Construction</SelectItem>
                <SelectItem value="infrastructure">Infrastructure</SelectItem>
                <SelectItem value="renovation">Renovation</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="installation">Installation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={selectedStatus} onValueChange={onStatusChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="generating">Generating</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Extended Filters - Collapsible */}
        {isExpanded && (
          <>
            <Separator />
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              {/* Frequency Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Frequency</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All frequencies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Frequencies</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select>
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

              {/* Department Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="procurement">Procurement</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Quick Filter Presets */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quick Filters</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date()
                    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
                    onDateRangeChange({ from: lastMonth, to: today })
                  }}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Last 30 Days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date()
                    const lastQuarter = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate())
                    onDateRangeChange({ from: lastQuarter, to: today })
                  }}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Last Quarter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date()
                    const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
                    onDateRangeChange({ from: lastYear, to: today })
                  }}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Last Year
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReportTypeChange('financial')}
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  Financial Only
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReportTypeChange('project')}
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Project Only
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <>
            <Separator />
            <div className="space-y-2">
              <label className="text-sm font-medium">Active Filters:</label>
              <div className="flex flex-wrap gap-2">
                {selectedDateRange && (selectedDateRange.from || selectedDateRange.to) && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {selectedDateRange.from ? selectedDateRange.from.toLocaleDateString() : 'Start'} - {' '}
                      {selectedDateRange.to ? selectedDateRange.to.toLocaleDateString() : 'End'}
                    </span>
                    <button 
                      onClick={() => onDateRangeChange(undefined)}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedReportType !== 'all' && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    {getReportTypeIcon(selectedReportType)}
                    <span className="capitalize">{selectedReportType}</span>
                    <button 
                      onClick={() => onReportTypeChange('all')}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedCategory !== 'all' && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <span className="capitalize">{selectedCategory}</span>
                    <button 
                      onClick={() => onCategoryChange('all')}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedStatus !== 'all' && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <span className="capitalize">{selectedStatus}</span>
                    <button 
                      onClick={() => onStatusChange('all')}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}