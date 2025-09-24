import { NextResponse } from 'next/server'
import { supabase } from '@/lib/database'

export async function GET() {
  try {
    // Test basic database connection
    const { data, error } = await supabase
      .from('products')
      .select('count(*)', { count: 'exact', head: true })

    if (error) {
      console.error('Database test error:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        details: 'Failed to connect to products table'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      productCount: data || 0
    })

  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}