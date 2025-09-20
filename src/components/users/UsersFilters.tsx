'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Separator } from '@/components/ui/separator'
import { Search, Filter, X, Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { UserFilters, User } from './UsersView'

interface UsersFiltersProps {
  filters: UserFilters
  onFiltersChange: (filters: UserFilters) => void
  users: User[]
}

interface DateRange {
  from?: Date
  to?: Date
}

export function UsersFilters({ filters, onFiltersChange, users }: UsersFiltersProps) {
  // Get unique filter options from users data
  const roles = [...new Set(users.map(u => u.role))]
  const departments = [...new Set(users.map(u => u.department))]
  const statuses = [...new Set(users.map(u => u.status))]
  
  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      role: 'all',
      department: 'all', 
      status: 'all',
      permissions: 'all'
    })
  }

  const hasActiveFilters = 
    filters.search ||
    filters.role !== 'all' ||
    filters.department !== 'all' ||
    filters.status !== 'all' ||
    filters.permissions !== 'all'

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.role !== 'all') count++
    if (filters.department !== 'all') count++
    if (filters.status !== 'all') count++
    if (filters.permissions !== 'all') count++
    return count
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name, email, department, position, or tags..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="pl-10 pr-10"
            />
            {filters.search && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => onFiltersChange({ ...filters, search: '' })}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Role Filter */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Role</Label>
              <Select
                value={filters.role}
                onValueChange={(value) => onFiltersChange({ ...filters, role: value })}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role} value={role} className="capitalize">
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Department Filter */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Department</Label>
              <Select
                value={filters.department}
                onValueChange={(value) => onFiltersChange({ ...filters, department: value })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status} className="capitalize">
                      <Badge 
                        variant="outline" 
                        className={`mr-2 ${
                          status === 'active' ? 'bg-green-100 text-green-800' :
                          status === 'pending' ? 'bg-orange-100 text-orange-800' :
                          status === 'suspended' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {status}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Permission Level Filter */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Min Permission</Label>
              <Select
                value={filters.permissions}
                onValueChange={(value) => onFiltersChange({ ...filters, permissions: value })}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Permission</SelectItem>
                  <SelectItem value="admin">Admin Only</SelectItem>
                  <SelectItem value="write">Write or Admin</SelectItem>
                  <SelectItem value="read">Read or Higher</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Filters */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced
                  {getActiveFiltersCount() > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                    >
                      {getActiveFiltersCount()}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Quick Filters</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={filters.status === 'active' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onFiltersChange({ 
                          ...filters, 
                          status: filters.status === 'active' ? 'all' : 'active' 
                        })}
                      >
                        Active Users
                      </Button>
                      <Button
                        variant={filters.status === 'pending' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onFiltersChange({ 
                          ...filters, 
                          status: filters.status === 'pending' ? 'all' : 'pending' 
                        })}
                      >
                        Pending Invites
                      </Button>
                      <Button
                        variant={filters.role === 'admin' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onFiltersChange({ 
                          ...filters, 
                          role: filters.role === 'admin' ? 'all' : 'admin' 
                        })}
                      >
                        Admins Only
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">User Roles</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {['admin', 'manager', 'supervisor', 'worker', 'contractor'].map(role => {
                        const count = users.filter(u => u.role === role).length
                        return (
                          <Button
                            key={role}
                            variant={filters.role === role ? 'default' : 'outline'}
                            size="sm"
                            className="justify-between"
                            onClick={() => onFiltersChange({ 
                              ...filters, 
                              role: filters.role === role ? 'all' : role 
                            })}
                          >
                            <span className="capitalize">{role}</span>
                            <Badge variant="secondary">{count}</Badge>
                          </Button>
                        )
                      })}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Departments</Label>
                    <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
                      {departments.map(dept => {
                        const count = users.filter(u => u.department === dept).length
                        return (
                          <Button
                            key={dept}
                            variant={filters.department === dept ? 'default' : 'ghost'}
                            size="sm"
                            className="justify-between"
                            onClick={() => onFiltersChange({ 
                              ...filters, 
                              department: filters.department === dept ? 'all' : dept 
                            })}
                          >
                            <span>{dept}</span>
                            <Badge variant="secondary">{count}</Badge>
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">Active filters:</span>
              
              {filters.search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: "{filters.search}"
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => onFiltersChange({ ...filters, search: '' })}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {filters.role !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1 capitalize">
                  Role: {filters.role}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => onFiltersChange({ ...filters, role: 'all' })}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {filters.department !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Dept: {filters.department}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => onFiltersChange({ ...filters, department: 'all' })}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {filters.status !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1 capitalize">
                  Status: {filters.status}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => onFiltersChange({ ...filters, status: 'all' })}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {filters.permissions !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1 capitalize">
                  Min Perm: {filters.permissions}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => onFiltersChange({ ...filters, permissions: 'all' })}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          )}

          {/* Results Summary */}
          <div className="text-xs text-muted-foreground">
            Showing {users.length} user{users.length !== 1 ? 's' : ''}
            {hasActiveFilters && (
              <>
                {' '} matching your filters
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 ml-1 text-xs underline"
                  onClick={clearAllFilters}
                >
                  (show all)
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
