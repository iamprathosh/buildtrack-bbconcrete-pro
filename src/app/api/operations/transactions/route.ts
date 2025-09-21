import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/database'
import type { Database } from '@/types/database'

export async function GET(request: Request) {
  try {
    const session = auth()
    const userId = session?.userId
    const getToken = session?.getToken
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const token = getToken ? await getToken({ template: 'supabase' }) : undefined

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const status = searchParams.get('status') || 'all'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const search = searchParams.get('search')?.toLowerCase()

    const supabase = createServerClient(token || undefined)

    // Start building the query
    let query = supabase
      .from('stock_transactions')
      .select(`
        *,
        product:products(name, sku, unit_of_measure),
        user:user_profiles(full_name),
        project:projects(name)
      `)

    // Apply filters
    if (type && type !== 'all') {
      query = query.eq('transaction_type', type)
    }

    // Add date range filter if provided
    if (startDate) {
      query = query.gte('transaction_date', startDate)
    }
    if (endDate) {
      query = query.lte('transaction_date', endDate)
    }

    // Add search filter if provided
    if (search) {
      query = query.or(`product.name.ilike.%${search}%,product.sku.ilike.%${search}%`)
    }

    // Get transactions
    const { data: transactions, error } = await query
      .order('transaction_date', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
    }

    // Transform the data to match the frontend interface
    const transformedTransactions = transactions.map((transaction) => ({
      id: transaction.id,
      type: transaction.transaction_type.toUpperCase(),
      product: transaction.product?.name || 'Unknown Product',
      sku: transaction.product?.sku || 'N/A',
      quantity: transaction.quantity,
      unit: transaction.product?.unit_of_measure || 'units',
      project: transaction.project?.name || 'No Project',
      user: transaction.user?.full_name || 'Unknown User',
      timestamp: transaction.transaction_date || transaction.created_at,
      status: 'completed', // Since we don't track status in the database, all historical transactions are completed
      notes: transaction.notes,
      unit_cost: transaction.unit_cost
    }))

    return NextResponse.json({ transactions: transformedTransactions })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = auth()
    const userId = session?.userId
    const getToken = session?.getToken
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const token = getToken ? await getToken({ template: 'supabase' }) : undefined

    const body = await request.json()
    const {
      productId,
      projectId,
      quantity,
      transactionType,
      unitCost,
      notes
    } = body

    const supabase = createServerClient(token || undefined)

    // First, get the current stock level
    const { data: product } = await supabase
      .from('products')
      .select('current_stock, unit_of_measure')
      .eq('id', productId)
      .single()

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Calculate new stock level
    let newStock = product.current_stock || 0
    if (transactionType === 'pull') {
      newStock -= quantity
    } else if (transactionType === 'receive' || transactionType === 'return') {
      newStock += quantity
    }

    // Start a transaction to update both stock level and create transaction record
    const { data: transaction, error } = await supabase
      .from('stock_transactions')
      .insert({
        product_id: productId,
        project_id: projectId,
        user_id: userId,
        transaction_type: transactionType,
        quantity,
        unit_cost: unitCost,
        transaction_date: new Date().toISOString(),
        notes,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Transaction creation failed:', error)
      return NextResponse.json(
        { error: 'Failed to create transaction' },
        { status: 500 }
      )
    }

    // Update product stock level
    const { error: updateError } = await supabase
      .from('products')
      .update({ current_stock: newStock })
      .eq('id', productId)

    if (updateError) {
      console.error('Stock update failed:', updateError)
      return NextResponse.json(
        { error: 'Failed to update stock level' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      transaction: {
        ...transaction,
        new_stock_level: newStock
      }
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}