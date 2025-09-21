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
    const category = searchParams.get('category') || 'all'
    const status = searchParams.get('status') || 'all'
    const search = searchParams.get('search')?.toLowerCase()

    const supabase = createServerClient(token || undefined)

    // Start building the query
    let query = supabase
      .from('products')
      .select(`
        *,
        category:product_categories(name),
        location:inventory_locations(name),
        transactions:stock_transactions(
          quantity,
          transaction_type,
          transaction_date,
          created_at
        )
      `)
      .eq('is_active', true)

    // Apply category filter
    if (category && category !== 'all') {
      query = query.eq('category.name', category)
    }

    // Add search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,supplier.ilike.%${search}%`)
    }

    // Get stock items
    const { data: products, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch stock levels' }, { status: 500 })
    }

    // Calculate average usage for each product
    const transformedProducts = products.map(product => {
      // Get transactions from the last 30 days
      const recentTransactions = (product.transactions || []).filter(t => {
        const date = new Date(t.transaction_date || t.created_at)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return date >= thirtyDaysAgo
      })

      // Calculate total outgoing quantity (pulls)
      const totalPulls = recentTransactions
        .filter(t => t.transaction_type === 'pull')
        .reduce((sum, t) => sum + (t.quantity || 0), 0)

      // Calculate average monthly usage
      const averageUsage = Math.round(totalPulls / 30 * 30) // Convert to monthly

      // Calculate stock value
      const stockValue = (product.current_stock || 0) * (product.mauc || 0)

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category?.name || 'Uncategorized',
        currentStock: product.current_stock || 0,
        minLevel: product.min_stock_level || 0,
        maxLevel: product.max_stock_level || product.min_stock_level * 2 || 100,
        unit: product.unit_of_measure,
        value: stockValue,
        location: product.location?.name || product.location || 'No Location',
        supplier: product.supplier || 'No Supplier',
        lastUpdated: product.updated_at || product.created_at,
        reorderPoint: product.min_stock_level || 0,
        averageUsage
      }
    })

    // Apply status filter if needed
    let filteredProducts = transformedProducts
    if (status && status !== 'all') {
      filteredProducts = transformedProducts.filter(product => {
        const stockLevel = (product.currentStock / product.maxLevel) * 100
        
        switch (status) {
          case 'critical':
            return product.currentStock <= product.minLevel * 0.5
          case 'low':
            return product.currentStock <= product.minLevel
          case 'good':
            return product.currentStock > product.minLevel * 1.5
          default:
            return true
        }
      })
    }

    // Get category list for filters
    const { data: categories } = await supabase
      .from('product_categories')
      .select('name')
      .order('name')

    return NextResponse.json({
      items: filteredProducts,
      categories: categories?.map(c => c.name) || []
    })

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
      currentStock,
      minLevel,
      maxLevel,
      location,
      notes
    } = body

    const supabase = createServerClient(token || undefined)

    // Update product stock level and settings
    const { data: product, error } = await supabase
      .from('products')
      .update({
        current_stock: currentStock,
        min_stock_level: minLevel,
        max_stock_level: maxLevel,
        location: location,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .select()
      .single()

    if (error) {
      console.error('Stock update failed:', error)
      return NextResponse.json(
        { error: 'Failed to update stock level' },
        { status: 500 }
      )
    }

    return NextResponse.json({ product })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}