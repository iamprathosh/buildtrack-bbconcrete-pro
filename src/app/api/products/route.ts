import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { productService } from '@/services/ProductService'
import type { ProductInsert } from '@/types/database'

export async function GET(request: Request) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const location = searchParams.get('location')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined

    const options = {
      category: category || undefined,
      location: location || undefined,
      status: status || undefined,
      search: search || undefined,
      limit
    }

    const { data: products, error } = await productService.getAllWithDetails(options)

    if (error) {
      console.error('Failed to fetch products:', error)
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    // Transform products for frontend compatibility
    const transformedProducts = products?.map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      description: product.description,
      category: product.category || 'Uncategorized',
      unit_of_measure: product.unit_of_measure,
      current_stock: product.current_stock || 0,
      min_stock_level: product.min_stock_level || 0,
      max_stock_level: product.max_stock_level || 0,
      mauc: product.mauc || 0,
      supplier: product.supplier,
      location: product.location || product.inventory_location?.name,
      location_id: product.location_id,
      image_url: product.image_url,
      is_active: product.is_active,
      stock_status: product.stock_status,
      total_value: product.total_value || 0,
      created_by: product.created_by,
      created_by_id: product.created_by_id,
      created_by_email: product.created_by_email,
      updated_by: product.updated_by,
      updated_by_id: product.updated_by_id,
      updated_by_email: product.updated_by_email,
      created_at: product.created_at,
      updated_at: product.updated_at
    })) || []

    return NextResponse.json({ 
      products: transformedProducts,
      count: transformedProducts.length
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
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Map the frontend field names to database field names
    const productData: ProductInsert = {
      sku: body.sku,
      name: body.name,
      description: body.description || null,
      category: body.category || null,
      unit_of_measure: body.unit_of_measure,
      current_stock: body.current_stock || 0,
      min_stock_level: body.min_stock_level || 0,
      max_stock_level: body.max_stock_level || 0,
      mauc: body.mauc || 0,
      location: body.location || null,
      location_id: body.location_id || null,
      supplier: body.supplier || null,
      image_url: body.image_url || null,
      is_active: body.is_active !== false, // Default to true unless explicitly false
      // Automatically filled "done by" fields
      created_by: body.created_by || user.fullName || user.firstName || 'Unknown User',
      created_by_id: body.created_by_id || user.id,
      created_by_email: body.created_by_email || user.emailAddresses?.[0]?.emailAddress || ''
    }

    // Validate required fields
    if (!productData.sku || !productData.name || !productData.unit_of_measure) {
      return NextResponse.json(
        { error: 'Missing required fields: sku, name, and unit_of_measure are required' },
        { status: 400 }
      )
    }

    console.log('Creating product with data:', productData)
    
    const { data: product, error } = await productService.createProduct(productData)

    if (error) {
      console.error('Failed to create product:', error)
      console.error('Product data that failed:', productData)
      return NextResponse.json(
        { error: 'Failed to create product: ' + error },
        { status: 500 }
      )
    }
    
    console.log('Product created successfully:', product)

    // Return the created product
    return NextResponse.json({
      product: {
        id: product?.id,
        name: product?.name,
        sku: product?.sku,
        description: product?.description,
        category: product?.category,
        unit_of_measure: product?.unit_of_measure,
        current_stock: product?.current_stock,
        min_stock_level: product?.min_stock_level,
        max_stock_level: product?.max_stock_level,
        mauc: product?.mauc,
        supplier: product?.supplier,
        location: product?.location,
        location_id: product?.location_id,
        image_url: product?.image_url,
        is_active: product?.is_active,
        created_by: product?.created_by,
        created_by_id: product?.created_by_id,
        created_by_email: product?.created_by_email,
        updated_by: product?.updated_by,
        updated_by_id: product?.updated_by_id,
        updated_by_email: product?.updated_by_email,
        created_at: product?.created_at,
        updated_at: product?.updated_at
      },
      success: true
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}