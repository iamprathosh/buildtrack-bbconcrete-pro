import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/database'
import { z } from 'zod'

// Validation schemas aligned to user_profiles
const userUpdateSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().optional(),
  phone_extension: z.string().optional(),
  emergency_contact: z.string().optional(),
  role: z.enum(['super_admin', 'project_manager', 'worker']).optional(),
  department_id: z.string().uuid().nullable().optional(),
  position: z.string().optional(),
  reports_to_id: z.string().uuid().nullable().optional(),
  hire_date: z.string().datetime().nullable().optional(),
  permissions: z.record(z.string(), z.string()).optional(),
  is_active: z.boolean().optional(),
})

const statusUpdateSchema = z.union([
  z.object({ is_active: z.boolean() }),
  z.object({
    action: z.literal('update_status'),
    status: z.enum(['active', 'inactive']),
    reason: z.string().optional(),
  }),
])

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: currentUserId } = await auth()

    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = params

    const db = createServerClient()

    const { data: user, error } = await db
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if ((error as any).code === 'PGRST116') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch user' },
        { status: 500 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: currentUserId } = await auth()

    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = params
    const body = await request.json()

    const validatedData = userUpdateSchema.parse(body)

    const db = createServerClient()

    // Check if user exists
    const { data: existingUser, error: fetchError } = await db
      .from('user_profiles')
      .select('id, email')
      .eq('id', userId)
      .single()

    if (fetchError || !existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If email is being updated, check for duplicates
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const { data: duplicateUser } = await db
        .from('user_profiles')
        .select('id')
        .eq('email', validatedData.email)
        .neq('id', userId)
        .single()

      if (duplicateUser) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        )
      }
    }

    const updateData: Record<string, any> = {
      ...validatedData,
      updated_at: new Date().toISOString(),
    }

    const { data: updatedUser, error } = await db
      .from('user_profiles')
      .update(updateData)
      .eq('id', userId)
      .select('*')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      )
    }

    return NextResponse.json({ user: updatedUser })
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: currentUserId } = await auth()

    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = params

    const db = createServerClient()

    // Prevent self-deletion (optional if ids align)
    if (userId === currentUserId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Ensure user exists
    const { data: existingUser, error: fetchError } = await db
      .from('user_profiles')
      .select('id, full_name')
      .eq('id', userId)
      .single()

    if (fetchError || !existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { error: updateError } = await db
      .from('user_profiles')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Database error:', updateError)
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'User deactivated successfully' })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: currentUserId } = await auth()

    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = params
    const body = await request.json()

    const parsed = statusUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      )
    }

    let isActiveUpdate: boolean | null = null
    if ('is_active' in parsed.data) {
      isActiveUpdate = parsed.data.is_active
    } else if (parsed.data.action === 'update_status') {
      isActiveUpdate = parsed.data.status === 'active'
    }

    if (isActiveUpdate === null) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const db = createServerClient()

    const { data: updatedUser, error } = await db
      .from('user_profiles')
      .update({ 
        is_active: isActiveUpdate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('id, full_name, is_active')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update user status' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Status updated successfully',
      user: updatedUser,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
