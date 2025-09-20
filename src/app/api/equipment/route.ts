import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { differenceInDays } from 'date-fns'

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
const mockEquipment: Equipment[] = [
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

// Helper function to calculate maintenance status
function getMaintenanceStatus(nextService: string): 'overdue' | 'due_soon' | 'up_to_date' {
  const daysTillService = differenceInDays(new Date(nextService), new Date())
  if (daysTillService < 0) return 'overdue'
  if (daysTillService <= 7) return 'due_soon'
  return 'up_to_date'
}

// Helper function to apply filters
function applyFilters(equipment: Equipment[], filters: any) {
  let filtered = [...equipment]

  // Search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(searchTerm) ||
      item.model.toLowerCase().includes(searchTerm) ||
      item.manufacturer.toLowerCase().includes(searchTerm) ||
      item.serialNumber.toLowerCase().includes(searchTerm) ||
      item.notes.toLowerCase().includes(searchTerm) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      item.location.toLowerCase().includes(searchTerm) ||
      (item.assignedTo && item.assignedTo.toLowerCase().includes(searchTerm)) ||
      (item.project && item.project.toLowerCase().includes(searchTerm))
    )
  }

  // Type filter
  if (filters.type && filters.type !== 'all') {
    filtered = filtered.filter(item => item.type === filters.type)
  }

  // Category filter
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(item => item.category === filters.category)
  }

  // Status filter
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(item => item.status === filters.status)
  }

  // Condition filter
  if (filters.condition && filters.condition !== 'all') {
    filtered = filtered.filter(item => item.condition === filters.condition)
  }

  // Location filter
  if (filters.location && filters.location !== 'all') {
    filtered = filtered.filter(item => item.location === filters.location)
  }

  // Assigned to filter
  if (filters.assignedTo && filters.assignedTo !== 'all') {
    filtered = filtered.filter(item => item.assignedTo === filters.assignedTo)
  }

  // Maintenance status filter
  if (filters.maintenanceStatus && filters.maintenanceStatus !== 'all') {
    filtered = filtered.filter(item => {
      const maintenanceStatus = getMaintenanceStatus(item.maintenance.nextService)
      return maintenanceStatus === filters.maintenanceStatus
    })
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
      condition: searchParams.get('condition') || 'all',
      location: searchParams.get('location') || 'all',
      assignedTo: searchParams.get('assignedTo') || 'all',
      maintenanceStatus: searchParams.get('maintenanceStatus') || 'all',
    }

    const filteredEquipment = applyFilters(mockEquipment, filters)
    
    // Sort by name
    filteredEquipment.sort((a, b) => a.name.localeCompare(b.name))

    // Calculate statistics
    const today = new Date()
    const overdue = mockEquipment.filter(e => differenceInDays(new Date(e.maintenance.nextService), today) < 0)
    
    const stats = {
      totalEquipment: mockEquipment.length,
      availableEquipment: mockEquipment.filter(e => e.status === 'available').length,
      inUseEquipment: mockEquipment.filter(e => e.status === 'in_use').length,
      maintenanceEquipment: mockEquipment.filter(e => e.status === 'maintenance').length,
      outOfServiceEquipment: mockEquipment.filter(e => e.status === 'out_of_service').length,
      retiredEquipment: mockEquipment.filter(e => e.status === 'retired').length,
      totalValue: mockEquipment.reduce((sum, e) => sum + e.financial.currentValue, 0),
      totalPurchaseValue: mockEquipment.reduce((sum, e) => sum + e.financial.purchasePrice, 0),
      avgUtilization: mockEquipment.length > 0 ? mockEquipment.reduce((sum, e) => sum + e.usage.utilizationRate, 0) / mockEquipment.length : 0,
      maintenanceOverdue: overdue.length,
      totalMaintenanceCost: mockEquipment.reduce((sum, e) => sum + e.financial.maintenanceCostYTD, 0),
      totalOperatingCost: mockEquipment.reduce((sum, e) => sum + (e.usage.hoursThisMonth * e.financial.operatingCostPerHour), 0),
      // Breakdown by type
      heavyMachineryCount: mockEquipment.filter(e => e.type === 'heavy_machinery').length,
      vehiclesCount: mockEquipment.filter(e => e.type === 'vehicles').length,
      toolsCount: mockEquipment.filter(e => e.type === 'tools').length,
      safetyEquipmentCount: mockEquipment.filter(e => e.type === 'safety_equipment').length,
      // Condition breakdown
      excellentCount: mockEquipment.filter(e => e.condition === 'excellent').length,
      goodCount: mockEquipment.filter(e => e.condition === 'good').length,
      fairCount: mockEquipment.filter(e => e.condition === 'fair').length,
      poorCount: mockEquipment.filter(e => e.condition === 'poor').length
    }

    // Get unique values for filters
    const categories = [...new Set(mockEquipment.map(e => e.category))].sort()
    const locations = [...new Set(mockEquipment.map(e => e.location))].sort()
    const assignedUsers = [...new Set(mockEquipment.map(e => e.assignedTo).filter(Boolean))].sort()
    const manufacturers = [...new Set(mockEquipment.map(e => e.manufacturer))].sort()

    return NextResponse.json({
      equipment: filteredEquipment,
      stats,
      categories,
      locations,
      assignedUsers,
      manufacturers,
      total: filteredEquipment.length
    })

  } catch (error) {
    console.error('Equipment API error:', error)
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
    const requiredFields = ['name', 'type', 'category', 'model', 'manufacturer', 'serialNumber']
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Validate serial number uniqueness
    const existingEquipment = mockEquipment.find(e => e.serialNumber === data.serialNumber)
    if (existingEquipment) {
      return NextResponse.json(
        { error: 'Serial number already exists' },
        { status: 400 }
      )
    }

    // Create new equipment
    const newEquipment: Equipment = {
      id: Date.now().toString(),
      name: data.name,
      type: data.type,
      category: data.category,
      model: data.model,
      manufacturer: data.manufacturer,
      serialNumber: data.serialNumber,
      status: data.status || 'available',
      condition: data.condition || 'good',
      location: data.location || 'Main Depot',
      assignedTo: data.assignedTo || undefined,
      project: data.project || undefined,
      specifications: data.specifications || {},
      financial: {
        purchasePrice: data.financial?.purchasePrice || 0,
        currentValue: data.financial?.currentValue || data.financial?.purchasePrice || 0,
        depreciationRate: data.financial?.depreciationRate || 15,
        operatingCostPerHour: data.financial?.operatingCostPerHour || 0,
        maintenanceCostYTD: 0
      },
      maintenance: {
        lastService: data.maintenance?.lastService || new Date().toISOString(),
        nextService: data.maintenance?.nextService || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        serviceInterval: data.maintenance?.serviceInterval || 30,
        maintenanceHistory: []
      },
      usage: {
        totalHours: 0,
        hoursThisMonth: 0,
        utilizationRate: 0,
        fuelConsumption: 0
      },
      documents: [],
      purchaseDate: data.purchaseDate || new Date().toISOString(),
      warrantyExpiry: data.warrantyExpiry || undefined,
      notes: data.notes || '',
      tags: data.tags || [],
      addedDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      createdBy: user.id,
      createdByName: user.fullName || user.firstName + ' ' + user.lastName || 'Unknown User'
    }

    // In production, save to database
    mockEquipment.push(newEquipment)

    return NextResponse.json({
      equipment: newEquipment,
      message: 'Equipment created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create equipment error:', error)
    return NextResponse.json(
      { error: 'Failed to create equipment' },
      { status: 500 }
    )
  }
}