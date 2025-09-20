import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = await params

    // Fetch tasks for the project with user information
    const { data: tasks, error } = await supabase
      .from('project_tasks')
      .select(`
        *,
        assigned_user:user_profiles(id, full_name, email)
      `)
      .eq('project_id', projectId)
      .order('task_number', { ascending: true })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: 500 }
      )
    }

    // Transform the data
    const transformedTasks = tasks?.map((task: any) => ({
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
    })) || []

    return NextResponse.json({ tasks: transformedTasks })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = await params
    const body = await request.json()

    const {
      name,
      description,
      status = 'pending',
      priority = 'medium',
      assignedTo,
      startDate,
      dueDate,
      estimatedHours,
      notes
    } = body

    // Get the next task number for this project
    const { data: lastTask } = await supabase
      .from('project_tasks')
      .select('task_number')
      .eq('project_id', projectId)
      .order('task_number', { ascending: false })
      .limit(1)
      .maybeSingle()

    const nextTaskNumber = lastTask?.task_number ? lastTask.task_number + 1 : 1

    // Insert new task
    const { data: task, error } = await supabase
      .from('project_tasks')
      .insert({
        project_id: projectId,
        task_number: nextTaskNumber,
        name,
        description,
        status,
        priority,
        assigned_to: assignedTo || null,
        start_date: startDate ? new Date(startDate).toISOString() : null,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        estimated_hours: estimatedHours || null,
        notes,
      })
      .select(`
        *,
        assigned_user:user_profiles(id, full_name, email)
      `)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create task' },
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