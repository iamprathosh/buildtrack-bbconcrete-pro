import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch projects first
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      )
    }

    if (!projects || projects.length === 0) {
      return NextResponse.json({ projects: [] })
    }

    // Get unique customer and user IDs
    const customerIds = [...new Set(projects.map(p => p.customer_id).filter(Boolean))]
    const userIds = [...new Set(projects.map(p => p.project_manager_id).filter(Boolean))]

    // Fetch related data
    const [customersResult, usersResult] = await Promise.all([
      customerIds.length > 0 ? supabase.from('customers').select('id, name, contact, phone, email').in('id', customerIds) : { data: [] },
      userIds.length > 0 ? supabase.from('user_profiles').select('id, full_name, email').in('id', userIds) : { data: [] }
    ])

    const customersMap = new Map((customersResult.data || []).map(c => [c.id, c]))
    const usersMap = new Map((usersResult.data || []).map(u => [u.id, u]))

    // Transform the database data to match the frontend Project interface
    const transformedProjects = await Promise.all(
      projects.map(async (project: any) => {
        const customer = customersMap.get(project.customer_id)
        const projectManager = usersMap.get(project.project_manager_id)

        return {
          id: project.id,
          name: project.name,
          description: project.description || '',
          status: mapStatusFromDB(project.status),
          priority: 'medium', // Default priority since it's not in DB schema yet
          startDate: project.start_date ? new Date(project.start_date) : new Date(),
          endDate: project.end_date ? new Date(project.end_date) : new Date(),
          estimatedEndDate: project.end_date ? new Date(project.end_date) : new Date(),
          budget: project.budget || 0,
          actualCost: 0, // Not tracked in current schema
          progress: await calculateProgress(project), // Calculate based on tasks or dates
          manager: projectManager?.full_name || 'Unassigned',
          client: customer?.name || 'No Client',
          location: project.location || 'No Location',
          category: 'General', // Default category since it's not in DB schema yet
          team: [projectManager?.full_name].filter(Boolean), // Just project manager for now
          tags: [], // Default empty tags since it's not in DB schema yet
          lastUpdated: new Date(project.updated_at || project.created_at),
          // Additional fields for database operations
          jobNumber: project.job_number,
          customerId: project.customer_id,
          projectManagerId: project.project_manager_id,
          dbStatus: project.status,
        }
      })
    )

    return NextResponse.json({ projects: transformedProjects })

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
    const {
      name,
      description,
      startDate,
      endDate,
      budget,
      location,
      customerId,
      projectManagerId
    } = body

    // Generate job number (simple counter-based approach)
    const { data: lastProjectData } = await supabase
      .from('projects')
      .select('job_number')
      .order('job_number', { ascending: false })
      .limit(1)

    const lastProject = lastProjectData?.[0] as { job_number: string } | undefined
    const lastJobNumber = lastProject?.job_number
    const nextJobNumber = lastJobNumber 
      ? (parseInt(lastJobNumber.replace(/\D/g, '')) + 1).toString().padStart(4, '0')
      : '0001'

    const jobNumber = `PRJ-${nextJobNumber}`

    // Insert new project
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        job_number: jobNumber,
        name,
        description,
        budget: budget || null,
        location: location || null,
        customer_id: customerId || null,
        project_manager_id: projectManagerId || null,
        start_date: startDate ? new Date(startDate).toISOString() : null,
        end_date: endDate ? new Date(endDate).toISOString() : null,
        status: 'planning',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      )
    }

    // Fetch related data
    const [customer, projectManager] = await Promise.all([
      project.customer_id ? supabase.from('customers').select('name').eq('id', project.customer_id).single() : null,
      project.project_manager_id ? supabase.from('user_profiles').select('full_name').eq('id', project.project_manager_id).single() : null
    ])

    // Transform the response
    const transformedProject = {
      id: project.id,
      name: project.name,
      description: project.description || '',
      status: mapStatusFromDB(project.status),
      priority: 'medium',
      startDate: project.start_date ? new Date(project.start_date) : new Date(),
      endDate: project.end_date ? new Date(project.end_date) : new Date(),
      estimatedEndDate: project.end_date ? new Date(project.end_date) : new Date(),
      budget: project.budget || 0,
      actualCost: 0,
      progress: 0,
      manager: projectManager?.data?.full_name || 'Unassigned',
      client: customer?.data?.name || 'No Client',
      location: project.location || 'No Location',
      category: 'General',
      team: [projectManager?.data?.full_name].filter(Boolean),
      tags: [],
      lastUpdated: new Date(project.updated_at || project.created_at),
      jobNumber: project.job_number,
      customerId: project.customer_id,
      projectManagerId: project.project_manager_id,
      dbStatus: project.status,
    }

    return NextResponse.json({ project: transformedProject })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions
function mapStatusFromDB(dbStatus: string | null): 'planning' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled' {
  switch (dbStatus) {
    case 'active':
      return 'in-progress'
    case 'on_hold':
      return 'on-hold'
    case 'planning':
    case 'completed':
    case 'cancelled':
      return dbStatus as 'planning' | 'completed' | 'cancelled'
    default:
      return 'planning'
  }
}

async function calculateProgress(project: any): Promise<number> {
  if (project.status === 'completed') return 100
  if (project.status === 'cancelled') return 0
  if (project.status === 'planning') return 0

  try {
    // Get task completion stats
    const { data: tasks } = await supabase
      .from('project_tasks')
      .select('status')
      .eq('project_id', project.id)

    if (!tasks || tasks.length === 0) {
      // If no tasks, fall back to date-based calculation
      if (project.status === 'on_hold') return 25
      
      if (project.start_date && project.end_date) {
        const start = new Date(project.start_date)
        const end = new Date(project.end_date)
        const now = new Date()

        if (now < start) return 0
        if (now > end) return 100

        const totalDuration = end.getTime() - start.getTime()
        const elapsed = now.getTime() - start.getTime()
        const progress = Math.round((elapsed / totalDuration) * 100)

        return Math.max(0, Math.min(100, progress))
      }

      return 25 // Default progress for active projects with no tasks
    }

    // Calculate progress based on completed tasks
    const completedTasks = tasks.filter(task => task.status === 'completed').length
    const totalTasks = tasks.length
    
    return Math.round((completedTasks / totalTasks) * 100)
  } catch (error) {
    console.error('Error calculating progress:', error)
    return 25 // Default fallback
  }
}
