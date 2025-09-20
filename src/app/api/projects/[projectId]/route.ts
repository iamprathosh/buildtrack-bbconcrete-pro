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

    // Fetch the specific project
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
      }
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch project' },
        { status: 500 }
      )
    }

    // Fetch related data
    const [customer, projectManager] = await Promise.all([
      project.customer_id ? supabase.from('customers').select('name').eq('id', project.customer_id).single() : null,
      project.project_manager_id ? supabase.from('user_profiles').select('full_name').eq('id', project.project_manager_id).single() : null
    ])

    // Transform the database data to match the frontend Project interface
    const transformedProject = {
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
      manager: projectManager?.data?.full_name || 'Unassigned',
      client: customer?.data?.name || 'No Client',
      location: project.location || 'No Location',
      category: 'General', // Default category since it's not in DB schema yet
      team: [projectManager?.data?.full_name].filter(Boolean), // Just project manager for now
      tags: [], // Default empty tags since it's not in DB schema yet
      lastUpdated: new Date(project.updated_at || project.created_at),
      // Additional fields for database operations
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

export async function PUT(
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
    
    // Extract and validate the fields we can update
    const {
      name,
      description,
      status,
      priority, // We'll store this in the description or notes for now
      manager,
      client,
      location,
      category, // We'll store this in the description or notes for now
      budget,
      startDate,
      endDate,
      estimatedEndDate,
      lastUpdated
    } = body

    // Map frontend status to database status
    const dbStatus = mapStatusToDB(status)

    // Prepare the update object
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (dbStatus !== undefined) updateData.status = dbStatus
    if (location !== undefined) updateData.location = location
    if (budget !== undefined) updateData.budget = budget
    if (startDate !== undefined) updateData.start_date = new Date(startDate).toISOString()
    if (endDate !== undefined) updateData.end_date = new Date(endDate).toISOString()

    // Handle manager assignment - find user by name
    if (manager !== undefined) {
      if (manager) {
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('full_name', manager)
          .single()
        
        if (userProfile) {
          updateData.project_manager_id = userProfile.id
        }
      } else {
        updateData.project_manager_id = null
      }
    }

    // Handle client assignment - find customer by name or create new one
    if (client !== undefined) {
      if (client) {
        let { data: customerData } = await supabase
          .from('customers')
          .select('id')
          .eq('name', client)
          .single()

        if (!customerData) {
          // Create new customer if not found
          const { data: newCustomer } = await supabase
            .from('customers')
            .insert({
              name: client,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select('id')
            .single()
          
          if (newCustomer) {
            customerData = newCustomer
          }
        }

        if (customerData) {
          updateData.customer_id = customerData.id
        }
      } else {
        updateData.customer_id = null
      }
    }

    // Update the project
    const { data: updatedProject, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .select('*')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
      }
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update project' },
        { status: 500 }
      )
    }

    // Fetch updated related data
    const [customer, projectManagerData] = await Promise.all([
      updatedProject.customer_id ? supabase.from('customers').select('name').eq('id', updatedProject.customer_id).single() : null,
      updatedProject.project_manager_id ? supabase.from('user_profiles').select('full_name').eq('id', updatedProject.project_manager_id).single() : null
    ])

    // Transform the response
    const transformedProject = {
      id: updatedProject.id,
      name: updatedProject.name,
      description: updatedProject.description || '',
      status: mapStatusFromDB(updatedProject.status),
      priority: priority || 'medium',
      startDate: updatedProject.start_date ? new Date(updatedProject.start_date) : new Date(),
      endDate: updatedProject.end_date ? new Date(updatedProject.end_date) : new Date(),
      estimatedEndDate: updatedProject.end_date ? new Date(updatedProject.end_date) : new Date(),
      budget: updatedProject.budget || 0,
      actualCost: 0,
      progress: await calculateProgress(updatedProject),
      manager: projectManagerData?.data?.full_name || 'Unassigned',
      client: customer?.data?.name || 'No Client',
      location: updatedProject.location || 'No Location',
      category: category || 'General',
      team: [projectManagerData?.data?.full_name].filter(Boolean),
      tags: [],
      lastUpdated: new Date(updatedProject.updated_at || updatedProject.created_at),
      jobNumber: updatedProject.job_number,
      customerId: updatedProject.customer_id,
      projectManagerId: updatedProject.project_manager_id,
      dbStatus: updatedProject.status,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = await params

    // Delete the project (CASCADE will handle related tasks)
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to delete project' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Project deleted successfully' })

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

function mapStatusToDB(frontendStatus: string | null): string {
  switch (frontendStatus) {
    case 'in-progress':
      return 'active'
    case 'on-hold':
      return 'on_hold'
    case 'planning':
    case 'completed':
    case 'cancelled':
      return frontendStatus
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