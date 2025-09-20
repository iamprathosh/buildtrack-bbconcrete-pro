import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

interface Project {
  id: string
  name: string
  status: 'planning' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled'
  budget: number
  progress: number
  startDate: string
  endDate: string
  estimatedEndDate: string
  actualCost?: number
  client: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  createdAt: string
  lastUpdated: string
}

interface Task {
  id: string
  projectId: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  estimatedHours?: number
  actualHours?: number
  createdAt: string
  completedDate?: string
}

// Mock data - In production, this would come from your database
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Downtown Office Complex',
    status: 'completed',
    budget: 850000,
    progress: 100,
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    estimatedEndDate: '2024-06-15',
    actualCost: 820000,
    client: 'Metro Development',
    category: 'construction',
    priority: 'high',
    createdAt: '2024-01-10',
    lastUpdated: '2024-06-30'
  },
  {
    id: '2',
    name: 'Highway Bridge Repair',
    status: 'in-progress',
    budget: 1200000,
    progress: 75,
    startDate: '2024-03-01',
    endDate: '2024-09-15',
    estimatedEndDate: '2024-09-01',
    actualCost: 890000,
    client: 'State Highway Department',
    category: 'infrastructure',
    priority: 'urgent',
    createdAt: '2024-02-20',
    lastUpdated: '2024-07-15'
  },
  {
    id: '3',
    name: 'Residential Complex Renovation',
    status: 'completed',
    budget: 650000,
    progress: 100,
    startDate: '2024-02-01',
    endDate: '2024-05-30',
    estimatedEndDate: '2024-06-01',
    actualCost: 630000,
    client: 'Heritage Properties',
    category: 'renovation',
    priority: 'medium',
    createdAt: '2024-01-25',
    lastUpdated: '2024-05-30'
  },
  {
    id: '4',
    name: 'Shopping Mall Construction',
    status: 'in-progress',
    budget: 2100000,
    progress: 40,
    startDate: '2024-04-01',
    endDate: '2024-12-31',
    estimatedEndDate: '2024-11-30',
    actualCost: 750000,
    client: 'Retail Ventures Inc',
    category: 'construction',
    priority: 'high',
    createdAt: '2024-03-15',
    lastUpdated: '2024-07-20'
  },
  {
    id: '5',
    name: 'School Building Maintenance',
    status: 'completed',
    budget: 180000,
    progress: 100,
    startDate: '2024-01-08',
    endDate: '2024-03-15',
    estimatedEndDate: '2024-03-20',
    actualCost: 175000,
    client: 'City School District',
    category: 'maintenance',
    priority: 'medium',
    createdAt: '2024-01-01',
    lastUpdated: '2024-03-15'
  },
  {
    id: '6',
    name: 'Industrial Warehouse Build',
    status: 'on-hold',
    budget: 950000,
    progress: 25,
    startDate: '2024-05-01',
    endDate: '2024-10-30',
    estimatedEndDate: '2024-11-15',
    actualCost: 220000,
    client: 'LogiCorp Solutions',
    category: 'construction',
    priority: 'low',
    createdAt: '2024-04-20',
    lastUpdated: '2024-06-10'
  },
  {
    id: '7',
    name: 'Hospital Equipment Installation',
    status: 'in-progress',
    budget: 750000,
    progress: 60,
    startDate: '2024-06-01',
    endDate: '2024-09-30',
    estimatedEndDate: '2024-10-05',
    actualCost: 420000,
    client: 'Regional Medical Center',
    category: 'installation',
    priority: 'urgent',
    createdAt: '2024-05-20',
    lastUpdated: '2024-07-25'
  },
  {
    id: '8',
    name: 'Park Infrastructure Upgrade',
    status: 'completed',
    budget: 320000,
    progress: 100,
    startDate: '2024-03-15',
    endDate: '2024-06-10',
    estimatedEndDate: '2024-06-05',
    actualCost: 310000,
    client: 'City Parks Department',
    category: 'infrastructure',
    priority: 'low',
    createdAt: '2024-03-01',
    lastUpdated: '2024-06-10'
  }
]

const mockTasks: Task[] = [
  // Project 1 tasks
  { id: '1', projectId: '1', status: 'completed', estimatedHours: 120, actualHours: 115, createdAt: '2024-01-15', completedDate: '2024-02-28' },
  { id: '2', projectId: '1', status: 'completed', estimatedHours: 80, actualHours: 85, createdAt: '2024-02-01', completedDate: '2024-03-15' },
  { id: '3', projectId: '1', status: 'completed', estimatedHours: 150, actualHours: 140, createdAt: '2024-03-01', completedDate: '2024-05-20' },
  
  // Project 2 tasks
  { id: '4', projectId: '2', status: 'completed', estimatedHours: 200, actualHours: 210, createdAt: '2024-03-01', completedDate: '2024-05-10' },
  { id: '5', projectId: '2', status: 'in_progress', estimatedHours: 180, actualHours: 120, createdAt: '2024-04-15' },
  { id: '6', projectId: '2', status: 'pending', estimatedHours: 100, actualHours: 0, createdAt: '2024-06-01' },
  
  // Project 3 tasks
  { id: '7', projectId: '3', status: 'completed', estimatedHours: 90, actualHours: 88, createdAt: '2024-02-01', completedDate: '2024-04-15' },
  { id: '8', projectId: '3', status: 'completed', estimatedHours: 60, actualHours: 65, createdAt: '2024-03-01', completedDate: '2024-05-30' },
  
  // Project 4 tasks
  { id: '9', projectId: '4', status: 'completed', estimatedHours: 300, actualHours: 295, createdAt: '2024-04-01', completedDate: '2024-06-20' },
  { id: '10', projectId: '4', status: 'in_progress', estimatedHours: 250, actualHours: 150, createdAt: '2024-05-15' },
  { id: '11', projectId: '4', status: 'pending', estimatedHours: 200, actualHours: 0, createdAt: '2024-07-01' },
  
  // Additional tasks for other projects
  { id: '12', projectId: '5', status: 'completed', estimatedHours: 40, actualHours: 42, createdAt: '2024-01-08', completedDate: '2024-03-15' },
  { id: '13', projectId: '6', status: 'completed', estimatedHours: 80, actualHours: 75, createdAt: '2024-05-01', completedDate: '2024-05-30' },
  { id: '14', projectId: '7', status: 'in_progress', estimatedHours: 120, actualHours: 80, createdAt: '2024-06-01' },
  { id: '15', projectId: '8', status: 'completed', estimatedHours: 70, actualHours: 68, createdAt: '2024-03-15', completedDate: '2024-06-10' }
]

function calculateAnalytics(projects: Project[], tasks: Task[], dateRange?: { from: Date; to: Date }) {
  // Filter projects by date range if provided
  let filteredProjects = projects
  if (dateRange) {
    filteredProjects = projects.filter(project => {
      const projectStart = new Date(project.startDate)
      return projectStart >= dateRange.from && projectStart <= dateRange.to
    })
  }

  // Calculate basic project metrics
  const totalProjects = filteredProjects.length
  const completedProjects = filteredProjects.filter(p => p.status === 'completed').length
  const activeProjects = filteredProjects.filter(p => p.status === 'in-progress').length
  const onHoldProjects = filteredProjects.filter(p => p.status === 'on-hold').length
  const cancelledProjects = filteredProjects.filter(p => p.status === 'cancelled').length

  // Calculate financial metrics
  const totalBudget = filteredProjects.reduce((sum, p) => sum + p.budget, 0)
  const totalActualCost = filteredProjects.reduce((sum, p) => sum + (p.actualCost || 0), 0)
  const totalRevenue = filteredProjects
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.budget, 0)

  // Calculate profit metrics
  const completedProjectsCost = filteredProjects
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.actualCost || p.budget * 0.8), 0)
  
  const profitMargin = totalRevenue > 0 ? ((totalRevenue - completedProjectsCost) / totalRevenue) * 100 : 0

  // Calculate task metrics
  const projectIds = filteredProjects.map(p => p.id)
  const filteredTasks = tasks.filter(task => projectIds.includes(task.projectId))
  const completedTasks = filteredTasks.filter(t => t.status === 'completed').length
  const totalTasks = filteredTasks.length

  // Calculate average project duration and performance
  const completedProjectsWithDates = filteredProjects.filter(p => 
    p.status === 'completed' && p.startDate && p.endDate
  )
  
  const averageProjectDuration = completedProjectsWithDates.length > 0 
    ? completedProjectsWithDates.reduce((sum, p) => {
        const start = new Date(p.startDate)
        const end = new Date(p.endDate)
        return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      }, 0) / completedProjectsWithDates.length
    : 0

  // Generate monthly trend data
  const monthlyTrend = generateMonthlyTrend(filteredProjects, tasks)

  // Calculate category breakdown
  const categoryBreakdown = filteredProjects.reduce((acc, project) => {
    acc[project.category] = (acc[project.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Calculate efficiency metrics
  const totalEstimatedHours = filteredTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0)
  const totalActualHours = filteredTasks.reduce((sum, task) => sum + (task.actualHours || 0), 0)
  const efficiencyRatio = totalEstimatedHours > 0 ? (totalActualHours / totalEstimatedHours) * 100 : 0

  return {
    totalProjects,
    activeProjects,
    completedProjects,
    onHoldProjects,
    cancelledProjects,
    totalRevenue,
    totalCosts: completedProjectsCost,
    totalBudget,
    profitMargin: Math.round(profitMargin * 100) / 100,
    inventoryValue: 450000, // Static for now - would calculate from inventory data
    pendingOrders: 12, // Static for now - would calculate from procurement data
    completedTasks,
    totalTasks,
    averageProjectDuration: Math.round(averageProjectDuration),
    monthlyTrend,
    categoryBreakdown,
    efficiencyRatio: Math.round(efficiencyRatio * 100) / 100,
    // Additional metrics
    onTimeProjects: completedProjectsWithDates.filter(p => 
      new Date(p.endDate) <= new Date(p.estimatedEndDate)
    ).length,
    overdueProjects: filteredProjects.filter(p => 
      p.status === 'in-progress' && new Date() > new Date(p.estimatedEndDate)
    ).length,
    averageBudget: totalProjects > 0 ? totalBudget / totalProjects : 0,
    budgetUtilization: totalBudget > 0 ? (totalActualCost / totalBudget) * 100 : 0
  }
}

function generateMonthlyTrend(projects: Project[], tasks: Task[]) {
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan']
  const currentDate = new Date()
  
  return months.map(month => {
    // For demo purposes, we'll use the existing logic with some randomization
    // In production, you'd calculate actual monthly data from your database
    const baseRevenue = Math.random() * 100000 + 150000
    const baseCosts = baseRevenue * (0.7 + Math.random() * 0.2)
    const projectsInMonth = Math.floor(Math.random() * 4) + 2
    
    return {
      month,
      revenue: Math.round(baseRevenue),
      costs: Math.round(baseCosts),
      projects: projectsInMonth
    }
  })
}

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const type = searchParams.get('type') || 'overview'

    let dateRange: { from: Date; to: Date } | undefined
    if (from && to) {
      dateRange = {
        from: new Date(from),
        to: new Date(to)
      }
    }

    // In production, you would fetch this from your database
    // For now, we'll use the mock data
    const analytics = calculateAnalytics(mockProjects, mockTasks, dateRange)

    if (type === 'overview') {
      return NextResponse.json({
        analytics,
        reports: [
          {
            id: 'financial-summary',
            name: 'Financial Summary Report',
            type: 'financial',
            description: 'Comprehensive financial overview including revenue, costs, and profit margins',
            lastUpdated: new Date().toISOString(),
            status: 'ready',
            frequency: 'monthly',
            data: {
              totalRevenue: analytics.totalRevenue,
              totalCosts: analytics.totalCosts,
              profitMargin: analytics.profitMargin,
              budgetUtilization: analytics.budgetUtilization
            }
          },
          {
            id: 'project-performance',
            name: 'Project Performance Dashboard',
            type: 'project',
            description: 'Project completion rates, budget utilization, and timeline analysis',
            lastUpdated: new Date().toISOString(),
            status: 'ready',
            frequency: 'weekly',
            data: {
              totalProjects: analytics.totalProjects,
              completedProjects: analytics.completedProjects,
              activeProjects: analytics.activeProjects,
              onTimeProjects: analytics.onTimeProjects,
              overdueProjects: analytics.overdueProjects,
              averageProjectDuration: analytics.averageProjectDuration
            }
          },
          {
            id: 'task-efficiency',
            name: 'Task Efficiency Report',
            type: 'project',
            description: 'Task completion rates and time tracking analysis',
            lastUpdated: new Date().toISOString(),
            status: 'ready',
            frequency: 'weekly',
            data: {
              totalTasks: analytics.totalTasks,
              completedTasks: analytics.completedTasks,
              efficiencyRatio: analytics.efficiencyRatio,
              completionRate: analytics.totalTasks > 0 ? (analytics.completedTasks / analytics.totalTasks) * 100 : 0
            }
          },
          {
            id: 'category-analysis',
            name: 'Project Category Analysis',
            type: 'custom',
            description: 'Breakdown of projects by category and performance metrics',
            lastUpdated: new Date().toISOString(),
            status: 'ready',
            frequency: 'monthly',
            data: analytics.categoryBreakdown
          }
        ]
      })
    }

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error('Reports API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}