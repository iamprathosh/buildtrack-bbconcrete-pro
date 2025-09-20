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
// This should match the data from the main procurement route
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

// GET individual purchase order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await params
    const order = mockPurchaseOrders.find(o => o.id === orderId)

    if (!order) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ purchaseOrder: order })

  } catch (error) {
    console.error('Get purchase order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update purchase order
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await params
    const orderIndex = mockPurchaseOrders.findIndex(o => o.id === orderId)

    if (orderIndex === -1) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      )
    }

    const data = await request.json()
    const existingOrder = mockPurchaseOrders[orderIndex]

    // Handle status updates with validation
    if (data.status) {
      const validTransitions: Record<string, string[]> = {
        'draft': ['pending', 'cancelled'],
        'pending': ['approved', 'cancelled'],
        'approved': ['ordered', 'cancelled'],
        'ordered': ['received', 'cancelled'],
        'received': [], // Final state
        'cancelled': [] // Final state
      }

      const currentStatus = existingOrder.status
      const newStatus = data.status

      if (!validTransitions[currentStatus]?.includes(newStatus)) {
        return NextResponse.json(
          { error: `Cannot transition from ${currentStatus} to ${newStatus}` },
          { status: 400 }
        )
      }

      // Set approval information for status changes
      if (newStatus === 'approved') {
        data.approvedBy = user.fullName || user.firstName + ' ' + user.lastName || 'Unknown User'
      }

      // Set actual delivery date if status is 'received'
      if (newStatus === 'received' && !data.actualDelivery) {
        data.actualDelivery = new Date().toISOString()
      }
    }

    // Handle items update and recalculate total
    if (data.items) {
      const totalAmount = data.items.reduce((sum: number, item: any) => 
        sum + (item.quantity * item.unitPrice), 0
      )
      data.totalAmount = totalAmount
    }

    // Update the order
    const updatedOrder: PurchaseOrder = {
      ...existingOrder,
      ...data,
      lastUpdated: new Date().toISOString()
    }

    mockPurchaseOrders[orderIndex] = updatedOrder

    return NextResponse.json({
      purchaseOrder: updatedOrder,
      message: 'Purchase order updated successfully'
    })

  } catch (error) {
    console.error('Update purchase order error:', error)
    return NextResponse.json(
      { error: 'Failed to update purchase order' },
      { status: 500 }
    )
  }
}

// DELETE purchase order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await params
    const orderIndex = mockPurchaseOrders.findIndex(o => o.id === orderId)

    if (orderIndex === -1) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      )
    }

    const order = mockPurchaseOrders[orderIndex]

    // Check if order can be deleted (only draft and cancelled orders)
    if (!['draft', 'cancelled'].includes(order.status)) {
      return NextResponse.json(
        { error: `Cannot delete purchase order with status: ${order.status}` },
        { status: 400 }
      )
    }

    // Remove from mock data (in production, soft delete or hard delete from database)
    mockPurchaseOrders.splice(orderIndex, 1)

    return NextResponse.json({
      message: 'Purchase order deleted successfully'
    })

  } catch (error) {
    console.error('Delete purchase order error:', error)
    return NextResponse.json(
      { error: 'Failed to delete purchase order' },
      { status: 500 }
    )
  }
}