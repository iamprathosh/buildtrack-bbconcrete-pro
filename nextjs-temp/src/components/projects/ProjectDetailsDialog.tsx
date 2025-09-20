'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { TasksTable, Task, User as TaskUser } from './TasksTable'
import { Project } from './ProjectsView'
import { EditProjectDialog } from './EditProjectDialog'
import {
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  User as UserIcon,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Users,
  Plus,
  Edit
} from 'lucide-react'

interface ProjectDetailsDialogProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
  onProjectUpdate?: (projectId: string, updates: Partial<Project>) => void
}

export function ProjectDetailsDialog({ project, isOpen, onClose, onProjectUpdate }: ProjectDetailsDialogProps) {
  const { user } = useUser()
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<TaskUser[]>([])
  const [loading, setLoading] = useState(false)
  const [tasksLoading, setTasksLoading] = useState(false)
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false)
  const [showEditProjectDialog, setShowEditProjectDialog] = useState(false)

  const isAdmin = user?.publicMetadata?.role === 'super_admin' || user?.publicMetadata?.role === 'project_manager'

  // Fetch project tasks and users when dialog opens
  useEffect(() => {
    if (isOpen && project?.id) {
      fetchProjectData()
    }
  }, [isOpen, project?.id])

  const fetchProjectData = async () => {
    if (!project?.id) return

    setLoading(true)
    try {
      const [tasksResponse, usersResponse] = await Promise.all([
        fetch(`/api/projects/${project.id}/tasks`),
        fetch('/api/users')
      ])

      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json()
        setTasks(tasksData.tasks || [])
      }

      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        const rawUsers = usersData.users || []
        console.log('Raw users data:', rawUsers)
        
        // Filter out duplicates and invalid users
        const validUsers = rawUsers.filter((user: any) => user && user.id && user.full_name)
        const uniqueUsers = validUsers.filter((user: any, index: number, arr: any[]) => 
          arr.findIndex(u => u.id === user.id) === index
        )
        
        console.log('Filtered unique users:', uniqueUsers)
        setUsers(uniqueUsers)
      }
    } catch (error) {
      console.error('Failed to fetch project data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    setTasksLoading(true)
    try {
      const response = await fetch(`/api/projects/${project?.id}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const { task: updatedTask } = await response.json()
        setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, ...updatedTask } : task
        ))
        
        // Refresh parent project data if needed for progress update
        // This could be optimized to update progress locally
      }
    } catch (error) {
      console.error('Failed to update task:', error)
    } finally {
      setTasksLoading(false)
    }
  }

  const handleTaskDelete = async (taskId: string) => {
    setTasksLoading(true)
    try {
      const response = await fetch(`/api/projects/${project?.id}/tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setTasks(prev => prev.filter(task => task.id !== taskId))
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
    } finally {
      setTasksLoading(false)
    }
  }

  const handleTaskAdd = async (taskData: Omit<Task, 'id' | 'taskNumber' | 'createdAt' | 'updatedAt'>) => {
    setTasksLoading(true)
    try {
      const response = await fetch(`/api/projects/${project?.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      })

      if (response.ok) {
        const { task: newTask } = await response.json()
        setTasks(prev => [...prev, newTask])
      }
    } catch (error) {
      console.error('Failed to create task:', error)
    } finally {
      setTasksLoading(false)
    }
  }

  const handleProjectUpdate = async (projectId: string, updates: Partial<Project>) => {
    console.log('handleProjectUpdate called', { projectId, updates })
    try {
      console.log('Making PUT request to:', `/api/projects/${projectId}`)
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      console.log('Response status:', response.status)
      if (response.ok) {
        const responseData = await response.json()
        console.log('Update successful:', responseData)
        // Call parent update handler if provided
        onProjectUpdate?.(projectId, updates)
        // Refresh the dialog data
        if (isOpen && project?.id === projectId) {
          fetchProjectData()
        }
      } else {
        const errorData = await response.text()
        console.error('Update failed:', response.status, errorData)
      }
    } catch (error) {
      console.error('Failed to update project:', error)
    }
  }

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-600" />
      case 'on-hold':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />
      case 'cancelled':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <Target className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'in-progress':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'on-hold':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
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

  const getTaskStats = () => {
    const total = tasks.length
    const completed = tasks.filter(t => t.status === 'completed').length
    const inProgress = tasks.filter(t => t.status === 'in_progress').length
    const overdue = tasks.filter(t => {
      if (!t.dueDate || t.status === 'completed') return false
      return new Date() > t.dueDate
    }).length

    return { total, completed, inProgress, overdue }
  }

  const taskStats = getTaskStats()

  if (!project) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{project.name}</DialogTitle>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground mt-1">
                <span>{project.jobNumber}</span>
                <span>•</span>
                <span>{project.client}</span>
                <span>•</span>
                <span>{project.location}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-2 px-2 py-1 rounded border ${getStatusColor(project.status)}`}>
                {getStatusIcon(project.status)}
                <span className="text-sm font-medium capitalize">
                  {project.status.replace('-', ' ')}
                </span>
              </div>
              {/* Always show for testing - can be restricted later */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  console.log('Edit Project button clicked', { user, isAdmin })
                  setShowEditProjectDialog(true)
                }}
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Simplified Overview */}
          <div className="grid gap-3 md:grid-cols-3">
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-semibold">{project.progress}%</div>
                <div className="text-xs text-muted-foreground">Progress</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-semibold">{formatCurrency(project.budget)}</div>
                <div className="text-xs text-muted-foreground">Budget</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <div className="font-semibold">{project.manager}</div>
                <div className="text-xs text-muted-foreground">Manager</div>
              </div>
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm">{project.description}</p>
            </div>
          )}

          {/* Task Management Section */}
          <div className="space-y-4">
            {/* Task Summary and Actions Header */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
              <div className="flex items-center space-x-6">
                <div>
                  <h3 className="font-semibold text-lg">Project Tasks</h3>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                    <span>{taskStats.total} total</span>
                    <span>•</span>
                    <span className="text-green-600">{taskStats.completed} completed</span>
                    <span>•</span>
                    <span className="text-blue-600">{taskStats.inProgress} in progress</span>
                    {taskStats.overdue > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-red-600 font-medium">{taskStats.overdue} overdue</span>
                      </>
                    )}
                  </div>
                </div>
                {taskStats.total > 0 && (
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-2xl font-bold">{Math.round((taskStats.completed / taskStats.total) * 100)}%</div>
                      <div className="text-xs text-muted-foreground">Complete</div>
                    </div>
                    <Progress 
                      value={Math.round((taskStats.completed / taskStats.total) * 100)} 
                      className="w-20 h-2" 
                    />
                  </div>
                )}
              </div>
              
              {/* Quick Action Buttons */}
              {user && (
                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={() => {
                      console.log('Add Task button clicked (header)', { user, showAddTaskDialog })
                      setShowAddTaskDialog(true)
                    }}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                  {tasks.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const completed = tasks.filter(t => t.status !== 'completed')
                        if (completed.length > 0) {
                          const message = `Mark all ${completed.length} pending tasks as completed?`
                          if (window.confirm(message)) {
                            completed.forEach(task => {
                              handleTaskUpdate(task.id, { status: 'completed' as const, completedDate: new Date() })
                            })
                          }
                        }
                      }}
                      disabled={taskStats.completed === taskStats.total}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Complete All
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Tasks Content */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : tasks.length > 0 ? (
              <TasksTable
                projectId={project.id}
                tasks={tasks}
                users={users}
                onTaskUpdate={handleTaskUpdate}
                onTaskDelete={handleTaskDelete}
                onTaskAdd={handleTaskAdd}
                isAdmin={isAdmin}
                externalAddTrigger={showAddTaskDialog}
                onExternalAddTriggerHandled={() => setShowAddTaskDialog(false)}
              />
            ) : (
              <div className="text-center py-12 bg-muted/20 rounded-lg border-2 border-dashed">
                <div className="max-w-sm mx-auto">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <Plus className="h-8 w-8 text-blue-600" />
                  </div>
                  <h4 className="font-medium mb-2">No Tasks Yet</h4>
                  <p className="text-muted-foreground mb-4">Get started by creating your first task for this project.</p>
                  {user && (
                    <Button 
                      onClick={() => setShowAddTaskDialog(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Task
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
      
      {/* Edit Project Dialog */}
      <EditProjectDialog
        project={project}
        isOpen={showEditProjectDialog}
        onClose={() => setShowEditProjectDialog(false)}
        onProjectUpdate={handleProjectUpdate}
        users={users}
      />
    </Dialog>
  )
}
