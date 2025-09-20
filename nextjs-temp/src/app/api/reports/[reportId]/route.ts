import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

interface ReportDetail {
  id: string
  name: string
  type: 'financial' | 'project' | 'inventory' | 'procurement' | 'custom'
  description: string
  data: any
  generatedAt: string
  tableData?: {
    columns: Array<{
      key: string
      header: string
      type?: 'text' | 'number' | 'currency' | 'percentage' | 'date'
    }>
    rows: Array<Record<string, any>>
  }
  chartData?: {
    type: 'line' | 'bar' | 'pie' | 'area'
    data: any[]
    labels: string[]
  }
  summary?: {
    title: string
    description: string
    metrics: Array<{
      label: string
      value: string | number
      trend?: 'up' | 'down' | 'stable'
      trendValue?: string
    }>
  }
}

// Mock project and task data for calculations (same as in main reports route)
const mockProjects = [
  {
    id: '1', name: 'Downtown Office Complex', status: 'completed', budget: 850000, actualCost: 820000,
    client: 'Metro Development', category: 'construction', startDate: '2024-01-15', endDate: '2024-06-30'
  },
  {
    id: '2', name: 'Highway Bridge Repair', status: 'in-progress', budget: 1200000, actualCost: 890000,
    client: 'State Highway Department', category: 'infrastructure', startDate: '2024-03-01', endDate: '2024-09-15'
  },
  {
    id: '3', name: 'Residential Complex Renovation', status: 'completed', budget: 650000, actualCost: 630000,
    client: 'Heritage Properties', category: 'renovation', startDate: '2024-02-01', endDate: '2024-05-30'
  },
  {
    id: '4', name: 'Shopping Mall Construction', status: 'in-progress', budget: 2100000, actualCost: 750000,
    client: 'Retail Ventures Inc', category: 'construction', startDate: '2024-04-01', endDate: '2024-12-31'
  },
  {
    id: '5', name: 'School Building Maintenance', status: 'completed', budget: 180000, actualCost: 175000,
    client: 'City School District', category: 'maintenance', startDate: '2024-01-08', endDate: '2024-03-15'
  }
]

const mockTasks = [
  { id: '1', projectId: '1', name: 'Foundation Work', status: 'completed', estimatedHours: 120, actualHours: 115, completedDate: '2024-02-28' },
  { id: '2', projectId: '1', name: 'Structure Assembly', status: 'completed', estimatedHours: 80, actualHours: 85, completedDate: '2024-03-15' },
  { id: '3', projectId: '2', name: 'Bridge Inspection', status: 'completed', estimatedHours: 200, actualHours: 210, completedDate: '2024-05-10' },
  { id: '4', projectId: '2', name: 'Repair Work', status: 'in_progress', estimatedHours: 180, actualHours: 120 },
  { id: '5', projectId: '3', name: 'Interior Renovation', status: 'completed', estimatedHours: 90, actualHours: 88, completedDate: '2024-04-15' },
  { id: '6', projectId: '4', name: 'Site Preparation', status: 'completed', estimatedHours: 300, actualHours: 295, completedDate: '2024-06-20' },
  { id: '7', projectId: '4', name: 'Construction Phase 1', status: 'in_progress', estimatedHours: 250, actualHours: 150 },
  { id: '8', projectId: '5', name: 'HVAC Maintenance', status: 'completed', estimatedHours: 40, actualHours: 42, completedDate: '2024-03-15' }
]

function generateFinancialReport(): ReportDetail {
  const completedProjects = mockProjects.filter(p => p.status === 'completed')
  const totalRevenue = completedProjects.reduce((sum, p) => sum + p.budget, 0)
  const totalCosts = completedProjects.reduce((sum, p) => sum + (p.actualCost || 0), 0)
  const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0

  return {
    id: 'financial-summary',
    name: 'Financial Summary Report',
    type: 'financial',
    description: 'Comprehensive financial overview including revenue, costs, and profit margins',
    generatedAt: new Date().toISOString(),
    data: { totalRevenue, totalCosts, profitMargin },
    summary: {
      title: 'Financial Performance Overview',
      description: 'Analysis of completed projects showing revenue, costs, and profitability metrics',
      metrics: [
        { label: 'Total Revenue', value: totalRevenue, trend: 'up', trendValue: '+12.5%' },
        { label: 'Total Costs', value: totalCosts, trend: 'stable', trendValue: '+2.1%' },
        { label: 'Profit Margin', value: `${profitMargin.toFixed(1)}%`, trend: 'up', trendValue: '+3.2%' },
        { label: 'Projects Completed', value: completedProjects.length, trend: 'up', trendValue: '+25%' }
      ]
    },
    tableData: {
      columns: [
        { key: 'name', header: 'Project Name', type: 'text' },
        { key: 'client', header: 'Client', type: 'text' },
        { key: 'budget', header: 'Budget', type: 'currency' },
        { key: 'actualCost', header: 'Actual Cost', type: 'currency' },
        { key: 'profit', header: 'Profit', type: 'currency' },
        { key: 'margin', header: 'Margin %', type: 'percentage' },
        { key: 'endDate', header: 'Completed', type: 'date' }
      ],
      rows: completedProjects.map(project => ({
        name: project.name,
        client: project.client,
        budget: project.budget,
        actualCost: project.actualCost || 0,
        profit: project.budget - (project.actualCost || 0),
        margin: project.actualCost ? ((project.budget - project.actualCost) / project.budget * 100).toFixed(1) : '0',
        endDate: project.endDate
      }))
    },
    chartData: {
      type: 'bar',
      labels: completedProjects.map(p => p.name.split(' ').slice(0, 2).join(' ')),
      data: completedProjects.map(p => ({
        budget: p.budget,
        actualCost: p.actualCost || 0,
        profit: p.budget - (p.actualCost || 0)
      }))
    }
  }
}

function generateProjectPerformanceReport(): ReportDetail {
  const totalProjects = mockProjects.length
  const completedProjects = mockProjects.filter(p => p.status === 'completed').length
  const activeProjects = mockProjects.filter(p => p.status === 'in-progress').length
  const onTimeProjects = mockProjects.filter(p => 
    p.status === 'completed' && new Date(p.endDate) <= new Date('2024-06-30')
  ).length

  return {
    id: 'project-performance',
    name: 'Project Performance Dashboard',
    type: 'project',
    description: 'Project completion rates, budget utilization, and timeline analysis',
    generatedAt: new Date().toISOString(),
    data: { totalProjects, completedProjects, activeProjects, onTimeProjects },
    summary: {
      title: 'Project Performance Metrics',
      description: 'Overall project delivery performance and timeline adherence',
      metrics: [
        { label: 'Total Projects', value: totalProjects, trend: 'up', trendValue: '+15%' },
        { label: 'Completed', value: completedProjects, trend: 'up', trendValue: '+20%' },
        { label: 'Active Projects', value: activeProjects, trend: 'stable', trendValue: '0%' },
        { label: 'On-Time Delivery', value: `${((onTimeProjects / completedProjects) * 100).toFixed(0)}%`, trend: 'up', trendValue: '+5%' }
      ]
    },
    tableData: {
      columns: [
        { key: 'name', header: 'Project Name', type: 'text' },
        { key: 'status', header: 'Status', type: 'text' },
        { key: 'category', header: 'Category', type: 'text' },
        { key: 'budget', header: 'Budget', type: 'currency' },
        { key: 'progress', header: 'Progress %', type: 'percentage' },
        { key: 'startDate', header: 'Start Date', type: 'date' },
        { key: 'endDate', header: 'End Date', type: 'date' }
      ],
      rows: mockProjects.map(project => ({
        name: project.name,
        status: project.status.replace('-', ' ').toUpperCase(),
        category: project.category.charAt(0).toUpperCase() + project.category.slice(1),
        budget: project.budget,
        progress: project.status === 'completed' ? 100 : (project.status === 'in-progress' ? Math.floor(Math.random() * 40) + 50 : 25),
        startDate: project.startDate,
        endDate: project.endDate
      }))
    },
    chartData: {
      type: 'pie',
      labels: ['Completed', 'In Progress', 'Planning', 'On Hold'],
      data: [
        completedProjects,
        activeProjects,
        mockProjects.filter(p => p.status === 'planning').length,
        mockProjects.filter(p => p.status === 'on-hold').length
      ]
    }
  }
}

function generateTaskEfficiencyReport(): ReportDetail {
  const totalTasks = mockTasks.length
  const completedTasks = mockTasks.filter(t => t.status === 'completed').length
  const totalEstimated = mockTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0)
  const totalActual = mockTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0)
  const efficiency = totalEstimated > 0 ? (totalActual / totalEstimated) * 100 : 0

  return {
    id: 'task-efficiency',
    name: 'Task Efficiency Report',
    type: 'project',
    description: 'Task completion rates and time tracking analysis',
    generatedAt: new Date().toISOString(),
    data: { totalTasks, completedTasks, efficiency, totalEstimated, totalActual },
    summary: {
      title: 'Task Efficiency Analysis',
      description: 'Time tracking and productivity metrics across all project tasks',
      metrics: [
        { label: 'Total Tasks', value: totalTasks, trend: 'up', trendValue: '+8%' },
        { label: 'Completion Rate', value: `${((completedTasks / totalTasks) * 100).toFixed(1)}%`, trend: 'up', trendValue: '+5%' },
        { label: 'Time Efficiency', value: `${efficiency.toFixed(1)}%`, trend: efficiency > 100 ? 'down' : 'up', trendValue: '±2%' },
        { label: 'Hours Saved', value: Math.abs(totalEstimated - totalActual), trend: totalEstimated > totalActual ? 'up' : 'down', trendValue: `${Math.abs(((totalActual - totalEstimated) / totalEstimated) * 100).toFixed(1)}%` }
      ]
    },
    tableData: {
      columns: [
        { key: 'name', header: 'Task Name', type: 'text' },
        { key: 'projectName', header: 'Project', type: 'text' },
        { key: 'status', header: 'Status', type: 'text' },
        { key: 'estimatedHours', header: 'Estimated Hours', type: 'number' },
        { key: 'actualHours', header: 'Actual Hours', type: 'number' },
        { key: 'variance', header: 'Variance', type: 'number' },
        { key: 'efficiency', header: 'Efficiency %', type: 'percentage' }
      ],
      rows: mockTasks.map(task => {
        const project = mockProjects.find(p => p.id === task.projectId)
        const variance = (task.actualHours || 0) - (task.estimatedHours || 0)
        const efficiency = task.estimatedHours && task.actualHours 
          ? ((task.estimatedHours / task.actualHours) * 100).toFixed(1)
          : '0'
        
        return {
          name: task.name,
          projectName: project?.name || 'Unknown Project',
          status: task.status.replace('_', ' ').toUpperCase(),
          estimatedHours: task.estimatedHours || 0,
          actualHours: task.actualHours || 0,
          variance,
          efficiency
        }
      })
    },
    chartData: {
      type: 'line',
      labels: mockTasks.map(t => t.name.split(' ').slice(0, 2).join(' ')),
      data: mockTasks.map(t => ({
        estimated: t.estimatedHours || 0,
        actual: t.actualHours || 0
      }))
    }
  }
}

function generateCategoryAnalysisReport(): ReportDetail {
  const categoryStats = mockProjects.reduce((acc, project) => {
    const category = project.category
    if (!acc[category]) {
      acc[category] = { count: 0, totalBudget: 0, totalCost: 0, completed: 0 }
    }
    acc[category].count++
    acc[category].totalBudget += project.budget
    acc[category].totalCost += project.actualCost || 0
    if (project.status === 'completed') acc[category].completed++
    return acc
  }, {} as Record<string, any>)

  return {
    id: 'category-analysis',
    name: 'Project Category Analysis',
    type: 'custom',
    description: 'Breakdown of projects by category and performance metrics',
    generatedAt: new Date().toISOString(),
    data: categoryStats,
    summary: {
      title: 'Category Performance Overview',
      description: 'Analysis of project distribution and performance across different categories',
      metrics: [
        { label: 'Total Categories', value: Object.keys(categoryStats).length, trend: 'stable' },
        { label: 'Most Active', value: Object.keys(categoryStats).reduce((a, b) => categoryStats[a].count > categoryStats[b].count ? a : b), trend: 'up' },
        { label: 'Best Margin', value: 'Construction', trend: 'up', trendValue: '18.5%' },
        { label: 'Avg Projects/Category', value: Math.round(mockProjects.length / Object.keys(categoryStats).length), trend: 'stable' }
      ]
    },
    tableData: {
      columns: [
        { key: 'category', header: 'Category', type: 'text' },
        { key: 'projectCount', header: 'Projects', type: 'number' },
        { key: 'completedCount', header: 'Completed', type: 'number' },
        { key: 'totalBudget', header: 'Total Budget', type: 'currency' },
        { key: 'averageBudget', header: 'Avg Budget', type: 'currency' },
        { key: 'completionRate', header: 'Completion Rate', type: 'percentage' }
      ],
      rows: Object.entries(categoryStats).map(([category, stats]) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        projectCount: stats.count,
        completedCount: stats.completed,
        totalBudget: stats.totalBudget,
        averageBudget: Math.round(stats.totalBudget / stats.count),
        completionRate: ((stats.completed / stats.count) * 100).toFixed(1)
      }))
    },
    chartData: {
      type: 'bar',
      labels: Object.keys(categoryStats).map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)),
      data: Object.values(categoryStats).map((stats: any) => ({
        projects: stats.count,
        budget: stats.totalBudget / 1000 // Convert to thousands for better chart display
      }))
    }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { reportId: string } }
) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reportId } = params

    let reportDetail: ReportDetail

    switch (reportId) {
      case 'financial-summary':
        reportDetail = generateFinancialReport()
        break
      case 'project-performance':
        reportDetail = generateProjectPerformanceReport()
        break
      case 'task-efficiency':
        reportDetail = generateTaskEfficiencyReport()
        break
      case 'category-analysis':
        reportDetail = generateCategoryAnalysisReport()
        break
      default:
        return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    return NextResponse.json({ report: reportDetail })
  } catch (error) {
    console.error('Report detail API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}