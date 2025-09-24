'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, FilterIcon, DownloadIcon, RefreshCwIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export interface FilterOptions {
  startDate: Date | undefined
  endDate: Date | undefined
  category: 'all' | 'inventory' | 'equipment' | 'projects'
}

interface ReportsFiltersProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  onExportCSV: () => void
  onRefresh: () => void
  isLoading?: boolean
}

export function ReportsFilters({
  filters,
  onFiltersChange,
  onExportCSV,
  onRefresh,
  isLoading = false
}: ReportsFiltersProps) {
  const handleDateChange = (field: 'startDate' | 'endDate', date: Date | undefined) => {
    onFiltersChange({
      ...filters,
      [field]: date
    })
  }

  const handleCategoryChange = (value: string) => {
    onFiltersChange({
      ...filters,
      category: value as FilterOptions['category']
    })
  }

  const handleReset = () => {
    const defaultFilters: FilterOptions = {
      startDate: undefined,
      endDate: undefined,
      category: 'all'
    }
    onFiltersChange(defaultFilters)
  }

  const getCategoryLabel = (category: string) => {
    const labels = {
      'all': 'All Data',
      'inventory': 'Inventory Transactions',
      'equipment': 'Equipment Transactions', 
      'projects': 'Project Tasks'
    }
    return labels[category as keyof typeof labels] || 'All Data'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FilterIcon className="h-5 w-5" />
          Report Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Date Range Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Start Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.startDate ? format(filters.startDate, "PPP") : "Pick start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.startDate}
                    onSelect={(date) => handleDateChange('startDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                End Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.endDate ? format(filters.endDate, "PPP") : "Pick end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.endDate}
                    onSelect={(date) => handleDateChange('endDate', date)}
                    disabled={(date) => 
                      filters.startDate ? date < filters.startDate : false
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <Label htmlFor="category">Data Category</Label>
            <Select value={filters.category} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Data</SelectItem>
                <SelectItem value="inventory">Inventory Transactions</SelectItem>
                <SelectItem value="equipment">Equipment Transactions</SelectItem>
                <SelectItem value="projects">Project Tasks</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 justify-between items-center pt-4 border-t">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleReset}
              >
                Reset Filters
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCwIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button 
                size="sm" 
                onClick={onExportCSV}
                className="bg-green-600 hover:bg-green-700"
              >
                <DownloadIcon className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Filter Summary */}
          {(filters.startDate || filters.endDate || filters.category !== 'all') && (
            <div className="bg-muted p-3 rounded-md text-sm">
              <span className="font-medium">Active Filters: </span>
              {filters.startDate && (
                <span className="text-blue-600">
                  From {format(filters.startDate, 'MMM dd, yyyy')} 
                </span>
              )}
              {filters.startDate && filters.endDate && <span> • </span>}
              {filters.endDate && (
                <span className="text-blue-600">
                  To {format(filters.endDate, 'MMM dd, yyyy')} 
                </span>
              )}
              {(filters.startDate || filters.endDate) && filters.category !== 'all' && <span> • </span>}
              {filters.category !== 'all' && (
                <span className="text-purple-600">
                  {getCategoryLabel(filters.category)}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
