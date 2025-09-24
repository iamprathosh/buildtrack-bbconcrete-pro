import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // Create server-side Supabase client
    const supabase = createServerClient()

    // Fetch recent equipment transactions with equipment details
    const { data: equipmentTx, error: equipmentError } = await supabase
      .from('equipment_transactions')
      .select(`
        *,
        equipment:equipment_id (
          name,
          equipment_number,
          category
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (equipmentError && !(equipmentError.message?.includes('relation') && equipmentError.message?.includes('does not exist'))) {
      console.error('Error fetching equipment transactions:', equipmentError)
      return NextResponse.json(
        { error: 'Failed to fetch equipment transactions' },
        { status: 500 }
      )
    }

    // Fetch recent simple inventory transactions with product details
    // Fetch recent simple inventory transactions (no join to avoid FK naming issues)
    const { data: inventoryTxRaw, error: invError } = await supabase
      .from('simple_inventory_transactions')
      .select('*')
      .order('done_at', { ascending: false })
      .limit(limit)

    if (invError && !(invError.message?.includes('relation') && invError.message?.includes('does not exist'))) {
      console.error('Error fetching simple inventory transactions:', invError)
      // Continue without inventory results rather than failing the whole feed
    }

    // Load product names for inventory tx
    let productsMap: Record<string, { name: string; sku: string | null }> = {}
    const productIds = Array.from(new Set((inventoryTxRaw || []).map((t: any) => t.product_id).filter(Boolean)))
    if (productIds.length > 0) {
      const { data: productsList } = await supabase
        .from('products')
        .select('id, name, sku')
        .in('id', productIds)
      productsMap = (productsList || []).reduce((acc: any, p: any) => {
        acc[p.id] = { name: p.name, sku: p.sku }
        return acc
      }, {})
    }

    // Transform equipment transactions
    const equipmentActivities = (equipmentTx || []).map((transaction: any) => {
      const equipmentName = transaction.equipment?.name || 'Unknown Equipment'
      const equipmentNumber = transaction.equipment?.equipment_number || ''

      let title = ''
      let description = ''
      let status: 'completed' | 'pending' | 'warning' = 'completed'
      
      switch (transaction.action) {
        case 'assign_to_project':
          title = 'Equipment Assigned to Project'
          description = `${equipmentName} (${equipmentNumber}) assigned to project`
          break
        case 'assign_to_person':
          title = 'Equipment Assigned to Person'
          description = `${equipmentName} (${equipmentNumber}) assigned to ${transaction.person_name || 'person'}`
          break
        case 'move_to_maintenance':
          title = 'Equipment Moved to Maintenance'
          description = `${equipmentName} (${equipmentNumber}) moved to maintenance`
          status = 'warning'
          break
        case 'check_in':
          title = 'Equipment Checked In'
          description = `${equipmentName} (${equipmentNumber}) checked in and available`
          status = 'completed'
          break
        default:
          title = 'Equipment Transaction'
          description = `${equipmentName} (${equipmentNumber}) - ${transaction.action}`
      }

      const now = new Date()
      const transactionDate = new Date(transaction.created_at)
      const diffInMinutes = Math.floor((now.getTime() - transactionDate.getTime()) / (1000 * 60))
      let timestamp = ''
      if (diffInMinutes < 1) timestamp = 'Just now'
      else if (diffInMinutes < 60) timestamp = `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`
      else if (diffInMinutes < 1440) timestamp = `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) === 1 ? '' : 's'} ago`
      else timestamp = `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) === 1 ? '' : 's'} ago`

      return {
        id: transaction.id,
        type: 'equipment' as const,
        title,
        description,
        timestamp,
        status,
        user: transaction.done_by || 'System',
        link: '/equipment',
        metadata: {
          equipment_id: transaction.equipment_id,
          action: transaction.action,
          project_id: transaction.project_id,
          person_name: transaction.person_name,
          notes: transaction.notes,
          expected_return_date: transaction.expected_return_date
        }
      }
    })

    // Transform inventory transactions
    const inventoryActivities = (inventoryTxRaw || []).map((tx: any) => {
      const p = productsMap[tx.product_id] || { name: 'Unknown Product', sku: null }
      const productName = p.name
      const sku = p.sku || ''
      const t = (tx.transaction_type || '').toUpperCase()
      const actionWord = t === 'IN' ? 'Stock In' : t === 'OUT' ? 'Stock Out' : 'Return'
      const qty = tx.quantity

      const now = new Date()
      const when = new Date(tx.done_at || tx.created_at)
      const diffInMinutes = Math.floor((now.getTime() - when.getTime()) / (1000 * 60))
      let timestamp = ''
      if (diffInMinutes < 1) timestamp = 'Just now'
      else if (diffInMinutes < 60) timestamp = `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`
      else if (diffInMinutes < 1440) timestamp = `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) === 1 ? '' : 's'} ago`
      else timestamp = `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) === 1 ? '' : 's'} ago`

      return {
        id: tx.id,
        type: 'inventory' as const,
        title: `${actionWord}: ${productName}`,
        description: `${qty} ${sku ? `• SKU ${sku}` : ''}${tx.project_name ? ` • ${tx.project_name}` : ''}`.trim(),
        timestamp,
        status: 'completed' as const,
        user: tx.done_by || 'System',
        link: '/inventory',
        metadata: {
          product_id: tx.product_id,
          transaction_type: tx.transaction_type,
          quantity: tx.quantity,
          unit_cost: tx.unit_cost,
          total_value: tx.total_value,
          project_name: tx.project_name,
          reason: tx.reason,
          created_at: tx.done_at || tx.created_at
        }
      }
    })

    // Merge and cap by limit (sort by raw date when available)
    const merged = [...equipmentActivities, ...inventoryActivities]
    const parseDate = (act: any) => new Date(act.metadata?.created_at || 0).getTime()
    merged.sort((a, b) => parseDate(b) - parseDate(a))
    const activities = merged.slice(0, limit)

    // If both tables missing, return mock
    if (!equipmentTx && !inventoryTx) {
      return NextResponse.json({ 
        activities: [
          {
            id: 'mock-1',
            type: 'system',
            title: 'System Ready',
            description: 'Activity feed is ready',
            timestamp: 'Just now',
            status: 'completed',
            user: 'System',
            link: '/',
            metadata: {}
          }
        ]
      })
    }

    return NextResponse.json({ activities })

  } catch (error) {
    console.error('Get recent equipment transactions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}