import { createServerClient } from '@/lib/database'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import type { Database } from '@/types/database'

export async function GET(request: Request) {
  try {
    const session = auth()
    const userId = session?.userId
    const getToken = session?.getToken

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    if (!query.trim()) {
      return NextResponse.json({ results: [] })
    }

    const supabaseToken = getToken ? await getToken({ template: 'supabase' }) : undefined
    const supabase = createServerClient(supabaseToken || undefined)

    const q = query.toLowerCase().trim()
    // Use simple, robust OR filters
    const productConditions = `name.ilike.%${q}%,description.ilike.%${q}%,sku.ilike.%${q}%`
    const equipmentConditions = `name.ilike.%${q}%,equipment_number.ilike.%${q}%,category.ilike.%${q}%,model.ilike.%${q}%`
    const projectConditions = `name.ilike.%${q}%,job_number.ilike.%${q}%,description.ilike.%${q}%`
    const taskConditions = `name.ilike.%${q}%,description.ilike.%${q}%`
    // Build search conditions for each term
    const productConditions = searchTerms.map(term => (
      `name.ilike.%${term}% OR description.ilike.%${term}% OR sku.ilike.%${term}%`
    )).join(' OR ')

    const equipmentConditions = searchTerms.map(term => (
      `name.ilike.%${term}% OR equipment_number.ilike.%${term}% OR category.ilike.%${term}% OR model.ilike.%${term}%`
    )).join(' OR ')

    const projectConditions = searchTerms.map(term => (
      `name.ilike.%${term}% OR job_number.ilike.%${term}% OR description.ilike.%${term}%`
    )).join(' OR ')

    const taskConditions = searchTerms.map(term => (
      `name.ilike.%${term}% OR description.ilike.%${term}%`
    )).join(' OR ')

    // Execute searches with proper error handling
    const [productsRes, equipmentRes, projectsRes, tasksRes] = await Promise.all([
      // Search products
      supabase
        .from('products')
        .select('id, name, description, sku, category_id, unit_of_measure')
        .filter('is_active', 'eq', true)
        .or(productConditions)
        .limit(5),

      // Search equipment
      supabase
        .from('equipment')
        .select('id, name, equipment_number, category, model, status')
        .or(equipmentConditions)
        .limit(5),

      // Search projects
      supabase
        .from('projects')
        .select('id, name, job_number, description, status')
        .or(projectConditions)
        .limit(5),

      // Search tasks
      supabase
        .from('project_tasks')
        .select('id, name, description, status, priority, project_id')
        .or(taskConditions)
        .limit(5),
    ])

    // Check for errors in any of the queries
    const errors = {
      products: productsRes.error,
      equipment: equipmentRes.error,
      projects: projectsRes.error,
      tasks: tasksRes.error
    }

    // Log all errors if any
    Object.entries(errors).forEach(([type, error]) => {
      if (error) {
        console.error(`${type} search failed:`, error)
      }
    })

    // If any query failed, return error with details
    if (Object.values(errors).some(error => error)) {
      return NextResponse.json({
        error: 'Search failed',
        details: Object.fromEntries(
          Object.entries(errors)
            .filter(([_, error]) => error)
            .map(([type, error]) => [type, error.message])
        )
      }, { status: 500 })
    }

    const products = productsRes.data || []
    const equipment = equipmentRes.data || []
    const projects = projectsRes.data || []
    const tasks = tasksRes.data || []

    const results = {
      products: products.data?.map(product => ({
        id: product.id,
        title: product.name,
        description: product.description || `SKU: ${product.sku}`,
        section: 'inventory' as const,
        url: `/inventory/${product.id}`,
        icon: 'package'
      })) || [],

      equipment: equipment.data?.map(item => ({
        id: item.id,
        title: item.name,
        description: `${item.category || 'Equipment'} - ${item.equipment_number}`,
        section: 'equipment' as const,
        url: `/equipment/${item.id}`,
        icon: 'tool',
        status: item.status
      })) || [],

      projects: projects.data?.map(project => ({
        id: project.id,
        title: project.name,
        description: `${project.job_number} - ${project.description || 'No description'}`,
        section: 'projects' as const,
        url: `/projects/${project.id}`,
        icon: 'folder',
        status: project.status
      })) || [],

      tasks: tasks.data?.map(task => ({
        id: task.id,
        title: task.name,
        description: task.description || 'No description',
        section: 'tasks' as const,
        url: `/projects/${task.project_id}/tasks/${task.id}`,
        icon: 'check-square',
        priority: task.priority,
        status: task.status
      })) || []
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Search failed:', error)
    console.error('Search error:', error)
    return NextResponse.json({
      error: 'Search failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}