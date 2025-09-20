'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Vendor, VendorFilters } from './VendorsView'
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
  Star
} from 'lucide-react'

interface VendorsFiltersProps {
  filters: VendorFilters
  onFiltersChange: (filters: VendorFilters) => void
  categories: string[]
  locations: string[]
  isLoading?: boolean
}

export function VendorsFilters({
  filters,
  onFiltersChange,
  categories,
  locations,
  isLoading = false
}: VendorsFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (key: keyof VendorFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      type: 'all',
      category: 'all',
      status: 'all',
      rating: 0,
      location: 'all'
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.type !== 'all') count++
    if (filters.category !== 'all') count++
    if (filters.status !== 'all') count++
    if (filters.rating > 0) count++
    if (filters.location !== 'all') count++
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
                placeholder="Search vendors, contacts, categories..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              className="relative"
              disabled={isLoading}
            >
              <Filter className="h-4 w-4 mr-2" />
              {isLoading ? 'Loading...' : 'Filters'}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 pt-4 border-t">
              {/* Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => handleFilterChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="supplier">Supplier</SelectItem>
                    <SelectItem value="contractor">Contractor</SelectItem>
                    <SelectItem value="consultant">Consultant</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => handleFilterChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="blacklisted">Blacklisted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Rating Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Min Rating</label>
                <Select
                  value={filters.rating.toString()}
                  onValueChange={(value) => handleFilterChange('rating', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any Rating</SelectItem>
                    <SelectItem value="1">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1" />
                        1+ Stars
                      </div>
                    </SelectItem>
                    <SelectItem value="2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1" />
                        2+ Stars
                      </div>
                    </SelectItem>
                    <SelectItem value="3">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1" />
                        3+ Stars
                      </div>
                    </SelectItem>
                    <SelectItem value="4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1" />
                        4+ Stars
                      </div>
                    </SelectItem>
                    <SelectItem value="5">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1" />
                        5 Stars Only
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Select
                  value={filters.location}
                  onValueChange={(value) => handleFilterChange('location', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

              {filters.type !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Type: {filters.type}
                  <button
                    onClick={() => handleFilterChange('type', 'all')}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filters.category !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Category: {filters.category}
                  <button
                    onClick={() => handleFilterChange('category', 'all')}
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

              {filters.rating > 0 && (
                <Badge variant="secondary" className="text-xs">
                  Rating: {filters.rating}+ stars
                  <button
                    onClick={() => handleFilterChange('rating', 0)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filters.location !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Location: {filters.location}
                  <button
                    onClick={() => handleFilterChange('location', 'all')}
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