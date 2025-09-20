'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  Plus,
  MoreHorizontal, 
  Edit2, 
  Trash2,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  Circle,
  XCircle,
  AlertCircle
} from 'lucide-react'

export interface Task {
  id: string
  projectId: string
  taskNumber: number
  name: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: string | null
  assignedUser?: {
    id: string
    full_name: string
    email: string
  } | null
  startDate?: Date | null
  dueDate?: Date | null
  completedDate?: Date | null
  estimatedHours?: number
  actualHours?: number
  dependencies?: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  full_name: string
  email: string
}

interface TasksTableProps {
  projectId: string
  tasks: Task[]
  users: User[]
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>
  onTaskDelete: (taskId: string) => Promise<void>
  onTaskAdd: (task: Omit<Task, 'id' | 'taskNumber' | 'createdAt' | 'updatedAt'>) => Promise<void>
  isAdmin?: boolean
  externalAddTrigger?: boolean
  onExternalAddTriggerHandled?: () => void
}

const taskSchema = z.object({
  name: z.string().min(1, 'Task name is required'),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  assignedTo: z.string().optional(),
  startDate: z.date().optional(),
  dueDate: z.date().optional(),
  estimatedHours: z.number().min(0).optional(),
  notes: z.string().optional(),
})

type TaskFormValues = z.infer<typeof taskSchema>

export function TasksTable({ 
  projectId, 
  tasks, 
  users, 
  onTaskUpdate, 
  onTaskDelete, 
  onTaskAdd,
  isAdmin = true,
  externalAddTrigger = false,
  onExternalAddTriggerHandled
}: TasksTableProps) {
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      assignedTo: '',
      estimatedHours: 0,
      notes: '',
    },
  })

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Circle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: Task['status']) => {
    const variants = {
      pending: 'outline',
      in_progress: 'default',
      completed: 'default',
      cancelled: 'destructive',
    } as const

    const colors = {
      pending: 'text-gray-600',
      in_progress: 'text-blue-600 bg-blue-50',
      completed: 'text-green-600 bg-green-50',
      cancelled: 'text-red-600',
    }

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: Task['priority']) => {
    const variants = {
      low: 'outline',
      medium: 'secondary',
      high: 'default',
      urgent: 'destructive',
    } as const

    return (
      <Badge variant={variants[priority]} className="text-xs">
        {priority}
      </Badge>
    )
  }

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    if (!isAdmin) return

    setLoading(true)
    try {
      const updates: Partial<Task> = { status: newStatus }
      if (newStatus === 'completed') {
        updates.completedDate = new Date()
      } else {
        updates.completedDate = null
      }
      await onTaskUpdate(taskId, updates)
    } catch (error) {
      console.error('Failed to update task status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!isAdmin || !window.confirm('Are you sure you want to delete this task?')) return

    setLoading(true)
    try {
      await onTaskDelete(taskId)
      // Remove from selected tasks if it was selected
      setSelectedTasks(prev => prev.filter(id => id !== taskId))
    } catch (error) {
      console.error('Failed to delete task:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (!isAdmin || selectedTasks.length === 0) return
    
    const message = `Are you sure you want to delete ${selectedTasks.length} selected task${selectedTasks.length > 1 ? 's' : ''}?`
    if (!window.confirm(message)) return

    setLoading(true)
    try {
      // Delete tasks sequentially to avoid overwhelming the API
      for (const taskId of selectedTasks) {
        await onTaskDelete(taskId)
      }
      setSelectedTasks([])
    } catch (error) {
      console.error('Failed to delete tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(tasks.map(task => task.id))
    } else {
      setSelectedTasks([])
    }
  }

  const handleSelectTask = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTasks(prev => [...prev, taskId])
    } else {
      setSelectedTasks(prev => prev.filter(id => id !== taskId))
    }
  }

  const onSubmitNewTask = async (values: TaskFormValues) => {
    setLoading(true)
    try {
      await onTaskAdd({
        projectId,
        name: values.name,
        description: values.description || '',
        status: values.status,
        priority: values.priority,
        assignedTo: values.assignedTo || null,
        startDate: values.startDate || null,
        dueDate: values.dueDate || null,
        completedDate: null,
        estimatedHours: values.estimatedHours || 0,
        actualHours: 0,
        dependencies: [],
        notes: values.notes || '',
      })
      form.reset()
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error('Failed to create task:', error)
    } finally {
      setLoading(false)
    }
  }

  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.status === 'completed') return false
    return new Date() > task.dueDate
  }

  // Handle external trigger for add task dialog
  useEffect(() => {
    if (externalAddTrigger) {
      setIsAddDialogOpen(true)
      onExternalAddTriggerHandled?.()
    }
  }, [externalAddTrigger, onExternalAddTriggerHandled])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h3 className="text-lg font-semibold">Tasks</h3>
            <p className="text-sm text-muted-foreground">
              {tasks.filter(t => t.status === 'completed').length} of {tasks.length} completed
              {selectedTasks.length > 0 && (
                <span className="ml-2 text-blue-600 font-medium">
                  • {selectedTasks.length} selected
                </span>
              )}
            </p>
          </div>
          
          {/* Bulk Actions */}
          {isAdmin && selectedTasks.length > 0 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                disabled={loading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete ({selectedTasks.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTasks([])}
                disabled={loading}
              >
                Clear Selection
              </Button>
            </div>
          )}
        </div>
        
        <Button 
          onClick={() => {
            console.log('Add Task button clicked (TasksTable)')
            setIsAddDialogOpen(true)
          }}
          data-add-task-button
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Tasks Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {isAdmin && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={tasks.length > 0 && selectedTasks.length === tasks.length}
                    onCheckedChange={handleSelectAll}
                    disabled={loading}
                  />
                </TableHead>
              )}
              <TableHead className="w-12">#</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Estimated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 9 : 8} className="text-center py-8 text-muted-foreground">
                  No tasks yet. Click "Add Task" to get started.
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task.id} className={isOverdue(task) ? 'bg-red-50' : ''}>
                  {isAdmin && (
                    <TableCell>
                      <Checkbox
                        checked={selectedTasks.includes(task.id)}
                        onCheckedChange={(checked) => handleSelectTask(task.id, checked as boolean)}
                        disabled={loading}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-mono text-sm">
                    {task.taskNumber}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{task.name}</div>
                      {task.description && (
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {task.description}
                        </div>
                      )}
                      {isOverdue(task) && (
                        <div className="flex items-center text-xs text-red-600">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Overdue
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(task.status)}
                      {isAdmin ? (
                        <Select
                          value={task.status}
                          onValueChange={(value) => handleStatusChange(task.id, value as Task['status'])}
                          disabled={loading}
                        >
                          <SelectTrigger className="w-32 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        getStatusBadge(task.status)
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                  <TableCell>
                    {task.assignedUser ? (
                      <div className="flex items-center space-x-2">
                        <User className="h-3 w-3" />
                        <span className="text-sm">{task.assignedUser.full_name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {task.dueDate ? (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3 w-3" />
                        <span className={`text-sm ${isOverdue(task) ? 'text-red-600 font-medium' : ''}`}>
                          {format(task.dueDate, 'MMM dd, yyyy')}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">No deadline</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {task.estimatedHours && task.estimatedHours > 0 && (
                      <div className="flex items-center space-x-1 text-sm">
                        <Clock className="h-3 w-3" />
                        <span>{task.estimatedHours}h</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setEditingTask(task.id)}
                          >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Create a new task for this project.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitNewTask)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter task name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter task description"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign To</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select user" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem key="unassigned" value="">Unassigned</SelectItem>
                          {users
                            .filter((user, index, arr) => {
                              // Filter out duplicates and invalid users
                              return user && user.id && user.full_name && 
                                     arr.findIndex(u => u.id === user.id) === index;
                            })
                            .map((user) => {
                              console.log('TasksTable: Rendering user:', { user });
                              return (
                                <SelectItem key={`task-assign-${user.id}`} value={user.id}>
                                  {user.full_name}
                                </SelectItem>
                              );
                            })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <DatePicker
                        date={field.value}
                        onDateChange={field.onChange}
                        placeholder="Select start date"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
                      <DatePicker
                        date={field.value}
                        onDateChange={field.onChange}
                        placeholder="Select due date"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="estimatedHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Hours</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes or requirements"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Task'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}