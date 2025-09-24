import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

// GET: list simple tasks for a project
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

    const { data, error } = await supabase
      .from('project_simple_tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('DB error (GET simple tasks):', error)
      return NextResponse.json({ error: 'Failed to fetch simple tasks' }, { status: 500 })
    }

    const tasks = (data || []).map((t: any) => ({
      id: t.id,
      projectId: t.project_id,
      task: t.task,
      createdBy: t.created_by, // string (text)
      createdAt: t.created_at ? new Date(t.created_at) : null,
      deadline: t.deadline ? new Date(t.deadline) : null,
      completed: !!t.completed,
    }))

    return NextResponse.json({ tasks })
  } catch (err) {
    console.error('API error (GET simple tasks):', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: create a new simple task
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

    const { task, deadline, completed } = body as { task?: string; deadline?: string | Date | null; completed?: boolean }
    if (!task || typeof task !== 'string' || task.trim().length === 0) {
      return NextResponse.json({ error: 'Task is required' }, { status: 400 })
    }

    const insertPayload: any = {
      project_id: projectId,
      task: task.trim(),
      created_by: userId, // text id; ensure your migration uses text type for created_by
      created_at: new Date().toISOString(),
      deadline: deadline ? new Date(deadline).toISOString() : null,
      completed: completed === true ? true : false,
    }

    const { data, error } = await supabase
      .from('project_simple_tasks')
      .insert(insertPayload)
      .select('*')
      .single()

    if (error) {
      console.error('DB error (POST simple task):', error)
      return NextResponse.json({ error: 'Failed to create simple task' }, { status: 500 })
    }

    const created = {
      id: data.id,
      projectId: data.project_id,
      task: data.task,
      createdBy: data.created_by,
      createdAt: data.created_at ? new Date(data.created_at) : null,
      deadline: data.deadline ? new Date(data.deadline) : null,
      completed: !!data.completed,
    }

    return NextResponse.json({ task: created }, { status: 201 })
  } catch (err) {
    console.error('API error (POST simple task):', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}