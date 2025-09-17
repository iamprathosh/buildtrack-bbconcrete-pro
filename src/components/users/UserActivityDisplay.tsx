import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Activity, 
  Clock, 
  Eye, 
  LogIn, 
  LogOut, 
  MousePointer,
  RefreshCw,
  Users,
  Calendar,
  Timer,
  Dot
} from 'lucide-react';
import { useRecentUserActivity, useActiveUserSessions, useUserActivityStats } from '@/hooks/useUserActivity';
import { formatDistanceToNow, format, differenceInMinutes } from 'date-fns';

export function UserActivityDisplay() {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { 
    recentActivity, 
    loading: activityLoading, 
    error: activityError 
  } = useRecentUserActivity(refreshKey);
  
  const { 
    activeSessions, 
    loading: sessionsLoading, 
    error: sessionsError 
  } = useActiveUserSessions(refreshKey);
  
  const { 
    stats, 
    loading: statsLoading, 
    error: statsError 
  } = useUserActivityStats(refreshKey);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Activity type icons
  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'login':
        return <LogIn className="h-4 w-4 text-green-500" />;
      case 'logout':
        return <LogOut className="h-4 w-4 text-red-500" />;
      case 'page_view':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'heartbeat':
        return <Activity className="h-4 w-4 text-purple-500" />;
      case 'action':
        return <MousePointer className="h-4 w-4 text-orange-500" />;
      default:
        return <Dot className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSessionStatus = (lastActivity: string) => {
    const minutesAgo = differenceInMinutes(new Date(), new Date(lastActivity));
    if (minutesAgo < 2) {
      return { status: 'active', color: 'bg-green-500', text: 'Active' };
    } else if (minutesAgo < 5) {
      return { status: 'idle', color: 'bg-yellow-500', text: 'Idle' };
    } else {
      return { status: 'away', color: 'bg-gray-500', text: 'Away' };
    }
  };

  if (activityError || sessionsError || statsError) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Activity Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {activityError || sessionsError || statsError}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.active_sessions || 0}</p>
                )}
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Daily Logins</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.daily_logins || 0}</p>
                )}
              </div>
              <LogIn className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Page Views (24h)</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.page_views_24h || 0}</p>
                )}
              </div>
              <Eye className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity and Sessions Tabs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>User Activity</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={activityLoading || sessionsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(activityLoading || sessionsLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="recent" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="recent">Recent Activity</TabsTrigger>
              <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
            </TabsList>

            <TabsContent value="recent">
              <ScrollArea className="h-96">
                {activityLoading ? (
                  <div className="space-y-3">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentActivity && recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50">
                        <div className="flex-shrink-0 mt-1">
                          {getActivityIcon(activity.activity_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">
                              {activity.user_name || activity.user_email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {activity.activity_type === 'page_view' && `Viewed ${activity.description}`}
                            {activity.activity_type === 'login' && 'Signed in'}
                            {activity.activity_type === 'logout' && 'Signed out'}
                            {activity.activity_type === 'action' && activity.description}
                            {activity.activity_type === 'heartbeat' && 'Session active'}
                          </p>
                          {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                            <div className="mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {activity.metadata.path || activity.metadata.action || 'Activity'}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No recent activity found</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="sessions">
              <ScrollArea className="h-96">
                {sessionsLoading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3 p-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1 flex-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                      </div>
                    ))}
                  </div>
                ) : activeSessions && activeSessions.length > 0 ? (
                  <div className="space-y-3">
                    {activeSessions.map((session) => {
                      const sessionStatus = getSessionStatus(session.last_activity);
                      return (
                        <div key={session.session_id} className="flex items-start space-x-3 p-3 rounded-lg border">
                          <div className="flex-shrink-0 mt-1">
                            <div className={`h-3 w-3 rounded-full ${sessionStatus.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">
                                {session.user_name || session.user_email}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {sessionStatus.text}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>Started {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Timer className="h-3 w-3" />
                                <span>
                                  Duration: {session.duration_minutes ? `${session.duration_minutes}m` : 'Ongoing'}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Last activity: {format(new Date(session.last_activity), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No active sessions found</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}