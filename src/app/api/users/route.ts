import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/database'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { UserProfile } from '@/types/database'

// Validation schemas
const userCreateSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  phone_extension: z.string().optional(),
  emergency_contact: z.string().optional(),
  role: z.enum(['super_admin', 'project_manager', 'worker']),
  department_id: z.string().uuid().optional(),
  position: z.string().optional(),
  reports_to_id: z.string().uuid().optional(),
  hire_date: z.string().datetime().optional(),
  permissions: z.record(z.string(), z.string()).optional(),
  is_active: z.boolean().default(true)
})

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || 'all'
    const department = searchParams.get('department') || 'all'
    const status = searchParams.get('status') || 'all'
    const includeStats = searchParams.get('includeStats') === 'true'

    const db = createServerClient()

    // Build query
    let query = db
      .from('user_profiles')
      .select(`
        *,
        department:departments(*),
        reports_to:user_profiles!reports_to_id(*)
      `)

    // Apply filters
    if (role !== 'all') {
      query = query.eq('role', role)
    }
    
    if (department !== 'all') {
      query = query.eq('department_id', department)
    }
    
    if (status === 'active') {
      query = query.eq('is_active', true)
    } else if (status === 'inactive') {
      query = query.eq('is_active', false)
    }

    // Search functionality
    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,` +
        `email.ilike.%${search}%,` +
        `phone.ilike.%${search}%,` +
        `position.ilike.%${search}%`
      )
    }

    // Order by name
    query = query.order('full_name', { ascending: true })

    const { data: users, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    // Transform data
    const userProfiles = (users || []) as UserProfile[]

    let stats = null
    if (includeStats) {
      // Calculate statistics
      const { data: allUsers } = await db
        .from('user_profiles')
        .select('role, is_active, last_login, department_id')
      
      if (allUsers) {
        const now = new Date()
        const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        
        stats = {
          totalUsers: allUsers.length,
          activeUsers: allUsers.filter(u => u.is_active).length,
          inactiveUsers: allUsers.filter(u => !u.is_active).length,
          recentLogins: allUsers.filter(u => 
            u.last_login && new Date(u.last_login) > dayAgo
          ).length
        }
      }
    }

    return NextResponse.json({ 
      users: userProfiles,
      stats
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = userCreateSchema.parse(body)

    const db = createServerClient()
    
    // Check if user with email already exists
    const { data: existingUser } = await db
      .from('user_profiles')
      .select('id')
      .eq('email', validatedData.email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Create new user
    const { data: newUser, error } = await db
      .from('user_profiles')
      .insert({
        ...validatedData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    revalidatePath('/users')
    return NextResponse.json({ user: newUser }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}