import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

interface VendorContact {
  email: string
  phone: string
  address: string
  contactPerson: string
  title: string
}

interface VendorBusiness {
  licenseNumber?: string
  taxId?: string
  insuranceExpiry?: string
  bondAmount?: number
  website?: string
}

interface VendorPerformance {
  totalOrders: number
  totalValue: number
  avgDeliveryTime: number
  onTimeDeliveryRate: number
  qualityRating: number
}

interface Vendor {
  id: string
  name: string
  type: 'supplier' | 'contractor' | 'consultant' | 'other'
  category: string
  status: 'active' | 'inactive' | 'pending' | 'blacklisted'
  rating: number
  contact: VendorContact
  business: VendorBusiness
  performance: VendorPerformance
  notes: string
  tags: string[]
  addedDate: string
  lastUpdated: string
  createdBy?: string
  createdByName?: string
}

// Mock data - In production, this would come from your database
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
      insuranceExpiry: '2024-12-31T00:00:00Z',
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
    addedDate: '2023-06-15T00:00:00Z',
    lastUpdated: '2024-01-15T10:30:00Z',
    createdBy: 'user_123',
    createdByName: 'Mike Johnson'
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
      insuranceExpiry: '2024-11-30T00:00:00Z',
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
    addedDate: '2023-08-20T00:00:00Z',
    lastUpdated: '2024-01-12T14:20:00Z',
    createdBy: 'user_456',
    createdByName: 'Sarah Wilson'
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
      insuranceExpiry: '2024-10-15T00:00:00Z',
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
    addedDate: '2023-05-10T00:00:00Z',
    lastUpdated: '2024-01-08T16:45:00Z',
    createdBy: 'user_789',
    createdByName: 'David Brown'
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
      insuranceExpiry: '2025-03-15T00:00:00Z',
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
    addedDate: '2024-01-05T00:00:00Z',
    lastUpdated: '2024-01-14T09:30:00Z',
    createdBy: 'user_321',
    createdByName: 'Emily Chen'
  },
  {
    id: '5',
    name: 'Green Energy Solutions',
    type: 'contractor',
    category: 'Electrical Services',
    status: 'active',
    rating: 4.6,
    contact: {
      email: 'info@greenenergy.com',
      phone: '+1-555-654-3210',
      address: '555 Solar Drive, Tech District, CA 90210',
      contactPerson: 'Alex Thompson',
      title: 'Operations Manager'
    },
    business: {
      licenseNumber: 'ES-2024-321',
      taxId: '33-7788990',
      insuranceExpiry: '2025-06-30T00:00:00Z',
      bondAmount: 150000,
      website: 'https://greenenergy.com'
    },
    performance: {
      totalOrders: 22,
      totalValue: 175000,
      avgDeliveryTime: 7.2,
      onTimeDeliveryRate: 91,
      qualityRating: 4.4
    },
    notes: 'Specialized in renewable energy systems. Great for sustainable projects.',
    tags: ['electrical', 'renewable', 'sustainable', 'certified'],
    addedDate: '2023-09-12T00:00:00Z',
    lastUpdated: '2024-01-18T11:15:00Z',
    createdBy: 'user_654',
    createdByName: 'Jennifer Miller'
  },
  {
    id: '6',
    name: 'Budget Building Supplies',
    type: 'supplier',
    category: 'General Materials',
    status: 'inactive',
    rating: 3.2,
    contact: {
      email: 'sales@budgetbuilding.com',
      phone: '+1-555-999-8888',
      address: '888 Warehouse Rd, Industrial Zone, TX 77001',
      contactPerson: 'Mike Wilson',
      title: 'Sales Representative'
    },
    business: {
      licenseNumber: 'GS-2023-045',
      taxId: '99-1122334',
      insuranceExpiry: '2024-08-15T00:00:00Z',
      bondAmount: 25000
    },
    performance: {
      totalOrders: 15,
      totalValue: 38000,
      avgDeliveryTime: 6.8,
      onTimeDeliveryRate: 65,
      qualityRating: 3.1
    },
    notes: 'Low cost supplier but quality and reliability issues. Use with caution.',
    tags: ['budget', 'low-cost', 'quality-issues', 'backup'],
    addedDate: '2023-03-22T00:00:00Z',
    lastUpdated: '2023-12-05T08:45:00Z',
    createdBy: 'user_987',
    createdByName: 'Robert Lee'
  }
]

// Helper function to apply filters
function applyFilters(vendors: Vendor[], filters: any) {
  let filtered = [...vendors]

  // Search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    filtered = filtered.filter(vendor =>
      vendor.name.toLowerCase().includes(searchTerm) ||
      vendor.contact.contactPerson.toLowerCase().includes(searchTerm) ||
      vendor.category.toLowerCase().includes(searchTerm) ||
      vendor.notes.toLowerCase().includes(searchTerm) ||
      vendor.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      vendor.contact.email.toLowerCase().includes(searchTerm)
    )
  }

  // Type filter
  if (filters.type && filters.type !== 'all') {
    filtered = filtered.filter(vendor => vendor.type === filters.type)
  }

  // Category filter
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(vendor => vendor.category === filters.category)
  }

  // Status filter
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(vendor => vendor.status === filters.status)
  }

  // Rating filter
  if (filters.rating && filters.rating > 0) {
    filtered = filtered.filter(vendor => vendor.rating >= filters.rating)
  }

  // Location filter
  if (filters.location && filters.location !== 'all') {
    filtered = filtered.filter(vendor => 
      vendor.contact.address.toLowerCase().includes(filters.location.toLowerCase())
    )
  }

  return filtered
}

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filters = {
      search: searchParams.get('search') || '',
      type: searchParams.get('type') || 'all',
      category: searchParams.get('category') || 'all',
      status: searchParams.get('status') || 'all',
      rating: parseFloat(searchParams.get('rating') || '0'),
      location: searchParams.get('location') || 'all',
    }

    const filteredVendors = applyFilters(mockVendors, filters)
    
    // Sort by name
    filteredVendors.sort((a, b) => a.name.localeCompare(b.name))

    // Calculate statistics
    const stats = {
      totalVendors: mockVendors.length,
      activeVendors: mockVendors.filter(v => v.status === 'active').length,
      inactiveVendors: mockVendors.filter(v => v.status === 'inactive').length,
      pendingVendors: mockVendors.filter(v => v.status === 'pending').length,
      blacklistedVendors: mockVendors.filter(v => v.status === 'blacklisted').length,
      totalValue: mockVendors.reduce((sum, v) => sum + v.performance.totalValue, 0),
      avgRating: mockVendors.length > 0 ? mockVendors.reduce((sum, v) => sum + v.rating, 0) / mockVendors.length : 0,
      topPerformers: mockVendors.filter(v => v.rating >= 4.5).length,
      // Additional metrics
      supplierCount: mockVendors.filter(v => v.type === 'supplier').length,
      contractorCount: mockVendors.filter(v => v.type === 'contractor').length,
      consultantCount: mockVendors.filter(v => v.type === 'consultant').length,
      avgOnTimeRate: mockVendors.length > 0 
        ? mockVendors.reduce((sum, v) => sum + v.performance.onTimeDeliveryRate, 0) / mockVendors.length 
        : 0,
      totalOrders: mockVendors.reduce((sum, v) => sum + v.performance.totalOrders, 0)
    }

    // Get unique categories and locations for filters
    const categories = [...new Set(mockVendors.map(v => v.category))].sort()
    const locations = [...new Set(mockVendors.map(v => 
      v.contact.address.split(',').pop()?.trim()
    ).filter(Boolean))].sort()

    return NextResponse.json({
      vendors: filteredVendors,
      stats,
      categories,
      locations,
      total: filteredVendors.length
    })

  } catch (error) {
    console.error('Vendors API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    const requiredFields = ['name', 'type', 'category', 'contact']
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Validate contact fields
    const requiredContactFields = ['email', 'phone', 'contactPerson', 'address']
    for (const field of requiredContactFields) {
      if (!data.contact[field]) {
        return NextResponse.json(
          { error: `Contact ${field} is required` },
          { status: 400 }
        )
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.contact.email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    // Create new vendor
    const newVendor: Vendor = {
      id: Date.now().toString(),
      name: data.name,
      type: data.type,
      category: data.category,
      status: data.status || 'pending',
      rating: data.rating || 0,
      contact: {
        email: data.contact.email,
        phone: data.contact.phone,
        address: data.contact.address,
        contactPerson: data.contact.contactPerson,
        title: data.contact.title || ''
      },
      business: {
        licenseNumber: data.business?.licenseNumber || '',
        taxId: data.business?.taxId || '',
        insuranceExpiry: data.business?.insuranceExpiry || undefined,
        bondAmount: data.business?.bondAmount || undefined,
        website: data.business?.website || ''
      },
      performance: {
        totalOrders: 0,
        totalValue: 0,
        avgDeliveryTime: 0,
        onTimeDeliveryRate: 0,
        qualityRating: data.rating || 0
      },
      notes: data.notes || '',
      tags: data.tags || [],
      addedDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      createdBy: user.id,
      createdByName: user.fullName || user.firstName + ' ' + user.lastName || 'Unknown User'
    }

    // In production, save to database
    mockVendors.push(newVendor)

    return NextResponse.json({
      vendor: newVendor,
      message: 'Vendor created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create vendor error:', error)
    return NextResponse.json(
      { error: 'Failed to create vendor' },
      { status: 500 }
    )
  }
}