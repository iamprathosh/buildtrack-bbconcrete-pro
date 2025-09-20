import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

interface EquipmentSpecifications {
  power?: string
  capacity?: string
  dimensions?: string
  weight?: string
  fuelType?: string
}

interface EquipmentFinancial {
  purchasePrice: number
  currentValue: number
  depreciationRate: number
  operatingCostPerHour: number
  maintenanceCostYTD: number
}

interface MaintenanceRecord {
  id: string
  date: string
  type: 'routine' | 'repair' | 'inspection'
  description: string
  cost: number
  performedBy: string
}

interface EquipmentMaintenance {
  lastService: string
  nextService: string
  serviceInterval: number
  maintenanceHistory: MaintenanceRecord[]
}

interface EquipmentUsage {
  totalHours: number
  hoursThisMonth: number
  utilizationRate: number
  fuelConsumption: number
}

interface EquipmentDocument {
  id: string
  name: string
  type: 'manual' | 'warranty' | 'certificate' | 'inspection' | 'other'
  url: string
  uploadDate: string
}

interface Equipment {
  id: string
  name: string
  type: 'heavy_machinery' | 'vehicles' | 'tools' | 'safety_equipment' | 'other'
  category: string
  model: string
  manufacturer: string
  serialNumber: string
  status: 'available' | 'in_use' | 'maintenance' | 'out_of_service' | 'retired'
  condition: 'excellent' | 'good' | 'fair' | 'poor'
  location: string
  assignedTo?: string
  project?: string
  specifications: EquipmentSpecifications
  financial: EquipmentFinancial
  maintenance: EquipmentMaintenance
  usage: EquipmentUsage
  documents: EquipmentDocument[]
  purchaseDate: string
  warrantyExpiry?: string
  notes: string
  tags: string[]
  addedDate: string
  lastUpdated: string
  createdBy?: string
  createdByName?: string
}

// Mock data - In production, this would come from your database
let mockEquipment: Equipment[] = [
  {
    id: '1',
    name: 'CAT 320 Excavator',
    type: 'heavy_machinery',
    category: 'Excavator',
    model: '320',
    manufacturer: 'Caterpillar',
    serialNumber: 'CAT320-001',
    status: 'in_use',
    condition: 'good',
    location: 'Residential Complex A',
    assignedTo: 'John Smith',
    project: 'Residential Complex A',
    specifications: {
      power: '148 HP',
      capacity: '20 tons',
      dimensions: '9.5m x 3.2m x 3.1m',
      weight: '20,500 kg',
      fuelType: 'Diesel'
    },
    financial: {
      purchasePrice: 250000,
      currentValue: 180000,
      depreciationRate: 15,
      operatingCostPerHour: 75,
      maintenanceCostYTD: 12500
    },
    maintenance: {
      lastService: '2024-01-10T00:00:00Z',
      nextService: '2024-02-10T00:00:00Z',
      serviceInterval: 30,
      maintenanceHistory: [
        {
          id: '1',
          date: '2024-01-10T00:00:00Z',
          type: 'routine',
          description: 'Oil change, filter replacement, general inspection',
          cost: 850,
          performedBy: 'Mike Wilson'
        }
      ]
    },
    usage: {
      totalHours: 2845,
      hoursThisMonth: 142,
      utilizationRate: 78,
      fuelConsumption: 12.5
    },
    documents: [],
    purchaseDate: '2022-06-15T00:00:00Z',
    warrantyExpiry: '2025-06-15T00:00:00Z',
    notes: 'Primary excavator for foundation work. Regular maintenance required.',
    tags: ['heavy-duty', 'foundation', 'primary'],
    addedDate: '2022-06-15T00:00:00Z',
    lastUpdated: '2024-01-15T00:00:00Z',
    createdBy: 'user_123',
    createdByName: 'Mike Johnson'
  },
  {
    id: '2',
    name: 'Volvo A40G Dump Truck',
    type: 'vehicles',
    category: 'Dump Truck',
    model: 'A40G',
    manufacturer: 'Volvo',
    serialNumber: 'VOL-A40G-002',
    status: 'available',
    condition: 'excellent',
    location: 'Main Depot',
    specifications: {
      power: '402 HP',
      capacity: '40 tons',
      dimensions: '11.8m x 3.7m x 3.8m',
      weight: '25,200 kg',
      fuelType: 'Diesel'
    },
    financial: {
      purchasePrice: 450000,
      currentValue: 380000,
      depreciationRate: 12,
      operatingCostPerHour: 95,
      maintenanceCostYTD: 8900
    },
    maintenance: {
      lastService: '2024-01-05T00:00:00Z',
      nextService: '2024-02-05T00:00:00Z',
      serviceInterval: 30,
      maintenanceHistory: [
        {
          id: '1',
          date: '2024-01-05T00:00:00Z',
          type: 'routine',
          description: 'Hydraulic fluid change, brake inspection',
          cost: 1200,
          performedBy: 'Sarah Johnson'
        }
      ]
    },
    usage: {
      totalHours: 1950,
      hoursThisMonth: 89,
      utilizationRate: 65,
      fuelConsumption: 18.2
    },
    documents: [],
    purchaseDate: '2023-03-20T00:00:00Z',
    warrantyExpiry: '2026-03-20T00:00:00Z',
    notes: 'Newest addition to the fleet. Excellent condition.',
    tags: ['transport', 'materials', 'high-capacity'],
    addedDate: '2023-03-20T00:00:00Z',
    lastUpdated: '2024-01-12T00:00:00Z',
    createdBy: 'user_456',
    createdByName: 'Sarah Wilson'
  },
  {
    id: '3',
    name: 'Concrete Mixer CM-500',
    type: 'heavy_machinery',
    category: 'Concrete Mixer',
    model: 'CM-500',
    manufacturer: 'MixMaster',
    serialNumber: 'MM-CM500-003',
    status: 'maintenance',
    condition: 'fair',
    location: 'Service Center',
    specifications: {
      capacity: '500L',
      power: '11 HP',
      dimensions: '2.1m x 1.8m x 2.3m',
      weight: '450 kg',
      fuelType: 'Electric'
    },
    financial: {
      purchasePrice: 15000,
      currentValue: 8500,
      depreciationRate: 20,
      operatingCostPerHour: 8,
      maintenanceCostYTD: 2100
    },
    maintenance: {
      lastService: '2024-01-14T00:00:00Z',
      nextService: '2024-01-28T00:00:00Z',
      serviceInterval: 14,
      maintenanceHistory: [
        {
          id: '1',
          date: '2024-01-14T00:00:00Z',
          type: 'repair',
          description: 'Motor replacement, drum cleaning',
          cost: 680,
          performedBy: 'Tom Anderson'
        }
      ]
    },
    usage: {
      totalHours: 1456,
      hoursThisMonth: 0,
      utilizationRate: 45,
      fuelConsumption: 0
    },
    documents: [],
    purchaseDate: '2021-08-10T00:00:00Z',
    warrantyExpiry: '2024-08-10T00:00:00Z',
    notes: 'Currently under repair. Motor replaced recently.',
    tags: ['concrete', 'repair-needed', 'small-jobs'],
    addedDate: '2021-08-10T00:00:00Z',
    lastUpdated: '2024-01-14T00:00:00Z',
    createdBy: 'user_789',
    createdByName: 'David Brown'
  },
  {
    id: '4',
    name: 'Bobcat S650 Skid Loader',
    type: 'heavy_machinery',
    category: 'Skid Loader',
    model: 'S650',
    manufacturer: 'Bobcat',
    serialNumber: 'BOB-S650-004',
    status: 'available',
    condition: 'good',
    location: 'Main Depot',
    specifications: {
      power: '74 HP',
      capacity: '2,200 lbs',
      dimensions: '3.7m x 1.8m x 2.0m',
      weight: '3,175 kg',
      fuelType: 'Diesel'
    },
    financial: {
      purchasePrice: 65000,
      currentValue: 45000,
      depreciationRate: 18,
      operatingCostPerHour: 35,
      maintenanceCostYTD: 3200
    },
    maintenance: {
      lastService: '2024-01-08T00:00:00Z',
      nextService: '2024-02-08T00:00:00Z',
      serviceInterval: 30,
      maintenanceHistory: [
        {
          id: '1',
          date: '2024-01-08T00:00:00Z',
          type: 'routine',
          description: 'Hydraulic system check, track inspection',
          cost: 420,
          performedBy: 'Mike Wilson'
        }
      ]
    },
    usage: {
      totalHours: 1245,
      hoursThisMonth: 65,
      utilizationRate: 58,
      fuelConsumption: 8.5
    },
    documents: [],
    purchaseDate: '2023-01-15T00:00:00Z',
    warrantyExpiry: '2026-01-15T00:00:00Z',
    notes: 'Versatile loader for material handling and site preparation.',
    tags: ['versatile', 'material-handling', 'compact'],
    addedDate: '2023-01-15T00:00:00Z',
    lastUpdated: '2024-01-10T00:00:00Z',
    createdBy: 'user_321',
    createdByName: 'Emily Chen'
  },
  {
    id: '5',
    name: 'Ford F-150 Work Truck',
    type: 'vehicles',
    category: 'Pickup Truck',
    model: 'F-150',
    manufacturer: 'Ford',
    serialNumber: 'FORD-F150-005',
    status: 'in_use',
    condition: 'excellent',
    location: 'Office Complex B',
    assignedTo: 'David Miller',
    project: 'Office Complex B',
    specifications: {
      power: '290 HP',
      capacity: '2,000 lbs',
      dimensions: '5.9m x 2.0m x 1.9m',
      weight: '2,100 kg',
      fuelType: 'Gasoline'
    },
    financial: {
      purchasePrice: 45000,
      currentValue: 35000,
      depreciationRate: 12,
      operatingCostPerHour: 15,
      maintenanceCostYTD: 1800
    },
    maintenance: {
      lastService: '2024-01-12T00:00:00Z',
      nextService: '2024-04-12T00:00:00Z',
      serviceInterval: 90,
      maintenanceHistory: [
        {
          id: '1',
          date: '2024-01-12T00:00:00Z',
          type: 'routine',
          description: 'Oil change, tire rotation, brake check',
          cost: 320,
          performedBy: 'Auto Service Center'
        }
      ]
    },
    usage: {
      totalHours: 892,
      hoursThisMonth: 85,
      utilizationRate: 72,
      fuelConsumption: 25.5
    },
    documents: [],
    purchaseDate: '2023-05-10T00:00:00Z',
    warrantyExpiry: '2026-05-10T00:00:00Z',
    notes: 'Reliable work truck for transportation and light hauling.',
    tags: ['transportation', 'light-duty', 'reliable'],
    addedDate: '2023-05-10T00:00:00Z',
    lastUpdated: '2024-01-13T00:00:00Z',
    createdBy: 'user_654',
    createdByName: 'Jennifer Miller'
  },
  {
    id: '6',
    name: 'DeWalt Tool Set Complete',
    type: 'tools',
    category: 'Power Tools',
    model: 'Professional Kit',
    manufacturer: 'DeWalt',
    serialNumber: 'DW-TOOLKIT-006',
    status: 'available',
    condition: 'good',
    location: 'Tool Storage',
    specifications: {
      power: 'Battery/Corded',
      capacity: '50+ tools'
    },
    financial: {
      purchasePrice: 2500,
      currentValue: 1800,
      depreciationRate: 25,
      operatingCostPerHour: 2,
      maintenanceCostYTD: 150
    },
    maintenance: {
      lastService: '2023-12-15T00:00:00Z',
      nextService: '2024-06-15T00:00:00Z',
      serviceInterval: 180,
      maintenanceHistory: [
        {
          id: '1',
          date: '2023-12-15T00:00:00Z',
          type: 'inspection',
          description: 'Tool inventory and condition check',
          cost: 0,
          performedBy: 'Tool Manager'
        }
      ]
    },
    usage: {
      totalHours: 450,
      hoursThisMonth: 32,
      utilizationRate: 45,
      fuelConsumption: 0
    },
    documents: [],
    purchaseDate: '2023-08-01T00:00:00Z',
    warrantyExpiry: '2025-08-01T00:00:00Z',
    notes: 'Complete professional tool set for general construction work.',
    tags: ['tools', 'complete-set', 'portable'],
    addedDate: '2023-08-01T00:00:00Z',
    lastUpdated: '2023-12-16T00:00:00Z',
    createdBy: 'user_987',
    createdByName: 'Robert Lee'
  }
]

// Helper function to validate status transitions
function isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
  const validTransitions: { [key: string]: string[] } = {
    'available': ['in_use', 'maintenance', 'out_of_service', 'retired'],
    'in_use': ['available', 'maintenance', 'out_of_service'],
    'maintenance': ['available', 'in_use', 'out_of_service', 'retired'],
    'out_of_service': ['maintenance', 'retired'],
    'retired': [] // Once retired, cannot change status
  }

  return validTransitions[currentStatus]?.includes(newStatus) || false
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ equipmentId: string }> }
) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { equipmentId } = await params
    const equipment = mockEquipment.find(e => e.id === equipmentId)
    
    if (!equipment) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 })
    }

    return NextResponse.json({ equipment })

  } catch (error) {
    console.error('Get equipment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ equipmentId: string }> }
) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { equipmentId } = await params
    const equipmentIndex = mockEquipment.findIndex(e => e.id === equipmentId)
    
    if (equipmentIndex === -1) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 })
    }

    const data = await request.json()
    const currentEquipment = mockEquipment[equipmentIndex]

    // Validate status transition if status is being changed
    if (data.status && data.status !== currentEquipment.status) {
      if (!isValidStatusTransition(currentEquipment.status, data.status)) {
        return NextResponse.json({
          error: `Cannot change status from ${currentEquipment.status} to ${data.status}`
        }, { status: 400 })
      }
    }

    // Validate serial number uniqueness if it's being changed
    if (data.serialNumber && data.serialNumber !== currentEquipment.serialNumber) {
      const existingEquipment = mockEquipment.find(e => e.serialNumber === data.serialNumber && e.id !== equipmentId)
      if (existingEquipment) {
        return NextResponse.json({
          error: 'Serial number already exists'
        }, { status: 400 })
      }
    }

    // Update equipment
    const updatedEquipment: Equipment = {
      ...currentEquipment,
      name: data.name || currentEquipment.name,
      type: data.type || currentEquipment.type,
      category: data.category || currentEquipment.category,
      model: data.model || currentEquipment.model,
      manufacturer: data.manufacturer || currentEquipment.manufacturer,
      serialNumber: data.serialNumber || currentEquipment.serialNumber,
      status: data.status || currentEquipment.status,
      condition: data.condition || currentEquipment.condition,
      location: data.location || currentEquipment.location,
      assignedTo: data.assignedTo !== undefined ? data.assignedTo : currentEquipment.assignedTo,
      project: data.project !== undefined ? data.project : currentEquipment.project,
      specifications: {
        ...currentEquipment.specifications,
        ...(data.specifications || {})
      },
      financial: {
        ...currentEquipment.financial,
        ...(data.financial || {})
      },
      maintenance: {
        ...currentEquipment.maintenance,
        ...(data.maintenance || {})
      },
      usage: {
        ...currentEquipment.usage,
        ...(data.usage || {})
      },
      purchaseDate: data.purchaseDate || currentEquipment.purchaseDate,
      warrantyExpiry: data.warrantyExpiry !== undefined ? data.warrantyExpiry : currentEquipment.warrantyExpiry,
      notes: data.notes !== undefined ? data.notes : currentEquipment.notes,
      tags: data.tags || currentEquipment.tags,
      lastUpdated: new Date().toISOString()
    }

    mockEquipment[equipmentIndex] = updatedEquipment

    return NextResponse.json({
      equipment: updatedEquipment,
      message: 'Equipment updated successfully'
    })

  } catch (error) {
    console.error('Update equipment error:', error)
    return NextResponse.json(
      { error: 'Failed to update equipment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ equipmentId: string }> }
) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { equipmentId } = await params
    const equipmentIndex = mockEquipment.findIndex(e => e.id === equipmentId)
    
    if (equipmentIndex === -1) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 })
    }

    const equipment = mockEquipment[equipmentIndex]

    // Check if equipment is currently in use
    if (equipment.status === 'in_use') {
      return NextResponse.json({
        error: 'Cannot delete equipment that is currently in use. Please change status to available first.'
      }, { status: 400 })
    }

    // Check if equipment has maintenance history or high value
    if (equipment.maintenance.maintenanceHistory.length > 0 || equipment.financial.currentValue > 10000) {
      return NextResponse.json({
        error: 'Cannot delete equipment with maintenance history or high value. Consider retiring instead.'
      }, { status: 400 })
    }

    // Remove equipment from mock data
    mockEquipment.splice(equipmentIndex, 1)

    return NextResponse.json({
      message: 'Equipment deleted successfully'
    })

  } catch (error) {
    console.error('Delete equipment error:', error)
    return NextResponse.json(
      { error: 'Failed to delete equipment' },
      { status: 500 }
    )
  }
}

// PATCH for specific actions (assign, unassign, change status, schedule maintenance)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ equipmentId: string }> }
) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { equipmentId } = await params
    const equipmentIndex = mockEquipment.findIndex(e => e.id === equipmentId)
    
    if (equipmentIndex === -1) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 })
    }

    const data = await request.json()
    const currentEquipment = mockEquipment[equipmentIndex]

    // Handle specific actions
    if (data.action) {
      let message = ''
      let updatedEquipment = { ...currentEquipment }

      switch (data.action) {
        case 'assign':
          if (currentEquipment.status !== 'available') {
            return NextResponse.json({
              error: 'Can only assign available equipment'
            }, { status: 400 })
          }
          if (!data.assignedTo) {
            return NextResponse.json({
              error: 'assignedTo is required for assignment'
            }, { status: 400 })
          }
          updatedEquipment.status = 'in_use'
          updatedEquipment.assignedTo = data.assignedTo
          updatedEquipment.project = data.project || undefined
          message = 'Equipment assigned successfully'
          break

        case 'unassign':
          if (currentEquipment.status !== 'in_use') {
            return NextResponse.json({
              error: 'Can only unassign equipment that is in use'
            }, { status: 400 })
          }
          updatedEquipment.status = 'available'
          updatedEquipment.assignedTo = undefined
          updatedEquipment.project = undefined
          message = 'Equipment unassigned successfully'
          break

        case 'start_maintenance':
          if (currentEquipment.status === 'retired') {
            return NextResponse.json({
              error: 'Cannot start maintenance on retired equipment'
            }, { status: 400 })
          }
          updatedEquipment.status = 'maintenance'
          updatedEquipment.assignedTo = undefined
          updatedEquipment.project = undefined
          message = 'Equipment sent to maintenance'
          break

        case 'complete_maintenance':
          if (currentEquipment.status !== 'maintenance') {
            return NextResponse.json({
              error: 'Can only complete maintenance for equipment under maintenance'
            }, { status: 400 })
          }
          updatedEquipment.status = 'available'
          updatedEquipment.maintenance = {
            ...updatedEquipment.maintenance,
            lastService: new Date().toISOString(),
            nextService: new Date(Date.now() + updatedEquipment.maintenance.serviceInterval * 24 * 60 * 60 * 1000).toISOString()
          }
          // Add maintenance record if provided
          if (data.maintenanceRecord) {
            const newRecord = {
              id: Date.now().toString(),
              date: new Date().toISOString(),
              type: data.maintenanceRecord.type || 'routine',
              description: data.maintenanceRecord.description || 'Maintenance completed',
              cost: data.maintenanceRecord.cost || 0,
              performedBy: data.maintenanceRecord.performedBy || user.fullName || 'Unknown'
            }
            updatedEquipment.maintenance.maintenanceHistory.push(newRecord)
            updatedEquipment.financial.maintenanceCostYTD += newRecord.cost
          }
          message = 'Maintenance completed successfully'
          break

        case 'retire':
          if (currentEquipment.status === 'in_use') {
            return NextResponse.json({
              error: 'Cannot retire equipment that is in use. Please unassign first.'
            }, { status: 400 })
          }
          updatedEquipment.status = 'retired'
          updatedEquipment.assignedTo = undefined
          updatedEquipment.project = undefined
          message = 'Equipment retired successfully'
          break

        case 'mark_out_of_service':
          updatedEquipment.status = 'out_of_service'
          updatedEquipment.assignedTo = undefined
          updatedEquipment.project = undefined
          message = 'Equipment marked as out of service'
          break

        default:
          return NextResponse.json({
            error: 'Invalid action'
          }, { status: 400 })
      }

      // Update last modified timestamp
      updatedEquipment.lastUpdated = new Date().toISOString()
      
      mockEquipment[equipmentIndex] = updatedEquipment

      return NextResponse.json({
        equipment: updatedEquipment,
        message
      })
    }

    // Handle direct field updates
    const updates: Partial<Equipment> = {}
    let message = 'Equipment updated successfully'

    if (data.status && data.status !== currentEquipment.status) {
      if (!isValidStatusTransition(currentEquipment.status, data.status)) {
        return NextResponse.json({
          error: `Cannot change status from ${currentEquipment.status} to ${data.status}`
        }, { status: 400 })
      }
      updates.status = data.status
    }

    if (data.location && data.location !== currentEquipment.location) {
      updates.location = data.location
    }

    if (data.condition && data.condition !== currentEquipment.condition) {
      updates.condition = data.condition
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({
        error: 'No valid updates provided'
      }, { status: 400 })
    }

    const updatedEquipment = {
      ...currentEquipment,
      ...updates,
      lastUpdated: new Date().toISOString()
    }

    mockEquipment[equipmentIndex] = updatedEquipment

    return NextResponse.json({
      equipment: updatedEquipment,
      message
    })

  } catch (error) {
    console.error('Patch equipment error:', error)
    return NextResponse.json(
      { error: 'Failed to update equipment' },
      { status: 500 }
    )
  }
}