import { createServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: Request) {
  try {
    const session = auth()
    const userId = session?.userId
    const getToken = session?.getToken

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const raw = searchParams.get('q') || ''
    const query = raw.trim()

    if (!query) {
      return NextResponse.json({
        results: {
          products: [],
          equipment: [],
          projects: [],
          tasks: [],
        },
      })
    }

    const supabaseToken = getToken ? await getToken({ template: 'supabase' }) : undefined
    const supabase = createServerClient(supabaseToken || undefined)

    const q = query.toLowerCase()
    const searchTerms = q.split(/\s+/).filter(Boolean)

    const buildOr = (columns: string[]) => {
      const terms = searchTerms.length ? searchTerms : [q]
      return terms
        .map((term) => columns.map((c) => `${c}.ilike.%${term}%`).join(','))
        .join(',')
    }

    const [productsRes, equipmentRes, projectsRes, tasksRes] = await Promise.all([
      supabase
        .from('products')
        .select('id, name, description, sku')
        .filter('is_active', 'eq', true)
        .or(buildOr(['name', 'description', 'sku']))
        .limit(5),

      supabase
        .from('equipment')
        .select('id, name, equipment_number, category, model, status')
        .or(buildOr(['name', 'equipment_number', 'category', 'model']))
        .limit(5),

      supabase
        .from('projects')
        .select('id, name, job_number, description, status')
        .or(buildOr(['name', 'job_number', 'description']))
        .limit(5),

      supabase
        .from('project_tasks')
        .select('id, name, description, status, priority, project_id')
        .or(buildOr(['name', 'description']))
        .limit(5),
    ])

    const errors = {
      products: productsRes.error,
      equipment: equipmentRes.error,
      projects: projectsRes.error,
      tasks: tasksRes.error,
    }

    if (Object.values(errors).some((e) => e)) {
      return NextResponse.json(
        {
          error: 'Search failed',
          details: Object.fromEntries(
            Object.entries(errors)
              .filter(([_, e]) => e)
              .map(([k, e]) => [k, e?.message])
          ),
        },
        { status: 500 }
      )
    }

    const products = productsRes.data ?? []
    const equipment = equipmentRes.data ?? []
    const projects = projectsRes.data ?? []
    const tasks = tasksRes.data ?? []

    const results = {
      products: products.map((product) => ({
        id: product.id,
        title: product.name,
        description: product.description ?? `SKU: ${product.sku}`,
        section: 'inventory' as const,
        url: `/inventory/${product.id}`,
        icon: 'package',
      })),

      equipment: equipment.map((item) => ({
        id: item.id,
        title: item.name,
        description: `${item.category ?? 'Equipment'} - ${item.equipment_number}`,
        section: 'equipment' as const,
        url: `/equipment/${item.id}`,
        icon: 'tool',
        status: item.status,
      })),

      projects: projects.map((project) => ({
        id: project.id,
        title: project.name,
        description: `${project.job_number} - ${project.description ?? 'No description'}`,
        section: 'projects' as const,
        url: `/projects/${project.id}`,
        icon: 'folder',
        status: project.status,
      })),

      tasks: tasks.map((task) => ({
        id: task.id,
        title: task.name,
        description: task.description ?? 'No description',
        section: 'tasks' as const,
        url: `/projects/${task.project_id}/tasks/${task.id}`,
        icon: 'check-square',
        priority: task.priority,
        status: task.status,
      })),
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Search failed:', error)
    return NextResponse.json(
      {
        error: 'Search failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
