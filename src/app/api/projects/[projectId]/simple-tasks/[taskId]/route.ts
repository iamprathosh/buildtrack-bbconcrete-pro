import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

// PUT: update a simple task
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

    const updates: any = {}
    if (typeof body.task === 'string') {
      updates.task = body.task.trim()
    }
    if (body.deadline !== undefined) {
      updates.deadline = body.deadline ? new Date(body.deadline).toISOString() : null
    }
    if (typeof body.completed === 'boolean') {
      updates.completed = body.completed
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('project_simple_tasks')
      .update(updates)
      .eq('id', taskId)
      .select('*')
      .single()

    if (error) {
      console.error('DB error (PUT simple task):', error)
      return NextResponse.json({ error: 'Failed to update simple task' }, { status: 500 })
    }

    const task = {
      id: data.id,
      projectId: data.project_id,
      task: data.task,
      createdBy: data.created_by,
      createdAt: data.created_at ? new Date(data.created_at) : null,
      deadline: data.deadline ? new Date(data.deadline) : null,
      completed: !!data.completed,
    }

    return NextResponse.json({ task })
  } catch (err) {
    console.error('API error (PUT simple task):', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE: remove a simple task
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

    const { error } = await supabase
      .from('project_simple_tasks')
      .delete()
      .eq('id', taskId)

    if (error) {
      console.error('DB error (DELETE simple task):', error)
      return NextResponse.json({ error: 'Failed to delete simple task' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('API error (DELETE simple task):', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}