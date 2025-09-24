import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/database-server'

// GET /api/simple-transactions
// Optional query params:
// - product_id: string (filter by product)
// - limit: number (default 50)
export async function GET(request: Request) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('product_id') || undefined
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    let query = (supabaseServer as any)
      .from('simple_inventory_transactions')
      .select('*')
      .order('done_at', { ascending: false })
      .limit(isNaN(limit) ? 50 : Math.max(1, Math.min(limit, 200)))

    if (productId) {
      query = query.eq('product_id', productId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message || 'Failed to fetch transactions' }, { status: 500 })
    }

    return NextResponse.json({ transactions: data || [] })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/simple-transactions
// Body: { product_id, transaction_type: 'IN'|'OUT'|'RETURN', quantity, reason?, project_name?, unit_cost?, done_by? }
export async function POST(request: Request) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const product_id: string | undefined = body.product_id
    const transaction_type: 'IN' | 'OUT' | 'RETURN' | undefined = body.transaction_type
    const quantityRaw = body.quantity
    const reason: string | null = body.reason ?? null
    const project_name: string | null = body.project_name ?? null
    const unit_costRaw = body.unit_cost
    const done_by: string = body.done_by || user.fullName || user.firstName || 'Unknown User'

    if (!product_id || !transaction_type) {
      return NextResponse.json({ error: 'Missing required fields: product_id, transaction_type' }, { status: 400 })
    }

    const quantity = typeof quantityRaw === 'string' ? parseFloat(quantityRaw) : Number(quantityRaw)
    if (!quantity || quantity <= 0) {
      return NextResponse.json({ error: 'Quantity must be greater than 0' }, { status: 400 })
    }

    let unit_cost: number | null = null
    if (unit_costRaw !== undefined && unit_costRaw !== null && unit_costRaw !== '') {
      unit_cost = typeof unit_costRaw === 'string' ? parseFloat(unit_costRaw) : Number(unit_costRaw)
      if (isNaN(unit_cost)) unit_cost = null
    }

    // If unit_cost not provided, fall back to product.mauc so total_value is computed correctly
    if (unit_cost == null) {
      const prodRes = await (supabaseServer as any)
        .from('products')
        .select('mauc')
        .eq('id', product_id)
        .single()
      if (!prodRes.error) {
        const mauc = (prodRes.data?.mauc ?? null)
        if (typeof mauc === 'number') unit_cost = mauc
      }
    }

    const insertData = {
      product_id,
      transaction_type,
      quantity,
      reason,
      project_name,
      unit_cost,
      done_by,
      done_at: new Date().toISOString()
    }

    const { data, error } = await (supabaseServer as any)
      .from('simple_inventory_transactions')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      // Surface stock constraint failures from trigger as 400
      const status = (error.message || '').toLowerCase().includes('insufficient stock') ? 400 : 500
      return NextResponse.json({ error: error.message || 'Failed to create transaction' }, { status })
    }

    return NextResponse.json({ transaction: data, success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
