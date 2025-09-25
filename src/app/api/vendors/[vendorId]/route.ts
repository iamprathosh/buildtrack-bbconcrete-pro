import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
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
let mockVendors: Vendor[] = [
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

// Helper function to validate status transitions
function isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
  const validTransitions: { [key: string]: string[] } = {
    'pending': ['active', 'inactive', 'blacklisted'],
    'active': ['inactive', 'blacklisted'],
    'inactive': ['active', 'blacklisted'],
    'blacklisted': ['inactive'] // Only allow return to inactive from blacklisted
  }

  return validTransitions[currentStatus]?.includes(newStatus) || false
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { vendorId } = await params

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', vendorId)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    const row: any = data
    const addressParts = [
      row.address_line_1,
      row.address_line_2,
      row.city,
      row.state,
      row.zip_code,
      row.country,
    ].filter(Boolean)
    const address = addressParts.join(', ')

    const vendor: Vendor = {
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

    return NextResponse.json({ vendor })

  } catch (error) {
    console.error('Get vendor error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { vendorId } = await params
    const vendorIndex = mockVendors.findIndex(v => v.id === vendorId)
    
    if (vendorIndex === -1) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    const data = await request.json()
    const currentVendor = mockVendors[vendorIndex]

    // Validate status transition if status is being changed
    if (data.status && data.status !== currentVendor.status) {
      if (!isValidStatusTransition(currentVendor.status, data.status)) {
        return NextResponse.json({
          error: `Cannot change status from ${currentVendor.status} to ${data.status}`
        }, { status: 400 })
      }
    }

    // Validate email format if provided
    if (data.contact?.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.contact.email)) {
        return NextResponse.json(
          { error: 'Please provide a valid email address' },
          { status: 400 }
        )
      }
    }

    // Update vendor
    const updatedVendor: Vendor = {
      ...currentVendor,
      name: data.name || currentVendor.name,
      type: data.type || currentVendor.type,
      category: data.category || currentVendor.category,
      status: data.status || currentVendor.status,
      rating: data.rating !== undefined ? data.rating : currentVendor.rating,
      contact: {
        ...currentVendor.contact,
        ...(data.contact || {})
      },
      business: {
        ...currentVendor.business,
        ...(data.business || {})
      },
      performance: {
        ...currentVendor.performance,
        ...(data.performance || {}),
        qualityRating: data.rating !== undefined ? data.rating : currentVendor.performance.qualityRating
      },
      notes: data.notes !== undefined ? data.notes : currentVendor.notes,
      tags: data.tags || currentVendor.tags,
      lastUpdated: new Date().toISOString()
    }

    mockVendors[vendorIndex] = updatedVendor

    return NextResponse.json({
      vendor: updatedVendor,
      message: 'Vendor updated successfully'
    })

  } catch (error) {
    console.error('Update vendor error:', error)
    return NextResponse.json(
      { error: 'Failed to update vendor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { vendorId } = await params
    const vendorIndex = mockVendors.findIndex(v => v.id === vendorId)
    
    if (vendorIndex === -1) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    const vendor = mockVendors[vendorIndex]

    // Check if vendor has active orders or dependencies
    // In production, you'd check for related purchase orders, contracts, etc.
    if (vendor.performance.totalOrders > 0 && vendor.status === 'active') {
      return NextResponse.json({
        error: 'Cannot delete active vendor with order history. Consider setting status to inactive instead.'
      }, { status: 400 })
    }

    // Remove vendor from mock data
    mockVendors.splice(vendorIndex, 1)

    return NextResponse.json({
      message: 'Vendor deleted successfully'
    })

  } catch (error) {
    console.error('Delete vendor error:', error)
    return NextResponse.json(
      { error: 'Failed to delete vendor' },
      { status: 500 }
    )
  }
}

// PATCH for status-only updates (like approve/reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { vendorId } = await params
    const vendorIndex = mockVendors.findIndex(v => v.id === vendorId)
    
    if (vendorIndex === -1) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    const data = await request.json()
    const currentVendor = mockVendors[vendorIndex]

    // Handle specific actions
    if (data.action) {
      let newStatus = currentVendor.status
      let message = ''

      switch (data.action) {
        case 'approve':
          if (currentVendor.status === 'pending') {
            newStatus = 'active'
            message = 'Vendor approved and activated'
          } else {
            return NextResponse.json({
              error: 'Can only approve pending vendors'
            }, { status: 400 })
          }
          break

        case 'reject':
          if (currentVendor.status === 'pending') {
            newStatus = 'inactive'
            message = 'Vendor rejected'
          } else {
            return NextResponse.json({
              error: 'Can only reject pending vendors'
            }, { status: 400 })
          }
          break

        case 'activate':
          if (currentVendor.status === 'inactive') {
            newStatus = 'active'
            message = 'Vendor activated'
          } else {
            return NextResponse.json({
              error: 'Can only activate inactive vendors'
            }, { status: 400 })
          }
          break

        case 'deactivate':
          if (currentVendor.status === 'active') {
            newStatus = 'inactive'
            message = 'Vendor deactivated'
          } else {
            return NextResponse.json({
              error: 'Can only deactivate active vendors'
            }, { status: 400 })
          }
          break

        case 'blacklist':
          if (currentVendor.status !== 'blacklisted') {
            newStatus = 'blacklisted'
            message = 'Vendor blacklisted'
          } else {
            return NextResponse.json({
              error: 'Vendor is already blacklisted'
            }, { status: 400 })
          }
          break

        default:
          return NextResponse.json({
            error: 'Invalid action'
          }, { status: 400 })
      }

      // Update vendor status
      mockVendors[vendorIndex] = {
        ...currentVendor,
        status: newStatus,
        lastUpdated: new Date().toISOString()
      }

      return NextResponse.json({
        vendor: mockVendors[vendorIndex],
        message
      })
    }

    // Handle full vendor update (similar to PUT but without requiring all fields)
    if (!data.action) {
      // Validate email format if provided
      if (data.contact?.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(data.contact.email)) {
          return NextResponse.json(
            { error: 'Please provide a valid email address' },
            { status: 400 }
          )
        }
      }

      // Validate status transition if status is being changed
      if (data.status && data.status !== currentVendor.status) {
        if (!isValidStatusTransition(currentVendor.status, data.status)) {
          return NextResponse.json({
            error: `Cannot change status from ${currentVendor.status} to ${data.status}`
          }, { status: 400 })
        }
      }

      // Update vendor with provided data
      const updatedVendor: Vendor = {
        ...currentVendor,
        ...(data.name && { name: data.name }),
        ...(data.type && { type: data.type }),
        ...(data.category && { category: data.category }),
        ...(data.status && { status: data.status }),
        ...(data.rating !== undefined && { rating: data.rating }),
        contact: {
          ...currentVendor.contact,
          ...(data.contact || {})
        },
        business: {
          ...currentVendor.business,
          ...(data.business || {})
        },
        performance: {
          ...currentVendor.performance,
          ...(data.performance || {}),
          ...(data.rating !== undefined && { qualityRating: data.rating })
        },
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.tags && { tags: data.tags }),
        lastUpdated: new Date().toISOString()
      }

      mockVendors[vendorIndex] = updatedVendor

      return NextResponse.json({
        vendor: updatedVendor,
        message: 'Vendor updated successfully'
      })
    }

    return NextResponse.json({
      error: 'No valid update provided'
    }, { status: 400 })

  } catch (error) {
    console.error('Patch vendor error:', error)
    return NextResponse.json(
      { error: 'Failed to update vendor status' },
      { status: 500 }
    )
  }
}