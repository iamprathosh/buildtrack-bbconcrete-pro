'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { 
  Activity,
  Search,
  RefreshCw,
  UserPlus,
  UserX,
  UserCheck,
  Edit,
  Trash2,
  Settings,
  Key,
  Mail,
  Shield,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface ActivityEntry {
  id: string
  userId: string
  actorId: string
  action: string
  details: any
  timestamp: Date
  user: {
    firstName: string
    lastName: string
    avatar?: string
  } | null
  actor: {
    firstName: string
    lastName: string
    avatar?: string
  } | null
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const ACTION_ICONS = {
  user_created: UserPlus,
  user_updated: Edit,
  user_deleted: UserX,
  status_changed: UserCheck,
  invitation_resent: Mail,
  settings_updated: Settings,
  api_key_created: Key,
  api_key_deleted: Key,
  login: Activity
}

const ACTION_COLORS = {
  user_created: 'bg-green-100 text-green-800',
  user_updated: 'bg-blue-100 text-blue-800',
  user_deleted: 'bg-red-100 text-red-800',
  status_changed: 'bg-orange-100 text-orange-800',
  invitation_resent: 'bg-purple-100 text-purple-800',
  settings_updated: 'bg-indigo-100 text-indigo-800',
  api_key_created: 'bg-cyan-100 text-cyan-800',
  api_key_deleted: 'bg-red-100 text-red-800',
  login: 'bg-gray-100 text-gray-800'
}

const ACTION_LABELS = {
  user_created: 'User Created',
  user_updated: 'User Updated',
  user_deleted: 'User Deleted',
  status_changed: 'Status Changed',
  invitation_resent: 'Invitation Resent',
  settings_updated: 'Settings Updated',
  api_key_created: 'API Key Created',
  api_key_deleted: 'API Key Deleted',
  login: 'User Login'
}

export function UserActivityTab() {
  const [activities, setActivities] = useState<ActivityEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const [filters, setFilters] = useState({
    search: '',
    action: 'all'
  })

  const fetchActivities = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.action !== 'all' && { action: filters.action })
      })

      const response = await fetch(`/api/users/activities?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch activities')
      }

      setActivities(data.activities)
      setPagination(data.pagination)
    } catch (err) {
      console.error('Error fetching activities:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch activities')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [pagination.page, filters.action])

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm }))
  }

  const handleActionFilter = (action: string) => {
    setFilters(prev => ({ ...prev, action }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const formatActivityDescription = (activity: ActivityEntry) => {
    const actorName = activity.actor 
      ? `${activity.actor.firstName} ${activity.actor.lastName}`
      : 'System'
    
    const userName = activity.user 
      ? `${activity.user.firstName} ${activity.user.lastName}`
      : 'Unknown User'

    switch (activity.action) {
      case 'user_created':
        return `${actorName} created user account for ${userName}`
      case 'user_updated':
        const updatedFields = activity.details?.updatedFields?.join(', ') || 'profile'
        return `${actorName} updated ${updatedFields} for ${userName}`
      case 'user_deleted':
        return `${actorName} deleted user account for ${userName}`
      case 'status_changed':
        const newStatus = activity.details?.newStatus || 'unknown'
        return `${actorName} changed ${userName}'s status to ${newStatus}`
      case 'invitation_resent':
        return `${actorName} resent invitation to ${userName}`
      case 'settings_updated':
        const section = activity.details?.section || 'system'
        return `${actorName} updated ${section} settings`
      case 'api_key_created':
        const keyName = activity.details?.keyName || 'API key'
        return `${actorName} created ${keyName}`
      case 'api_key_deleted':
        const deletedKeyName = activity.details?.keyName || 'API key'
        return `${actorName} deleted ${deletedKeyName}`
      case 'login':
        return `${userName} logged in`
      default:
        return `${actorName} performed ${activity.action} on ${userName}`
    }
  }

  const getActionIcon = (action: string) => {
    const IconComponent = ACTION_ICONS[action as keyof typeof ACTION_ICONS] || Activity
    return <IconComponent className="h-4 w-4" />
  }

  const getActionColor = (action: string) => {
    return ACTION_COLORS[action as keyof typeof ACTION_COLORS] || 'bg-gray-100 text-gray-800'
  }

  const filteredActivities = activities.filter(activity => {
    if (!filters.search) return true
    
    const searchLower = filters.search.toLowerCase()
    const actorName = activity.actor 
      ? `${activity.actor.firstName} ${activity.actor.lastName}`.toLowerCase()
      : 'system'
    const userName = activity.user 
      ? `${activity.user.firstName} ${activity.user.lastName}`.toLowerCase()
      : 'unknown user'
    const description = formatActivityDescription(activity).toLowerCase()
    
    return actorName.includes(searchLower) || 
           userName.includes(searchLower) || 
           description.includes(searchLower)
  })

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-lg font-medium text-muted-foreground">Loading activity...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-red-600">
            <Activity className="h-4 w-4" />
            <span className="font-medium">Error: {error}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={fetchActivities}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>User Activity Log</span>
        </CardTitle>
        <CardDescription>
          Track user actions, system changes, and login activity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filters.action} onValueChange={handleActionFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {Object.entries(ACTION_LABELS).map(([action, label]) => (
                <SelectItem key={action} value={action}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchActivities}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Activity List */}
        <div className="space-y-3">
          {filteredActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4 p-4 bg-muted/30 rounded-lg border">
              <Avatar className="h-8 w-8">
                <AvatarImage src={activity.actor?.avatar} />
                <AvatarFallback>
                  {activity.actor 
                    ? `${activity.actor.firstName.charAt(0)}${activity.actor.lastName.charAt(0)}`
                    : 'SY'
                  }
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <Badge variant="secondary" className={getActionColor(activity.action)}>
                    {getActionIcon(activity.action)}
                    <span className="ml-1">{ACTION_LABELS[activity.action as keyof typeof ACTION_LABELS] || activity.action}</span>
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {format(activity.timestamp, 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  {formatActivityDescription(activity)}
                </p>
                {activity.details && Object.keys(activity.details).length > 0 && (
                  <details className="mt-2">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                      View details
                    </summary>
                    <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                      {JSON.stringify(activity.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredActivities.length === 0 && !isLoading && (
          <div className="text-center py-10">
            <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">No activities found</p>
            <p className="text-sm text-muted-foreground">
              {filters.search || filters.action !== 'all'
                ? 'Try adjusting your filters'
                : 'User activities will appear here'
              }
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} activities
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="text-sm font-medium">
                {pagination.page} of {pagination.totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}