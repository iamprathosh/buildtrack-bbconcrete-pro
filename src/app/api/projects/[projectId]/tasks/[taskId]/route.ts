import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; taskId: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { taskId } = await params
    const body = await request.json()

    const {
      name,
      description,
      status,
      priority,
      assignedTo,
      startDate,
      dueDate,
      completedDate,
      estimatedHours,
      actualHours,
      notes
    } = body

    // Update task
    const { data: task, error } = await supabase
      .from('project_tasks')
      .update({
        name,
        description,
        status,
        priority,
        assigned_to: assignedTo || null,
        start_date: startDate ? new Date(startDate).toISOString() : null,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        completed_date: completedDate ? new Date(completedDate).toISOString() : null,
        estimated_hours: estimatedHours || null,
        actual_hours: actualHours || null,
        notes,
      })
      .eq('id', taskId)
      .select(`
        *,
        assigned_user:user_profiles(id, full_name, email)
      `)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update task' },
        { status: 500 }
      )
    }

    // Transform the response
    const transformedTask = {
      id: task.id,
      projectId: task.project_id,
      taskNumber: task.task_number,
      name: task.name,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      assignedTo: task.assigned_to,
      assignedUser: task.assigned_user,
      startDate: task.start_date ? new Date(task.start_date) : null,
      dueDate: task.due_date ? new Date(task.due_date) : null,
      completedDate: task.completed_date ? new Date(task.completed_date) : null,
      estimatedHours: task.estimated_hours || 0,
      actualHours: task.actual_hours || 0,
      dependencies: task.dependencies || [],
      notes: task.notes || '',
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at),
    }

    return NextResponse.json({ task: transformedTask })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; taskId: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { taskId } = await params

    // Delete task
    const { error } = await supabase
      .from('project_tasks')
      .delete()
      .eq('id', taskId)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to delete task' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}