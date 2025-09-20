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
    insuranceExpiry?: Date
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
  addedDate: Date
  lastUpdated: Date
}

export interface VendorFilters {
  search: string
  type: string
  category: string
  status: string
  rating: number
  location: string
}

export function VendorsView() {
  const { user } = useUser()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([])
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

  // Mock data initialization
  useEffect(() => {
    const mockVendors: Vendor[] = [
      {
        id: '1',
        name: 'ABC Construction Supplies',
        type: 'supplier',
        category: 'Building Materials',
        status: 'active',
        rating: 4.5,
        contact: {
          email: 'orders@abcsupplies.com',
          phone: '+1-555-123-4567',
          address: '123 Industrial Ave, Manufacturing District, NY 10001',
          contactPerson: 'John Smith',
          title: 'Sales Manager'
        },
        business: {
          licenseNumber: 'BS-2024-001',
          taxId: '12-3456789',
          insuranceExpiry: new Date('2024-12-31'),
          bondAmount: 50000,
          website: 'https://abcsupplies.com'
        },
        performance: {
          totalOrders: 45,
          totalValue: 125000,
          avgDeliveryTime: 3.2,
          onTimeDeliveryRate: 92,
          qualityRating: 4.3
        },
        notes: 'Reliable supplier with excellent quality materials. Always delivers on time.',
        tags: ['cement', 'steel', 'reliable', 'bulk-orders'],
        addedDate: new Date('2023-06-15'),
        lastUpdated: new Date('2024-01-15')
      },
      {
        id: '2',
        name: 'Elite Concrete Works',
        type: 'contractor',
        category: 'Concrete Services',
        status: 'active',
        rating: 4.8,
        contact: {
          email: 'info@eliteconcrete.com',
          phone: '+1-555-987-6543',
          address: '456 Construction Blvd, Industrial Park, NY 10002',
          contactPerson: 'Maria Garcia',
          title: 'Project Manager'
        },
        business: {
          licenseNumber: 'CC-2024-102',
          taxId: '98-7654321',
          insuranceExpiry: new Date('2024-11-30'),
          bondAmount: 100000,
          website: 'https://eliteconcrete.com'
        },
        performance: {
          totalOrders: 28,
          totalValue: 280000,
          avgDeliveryTime: 5.1,
          onTimeDeliveryRate: 96,
          qualityRating: 4.7
        },
        notes: 'Premium concrete contractor with exceptional quality work. Higher cost but worth it.',
        tags: ['concrete', 'premium', 'experienced', 'commercial'],
        addedDate: new Date('2023-08-20'),
        lastUpdated: new Date('2024-01-12')
      },
      {
        id: '3',
        name: 'Metropolitan Steel Ltd.',
        type: 'supplier',
        category: 'Steel & Metals',
        status: 'active',
        rating: 3.9,
        contact: {
          email: 'sales@metrosteel.com',
          phone: '+1-555-456-7890',
          address: '789 Steel Ave, Heavy Industry Zone, NY 10003',
          contactPerson: 'Robert Davis',
          title: 'Account Executive'
        },
        business: {
          licenseNumber: 'MS-2024-205',
          taxId: '55-9988776',
          insuranceExpiry: new Date('2024-10-15'),
          bondAmount: 75000
        },
        performance: {
          totalOrders: 32,
          totalValue: 95000,
          avgDeliveryTime: 4.8,
          onTimeDeliveryRate: 78,
          qualityRating: 3.8
        },
        notes: 'Good prices but sometimes delays in delivery. Quality is acceptable.',
        tags: ['steel', 'rebar', 'budget-friendly', 'sometimes-delayed'],
        addedDate: new Date('2023-05-10'),
        lastUpdated: new Date('2024-01-08')
      },
      {
        id: '4',
        name: 'Precision Engineering Co.',
        type: 'consultant',
        category: 'Engineering Services',
        status: 'pending',
        rating: 4.2,
        contact: {
          email: 'contact@precision-eng.com',
          phone: '+1-555-321-9876',
          address: '321 Professional Plaza, Business District, NY 10004',
          contactPerson: 'Dr. Sarah Johnson',
          title: 'Principal Engineer'
        },
        business: {
          licenseNumber: 'PE-2024-089',
          taxId: '77-4455663',
          insuranceExpiry: new Date('2025-03-15'),
          bondAmount: 200000,
          website: 'https://precision-eng.com'
        },
        performance: {
          totalOrders: 8,
          totalValue: 45000,
          avgDeliveryTime: 12.5,
          onTimeDeliveryRate: 88,
          qualityRating: 4.5
        },
        notes: 'New consultant under evaluation. Strong technical background and credentials.',
        tags: ['engineering', 'structural', 'consulting', 'evaluation'],
        addedDate: new Date('2024-01-05'),
        lastUpdated: new Date('2024-01-14')
      }
    ]

    setVendors(mockVendors)
    setFilteredVendors(mockVendors)
  }, [])

  // Apply filters
  useEffect(() => {
    const filtered = vendors.filter(vendor => {
      const matchesSearch = 
        vendor.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        vendor.contact.contactPerson.toLowerCase().includes(filters.search.toLowerCase()) ||
        vendor.category.toLowerCase().includes(filters.search.toLowerCase()) ||
        vendor.notes.toLowerCase().includes(filters.search.toLowerCase()) ||
        vendor.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()))

      const matchesType = filters.type === 'all' || vendor.type === filters.type
      const matchesCategory = filters.category === 'all' || vendor.category === filters.category
      const matchesStatus = filters.status === 'all' || vendor.status === filters.status
      const matchesRating = filters.rating === 0 || vendor.rating >= filters.rating
      const matchesLocation = filters.location === 'all' || 
        vendor.contact.address.toLowerCase().includes(filters.location.toLowerCase())

      return matchesSearch && matchesType && matchesCategory && matchesStatus && 
             matchesRating && matchesLocation
    })

    setFilteredVendors(filtered)
  }, [vendors, filters])

  // Calculate stats
  const stats = {
    totalVendors: vendors.length,
    activeVendors: vendors.filter(v => v.status === 'active').length,
    pendingVendors: vendors.filter(v => v.status === 'pending').length,
    totalValue: vendors.reduce((sum, v) => sum + v.performance.totalValue, 0),
    avgRating: vendors.length > 0 ? vendors.reduce((sum, v) => sum + v.rating, 0) / vendors.length : 0,
    topPerformers: vendors.filter(v => v.rating >= 4.5).length
  }

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
            <div className="text-2xl font-bold">{stats.totalVendors}</div>
            <p className="text-xs text-muted-foreground">All registered vendors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Building2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeVendors}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Shield className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingVendors}</div>
            <p className="text-xs text-muted-foreground">Under review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">All transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Overall performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.topPerformers}</div>
            <p className="text-xs text-muted-foreground">4.5+ star rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <VendorsFilters
        filters={filters}
        onFiltersChange={setFilters}
        vendors={vendors}
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
            vendors={filteredVendors}
            selectedVendors={selectedVendors}
            onSelectedVendorsChange={setSelectedVendors}
            onVendorUpdate={(vendorId, updates) => {
              setVendors(prev => prev.map(vendor => 
                vendor.id === vendorId ? { ...vendor, ...updates } : vendor
              ))
            }}
          />
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <VendorsTable
            vendors={filteredVendors.filter(v => v.type === 'supplier')}
            selectedVendors={selectedVendors}
            onSelectedVendorsChange={setSelectedVendors}
            onVendorUpdate={(vendorId, updates) => {
              setVendors(prev => prev.map(vendor => 
                vendor.id === vendorId ? { ...vendor, ...updates } : vendor
              ))
            }}
          />
        </TabsContent>

        <TabsContent value="contractors" className="space-y-4">
          <VendorsTable
            vendors={filteredVendors.filter(v => v.type === 'contractor')}
            selectedVendors={selectedVendors}
            onSelectedVendorsChange={setSelectedVendors}
            onVendorUpdate={(vendorId, updates) => {
              setVendors(prev => prev.map(vendor => 
                vendor.id === vendorId ? { ...vendor, ...updates } : vendor
              ))
            }}
          />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 w-full max-w-full">
            {filteredVendors
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
        </TabsContent>
      </Tabs>

      {/* Add Vendor Dialog */}
      <AddVendorDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onVendorAdded={(newVendor) => {
          setVendors(prev => [...prev, newVendor])
          setIsAddDialogOpen(false)
        }}
      />
    </div>
  )
}