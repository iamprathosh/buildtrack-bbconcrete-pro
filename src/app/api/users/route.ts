import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/database-server'
import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { UserProfile } from '@/types/database'

// Validation schemas
const userCreateSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().optional(),
  role: z.enum(['super_admin', 'project_manager', 'worker']).optional(),
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

    const rawBody = await request.json()

    // Validate input
    let validatedData: z.infer<typeof userCreateSchema>
    try {
      validatedData = userCreateSchema.parse(rawBody)
    } catch (err) {
      if (err instanceof z.ZodError) {
        const safeBody = {
          ...rawBody,
          password: rawBody?.password ? `***len:${String(rawBody.password).length}` : undefined,
        }
        console.error('[POST /api/users] Validation failed', {
          body: safeBody,
          issues: err.issues,
        })
        return NextResponse.json(
          { error: 'Validation failed', details: err.issues },
          { status: 400 }
        )
      }
      throw err
    }

    const db = supabaseServer

    // First, create the authentication user via Clerk with password
    try {
      const client = await clerkClient()
      // Derive first/last name from full_name if provided
      let firstName: string | undefined = undefined
      let lastName: string | undefined = undefined
      if (validatedData.full_name) {
        const parts = validatedData.full_name.trim().split(/\s+/)
        firstName = parts[0]
        lastName = parts.slice(1).join(' ') || undefined
      }

      // Compute a username if the instance requires it
      const makeUsername = (raw: string) => {
        const base = (raw || '').toLowerCase().replace(/[^a-z0-9_\.\-]/g, '_').replace(/^_+|_+$/g, '')
        return base.substring(0, 30) || `user_${Math.random().toString(36).slice(2, 8)}`
      }
      const baseUsername = validatedData.full_name
        ? makeUsername(validatedData.full_name)
        : makeUsername(validatedData.email.split('@')[0])

      const attemptCreate = async (username?: string) =>
        client.users.createUser({
          emailAddress: [validatedData.email],
          password: validatedData.password,
          firstName,
          lastName,
          username,
        })

      let created
      try {
        created = await attemptCreate(baseUsername)
      } catch (e: any) {
        // If username requirement fails or is not unique, try once with a suffixed username
        const needsUsernameRetry = Array.isArray(e?.errors) && e.errors.some((er: any) => {
          const msg = (er?.longMessage || er?.message || '').toLowerCase()
          return msg.includes('username')
        })
        if (needsUsernameRetry) {
          const altUsername = `${baseUsername}_${Math.random().toString(36).slice(2, 5)}`.slice(0, 30)
          console.warn('[POST /api/users] Retrying Clerk createUser with alternate username', { altUsername })
          created = await attemptCreate(altUsername)
        } else {
          throw e
        }
      }
      // Once auth user is created, upsert into user_profiles
      const displayName = validatedData.full_name || validatedData.email.split('@')[0]
      const role = validatedData.role || 'worker'

      // Try to insert profile with Clerk user ID
      let newUser = null as any
      let insertError: any = null
      try {
        const res = await db
          .from('user_profiles')
          .insert({
            id: created.id, // attempt to align with Clerk ID
            email: validatedData.email,
            full_name: displayName,
            role: role,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()
        newUser = res.data
        insertError = res.error
      } catch (e: any) {
        insertError = e
      }

      // Fallback: if insert failed (e.g., invalid UUID for id), retry without setting id
      if (insertError) {
        console.warn('[POST /api/users] Primary insert failed, retrying without explicit id', {
          error: insertError?.message || String(insertError),
          email: validatedData.email,
          role,
        })
        const res2 = await db
          .from('user_profiles')
          .insert({
            email: validatedData.email,
            full_name: displayName,
            role: role,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as any)
          .select()
          .single()
        newUser = res2.data
        insertError = res2.error
      }

      if (insertError) {
        console.error('[POST /api/users] Database error creating profile', {
          email: validatedData.email,
          role,
          error: insertError,
        })
        return NextResponse.json(
          { error: insertError?.message || 'Failed to create user profile' },
          { status: 500 }
        )
      }

      revalidatePath('/users')
      return NextResponse.json({ user: newUser }, { status: 201 })
    } catch (err: any) {
      // Clerk error likely due to duplicate or configuration
      const safeBody = {
        email: validatedData?.email,
        role: validatedData?.role || 'worker',
        full_name: validatedData?.full_name,
        passwordLength: validatedData?.password ? String(validatedData.password).length : 0,
      }
      console.error('[POST /api/users] Clerk createUser failed', {
        body: safeBody,
        clerkErrors: err?.errors,
        message: err?.message,
        stack: err?.stack,
      })
      const message = err?.errors?.[0]?.message || err?.message || 'Failed to create auth user'
      return NextResponse.json({ error: message }, { status: 400 })
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[POST /api/users] ZodError after try/catch boundary', { issues: error.issues })
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('[POST /api/users] API error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
