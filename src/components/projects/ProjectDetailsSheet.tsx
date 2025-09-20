'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Project } from './ProjectsView'
import { format } from 'date-fns'
import { 
  Calendar,
  DollarSign,
  MapPin,
  Users,
  Building2,
  Clock,
  AlertTriangle,
  TrendingUp,
  FileText,
  MessageSquare,
  X,
  Edit
} from 'lucide-react'

interface ProjectDetailsSheetProps {
  project: Project
  onClose: () => void
  onUpdate: (updates: Partial<Project>) => void
}

export function ProjectDetailsSheet({ project, onClose, onUpdate }: ProjectDetailsSheetProps) {
  const [isEditing, setIsEditing] = useState(false)

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

  const budgetUtilization = project.budget > 0 ? (project.actualCost / project.budget) * 100 : 0

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader className="pb-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <SheetTitle className="text-xl pr-8">{project.name}</SheetTitle>
              <SheetDescription className="text-base">
                {project.description}
              </SheetDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant={getStatusVariant(project.status)}>
              {project.status.replace('-', ' ')}
            </Badge>
            <Badge variant={getPriorityVariant(project.priority)}>
              {project.priority} priority
            </Badge>
            <Badge variant="outline">
              {project.category}
            </Badge>
          </div>
        </SheetHeader>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Project Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-3" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Budget Utilization</span>
                      <span className="font-medium">{budgetUtilization.toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={budgetUtilization} 
                      className="h-3"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Details */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building2 className="h-4 w-4" />
                    Client & Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Client</p>
                    <p className="font-medium">{project.client}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {project.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">{project.category}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <DollarSign className="h-4 w-4" />
                    Financial Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Budget</p>
                    <p className="font-medium text-lg">{formatCurrency(project.budget)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount Spent</p>
                    <p className="font-medium">{formatCurrency(project.actualCost)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Remaining</p>
                    <p className="font-medium text-green-600">
                      {formatCurrency(project.budget - project.actualCost)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">{format(project.startDate, 'MMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-medium">{format(project.endDate, 'MMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated End</p>
                    <p className="font-medium">{format(project.estimatedEndDate, 'MMM dd, yyyy')}</p>
                    {project.estimatedEndDate > project.endDate && (
                      <Badge variant="destructive" className="mt-1 text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Delayed
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Project Team
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Project Manager</p>
                    <p className="font-medium text-lg">{project.manager}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">Team Members</p>
                    <div className="space-y-2">
                      {project.team.map((member) => (
                        <div key={member} className="flex items-center space-x-3 p-2 rounded-lg border">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <Users className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{member}</p>
                            <p className="text-sm text-muted-foreground">Team Member</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Project Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div className="flex-1">
                      <p className="font-medium">Project Started</p>
                      <p className="text-sm text-muted-foreground">
                        {format(project.startDate, 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div className="flex-1">
                      <p className="font-medium">Current Progress</p>
                      <p className="text-sm text-muted-foreground">
                        {project.progress}% complete
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <div className="flex-1">
                      <p className="font-medium">Scheduled End</p>
                      <p className="text-sm text-muted-foreground">
                        {format(project.endDate, 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  {project.estimatedEndDate > project.endDate && (
                    <div className="flex items-center space-x-4 p-3 border border-red-200 rounded-lg bg-red-50">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <div className="flex-1">
                        <p className="font-medium text-red-700">Estimated End (Delayed)</p>
                        <p className="text-sm text-red-600">
                          {format(project.estimatedEndDate, 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Project Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium">Project Initialization</p>
                      <p className="text-xs text-muted-foreground">
                        {format(project.lastUpdated, 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Project setup completed. All initial documentation and permits are in place.
                      Team members have been assigned and briefed on project requirements.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium">Progress Update</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Project is proceeding as planned. Current milestone targets are being met.
                      Weekly team meetings scheduled to track progress and address any issues.
                    </p>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}