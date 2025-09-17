import { useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabaseClient } from '@/providers/SupabaseProvider';
import { useAuthContext } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

type UserActivity = Database['public']['Tables']['user_activity']['Row'];
type UserSession = Database['public']['Tables']['user_sessions']['Row'];

interface ActivityData {
  activity_type: 'login' | 'logout' | 'session_heartbeat' | 'page_view' | 'action';
  description?: string;
  metadata?: Record<string, any>;
}

interface SessionData {
  session_id: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
}

export function useUserActivity() {
  const { supabase } = useSupabaseClient();
  const { userId, isAuthenticated } = useAuthContext();
  const queryClient = useQueryClient();
  const sessionIdRef = useRef<string>('');
  const heartbeatIntervalRef = useRef<NodeJS.Timeout>();

  // Generate session ID on mount
  useEffect(() => {
    if (isAuthenticated && userId && !sessionIdRef.current) {
      sessionIdRef.current = `session_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }, [isAuthenticated, userId]);

  // Log activity mutation
  const logActivityMutation = useMutation({
    mutationFn: async (data: ActivityData) => {
      if (!userId) throw new Error('No user ID available');

      const activityData = {
        user_id: userId,
        activity_type: data.activity_type,
        description: data.description || '',
        session_id: sessionIdRef.current,
        ip_address: null, // Will be set by server if needed
        user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : null,
        metadata: data.metadata || {}
      };

      const { data: result, error } = await supabase
        .from('user_activity')
        .insert([activityData])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      // Invalidate activity queries
      queryClient.invalidateQueries({ queryKey: ['user_activity'] });
      queryClient.invalidateQueries({ queryKey: ['recent_user_activity'] });
    },
    onError: (error) => {
      console.error('Failed to log user activity:', error);
    }
  });

  // Start session mutation
  const startSessionMutation = useMutation({
    mutationFn: async (data?: Partial<SessionData>) => {
      if (!userId) throw new Error('No user ID available');

      const sessionData = {
        user_id: userId,
        session_id: sessionIdRef.current,
        ip_address: null,
        user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : null,
        is_active: true,
        metadata: data?.metadata || {}
      };

      const { data: result, error } = await supabase
        .from('user_sessions')
        .insert([sessionData])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_sessions'] });
      queryClient.invalidateQueries({ queryKey: ['active_sessions'] });
    }
  });

  // End session mutation
  const endSessionMutation = useMutation({
    mutationFn: async () => {
      if (!sessionIdRef.current) return;

      const { error } = await supabase
        .from('user_sessions')
        .update({ 
          is_active: false, 
          ended_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionIdRef.current);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_sessions'] });
      queryClient.invalidateQueries({ queryKey: ['active_sessions'] });
    }
  });

  // Update session heartbeat
  const updateHeartbeatMutation = useMutation({
    mutationFn: async () => {
      if (!sessionIdRef.current) return;

      const { error } = await supabase
        .from('user_sessions')
        .update({ 
          last_activity_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionIdRef.current)
        .eq('is_active', true);

      if (error) throw error;
    }
  });

  // Convenience methods
  const logActivity = useCallback((data: ActivityData) => {
    logActivityMutation.mutate(data);
  }, [logActivityMutation]);

  const logLogin = useCallback((metadata?: Record<string, any>) => {
    logActivity({
      activity_type: 'login',
      description: 'User logged in',
      metadata
    });
  }, [logActivity]);

  const logLogout = useCallback((metadata?: Record<string, any>) => {
    logActivity({
      activity_type: 'logout',
      description: 'User logged out',
      metadata
    });
  }, [logActivity]);

  const logPageView = useCallback((page: string, metadata?: Record<string, any>) => {
    logActivity({
      activity_type: 'page_view',
      description: `Viewed ${page}`,
      metadata: { page, ...metadata }
    });
  }, [logActivity]);

  const logUserAction = useCallback((action: string, metadata?: Record<string, any>) => {
    logActivity({
      activity_type: 'action',
      description: action,
      metadata
    });
  }, [logActivity]);

  const startSession = useCallback((metadata?: Record<string, any>) => {
    startSessionMutation.mutate({ metadata });
  }, [startSessionMutation]);

  const endSession = useCallback(() => {
    endSessionMutation.mutate();
  }, [endSessionMutation]);

  const sendHeartbeat = useCallback(() => {
    updateHeartbeatMutation.mutate();
  }, [updateHeartbeatMutation]);

  // Auto-start session when user is authenticated
  useEffect(() => {
    if (isAuthenticated && userId && sessionIdRef.current) {
      startSession();
      logLogin();
    }
  }, [isAuthenticated, userId, startSession, logLogin]);

  // Setup heartbeat interval
  useEffect(() => {
    if (isAuthenticated && userId) {
      // Send heartbeat every 30 seconds
      heartbeatIntervalRef.current = setInterval(() => {
        sendHeartbeat();
        logActivity({
          activity_type: 'session_heartbeat',
          description: 'Session heartbeat',
          metadata: { timestamp: new Date().toISOString() }
        });
      }, 30000); // 30 seconds

      return () => {
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }
      };
    }
  }, [isAuthenticated, userId, sendHeartbeat, logActivity]);

  // Handle page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Try to log logout (may not complete due to page unload)
      logLogout();
      endSession();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is being hidden/minimized
        logActivity({
          activity_type: 'action',
          description: 'Page hidden/minimized'
        });
      } else {
        // Page is visible again
        logActivity({
          activity_type: 'action',
          description: 'Page visible/restored'
        });
        sendHeartbeat();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [logLogout, endSession, logActivity, sendHeartbeat]);

  return {
    logActivity,
    logLogin,
    logLogout,
    logPageView,
    logUserAction,
    startSession,
    endSession,
    sendHeartbeat,
    sessionId: sessionIdRef.current,
    isLoading: logActivityMutation.isPending
  };
}

// Hook to fetch recent user activity
export function useRecentUserActivity(limit: number = 10) {
  const { supabase } = useSupabaseClient();

  return useQuery({
    queryKey: ['recent_user_activity', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_recent_user_activity')
        .select('*')
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000 // Consider data stale after 15 seconds
  });
}

// Hook to fetch active user sessions
export function useActiveUserSessions() {
  const { supabase } = useSupabaseClient();

  return useQuery({
    queryKey: ['active_sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_active_user_sessions')
        .select('*')
        .limit(20);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000,
    staleTime: 15000
  });
}

// Hook to get user activity stats
export function useUserActivityStats() {
  const { supabase } = useSupabaseClient();

  return useQuery({
    queryKey: ['user_activity_stats'],
    queryFn: async () => {
      // Get active sessions count
      const { count: activeSessions } = await supabase
        .from('user_sessions')
        .select('id', { count: 'exact' })
        .eq('is_active', true);

      // Get login count today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: loginsToday } = await supabase
        .from('user_activity')
        .select('id', { count: 'exact' })
        .eq('activity_type', 'login')
        .gte('created_at', today.toISOString());

      // Get total activity count today
      const { count: activityToday } = await supabase
        .from('user_activity')
        .select('id', { count: 'exact' })
        .gte('created_at', today.toISOString());

      return {
        activeSessions: activeSessions || 0,
        loginsToday: loginsToday || 0,
        activityToday: activityToday || 0
      };
    },
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000
  });
}