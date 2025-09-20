'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VendorsTable } from './VendorsTable'
import { VendorsFilters } from './VendorsFilters'
import { AddVendorDialog } from './AddVendorDialog'
import { useUser } from '@clerk/nextjs'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { 
  Plus,
  Users,
  Building2,
  MapPin,
  Phone,
  Mail,
  Star,
  DollarSign,
  TrendingUp,
  Shield
} from 'lucide-react'

export interface Vendor {
  id: string
  name: string
  type: 'supplier' | 'contractor' | 'consultant' | 'other'
  category: string
  status: 'active' | 'inactive' | 'pending' | 'blacklisted'
  rating: number
  contact: {
    email: string
    phone: string
    address: string
    contactPerson: string
    title: string
  }
  business: {
    licenseNumber?: string
    taxId?: string
    insuranceExpiry?: string
    bondAmount?: number
    website?: string
  }
  performance: {
    totalOrders: number
    totalValue: number
    avgDeliveryTime: number
    onTimeDeliveryRate: number
    qualityRating: number
  }
  notes: string
  tags: string[]
  addedDate: string
  lastUpdated: string
  createdBy?: string
  createdByName?: string
}

export interface VendorFilters {
  search: string
  type: string
  category: string
  status: string
  rating: number
  location: string
}

export interface VendorsStats {
  totalVendors: number
  activeVendors: number
  inactiveVendors: number
  pendingVendors: number
  blacklistedVendors: number
  totalValue: number
  avgRating: number
  topPerformers: number
  supplierCount: number
  contractorCount: number
  consultantCount: number
  avgOnTimeRate: number
  totalOrders: number
}

export function VendorsView() {
  const { user } = useUser()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [stats, setStats] = useState<VendorsStats | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>([])
  const [filters, setFilters] = useState<VendorFilters>({
    search: '',
    type: 'all',
    category: 'all',
    status: 'all',
    rating: 0,
    location: 'all'
  })
  const [selectedVendors, setSelectedVendors] = useState<string[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch vendors data from API
  const fetchVendors = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      
      // Add filter parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all' && value !== 0) {
          params.append(key, value.toString())
        }
      })
      
      const response = await fetch(`/api/vendors?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch vendors')
      }
      
      const data = await response.json()
      setVendors(data.vendors)
      setStats(data.stats)
      setCategories(data.categories)
      setLocations(data.locations)
      
    } catch (error) {
      console.error('Error fetching vendors:', error)
      toast.error('Failed to load vendors data')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Initial data fetch
  useEffect(() => {
    fetchVendors()
  }, []) // Remove filters dependency to avoid refetch on every filter change

  // Refetch data when filters change
  useEffect(() => {
    fetchVendors()
  }, [filters])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Vendor
          </Button>
          
          {selectedVendors.length > 0 && (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {selectedVendors.length} selected
              </Badge>
              <Button variant="outline" size="sm">
                Bulk Actions
              </Button>
              <Button variant="outline" size="sm">
                Export Selected
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 w-full max-w-full">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats?.totalVendors || 0}</div>
            <p className="text-xs text-muted-foreground">All registered vendors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Building2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{isLoading ? '...' : stats?.activeVendors || 0}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Shield className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{isLoading ? '...' : stats?.pendingVendors || 0}</div>
            <p className="text-xs text-muted-foreground">Under review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : formatCurrency(stats?.totalValue || 0)}</div>
            <p className="text-xs text-muted-foreground">All transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : (stats?.avgRating || 0).toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Overall performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{isLoading ? '...' : stats?.topPerformers || 0}</div>
            <p className="text-xs text-muted-foreground">4.5+ star rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <VendorsFilters
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories}
        locations={locations}
        isLoading={isLoading}
      />

      {/* Main Content */}
      <Tabs defaultValue="vendors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vendors">All Vendors</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="contractors">Contractors</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="vendors" className="space-y-4">
          <VendorsTable
            vendors={vendors}
            selectedVendors={selectedVendors}
            onSelectedVendorsChange={setSelectedVendors}
            onVendorUpdate={fetchVendors}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <VendorsTable
            vendors={vendors.filter(v => v.type === 'supplier')}
            selectedVendors={selectedVendors}
            onSelectedVendorsChange={setSelectedVendors}
            onVendorUpdate={fetchVendors}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="contractors" className="space-y-4">
          <VendorsTable
            vendors={vendors.filter(v => v.type === 'contractor')}
            selectedVendors={selectedVendors}
            onSelectedVendorsChange={setSelectedVendors}
            onVendorUpdate={fetchVendors}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">Loading performance data...</div>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 w-full max-w-full">
              {vendors
                .sort((a, b) => b.rating - a.rating)
                .map((vendor) => (
                  <Card key={vendor.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{vendor.name}</CardTitle>
                          <CardDescription>
                            {vendor.type} • {vendor.category}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            vendor.rating >= 4.5 ? 'default' :
                            vendor.rating >= 4.0 ? 'secondary' : 'outline'
                          }>
                            <Star className="h-3 w-3 mr-1" />
                            {vendor.rating}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Total Orders</p>
                            <p className="font-medium">{vendor.performance.totalOrders}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total Value</p>
                            <p className="font-medium">{formatCurrency(vendor.performance.totalValue)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">On-Time Rate</p>
                            <p className="font-medium">{vendor.performance.onTimeDeliveryRate}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Quality Rating</p>
                            <p className="font-medium">{vendor.performance.qualityRating}/5</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {vendor.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {vendor.notes && (
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm">{vendor.notes}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Vendor Dialog */}
      <AddVendorDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onVendorAdded={() => {
          fetchVendors()
          setIsAddDialogOpen(false)
        }}
        categories={categories}
      />
    </div>
  )
}