'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Project } from './ProjectsView'
import { DatePicker } from '@/components/ui/date-picker'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
  // Simple tasks state
  const [simpleTasks, setSimpleTasks] = useState<Array<{
    id: string
    projectId: string
    task: string
    createdBy: string
    createdAt: Date | null
    deadline: Date | null
    completed: boolean
  }>>([])
  const [simpleTasksLoading, setSimpleTasksLoading] = useState(false)
  const [showAddSimpleTaskDialog, setShowAddSimpleTaskDialog] = useState(false)

  // Form for creating simple tasks
  const simpleTaskSchema = z.object({
    task: z.string().min(1, 'Task is required'),
    deadline: z.date().optional().nullable(),
  })
  type SimpleTaskFormValues = z.infer<typeof simpleTaskSchema>
  const simpleTaskForm = useForm<SimpleTaskFormValues>({
    resolver: zodResolver(simpleTaskSchema),
    defaultValues: { task: '', deadline: null },
  })


  // Fetch simple tasks when dialog opens
  useEffect(() => {
    if (isOpen && project?.id) {
      fetchSimpleTasks()
    }
  }, [isOpen, project?.id])






  const fetchSimpleTasks = async () => {
    if (!project?.id) return
    setSimpleTasksLoading(true)
    try {
      const res = await fetch(`/api/projects/${project.id}/simple-tasks`)
      if (res.ok) {
        const data = await res.json()
        setSimpleTasks((data.tasks || []).map((t: any) => ({
          ...t,
          completed: !!t.completed,
        })))
      }
    } catch (e) {
      console.error('Failed to fetch simple tasks:', e)
    } finally {
      setSimpleTasksLoading(false)
    }
  }

  const onSubmitSimpleTask = async (values: SimpleTaskFormValues) => {
    if (!project?.id) return
    try {
      const res = await fetch(`/api/projects/${project.id}/simple-tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: values.task,
          deadline: values.deadline || null,
        }),
      })
      if (res.ok) {
        const { task } = await res.json()
        setSimpleTasks(prev => [{ ...task, completed: !!task.completed }, ...prev])
        setShowAddSimpleTaskDialog(false)
        simpleTaskForm.reset({ task: '', deadline: null })
      }
    } catch (e) {
      console.error('Failed to create simple task:', e)
    }
  }

  const handleToggleSimpleTaskCompleted = async (taskId: string, value: boolean) => {
    if (!project?.id) return
    try {
      const res = await fetch(`/api/projects/${project.id}/simple-tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: value })
      })
      if (res.ok) {
        const { task } = await res.json()
        setSimpleTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !!task.completed } : t))
      }
    } catch (e) {
      console.error('Failed to toggle simple task completed:', e)
    }
  }

  const handleDeleteSimpleTask = async (taskId: string) => {
    if (!project?.id) return
    if (!window.confirm('Delete this task?')) return
    try {
      const res = await fetch(`/api/projects/${project.id}/simple-tasks/${taskId}`, { method: 'DELETE' })
      if (res.ok) {
        setSimpleTasks(prev => prev.filter(t => t.id !== taskId))
      }
    } catch (e) {
      console.error('Failed to delete simple task:', e)
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


  if (!project) return null

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1100px] md:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{project.name}</DialogTitle>
              {(() => {
                const items = [
                  project.jobNumber,
                  project.client && project.client.trim() ? project.client : null,
                  project.location && project.location.trim() ? project.location : null,
                ].filter(Boolean) as string[]
                return (
                  <div className="flex items-center text-sm text-muted-foreground mt-1 flex-wrap gap-x-2">
                    {items.map((it, idx) => (
                      <span key={idx} className="truncate max-w-[220px]">
                        {it}{idx < items.length - 1 && <span className="mx-2">•</span>}
                      </span>
                    ))}
                  </div>
                )
              })()}
            </div>
            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-2 px-2 py-1 rounded border ${getStatusColor(project.status)}`}>
                {getStatusIcon(project.status)}
                <span className="text-sm font-medium capitalize">
                  {project.status.replace('-', ' ')}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Overview */}
          <div className="grid gap-3 md:grid-cols-2">
            <Card>
              <CardContent className="flex items-center space-x-3 p-4">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-semibold">{project.progress}%</div>
                  <div className="text-xs text-muted-foreground">Progress</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center space-x-3 p-4">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-semibold">{formatCurrency(project.budget)}</div>
                  <div className="text-xs text-muted-foreground">Budget</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          {project.description && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm">{project.description}</p>
            </div>
          )}


          {/* Simple Tasks */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Simple Tasks</CardTitle>
                  <CardDescription>Quick notes and deadlines linked to this project</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={() => setShowAddSimpleTaskDialog(true)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Simple Task
                  </Button>
                </div>
              </div>
              {simpleTasks.length > 0 && (
                <div className="flex items-center gap-3 mt-3">
                  {(() => {
                    const total = simpleTasks.length
                    const done = simpleTasks.filter(t => t.completed).length
                    const pct = Math.round((done / total) * 100)
                    return (
                      <>
                        <div className="text-right">
                          <div className="text-sm font-medium">{pct}% Complete</div>
                        </div>
                        <Progress value={pct} className="w-32 h-2" />
                      </>
                    )
                  })()}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {simpleTasksLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">Loading...</TableCell>
                    </TableRow>
                  ) : simpleTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No simple tasks yet.</TableCell>
                    </TableRow>
                  ) : (
                    simpleTasks.map((t, idx) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-mono text-xs">{simpleTasks.length - idx}</TableCell>
                        <TableCell>{t.task}</TableCell>
                        <TableCell>
                          {t.deadline ? format(t.deadline, 'MMM dd, yyyy') : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          {t.createdAt ? format(t.createdAt, 'MMM dd, yyyy') : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          <Checkbox checked={t.completed} onCheckedChange={(checked) => handleToggleSimpleTaskCompleted(t.id, Boolean(checked))} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteSimpleTask(t.id)} className="text-red-600 hover:text-red-700">
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            </CardContent>
          </Card>

        </div>
      </DialogContent>
    </Dialog>

    {/* Add Simple Task Dialog (separate from main dialog for cleaner markup) */}
    <Dialog open={showAddSimpleTaskDialog} onOpenChange={(open) => {
        setShowAddSimpleTaskDialog(open)
        if (!open) simpleTaskForm.reset({ task: '', deadline: null })
      }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Simple Task</DialogTitle>
        </DialogHeader>

        <Form {...simpleTaskForm}>
          <form onSubmit={simpleTaskForm.handleSubmit(onSubmitSimpleTask)} className="space-y-4">
            <FormField
              control={simpleTaskForm.control}
              name="task"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task</FormLabel>
                  <FormControl>
                    <Input placeholder="Describe the task" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={simpleTaskForm.control}
              name="deadline"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Deadline (optional)</FormLabel>
                  <DatePicker
                    date={field.value ?? undefined}
                    onDateChange={(d) => field.onChange(d ?? null)}
                    placeholder="Select deadline"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddSimpleTaskDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Add Task
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
    </>
  )
}
