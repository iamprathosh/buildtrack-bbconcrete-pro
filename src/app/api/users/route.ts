import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'

// Validation schemas
const userCreateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  role: z.enum(['admin', 'manager', 'supervisor', 'worker', 'contractor']),
  department: z.string().min(1, 'Department is required'),
  position: z.string().min(1, 'Position is required'),
  permissions: z.object({
    projects: z.enum(['read', 'write', 'admin', 'none']),
    inventory: z.enum(['read', 'write', 'admin', 'none']),
    procurement: z.enum(['read', 'write', 'admin', 'none']),
    reports: z.enum(['read', 'write', 'admin', 'none']),
    users: z.enum(['read', 'write', 'admin', 'none']),
    settings: z.enum(['read', 'write', 'admin', 'none'])
  }),
  projects: z.array(z.string()).default([]),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([])
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
    const permissions = searchParams.get('permissions') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const includeStats = searchParams.get('includeStats') === 'true'

    // Build query
    let query = supabase
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        avatar,
        role,
        status,
        department,
        position,
        permissions,
        projects,
        last_login,
        join_date,
        invited_by,
        notes,
        tags,
        created_at,
        updated_at
      `)

    // Apply filters
    if (role !== 'all') {
      query = query.eq('role', role)
    }
    
    if (department !== 'all') {
      query = query.eq('department', department)
    }
    
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    // Search functionality
    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,` +
        `last_name.ilike.%${search}%,` +
        `email.ilike.%${search}%,` +
        `department.ilike.%${search}%,` +
        `position.ilike.%${search}%,` +
        `notes.ilike.%${search}%`
      )
    }

    // Add pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    // Order by name
    query = query.order('first_name', { ascending: true })

    const { data: users, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    // Transform data to match frontend interface
    const transformedUsers = users?.map(user => ({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      department: user.department,
      position: user.position,
      permissions: user.permissions,
      projects: user.projects || [],
      lastLogin: user.last_login ? new Date(user.last_login) : undefined,
      joinDate: new Date(user.join_date),
      invitedBy: user.invited_by,
      notes: user.notes || '',
      tags: user.tags || [],
      addedDate: new Date(user.created_at),
      lastUpdated: new Date(user.updated_at)
    })) || []

    let stats = null
    if (includeStats) {
      // Calculate statistics
      const { data: allUsers } = await supabase
        .from('users')
        .select('role, status, last_login, department')
      
      if (allUsers) {
        const now = new Date()
        const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        
        stats = {
          totalUsers: allUsers.length,
          activeUsers: allUsers.filter(u => u.status === 'active').length,
          pendingUsers: allUsers.filter(u => u.status === 'pending').length,
          adminUsers: allUsers.filter(u => u.role === 'admin').length,
          recentLogins: allUsers.filter(u => 
            u.last_login && new Date(u.last_login) > dayAgo
          ).length,
          departments: [...new Set(allUsers.map(u => u.department))].length
        }
      }
    }

    return NextResponse.json({ 
      users: transformedUsers,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
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

    // Check if user with email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', validatedData.email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Get current user info for invited_by
    const { data: currentUser } = await supabase
      .from('users')
      .select('first_name, last_name')
      .eq('id', userId)
      .single()

    // Create new user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        role: validatedData.role,
        status: 'pending', // New users start as pending
        department: validatedData.department,
        position: validatedData.position,
        permissions: validatedData.permissions,
        projects: validatedData.projects,
        join_date: new Date().toISOString(),
        invited_by: currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'System',
        notes: validatedData.notes || '',
        tags: validatedData.tags
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

    // Transform response
    const transformedUser = {
      id: newUser.id,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      email: newUser.email,
      phone: newUser.phone,
      avatar: newUser.avatar,
      role: newUser.role,
      status: newUser.status,
      department: newUser.department,
      position: newUser.position,
      permissions: newUser.permissions,
      projects: newUser.projects || [],
      lastLogin: newUser.last_login ? new Date(newUser.last_login) : undefined,
      joinDate: new Date(newUser.join_date),
      invitedBy: newUser.invited_by,
      notes: newUser.notes || '',
      tags: newUser.tags || [],
      addedDate: new Date(newUser.created_at),
      lastUpdated: new Date(newUser.updated_at)
    }

    return NextResponse.json({ user: transformedUser }, { status: 201 })

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
