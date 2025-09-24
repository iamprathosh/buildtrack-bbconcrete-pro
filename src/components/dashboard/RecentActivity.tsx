'use client'

import { useEffect, useState } from 'react'
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
  ArrowRight,
  Wrench,
  Loader2,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Activity {
  id: string
  type: 'inventory' | 'project' | 'user' | 'system' | 'equipment'
  title: string
  description: string
  timestamp: string
  status: 'completed' | 'pending' | 'warning'
  user?: string
  link?: string
  metadata?: any
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch recent equipment transactions
  const fetchRecentActivities = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/equipment/transactions/recent?limit=10')
      if (!response.ok) {
        throw new Error('Failed to fetch recent activities')
      }
      
      const data = await response.json()
      setActivities(data.activities || [])
      
    } catch (err) {
      console.error('Error fetching recent activities:', err)
      setError(err instanceof Error ? err.message : 'Failed to load activities')
      // Fallback to some static activities on error
      setActivities([
        {
          id: 'fallback-1',
          type: 'system',
          title: 'System Online',
          description: 'BuildTrack system is operational',
          timestamp: 'Just now',
          status: 'completed',
          user: 'System',
          link: '/'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecentActivities()
  }, [])

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'inventory':
        return Package
      case 'project':
        return Building2
      case 'user':
        return Users
      case 'equipment':
        return Wrench
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
              Recent equipment transactions and maintenance activities
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchRecentActivities}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/equipment">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading recent activities...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <span className="ml-2 text-sm text-red-600">{error}</span>
            </div>
          ) : activities.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Clock className="h-6 w-6 text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">No recent activities</span>
            </div>
          ) : (
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
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
