import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  Plus,
  Edit,
  Trash2,
  Settings
} from 'lucide-react';
import { format, addDays, isAfter, isBefore, isEqual, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface MaintenanceTask {
  id: string;
  equipment_id: string;
  task_type: 'preventive' | 'corrective' | 'inspection';
  title: string;
  description?: string;
  scheduled_date: string;
  completed_date?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
  assigned_to?: string;
  estimated_duration?: number; // in minutes
  priority: 'low' | 'medium' | 'high' | 'critical';
  recurring_interval?: number; // in days
  cost_estimate?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  equipment?: {
    name: string;
    serial_number: string;
    category: string;
  };
}

interface MaintenanceSchedulerProps {
  equipmentId?: string;
  showEquipmentFilter?: boolean;
}

export function MaintenanceScheduler({ equipmentId, showEquipmentFilter = true }: MaintenanceSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<MaintenanceTask | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterEquipment, setFilterEquipment] = useState<string>(equipmentId || 'all');

  const queryClient = useQueryClient();

  // Fetch maintenance tasks
  const { data: maintenanceTasks = [], isLoading } = useQuery({
    queryKey: ['maintenance-tasks', equipmentId],
    queryFn: async (): Promise<MaintenanceTask[]> => {
      let query = supabase
        .from('maintenance_tasks')
        .select(`
          *,
          equipment:equipment_id (
            name,
            serial_number,
            category
          )
        `)
        .order('scheduled_date', { ascending: true });

      if (equipmentId) {
        query = query.eq('equipment_id', equipmentId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.map(task => ({
        ...task,
        equipment: task.equipment as any
      }));
    }
  });

  // Fetch equipment list for filter
  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment-for-maintenance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('id, name, serial_number, category')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      return data;
    },
    enabled: showEquipmentFilter
  });

  // Create/Update maintenance task mutation
  const saveTaskMutation = useMutation({
    mutationFn: async (taskData: Partial<MaintenanceTask>) => {
      if (taskData.id) {
        // Update existing task
        const { data, error } = await supabase
          .from('maintenance_tasks')
          .update({
            ...taskData,
            updated_at: new Date().toISOString()
          })
          .eq('id', taskData.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new task
        const { data, error } = await supabase
          .from('maintenance_tasks')
          .insert({
            ...taskData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] });
      setIsAddDialogOpen(false);
      setEditingTask(null);
      toast({
        title: "Success",
        description: "Maintenance task saved successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save maintenance task: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('maintenance_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] });
      toast({
        title: "Success",
        description: "Maintenance task deleted successfully"
      });
    }
  });

  // Update task status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ taskId, status, completedDate }: { taskId: string, status: string, completedDate?: string }) => {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .update({
          status,
          completed_date: completedDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] });
    }
  });

  // Filter tasks based on selected criteria
  const filteredTasks = useMemo(() => {
    return maintenanceTasks.filter(task => {
      if (filterStatus !== 'all' && task.status !== filterStatus) return false;
      if (filterEquipment !== 'all' && task.equipment_id !== filterEquipment) return false;
      return true;
    });
  }, [maintenanceTasks, filterStatus, filterEquipment]);

  // Get tasks for selected date
  const tasksForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    return filteredTasks.filter(task => {
      const taskDate = format(new Date(task.scheduled_date), 'yyyy-MM-dd');
      return taskDate === selectedDateStr;
    });
  }, [filteredTasks, selectedDate]);

  // Get upcoming and overdue tasks
  const upcomingTasks = useMemo(() => {
    const today = startOfDay(new Date());
    return filteredTasks.filter(task => {
      const taskDate = startOfDay(new Date(task.scheduled_date));
      return isAfter(taskDate, today) && task.status === 'scheduled';
    }).slice(0, 5);
  }, [filteredTasks]);

  const overdueTasks = useMemo(() => {
    const today = startOfDay(new Date());
    return filteredTasks.filter(task => {
      const taskDate = startOfDay(new Date(task.scheduled_date));
      return isBefore(taskDate, today) && task.status !== 'completed';
    });
  }, [filteredTasks]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'in_progress': return 'bg-blue-500 text-white';
      case 'overdue': return 'bg-red-500 text-white';
      case 'scheduled': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleCompleteTask = (task: MaintenanceTask) => {
    updateStatusMutation.mutate({
      taskId: task.id,
      status: 'completed',
      completedDate: new Date().toISOString()
    });
  };

  const MaintenanceTaskForm = ({ task }: { task?: MaintenanceTask }) => {
    const [formData, setFormData] = useState({
      equipment_id: task?.equipment_id || filterEquipment !== 'all' ? filterEquipment : '',
      task_type: task?.task_type || 'preventive',
      title: task?.title || '',
      description: task?.description || '',
      scheduled_date: task?.scheduled_date ? format(new Date(task.scheduled_date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      priority: task?.priority || 'medium',
      estimated_duration: task?.estimated_duration || 60,
      recurring_interval: task?.recurring_interval || 0,
      cost_estimate: task?.cost_estimate || 0,
      notes: task?.notes || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      saveTaskMutation.mutate({
        ...task,
        ...formData,
        scheduled_date: new Date(formData.scheduled_date).toISOString(),
        status: task?.status || 'scheduled'
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="equipment_id">Equipment *</Label>
            <Select value={formData.equipment_id} onValueChange={(value) => setFormData({ ...formData, equipment_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select equipment" />
              </SelectTrigger>
              <SelectContent>
                {equipment.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} ({item.serial_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task_type">Task Type *</Label>
            <Select value={formData.task_type} onValueChange={(value) => setFormData({ ...formData, task_type: value as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preventive">Preventive</SelectItem>
                <SelectItem value="corrective">Corrective</SelectItem>
                <SelectItem value="inspection">Inspection</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Task Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Oil Change, Belt Inspection"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detailed description of the maintenance task..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="scheduled_date">Scheduled Date *</Label>
            <Input
              id="scheduled_date"
              type="date"
              value={formData.scheduled_date}
              onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority *</Label>
            <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimated_duration">Duration (minutes)</Label>
            <Input
              id="estimated_duration"
              type="number"
              min="1"
              value={formData.estimated_duration}
              onChange={(e) => setFormData({ ...formData, estimated_duration: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="recurring_interval">Recurring (days)</Label>
            <Input
              id="recurring_interval"
              type="number"
              min="0"
              value={formData.recurring_interval}
              onChange={(e) => setFormData({ ...formData, recurring_interval: parseInt(e.target.value) })}
              placeholder="0 for non-recurring"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost_estimate">Cost Estimate ($)</Label>
            <Input
              id="cost_estimate"
              type="number"
              min="0"
              step="0.01"
              value={formData.cost_estimate}
              onChange={(e) => setFormData({ ...formData, cost_estimate: parseFloat(e.target.value) })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes or instructions..."
            rows={2}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsAddDialogOpen(false);
              setEditingTask(null);
            }}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saveTaskMutation.isPending}>
            {saveTaskMutation.isPending ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Maintenance Schedule</h2>
          <p className="text-muted-foreground">Manage equipment maintenance tasks and schedules</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-lg border">
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="rounded-r-none"
            >
              <CalendarIcon className="h-4 w-4 mr-1" />
              Calendar
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <Settings className="h-4 w-4 mr-1" />
              List
            </Button>
          </div>

          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>

        {showEquipmentFilter && (
          <Select value={filterEquipment} onValueChange={setFilterEquipment}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by equipment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Equipment</SelectItem>
              {equipment.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-500">{overdueTasks.length}</p>
                <p className="text-sm text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-500">{upcomingTasks.length}</p>
                <p className="text-sm text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-500">
                  {filteredTasks.filter(t => t.status === 'completed').length}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-2xl font-bold text-gray-500">{filteredTasks.length}</p>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Area */}
      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Calendar</CardTitle>
                <CardDescription>Click on a date to view scheduled tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  modifiers={{
                    hasTask: (date) => {
                      const dateStr = format(date, 'yyyy-MM-dd');
                      return filteredTasks.some(task => 
                        format(new Date(task.scheduled_date), 'yyyy-MM-dd') === dateStr
                      );
                    },
                    overdue: (date) => {
                      const dateStr = format(date, 'yyyy-MM-dd');
                      return overdueTasks.some(task => 
                        format(new Date(task.scheduled_date), 'yyyy-MM-dd') === dateStr
                      );
                    }
                  }}
                  modifiersStyles={{
                    hasTask: { backgroundColor: '#3b82f6', color: 'white' },
                    overdue: { backgroundColor: '#ef4444', color: 'white' }
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Tasks for Selected Date */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {selectedDate ? format(selectedDate, 'MMM dd, yyyy') : 'Select Date'}
                </CardTitle>
                <CardDescription>
                  {tasksForSelectedDate.length} task(s) scheduled
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasksForSelectedDate.length > 0 ? (
                  tasksForSelectedDate.map((task) => (
                    <div key={task.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm">{task.title}</h4>
                        <Badge className={cn('text-xs', getPriorityColor(task.priority))}>
                          {task.priority}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        {task.equipment?.name} • {task.task_type}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge className={cn('text-xs', getStatusColor(task.status))}>
                          {task.status}
                        </Badge>
                        
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingTask(task)}
                            className="h-6 px-2"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          
                          {task.status !== 'completed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCompleteTask(task)}
                              className="h-6 px-2"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No tasks scheduled for this date
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* List View */
        <Card>
          <CardHeader>
            <CardTitle>All Maintenance Tasks</CardTitle>
            <CardDescription>Complete list of maintenance tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">{task.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{task.equipment?.name}</span>
                        <span>•</span>
                        <span>{format(new Date(task.scheduled_date), 'MMM dd, yyyy')}</span>
                        <span>•</span>
                        <span>{task.task_type}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={cn('text-xs', getPriorityColor(task.priority))}>
                        {task.priority}
                      </Badge>
                      <Badge className={cn('text-xs', getStatusColor(task.status))}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {task.estimated_duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.estimated_duration}min
                        </span>
                      )}
                      {task.cost_estimate && (
                        <span>${task.cost_estimate.toFixed(2)}</span>
                      )}
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingTask(task)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      
                      {task.status !== 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCompleteTask(task)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteTaskMutation.mutate(task.id)}
                        disabled={deleteTaskMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredTasks.length === 0 && (
                <div className="text-center py-8">
                  <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg text-gray-500">No maintenance tasks found</p>
                  <p className="text-gray-400">Create your first maintenance task to get started</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Task Dialog */}
      <Dialog open={isAddDialogOpen || !!editingTask} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setEditingTask(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? 'Edit Maintenance Task' : 'Add Maintenance Task'}
            </DialogTitle>
            <DialogDescription>
              {editingTask ? 'Update the maintenance task details' : 'Create a new maintenance task for equipment'}
            </DialogDescription>
          </DialogHeader>
          
          <MaintenanceTaskForm task={editingTask || undefined} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
