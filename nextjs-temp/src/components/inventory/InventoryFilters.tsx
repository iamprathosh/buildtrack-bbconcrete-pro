'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { InventoryItem, InventoryFilters as IInventoryFilters } from './InventoryView'
import { Search, Filter, X } from 'lucide-react'

interface InventoryFiltersProps {
  filters: IInventoryFilters
  onFiltersChange: (filters: IInventoryFilters) => void
  inventory: InventoryItem[]
}

export function InventoryFilters({ filters, onFiltersChange, inventory }: InventoryFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Get unique values for filter options
  const categories = [...new Set(inventory.map(item => item.category))].sort()
  const locations = [...new Set(inventory.map(item => item.location))].sort()
  const suppliers = [...new Set(inventory.map(item => item.supplier))].sort()
  
  const handleFilterChange = (key: keyof IInventoryFilters, value: string | number | number[] | { from: Date | undefined; to: Date | undefined }) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      category: 'all',
      location: 'all',
      status: 'all',
      supplier: 'all',
      priceRange: [0, 10000],
      stockRange: [0, 1000]
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.category !== 'all') count++
    if (filters.location !== 'all') count++
    if (filters.status !== 'all') count++
    if (filters.supplier !== 'all') count++
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) count++
    if (filters.stockRange[0] > 0 || filters.stockRange[1] < 1000) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Filter and search your inventory
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Basic' : 'Advanced'}
            </Button>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Basic Filters */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full max-w-full">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category */}
          <Select 
            value={filters.category} 
            onValueChange={(value) => handleFilterChange('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status */}
          <Select 
            value={filters.status} 
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="low-stock">Low Stock</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              <SelectItem value="discontinued">Discontinued</SelectItem>
            </SelectContent>
          </Select>

          {/* Location */}
          <Select 
            value={filters.location} 
            onValueChange={(value) => handleFilterChange('location', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map(location => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="border-t pt-4">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Supplier */}
              <Select 
                value={filters.supplier} 
                onValueChange={(value) => handleFilterChange('supplier', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Suppliers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Suppliers</SelectItem>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier} value={supplier}>
                      {supplier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Price Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Price Range ($)</label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange[0]}
                    onChange={(e) => handleFilterChange('priceRange', [
                      Number(e.target.value) || 0, 
                      filters.priceRange[1]
                    ])}
                    className="w-full"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange[1]}
                    onChange={(e) => handleFilterChange('priceRange', [
                      filters.priceRange[0], 
                      Number(e.target.value) || 10000
                    ])}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Stock Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Stock Range</label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.stockRange[0]}
                    onChange={(e) => handleFilterChange('stockRange', [
                      Number(e.target.value) || 0, 
                      filters.stockRange[1]
                    ])}
                    className="w-full"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.stockRange[1]}
                    onChange={(e) => handleFilterChange('stockRange', [
                      filters.stockRange[0], 
                      Number(e.target.value) || 1000
                    ])}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="border-t pt-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              
              {filters.search && (
                <Badge variant="outline" className="gap-1">
                  Search: {filters.search}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange('search', '')}
                  />
                </Badge>
              )}
              
              {filters.category !== 'all' && (
                <Badge variant="outline" className="gap-1">
                  Category: {filters.category}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange('category', 'all')}
                  />
                </Badge>
              )}
              
              {filters.status !== 'all' && (
                <Badge variant="outline" className="gap-1">
                  Status: {filters.status.replace('-', ' ')}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange('status', 'all')}
                  />
                </Badge>
              )}
              
              {filters.location !== 'all' && (
                <Badge variant="outline" className="gap-1">
                  Location: {filters.location}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange('location', 'all')}
                  />
                </Badge>
              )}
              
              {filters.supplier !== 'all' && (
                <Badge variant="outline" className="gap-1">
                  Supplier: {filters.supplier}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange('supplier', 'all')}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}