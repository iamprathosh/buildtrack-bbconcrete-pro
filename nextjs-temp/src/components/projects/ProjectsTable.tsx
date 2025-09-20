'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Project } from './ProjectsView'
import { ProjectDetailsSheet } from './ProjectDetailsSheet'
import { format } from 'date-fns'
import { 
  ArrowUpDown, 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Trash2,
  Calendar,
  DollarSign,
  MapPin
} from 'lucide-react'

interface ProjectsTableProps {
  projects: Project[]
  selectedProjects: string[]
  onSelectedProjectsChange: (projects: string[]) => void
  onProjectClick?: (project: Project) => void
  onProjectUpdate: (projectId: string, updates: Partial<Project>) => void
}

type SortField = 'name' | 'status' | 'priority' | 'startDate' | 'endDate' | 'budget' | 'progress' | 'manager'
type SortDirection = 'asc' | 'desc'

export function ProjectsTable({ 
  projects, 
  selectedProjects, 
  onSelectedProjectsChange,
  onProjectClick,
  onProjectUpdate
}: ProjectsTableProps) {
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [selectedProjectForDetails, setSelectedProjectForDetails] = useState<Project | null>(null)

  // Sort projects
  const sortedProjects = [...projects].sort((a, b) => {
    let aValue: string | number | Date = a[sortField] as string | number | Date
    let bValue: string | number | Date = b[sortField] as string | number | Date

    // Handle date sorting
    if (sortField === 'startDate' || sortField === 'endDate') {
      aValue = new Date(aValue).getTime()
      bValue = new Date(bValue).getTime()
    }

    // Handle string sorting
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectedProjectsChange(projects.map(p => p.id))
    } else {
      onSelectedProjectsChange([])
    }
  }

  const handleSelectProject = (projectId: string, checked: boolean) => {
    if (checked) {
      onSelectedProjectsChange([...selectedProjects, projectId])
    } else {
      onSelectedProjectsChange(selectedProjects.filter(id => id !== projectId))
    }
  }

  const getStatusVariant = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'in-progress':
        return 'secondary'
      case 'on-hold':
        return 'destructive'
      case 'cancelled':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getPriorityVariant = (priority: Project['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'destructive'
      case 'high':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      className="h-8 px-2 lg:px-3"
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  )

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <div className="w-full overflow-auto">
          <Table className="w-full" style={{ minWidth: '1000px' }}>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedProjects.length === projects.length && projects.length > 0}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all projects"
                />
              </TableHead>
              <TableHead>
                <SortButton field="name">Project</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="status">Status</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="priority">Priority</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="progress">Progress</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="manager">Manager</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="budget">Budget</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="startDate">Start Date</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="endDate">End Date</SortButton>
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProjects.map((project) => (
              <TableRow 
                key={project.id} 
                className={onProjectClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                onClick={() => onProjectClick?.(project)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedProjects.includes(project.id)}
                    onCheckedChange={(checked) => handleSelectProject(project.id, !!checked)}
                    aria-label={`Select ${project.name}`}
                  />
                </TableCell>
                <TableCell className="max-w-64">
                  <div className="space-y-1">
                    <p className="font-medium truncate" title={project.name}>
                      {project.name}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {project.location}
                      </span>
                      <span className="truncate max-w-32" title={project.client}>
                        {project.client}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(project.status)}>
                    {project.status.replace('-', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getPriorityVariant(project.priority)} className="text-xs">
                    {project.priority}
                  </Badge>
                </TableCell>
                <TableCell className="w-32">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {project.manager}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium">{formatCurrency(project.budget)}</p>
                    <p className="text-sm text-muted-foreground">
                      Spent: {formatCurrency(project.actualCost)}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {format(project.startDate, 'MMM dd, yyyy')}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {format(project.endDate, 'MMM dd, yyyy')}
                  </div>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onProjectClick ? onProjectClick(project) : setSelectedProjectForDetails(project)
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Project
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
          {projects.length === 0 && (
            <div className="flex items-center justify-center py-10">
              <div className="text-center">
                <p className="text-lg font-medium text-muted-foreground">No projects found</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Project Details Sheet */}
      {selectedProjectForDetails && (
        <ProjectDetailsSheet
          project={selectedProjectForDetails}
          onClose={() => setSelectedProjectForDetails(null)}
          onUpdate={(updates) => {
            onProjectUpdate(selectedProjectForDetails.id, updates)
            setSelectedProjectForDetails({ ...selectedProjectForDetails, ...updates })
          }}
        />
      )}
    </>
  )
}