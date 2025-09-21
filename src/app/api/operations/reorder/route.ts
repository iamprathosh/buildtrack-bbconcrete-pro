import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/database'

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
      quantity,
      notes
    } = body

    const supabase = createServerClient(token || undefined)

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Create a reorder transaction
    const { data: transaction, error } = await supabase
      .from('stock_transactions')
      .insert({
        product_id: productId,
        user_id: userId,
        transaction_type: 'receive',
        quantity,
        transaction_date: new Date().toISOString(),
        notes: `Reorder: ${notes || 'No notes provided'}`,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Reorder transaction failed:', error)
      return NextResponse.json(
        { error: 'Failed to create reorder transaction' },
        { status: 500 }
      )
    }

    // Update product stock level
    const newStock = (product.current_stock || 0) + quantity
    const { error: updateError } = await supabase
      .from('products')
      .update({
        current_stock: newStock,
        updated_at: new Date().toISOString()
      })
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