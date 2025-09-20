'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProjectsTable } from './ProjectsTable'
import { ProjectFilters } from './ProjectFilters'
import { AddProjectDialog } from './AddProjectDialog'
import { ProjectDetailsDialog } from './ProjectDetailsDialog'
import { useUser } from '@clerk/nextjs'
import { format } from 'date-fns'
import { 
  Plus,
  Building2,
  Calendar,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp
} from 'lucide-react'

export interface Project {
  id: string
  name: string
  description: string
  status: 'planning' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  startDate: Date
  endDate: Date
  estimatedEndDate: Date
  budget: number
  actualCost: number
  progress: number
  manager: string
  client: string
  location: string
  category: string
  team: string[]
  tags: string[]
  lastUpdated: Date
  // Additional fields from database
  jobNumber?: string
  customerId?: string | null
  projectManagerId?: string | null
  dbStatus?: string | null
}

export interface ProjectFilters {
  search: string
  status: string
  priority: string
  manager: string
  category: string
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
}

export function ProjectsView() {
  const { user } = useUser()
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [filters, setFilters] = useState<ProjectFilters>({
    search: '',
    status: 'all',
    priority: 'all',
    manager: 'all',
    category: 'all',
    dateRange: { from: undefined, to: undefined }
  })
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isProjectDetailsOpen, setIsProjectDetailsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/projects')
        if (!response.ok) {
          throw new Error('Failed to fetch projects')
        }

        const data = await response.json()
        setProjects(data.projects || [])
        setFilteredProjects(data.projects || [])
      } catch (err) {
        console.error('Error fetching projects:', err)
        setError(err instanceof Error ? err.message : 'Failed to load projects')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchProjects()
    }
  }, [user])

  // Apply filters
  useEffect(() => {
    const filtered = projects.filter(project => {
      const matchesSearch = 
        project.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.client.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.location.toLowerCase().includes(filters.search.toLowerCase())

      const matchesStatus = filters.status === 'all' || project.status === filters.status
      const matchesPriority = filters.priority === 'all' || project.priority === filters.priority
      const matchesManager = filters.manager === 'all' || project.manager === filters.manager
      const matchesCategory = filters.category === 'all' || project.category === filters.category
      
      const matchesDateRange = 
        (!filters.dateRange.from || project.startDate >= filters.dateRange.from) &&
        (!filters.dateRange.to || project.endDate <= filters.dateRange.to)

      return matchesSearch && matchesStatus && matchesPriority && matchesManager && 
             matchesCategory && matchesDateRange
    })

    setFilteredProjects(filtered)
  }, [projects, filters])

  // Calculate stats
  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'in-progress').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
    totalSpent: projects.reduce((sum, p) => sum + p.actualCost, 0),
    avgProgress: projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) : 0
  }

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project)
    setIsProjectDetailsOpen(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="space-y-6 w-full max-w-full overflow-x-hidden">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 w-full max-w-full overflow-x-hidden">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Responsive container ensures no horizontal scroll */}
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
          
          {selectedProjects.length > 0 && (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {selectedProjects.length} selected
              </Badge>
              <Button variant="outline" size="sm">
                Export Selected
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 w-full max-w-full">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">All projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedProjects}</div>
            <p className="text-xs text-muted-foreground">Finished projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalBudget)}</div>
            <p className="text-xs text-muted-foreground">Allocated budget</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</div>
            <p className="text-xs text-muted-foreground">Actual costs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgProgress}%</div>
            <p className="text-xs text-muted-foreground">Overall progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <ProjectFilters
        filters={filters}
        onFiltersChange={setFilters}
        projects={projects}
      />

      {/* Main Content */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="cards">Card View</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <ProjectsTable
            projects={filteredProjects}
            selectedProjects={selectedProjects}
            onSelectedProjectsChange={setSelectedProjects}
            onProjectClick={handleProjectClick}
            onProjectUpdate={(projectId, updates) => {
              setProjects(prev => prev.map(project => 
                project.id === projectId ? { ...project, ...updates } : project
              ))
            }}
          />
        </TabsContent>

        <TabsContent value="cards" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-full">
            {filteredProjects.map((project) => (
              <Card 
                key={project.id} 
                className="relative cursor-pointer hover:shadow-md transition-shadow" 
                onClick={() => handleProjectClick(project)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 min-w-0">
                      <CardTitle className="text-lg truncate" title={project.name}>
                        {project.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {project.description}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge variant={
                        project.status === 'completed' ? 'default' :
                        project.status === 'in-progress' ? 'secondary' :
                        project.status === 'on-hold' ? 'destructive' : 'outline'
                      }>
                        {project.status.replace('-', ' ')}
                      </Badge>
                      <Badge variant={
                        project.priority === 'urgent' ? 'destructive' :
                        project.priority === 'high' ? 'secondary' : 'outline'
                      } className="text-xs">
                        {project.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  {/* Project Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Manager</p>
                      <p className="font-medium truncate" title={project.manager}>
                        {project.manager}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Budget</p>
                      <p className="font-medium">{formatCurrency(project.budget)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Client</p>
                      <p className="font-medium truncate" title={project.client}>
                        {project.client}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">End Date</p>
                      <p className="font-medium">
                        {format(project.endDate, 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {project.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {project.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
              <CardDescription>Visual timeline of all projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredProjects.map((project) => (
                  <div key={project.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium truncate">{project.name}</h3>
                        <Badge variant={
                          project.status === 'completed' ? 'default' :
                          project.status === 'in-progress' ? 'secondary' : 'outline'
                        }>
                          {project.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {format(project.startDate, 'MMM dd, yyyy')} → {format(project.endDate, 'MMM dd, yyyy')}
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Project Dialog */}
      <AddProjectDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onProjectAdded={async (newProject) => {
          try {
            const response = await fetch('/api/projects', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(newProject),
            })

            if (!response.ok) {
              throw new Error('Failed to create project')
            }

            const data = await response.json()
            setProjects(prev => [...prev, data.project])
            setIsAddDialogOpen(false)
          } catch (err) {
            console.error('Error creating project:', err)
            // You might want to show a toast error here
          }
        }}
      />

      {/* Project Details Dialog */}
      <ProjectDetailsDialog
        project={selectedProject}
        isOpen={isProjectDetailsOpen}
        onClose={() => {
          setIsProjectDetailsOpen(false)
          setSelectedProject(null)
        }}
        onProjectUpdate={(projectId, updates) => {
          setProjects(prev => prev.map(project => 
            project.id === projectId ? { ...project, ...updates } : project
          ))
        }}
      />
    </div>
  )
}