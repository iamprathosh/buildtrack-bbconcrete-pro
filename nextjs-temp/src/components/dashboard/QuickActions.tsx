'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Plus,
  Package,
  Building2,
  FileText,
  Users,
  Wrench,
  BarChart3,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'

interface QuickAction {
  title: string
  description: string
  icon: React.ElementType
  href: string
  color: string
  role?: string[]
}

export function QuickActions() {
  const { user } = useUser()
  const userRole = user?.publicMetadata?.role as string || 'worker'

  const actions: QuickAction[] = [
    {
      title: 'Add Inventory',
      description: 'Add new materials to inventory',
      icon: Package,
      href: '/inventory/add',
      color: 'bg-blue-500 hover:bg-blue-600',
      role: ['manager', 'admin', 'worker']
    },
    {
      title: 'Create Project',
      description: 'Start a new construction project',
      icon: Building2,
      href: '/projects/new',
      color: 'bg-green-500 hover:bg-green-600',
      role: ['manager', 'admin']
    },
    {
      title: 'Generate Report',
      description: 'Create detailed analytics report',
      icon: FileText,
      href: '/reports/new',
      color: 'bg-purple-500 hover:bg-purple-600',
      role: ['manager', 'admin']
    },
    {
      title: 'Add Team Member',
      description: 'Invite new user to the system',
      icon: Users,
      href: '/admin/users/new',
      color: 'bg-orange-500 hover:bg-orange-600',
      role: ['admin']
    },
    {
      title: 'Schedule Maintenance',
      description: 'Plan equipment maintenance',
      icon: Wrench,
      href: '/equipment/maintenance/new',
      color: 'bg-red-500 hover:bg-red-600',
      role: ['manager', 'admin']
    },
    {
      title: 'View Analytics',
      description: 'Check performance metrics',
      icon: BarChart3,
      href: '/analytics',
      color: 'bg-teal-500 hover:bg-teal-600',
      role: ['manager', 'admin']
    }
  ]

  // Filter actions based on user role
  const filteredActions = actions.filter(action => 
    !action.role || action.role.includes(userRole)
  )

  const upcomingTasks = [
    {
      title: 'Review pending requisitions',
      time: 'Due today',
      priority: 'high' as const
    },
    {
      title: 'Update project timeline',
      time: 'Due tomorrow',
      priority: 'medium' as const
    },
    {
      title: 'Equipment inspection',
      time: 'Due in 3 days',
      priority: 'low' as const
    }
  ]

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {filteredActions.slice(0, 4).map((action) => {
              const IconComponent = action.icon
              return (
                <Link 
                  key={action.title} 
                  href={action.href}
                  className="group flex flex-col items-center space-y-2 p-4 rounded-lg border border-border bg-card hover:bg-accent hover:shadow-md transition-all duration-200"
                >
                  <div className={`p-2 rounded-full text-white ${action.color} group-hover:scale-105 transition-transform`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-sm group-hover:text-accent-foreground">{action.title}</div>
                    <div className="text-xs text-muted-foreground group-hover:text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            Upcoming Tasks
          </CardTitle>
          <CardDescription>
            Tasks that need your attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingTasks.map((task, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{task.title}</h4>
                  <p className="text-xs text-muted-foreground">{task.time}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </div>
              </div>
            ))}
          </div>
          
          <Button variant="outline" size="sm" className="w-full mt-4" asChild>
            <Link href="/tasks">
              View All Tasks
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}