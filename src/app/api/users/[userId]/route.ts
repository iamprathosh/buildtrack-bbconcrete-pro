import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'

// Validation schemas
const userUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().optional(),
  role: z.enum(['admin', 'manager', 'supervisor', 'worker', 'contractor']).optional(),
  status: z.enum(['active', 'inactive', 'pending', 'suspended']).optional(),
  department: z.string().min(1, 'Department is required').optional(),
  position: z.string().min(1, 'Position is required').optional(),
  permissions: z.object({
    projects: z.enum(['read', 'write', 'admin', 'none']),
    inventory: z.enum(['read', 'write', 'admin', 'none']),
    procurement: z.enum(['read', 'write', 'admin', 'none']),
    reports: z.enum(['read', 'write', 'admin', 'none']),
    users: z.enum(['read', 'write', 'admin', 'none']),
    settings: z.enum(['read', 'write', 'admin', 'none'])
  }).optional(),
  projects: z.array(z.string()).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional()
})

const statusUpdateSchema = z.object({
  status: z.enum(['active', 'inactive', 'pending', 'suspended']),
  reason: z.string().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: currentUserId } = await auth()

    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await params

    // Get user details
    const { data: user, error } = await supabase
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
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch user' },
        { status: 500 }
      )
    }

    // Transform data
    const transformedUser = {
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
    }

    return NextResponse.json({ user: transformedUser })

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
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: currentUserId } = await auth()

    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await params
    const body = await request.json()

    // Validate input
    const validatedData = userUpdateSchema.parse(body)

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', userId)
      .single()

    if (fetchError || !existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If email is being updated, check for duplicates
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const { data: duplicateUser } = await supabase
        .from('users')
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

    // Prepare update data
    const updateData: any = {}
    if (validatedData.firstName !== undefined) updateData.first_name = validatedData.firstName
    if (validatedData.lastName !== undefined) updateData.last_name = validatedData.lastName
    if (validatedData.email !== undefined) updateData.email = validatedData.email
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone
    if (validatedData.role !== undefined) updateData.role = validatedData.role
    if (validatedData.status !== undefined) updateData.status = validatedData.status
    if (validatedData.department !== undefined) updateData.department = validatedData.department
    if (validatedData.position !== undefined) updateData.position = validatedData.position
    if (validatedData.permissions !== undefined) updateData.permissions = validatedData.permissions
    if (validatedData.projects !== undefined) updateData.projects = validatedData.projects
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes
    if (validatedData.tags !== undefined) updateData.tags = validatedData.tags

    // Update user
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      )
    }

    // Log the activity
    await supabase.from('user_activities').insert({
      user_id: userId,
      actor_id: currentUserId,
      action: 'user_updated',
      details: { 
        updatedFields: Object.keys(updateData),
        changes: updateData
      }
    })

    // Transform response
    const transformedUser = {
      id: updatedUser.id,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      avatar: updatedUser.avatar,
      role: updatedUser.role,
      status: updatedUser.status,
      department: updatedUser.department,
      position: updatedUser.position,
      permissions: updatedUser.permissions,
      projects: updatedUser.projects || [],
      lastLogin: updatedUser.last_login ? new Date(updatedUser.last_login) : undefined,
      joinDate: new Date(updatedUser.join_date),
      invitedBy: updatedUser.invited_by,
      notes: updatedUser.notes || '',
      tags: updatedUser.tags || [],
      addedDate: new Date(updatedUser.created_at),
      lastUpdated: new Date(updatedUser.updated_at)
    }

    return NextResponse.json({ user: transformedUser })

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
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: currentUserId } = await auth()

    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await params

    // Prevent self-deletion
    if (userId === currentUserId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, first_name, last_name')
      .eq('id', userId)
      .single()

    if (fetchError || !existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Soft delete by updating status to inactive
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Database error:', updateError)
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      )
    }

    // Log the activity
    await supabase.from('user_activities').insert({
      user_id: userId,
      actor_id: currentUserId,
      action: 'user_deleted',
      details: {
        userName: `${existingUser.first_name} ${existingUser.last_name}`,
        deletionType: 'soft_delete'
      }
    })

    return NextResponse.json({ message: 'User deleted successfully' })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Status update endpoint
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: currentUserId } = await auth()

    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await params
    const body = await request.json()
    const { action } = body

    if (action === 'update_status') {
      const validatedData = statusUpdateSchema.parse(body)

      // Update user status
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({ 
          status: validatedData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select('id, first_name, last_name, status')
        .single()

      if (error) {
        console.error('Database error:', error)
        return NextResponse.json(
          { error: 'Failed to update user status' },
          { status: 500 }
        )
      }

      // Log the activity
      await supabase.from('user_activities').insert({
        user_id: userId,
        actor_id: currentUserId,
        action: 'status_changed',
        details: {
          oldStatus: body.oldStatus,
          newStatus: validatedData.status,
          reason: validatedData.reason
        }
      })

      return NextResponse.json({ 
        message: 'Status updated successfully',
        user: {
          id: updatedUser.id,
          name: `${updatedUser.first_name} ${updatedUser.last_name}`,
          status: updatedUser.status
        }
      })
    }

    if (action === 'resend_invitation') {
      // Log the activity
      await supabase.from('user_activities').insert({
        user_id: userId,
        actor_id: currentUserId,
        action: 'invitation_resent',
        details: {}
      })

      return NextResponse.json({ message: 'Invitation resent successfully' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

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