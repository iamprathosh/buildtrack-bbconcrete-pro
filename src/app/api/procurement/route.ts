import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

interface PurchaseOrderItem {
  id: string
  name: string
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
}

interface PurchaseOrder {
  id: string
  orderNumber: string
  supplier: string
  project: string
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  orderDate: string
  expectedDelivery: string
  actualDelivery?: string
  totalAmount: number
  paidAmount: number
  items: PurchaseOrderItem[]
  approvedBy?: string
  notes: string
  lastUpdated: string
  createdBy?: string
  createdByName?: string
}

// Mock data - In production, this would come from your database
const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: '1',
    orderNumber: 'PO-2024-001',
    supplier: 'ABC Construction Supplies',
    project: 'Residential Complex A',
    status: 'approved',
    priority: 'high',
    orderDate: '2024-01-15T00:00:00Z',
    expectedDelivery: '2024-01-20T00:00:00Z',
    totalAmount: 15000,
    paidAmount: 0,
    items: [
      {
        id: '1',
        name: 'Portland Cement',
        quantity: 50,
        unit: 'bags',
        unitPrice: 25,
        totalPrice: 1250
      },
      {
        id: '2',
        name: 'Steel Rebar 12mm',
        quantity: 200,
        unit: 'pieces',
        unitPrice: 12.75,
        totalPrice: 2550
      },
      {
        id: '3',
        name: 'Concrete Blocks',
        quantity: 1000,
        unit: 'pieces',
        unitPrice: 11.2,
        totalPrice: 11200
      }
    ],
    approvedBy: 'John Smith',
    notes: 'Urgent delivery required for foundation work',
    lastUpdated: '2024-01-16T10:30:00Z',
    createdBy: 'user_123',
    createdByName: 'Mike Johnson'
  },
  {
    id: '2',
    orderNumber: 'PO-2024-002',
    supplier: 'XYZ Steel Ltd.',
    project: 'Bridge Construction',
    status: 'received',
    priority: 'medium',
    orderDate: '2024-01-10T00:00:00Z',
    expectedDelivery: '2024-01-18T00:00:00Z',
    actualDelivery: '2024-01-17T00:00:00Z',
    totalAmount: 25000,
    paidAmount: 25000,
    items: [
      {
        id: '1',
        name: 'Steel Beams I-Section',
        quantity: 20,
        unit: 'pieces',
        unitPrice: 1200,
        totalPrice: 24000
      },
      {
        id: '2',
        name: 'Welding Electrodes',
        quantity: 50,
        unit: 'kg',
        unitPrice: 20,
        totalPrice: 1000
      }
    ],
    approvedBy: 'Robert Davis',
    notes: 'Quality inspection completed, all items approved',
    lastUpdated: '2024-01-17T14:20:00Z',
    createdBy: 'user_456',
    createdByName: 'Sarah Wilson'
  },
  {
    id: '3',
    orderNumber: 'PO-2024-003',
    supplier: 'Ready Mix Corp.',
    project: 'Office Building B',
    status: 'pending',
    priority: 'urgent',
    orderDate: '2024-01-14T00:00:00Z',
    expectedDelivery: '2024-01-22T00:00:00Z',
    totalAmount: 8500,
    paidAmount: 0,
    items: [
      {
        id: '1',
        name: 'Concrete Mix 25 MPa',
        quantity: 100,
        unit: 'cubic meters',
        unitPrice: 85,
        totalPrice: 8500
      }
    ],
    notes: 'Awaiting final approval from project manager',
    lastUpdated: '2024-01-14T16:45:00Z',
    createdBy: 'user_789',
    createdByName: 'David Brown'
  },
  {
    id: '4',
    orderNumber: 'PO-2024-004',
    supplier: 'Local Quarry',
    project: 'Residential Complex A',
    status: 'ordered',
    priority: 'low',
    orderDate: '2024-01-12T00:00:00Z',
    expectedDelivery: '2024-01-25T00:00:00Z',
    totalAmount: 3500,
    paidAmount: 1750,
    items: [
      {
        id: '1',
        name: 'Crushed Gravel 20mm',
        quantity: 50,
        unit: 'tons',
        unitPrice: 30,
        totalPrice: 1500
      },
      {
        id: '2',
        name: 'Fine Sand',
        quantity: 40,
        unit: 'tons',
        unitPrice: 25,
        totalPrice: 1000
      },
      {
        id: '3',
        name: 'Coarse Aggregate',
        quantity: 20,
        unit: 'tons',
        unitPrice: 50,
        totalPrice: 1000
      }
    ],
    approvedBy: 'Maria Garcia',
    notes: 'Partial payment made, delivery scheduled',
    lastUpdated: '2024-01-13T09:15:00Z',
    createdBy: 'user_321',
    createdByName: 'Emily Chen'
  },
  {
    id: '5',
    orderNumber: 'PO-2024-005',
    supplier: 'Hardware Plus',
    project: 'Shopping Mall Construction',
    status: 'draft',
    priority: 'medium',
    orderDate: '2024-01-18T00:00:00Z',
    expectedDelivery: '2024-01-28T00:00:00Z',
    totalAmount: 12750,
    paidAmount: 0,
    items: [
      {
        id: '1',
        name: 'Electrical Wiring 2.5mm',
        quantity: 500,
        unit: 'meters',
        unitPrice: 8.5,
        totalPrice: 4250
      },
      {
        id: '2',
        name: 'PVC Conduit Pipes',
        quantity: 100,
        unit: 'meters',
        unitPrice: 15,
        totalPrice: 1500
      },
      {
        id: '3',
        name: 'Junction Boxes',
        quantity: 350,
        unit: 'pieces',
        unitPrice: 20,
        totalPrice: 7000
      }
    ],
    notes: 'Electrical materials for Phase 1 construction',
    lastUpdated: '2024-01-18T11:00:00Z',
    createdBy: 'user_654',
    createdByName: 'Alex Thompson'
  },
  {
    id: '6',
    orderNumber: 'PO-2024-006',
    supplier: 'BuildMax Supplies',
    project: 'Hospital Extension',
    status: 'approved',
    priority: 'urgent',
    orderDate: '2024-01-16T00:00:00Z',
    expectedDelivery: '2024-01-24T00:00:00Z',
    totalAmount: 18900,
    paidAmount: 0,
    items: [
      {
        id: '1',
        name: 'Insulation Panels',
        quantity: 200,
        unit: 'sq meters',
        unitPrice: 45,
        totalPrice: 9000
      },
      {
        id: '2',
        name: 'Waterproofing Membrane',
        quantity: 150,
        unit: 'sq meters',
        unitPrice: 32,
        totalPrice: 4800
      },
      {
        id: '3',
        name: 'Sealant Compound',
        quantity: 85,
        unit: 'tubes',
        unitPrice: 60,
        totalPrice: 5100
      }
    ],
    approvedBy: 'Jennifer Miller',
    notes: 'Critical for weatherproofing before winter',
    lastUpdated: '2024-01-17T08:30:00Z',
    createdBy: 'user_987',
    createdByName: 'Robert Lee'
  }
]

// Helper function to apply filters
function applyFilters(orders: PurchaseOrder[], filters: any) {
  let filtered = [...orders]

  // Search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    filtered = filtered.filter(order =>
      order.orderNumber.toLowerCase().includes(searchTerm) ||
      order.supplier.toLowerCase().includes(searchTerm) ||
      order.project.toLowerCase().includes(searchTerm) ||
      order.notes.toLowerCase().includes(searchTerm)
    )
  }

  // Status filter
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(order => order.status === filters.status)
  }

  // Priority filter
  if (filters.priority && filters.priority !== 'all') {
    filtered = filtered.filter(order => order.priority === filters.priority)
  }

  // Supplier filter
  if (filters.supplier && filters.supplier !== 'all') {
    filtered = filtered.filter(order => order.supplier === filters.supplier)
  }

  // Project filter
  if (filters.project && filters.project !== 'all') {
    filtered = filtered.filter(order => order.project === filters.project)
  }

  // Date range filter
  if (filters.dateFrom) {
    const fromDate = new Date(filters.dateFrom)
    filtered = filtered.filter(order => new Date(order.orderDate) >= fromDate)
  }

  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo)
    toDate.setHours(23, 59, 59, 999) // Include the entire day
    filtered = filtered.filter(order => new Date(order.orderDate) <= toDate)
  }

  return filtered
}

// Helper function to generate order number
function generateOrderNumber(): string {
  const year = new Date().getFullYear()
  const existingNumbers = mockPurchaseOrders
    .map(order => {
      const match = order.orderNumber.match(/PO-(\d{4})-(\d{3})/)
      return match ? parseInt(match[2]) : 0
    })
    .filter(Boolean)
  
  const nextNumber = Math.max(...existingNumbers, 0) + 1
  return `PO-${year}-${nextNumber.toString().padStart(3, '0')}`
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
      status: searchParams.get('status') || 'all',
      priority: searchParams.get('priority') || 'all',
      supplier: searchParams.get('supplier') || 'all',
      project: searchParams.get('project') || 'all',
      dateFrom: searchParams.get('dateFrom'),
      dateTo: searchParams.get('dateTo'),
    }

    const filteredOrders = applyFilters(mockPurchaseOrders, filters)
    
    // Sort by order date (newest first)
    filteredOrders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())

    // Calculate statistics
    const stats = {
      totalOrders: mockPurchaseOrders.length,
      pendingOrders: mockPurchaseOrders.filter(o => o.status === 'pending').length,
      approvedOrders: mockPurchaseOrders.filter(o => o.status === 'approved').length,
      orderedOrders: mockPurchaseOrders.filter(o => o.status === 'ordered').length,
      receivedOrders: mockPurchaseOrders.filter(o => o.status === 'received').length,
      cancelledOrders: mockPurchaseOrders.filter(o => o.status === 'cancelled').length,
      draftOrders: mockPurchaseOrders.filter(o => o.status === 'draft').length,
      totalValue: mockPurchaseOrders.reduce((sum, o) => sum + o.totalAmount, 0),
      totalPaid: mockPurchaseOrders.reduce((sum, o) => sum + o.paidAmount, 0),
      avgOrderValue: mockPurchaseOrders.length > 0 
        ? mockPurchaseOrders.reduce((sum, o) => sum + o.totalAmount, 0) / mockPurchaseOrders.length 
        : 0,
      // Additional metrics
      pendingValue: mockPurchaseOrders
        .filter(o => o.status === 'pending')
        .reduce((sum, o) => sum + o.totalAmount, 0),
      urgentOrders: mockPurchaseOrders.filter(o => o.priority === 'urgent').length,
      overdueOrders: mockPurchaseOrders.filter(o => 
        ['approved', 'ordered'].includes(o.status) && 
        new Date() > new Date(o.expectedDelivery)
      ).length
    }

    // Get unique suppliers and projects for filters
    const suppliers = [...new Set(mockPurchaseOrders.map(o => o.supplier))].sort()
    const projects = [...new Set(mockPurchaseOrders.map(o => o.project))].sort()

    return NextResponse.json({
      purchaseOrders: filteredOrders,
      stats,
      suppliers,
      projects,
      total: filteredOrders.length
    })

  } catch (error) {
    console.error('Procurement API error:', error)
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
    const requiredFields = ['supplier', 'project', 'expectedDelivery', 'items']
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Validate items
    if (!Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json(
        { error: 'At least one item is required' },
        { status: 400 }
      )
    }

    // Validate each item
    for (const item of data.items) {
      if (!item.name || !item.quantity || !item.unitPrice || !item.unit) {
        return NextResponse.json(
          { error: 'All item fields (name, quantity, unit, unitPrice) are required' },
          { status: 400 }
        )
      }
    }

    // Calculate total amount
    const totalAmount = data.items.reduce((sum: number, item: any) => 
      sum + (item.quantity * item.unitPrice), 0
    )

    // Create new purchase order
    const newOrder: PurchaseOrder = {
      id: Date.now().toString(),
      orderNumber: data.orderNumber || generateOrderNumber(),
      supplier: data.supplier,
      project: data.project,
      status: 'draft',
      priority: data.priority || 'medium',
      orderDate: new Date().toISOString(),
      expectedDelivery: data.expectedDelivery,
      totalAmount,
      paidAmount: 0,
      items: data.items.map((item: any, index: number) => ({
        id: (index + 1).toString(),
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice
      })),
      notes: data.notes || '',
      lastUpdated: new Date().toISOString(),
      createdBy: user.id,
      createdByName: user.fullName || user.firstName + ' ' + user.lastName || 'Unknown User'
    }

    // In production, save to database
    mockPurchaseOrders.unshift(newOrder)

    return NextResponse.json({
      purchaseOrder: newOrder,
      message: 'Purchase order created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create purchase order error:', error)
    return NextResponse.json(
      { error: 'Failed to create purchase order' },
      { status: 500 }
    )
  }
}