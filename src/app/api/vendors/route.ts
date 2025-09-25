import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { auth } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase-server'

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

    // Read from existing vendors table
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('vendors')
      .select('*')

    if (error) {
      console.error('Supabase vendors query error:', error)
      return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 })
    }

    const allVendors = (data || []) as any[]

    // Map DB rows to the UI Vendor shape safely
    const mapRowToVendor = (row: any): Vendor => {
      const addressParts = [
        row.address_line_1,
        row.address_line_2,
        row.city,
        row.state,
        row.zip_code,
        row.country,
      ].filter(Boolean)
      const address = addressParts.join(', ')

      return {
        id: row.id?.toString?.() || row.id,
        name: row.name || '',
        type: 'other',
        category: 'Uncategorized',
        status: 'pending',
        rating: 0,
        contact: {
          email: row.email || '',
          phone: row.phone || '',
          address,
          contactPerson: row.contact_name || '',
          title: ''
        },
        business: {},
        performance: {
          totalOrders: 0,
          totalValue: 0,
          avgDeliveryTime: 0,
          onTimeDeliveryRate: 0,
          qualityRating: 0,
        },
        notes: '',
        tags: [],
        addedDate: row.created_at || new Date().toISOString(),
        lastUpdated: row.updated_at || row.created_at || new Date().toISOString(),
        createdBy: undefined,
        createdByName: undefined,
      }
    }

    const vendorsMapped = allVendors.map(mapRowToVendor)

    // Apply filters in-memory to keep parity with existing UI behavior
    const filteredVendors = applyFilters(vendorsMapped, filters)

    // Sort by name
    filteredVendors.sort((a, b) => a.name.localeCompare(b.name))

    // Calculate statistics from the full dataset
    const stats = {
      totalVendors: vendorsMapped.length,
      activeVendors: vendorsMapped.filter(v => v.status === 'active').length,
      inactiveVendors: vendorsMapped.filter(v => v.status === 'inactive').length,
      pendingVendors: vendorsMapped.filter(v => v.status === 'pending').length,
      blacklistedVendors: vendorsMapped.filter(v => v.status === 'blacklisted').length,
      totalValue: vendorsMapped.reduce((sum, v) => sum + (v.performance.totalValue || 0), 0),
      avgRating: vendorsMapped.length > 0 ? vendorsMapped.reduce((sum, v) => sum + (v.rating || 0), 0) / vendorsMapped.length : 0,
      topPerformers: vendorsMapped.filter(v => (v.rating || 0) >= 4.5).length,
      supplierCount: vendorsMapped.filter(v => v.type === 'supplier').length,
      contractorCount: vendorsMapped.filter(v => v.type === 'contractor').length,
      consultantCount: vendorsMapped.filter(v => v.type === 'consultant').length,
      avgOnTimeRate: vendorsMapped.length > 0 
        ? vendorsMapped.reduce((sum, v) => sum + (v.performance.onTimeDeliveryRate || 0), 0) / vendorsMapped.length 
        : 0,
      totalOrders: vendorsMapped.reduce((sum, v) => sum + (v.performance.totalOrders || 0), 0)
    }

    // Get unique categories and locations for filters
    const categories = [...new Set(vendorsMapped.map(v => v.category).filter(Boolean))].sort()
    const locations = [...new Set(
      vendorsMapped
        .map(v => (v.contact?.address || '')
          .toString()
          .split(',')
          .pop()?.trim())
        .filter(Boolean)
    )].sort()

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
    // Use Clerk auth to get a Supabase JWT for RLS
    const session = auth()
    const userId = session?.userId
    const getToken = session?.getToken

    // Proceed even if no Clerk session (e.g., when RLS is disabled and grants are set)
    const supabaseToken = getToken ? await getToken({ template: 'supabase' }) : undefined

    const data = await request.json()

    // Validate required fields for the vendors table
    const errors: Record<string, string> = {}
    if (data.vendor_number === undefined || data.vendor_number === null || isNaN(Number(data.vendor_number))) {
      errors.vendor_number = 'Vendor number is required and must be a number'
    }
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.name = 'Name is required'
    }

    // Validate email format if provided
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(String(data.email))) {
        errors.email = 'Please provide a valid email address'
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 })
    }

    const supabase = createServerClient(supabaseToken || undefined)

    const insertPayload = {
      vendor_number: Number(data.vendor_number),
      name: data.name,
      address_line_1: data.address_line_1 || null,
      address_line_2: data.address_line_2 || null,
      city: data.city || null,
      state: data.state || null,
      zip_code: data.zip_code || null,
      country: data.country || null,
      phone: data.phone || null,
      email: data.email || null,
      contact_name: data.contact_name || null,
      credit_limit: data.credit_limit || null,
    }

    const { data: vendor, error } = await supabase
      .from('vendors')
      .insert(insertPayload)
      .select('*')
      .single()

    if (error) {
      if ((error as any).code === '23505') {
        return NextResponse.json(
          { error: 'Vendor number already exists' },
          { status: 409 }
        )
      }
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: 'Failed to create vendor' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      vendor,
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
