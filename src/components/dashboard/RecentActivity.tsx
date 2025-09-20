'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Package, 
  Building2, 
  Users, 
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

interface Activity {
  id: string
  type: 'inventory' | 'project' | 'user' | 'system'
  title: string
  description: string
  timestamp: string
  status: 'completed' | 'pending' | 'warning'
  user?: string
  link?: string
}

export function RecentActivity() {
  const activities: Activity[] = [
    {
      id: '1',
      type: 'inventory',
      title: 'Inventory Updated',
      description: 'Concrete Mix #205 stock level updated to 150 bags',
      timestamp: '2 minutes ago',
      status: 'completed',
      user: 'John Doe',
      link: '/inventory'
    },
    {
      id: '2',
      type: 'project',
      title: 'New Project Started',
      description: 'Downtown Office Building - Phase 2',
      timestamp: '1 hour ago',
      status: 'pending',
      user: 'Sarah Johnson',
      link: '/projects'
    },
    {
      id: '3',
      type: 'user',
      title: 'New Team Member',
      description: 'Mike Wilson joined as Construction Worker',
      timestamp: '3 hours ago',
      status: 'completed',
      user: 'Admin',
      link: '/admin/users'
    },
    {
      id: '4',
      type: 'system',
      title: 'Equipment Maintenance Due',
      description: 'Mixer #3 requires scheduled maintenance',
      timestamp: '5 hours ago',
      status: 'warning',
      user: 'System',
      link: '/equipment'
    },
    {
      id: '5',
      type: 'inventory',
      title: 'Low Stock Alert',
      description: 'Rebar Grade 60 running low (12 units remaining)',
      timestamp: '1 day ago',
      status: 'warning',
      user: 'System',
      link: '/inventory'
    },
    {
      id: '6',
      type: 'project',
      title: 'Project Completed',
      description: 'Riverside Apartments - Foundation work finished',
      timestamp: '2 days ago',
      status: 'completed',
      user: 'Robert Chen',
      link: '/projects'
    }
  ]

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'inventory':
        return Package
      case 'project':
        return Building2
      case 'user':
        return Users
      case 'system':
        return Clock
      default:
        return Clock
    }
  }

  const getStatusIcon = (status: Activity['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-green-600" />
      case 'warning':
        return <AlertCircle className="h-3 w-3 text-yellow-600" />
      case 'pending':
        return <Clock className="h-3 w-3 text-blue-600" />
      default:
        return <Clock className="h-3 w-3 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: Activity['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="text-green-700 bg-green-50 border-green-200">Completed</Badge>
      case 'warning':
        return <Badge variant="secondary" className="text-yellow-700 bg-yellow-50 border-yellow-200">Warning</Badge>
      case 'pending':
        return <Badge variant="secondary" className="text-blue-700 bg-blue-50 border-blue-200">Pending</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates and changes across your projects
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/activity">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {activities.map((activity) => {
              const IconComponent = getActivityIcon(activity.type)
              return (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <IconComponent className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">{activity.title}</h4>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(activity.status)}
                        <span className="text-xs text-muted-foreground">
                          {activity.timestamp}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-muted-foreground">
                        by {activity.user}
                      </span>
                      {getStatusBadge(activity.status)}
                    </div>
                  </div>

                  {activity.link && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={activity.link}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}