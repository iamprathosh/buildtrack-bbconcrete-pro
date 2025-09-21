import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/database'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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




// Helper to build ilike filter
function ilikeOr(fields: string[], term: string) {
  const escaped = term.replace(/%/g, '').replace(/_/g, '')
  return fields.map((f) => `${f}.ilike.%${escaped}%`).join(',')
}

async function fetchFromDb(searchParams: URLSearchParams) {
  const client = createServerClient()

  let query = client.from('equipment').select('*', { count: 'exact' })

  const search = searchParams.get('search') || ''
  const category = searchParams.get('category')
  const status = searchParams.get('status')
  const location = searchParams.get('location')
  const assignedTo = searchParams.get('assignedTo')

  if (search) {
    query = query.or(ilikeOr(['name', 'equipment_number', 'model', 'serial_number', 'location'], search))
  }
  if (category && category !== 'all') query = query.eq('category', category)
  if (status && status !== 'all') query = query.eq('status', status)
  if (location && location !== 'all') query = query.eq('location', location)
  if (assignedTo && assignedTo !== 'all') query = query.eq('checked_out_to', assignedTo)

  const { data, error } = await query.order('created_at', { ascending: false }).range(0, 9999)
  if (error) throw error

  const equipment = data || []

  // Stats derived from current rows
  const stats = {
    totalEquipment: equipment.length,
    availableEquipment: equipment.filter((e: any) => e.status === 'available').length,
    inUseEquipment: equipment.filter((e: any) => e.status === 'checked_out').length,
    maintenanceEquipment: equipment.filter((e: any) => e.status === 'maintenance').length,
    outOfServiceEquipment: equipment.filter((e: any) => e.status === 'retired').length,
    retiredEquipment: equipment.filter((e: any) => e.status === 'retired').length,
    totalValue: equipment.reduce((sum: number, e: any) => sum + (e.current_value || 0), 0),
    totalPurchaseValue: equipment.reduce((sum: number, e: any) => sum + (e.purchase_cost || 0), 0),
    avgUtilization: 0, // not tracked in DB schema yet
    maintenanceOverdue: 0, // not tracked in DB schema yet
    totalMaintenanceCost: 0, // not tracked in DB schema yet
    totalOperatingCost: 0, // not tracked in DB schema yet
    heavyMachineryCount: 0,
    vehiclesCount: 0,
    toolsCount: 0,
    safetyEquipmentCount: 0,
    excellentCount: 0,
    goodCount: 0,
    fairCount: 0,
    poorCount: 0,
  }

  const categories = [...new Set(equipment.map((e: any) => e.category).filter(Boolean))].sort()
  const locations = [...new Set(equipment.map((e: any) => e.location).filter(Boolean))].sort()
  const assignedUsers = [...new Set(equipment.map((e: any) => e.checked_out_to).filter(Boolean))].sort()
  const manufacturers: string[] = []

  return { equipment, stats, categories, locations, assignedUsers, manufacturers, total: equipment.length }
}

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)

    const result = await fetchFromDb(searchParams)

    return NextResponse.json(result)

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

    // Minimal validation for DB schema
    const requiredFields = ['name', 'equipment_number']
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    const client = createServerClient()

    const payload = {
      name: data.name,
      equipment_number: data.equipment_number,
      category: data.category ?? null,
      model: data.model ?? null,
      serial_number: data.serial_number ?? null,
      purchase_date: data.purchase_date ?? null,
      purchase_cost: data.purchase_cost ?? null,
      current_value: data.current_value ?? null,
      status: data.status ?? 'available',
      location: data.location ?? null,
      checked_out_to: data.checked_out_to ?? null,
      checked_out_date: data.checked_out_date ?? null,
      notes: data.notes ?? null,
      image_url: data.image_url ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: inserted, error } = await client.from('equipment').insert(payload).select().single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ equipment: inserted, message: 'Equipment created successfully' }, { status: 201 })

  } catch (error) {
    console.error('Create equipment error:', error)
    return NextResponse.json(
      { error: 'Failed to create equipment' },
      { status: 500 }
    )
  }
}