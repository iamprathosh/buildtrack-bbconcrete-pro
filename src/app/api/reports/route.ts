import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { currentUser } from '@clerk/nextjs/server'
import { Database } from '@/types/database'


interface ReportDataRow {
  id: string
  type: 'inventory' | 'equipment' | 'project'
  date: string
  name: string
  description?: string
  quantity?: number
  unit?: string
  cost?: number
  status: string
  maintenanceStatus?: 'good' | 'needs_maintenance' | 'under_maintenance' | 'out_of_order'
  location?: string
  project?: string
  category?: string
  createdAt: string
  updatedAt?: string
}

// Fetch simple inventory transactions from Supabase
async function fetchInventoryTransactions(supabase: any, filters: {
  startDate?: string
  endDate?: string
}): Promise<ReportDataRow[]> {
  try {
    let query = supabase
      .from('simple_inventory_transactions')
      .select('*')
      .order('done_at', { ascending: false })

    if (filters.startDate) {
      query = query.gte('done_at', filters.startDate)
    }
    if (filters.endDate) {
      query = query.lte('done_at', filters.endDate)
    }

    const { data, error } = await query
    if (error) {
      console.error('Simple inventory transactions query error:', error)
      throw error
    }

    if (!data || data.length === 0) {
      console.log('No simple inventory transactions found')
      return []
    }

    console.log(`Found ${data.length} simple inventory transactions`)

    // Get unique product IDs to fetch product details
    const productIds = [...new Set(data.map((item: any) => item.product_id).filter(Boolean))]
    console.log('Product IDs found:', productIds)

    // Fetch product details
    let productsMap: Record<string, any> = {}
    if (productIds.length > 0) {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, sku, description, unit_of_measure, category')
        .in('id', productIds)

      if (productsError) {
        console.error('Products query error:', productsError)
      } else {
        productsMap = (products || []).reduce((acc: any, product: any) => {
          acc[product.id] = product
          return acc
        }, {})
        console.log('Products fetched:', Object.keys(productsMap).length)
      }
    }

    return data.map((item: any) => {
      const product = productsMap[item.product_id] || {}
      return {
        id: item.id,
        type: 'inventory' as const,
        date: item.done_at?.split('T')[0] || item.created_at?.split('T')[0] || '',
        name: product.name || 'Unknown Product',
        description: `${item.transaction_type || 'Unknown'} Transaction${item.reason ? ` - ${item.reason}` : ''}`,
        quantity: Math.abs(item.quantity || 0),
        unit: product.unit_of_measure || undefined,
        cost: item.unit_cost && item.quantity ? (item.quantity * item.unit_cost) : undefined,
        status: item.transaction_type?.toLowerCase() || 'unknown',
        project: item.project_name || undefined,
        category: product.category || 'uncategorized',
        createdAt: item.created_at || item.done_at,
        updatedAt: item.done_at
      }
    })
  } catch (error) {
    console.error('Error fetching inventory transactions:', error)
    return []
  }
}

// Fetch equipment data from Supabase
async function fetchEquipmentData(supabase: any, filters: {
  startDate?: string
  endDate?: string
}): Promise<ReportDataRow[]> {
  try {
    let query = supabase
      .from('equipment')
      .select('*')
      .order('updated_at', { ascending: false })

    if (filters.startDate) {
      query = query.gte('updated_at', filters.startDate)
    }
    if (filters.endDate) {
      query = query.lte('updated_at', filters.endDate)
    }

    const { data, error } = await query
    if (error) throw error

    const getMaintenanceStatus = (status: string) => {
      switch (status) {
        case 'available': return 'good'
        case 'maintenance': return 'under_maintenance'
        case 'retired': return 'out_of_order'
        default: return 'good'
      }
    }

    return (data || []).map(item => ({
      id: item.id,
      type: 'equipment' as const,
      date: item.updated_at?.split('T')[0] || item.created_at.split('T')[0],
      name: item.name,
      description: `${item.model || ''} ${item.serial_number ? `(S/N: ${item.serial_number})` : ''}`.trim(),
      cost: item.current_value || item.purchase_cost,
      status: item.status,
      maintenanceStatus: getMaintenanceStatus(item.status) as any,
      location: item.location,
      category: item.category,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }))
  } catch (error) {
    console.error('Error fetching equipment data:', error)
    return []
  }
}

// Fetch project tasks from Supabase
async function fetchProjectTasks(supabase: any, filters: {
  startDate?: string
  endDate?: string
}): Promise<ReportDataRow[]> {
  try {
    let query = supabase
      .from('project_tasks')
      .select(`
        id,
        name,
        description,
        status,
        priority,
        start_date,
        due_date,
        completed_date,
        estimated_hours,
        actual_hours,
        notes,
        created_at,
        updated_at,
        projects!inner(
          name
        )
      `)
      .order('updated_at', { ascending: false })

    if (filters.startDate) {
      query = query.gte('start_date', filters.startDate)
    }
    if (filters.endDate) {
      query = query.lte('due_date', filters.endDate)
    }

    const { data, error } = await query
    if (error) throw error

    return (data || []).map((item: any) => ({
      id: item.id,
      type: 'project' as const,
      date: item.completed_date || item.due_date || item.start_date || item.created_at.split('T')[0],
      name: item.name,
      description: item.description,
      quantity: item.actual_hours || item.estimated_hours,
      unit: 'hours',
      status: item.status,
      project: item.projects?.name,
      category: `${item.priority}_priority`,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }))
  } catch (error) {
    console.error('Error fetching project tasks:', error)
    return []
  }
}

// Fetch all data based on category filter
async function fetchReportData(supabase: any, filters: {
  startDate?: string
  endDate?: string
  category?: string
}): Promise<ReportDataRow[]> {
  const results: ReportDataRow[] = []

  try {
    console.log('fetchReportData called with filters:', filters)
    
    // Fetch data based on category filter
    if (!filters.category || filters.category === 'all') {
      console.log('Fetching all data types (inventory, equipment, projects)')
      // Fetch all data types
      const [inventoryData, equipmentData, projectData] = await Promise.all([
        fetchInventoryTransactions(supabase, filters),
        fetchEquipmentData(supabase, filters),
        fetchProjectTasks(supabase, filters)
      ])
      console.log(`Data counts - inventory: ${inventoryData.length}, equipment: ${equipmentData.length}, projects: ${projectData.length}`)
      results.push(...inventoryData, ...equipmentData, ...projectData)
    } else if (filters.category === 'inventory') {
      console.log('Fetching inventory data only')
      const inventoryData = await fetchInventoryTransactions(supabase, filters)
      console.log(`Inventory data count: ${inventoryData.length}`)
      results.push(...inventoryData)
    } else if (filters.category === 'equipment') {
      console.log('Fetching equipment data only')
      const equipmentData = await fetchEquipmentData(supabase, filters)
      console.log(`Equipment data count: ${equipmentData.length}`)
      results.push(...equipmentData)
    } else if (filters.category === 'projects') {
      console.log('Fetching projects data only')
      const projectData = await fetchProjectTasks(supabase, filters)
      console.log(`Project data count: ${projectData.length}`)
      results.push(...projectData)
    }

    // Sort by date (newest first)
    results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    console.log(`fetchReportData returning ${results.length} total records`)
    return results
  } catch (error) {
    console.error('Error fetching report data:', error)
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filters = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      category: searchParams.get('category') || undefined
    }

    console.log('Reports API called with filters:', filters)

    // Initialize Supabase client using shared helper
    const supabase = createServerClient()

    // Fetch real data from Supabase
    const data = await fetchReportData(supabase, filters)

    console.log(`Reports API returning ${data.length} records`)

    return NextResponse.json({
      data: data,
      totalCount: data.length,
      filters: filters,
      message: data.length === 0 ? 'No data found for the selected filters' : undefined
    })
  } catch (error) {
    console.error('Reports API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
