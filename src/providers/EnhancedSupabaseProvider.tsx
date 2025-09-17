import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { supabase as defaultSupabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

interface EnhancedSupabaseContextType {
  supabase: SupabaseClient<Database>;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshAuthContext: () => void;
  userId: string | null;
  authContextSet: boolean;
  lastError: string | null;
}

const EnhancedSupabaseContext = createContext<EnhancedSupabaseContextType | undefined>(undefined);

export function useEnhancedSupabaseClient() {
  const context = useContext(EnhancedSupabaseContext);
  if (context === undefined) {
    throw new Error('useEnhancedSupabaseClient must be used within an EnhancedSupabaseProvider');
  }
  return context;
}

interface EnhancedSupabaseProviderProps {
  children: React.ReactNode;
  enableRLS?: boolean; // Flag to enable/disable RLS context setting
}

export function EnhancedSupabaseProvider({ 
  children, 
  enableRLS = false // Default to false for now since we've opened up policies
}: EnhancedSupabaseProviderProps) {
  const { user, userId, isAuthenticated: authContextAuthenticated, isLoaded, isLoading: authLoading } = useAuthContext();
  
  const [supabase] = useState<SupabaseClient<Database>>(() => defaultSupabase);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authContextSet, setAuthContextSet] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  
  // Cache for auth context state to prevent repeated calls
  const [lastAuthContextSet, setLastAuthContextSet] = useState<string | null>(null);

  // Enhanced auth setup with better error handling and retry logic
  const setupSupabaseAuth = useCallback(async (forceRefresh = false) => {
    try {
      setLastError(null);
      
      if (!userId) {
        console.log('👤 No user ID, clearing auth context');
        setIsAuthenticated(false);
        setAuthContextSet(false);
        setLastAuthContextSet(null);
        setIsLoading(false);
        return;
      }

      // Check if we already set auth context for this user (avoid redundant calls)
      if (!forceRefresh && lastAuthContextSet === userId) {
        console.log('📋 Auth context already set for user:', userId);
        setIsAuthenticated(true);
        setAuthContextSet(true);
        setIsLoading(false);
        return;
      }

      console.log('🔄 Setting up auth context for user:', userId);
      setIsLoading(true);

      if (enableRLS) {
        try {
          // Only set auth context if RLS is enabled
          const { error } = await supabase.rpc('set_auth_context', {
            user_id: userId
          });
          
          if (error) {
            throw error;
          }
          
          setAuthContextSet(true);
          console.log('✅ Auth context set for user:', userId);
        } catch (error: any) {
          console.error('❌ Failed to set auth context:', error);
          setLastError(error?.message || 'Failed to set auth context');
          
          // For development, continue even if auth context fails
          console.log('⚠️ Continuing without auth context (RLS policies are open)');
          setAuthContextSet(false);
        }
      } else {
        // Skip auth context setup if RLS is disabled
        console.log('🔓 RLS disabled, skipping auth context setup');
        setAuthContextSet(false);
      }
      
      setIsAuthenticated(true);
      setLastAuthContextSet(userId);
      
    } catch (error: any) {
      console.error('💥 Failed to setup authentication:', error);
      setLastError(error?.message || 'Authentication setup failed');
      setIsAuthenticated(false);
      setAuthContextSet(false);
    } finally {
      setIsLoading(false);
    }
  }, [userId, supabase, lastAuthContextSet, enableRLS]);

  useEffect(() => {
    console.log('🔄 EnhancedSupabaseProvider effect:', {
      isLoaded,
      authLoading,
      userId,
      authContextAuthenticated,
      enableRLS
    });

    // Wait for auth context to be loaded
    if (!isLoaded || authLoading) {
      setIsLoading(true);
      return;
    }

    // Setup auth context when user changes
    setupSupabaseAuth();
  }, [isLoaded, authLoading, userId, setupSupabaseAuth]);

  // Refresh auth context manually
  const refreshAuthContext = useCallback(() => {
    console.log('🔄 Manual auth context refresh requested');
    setupSupabaseAuth(true); // Force refresh
  }, [setupSupabaseAuth]);

  // Test database connection
  const testDatabaseConnection = useCallback(async () => {
    try {
      console.log('🧪 Testing database connection...');
      const { data, error } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('❌ Database connection test failed:', error);
        setLastError(`Database connection failed: ${error.message}`);
      } else {
        console.log('✅ Database connection successful');
        setLastError(null);
      }
    } catch (err: any) {
      console.error('💥 Database connection test error:', err);
      setLastError(`Database connection error: ${err.message}`);
    }
  }, [supabase]);

  // Test connection on mount
  useEffect(() => {
    if (userId && isLoaded) {
      testDatabaseConnection();
    }
  }, [userId, isLoaded, testDatabaseConnection]);

  // Expose debugging functions globally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__supabaseDebug = {
        refreshAuth: refreshAuthContext,
        testConnection: testDatabaseConnection,
        getUserId: () => userId,
        getAuthContextSet: () => authContextSet,
        getLastError: () => lastError,
        enableRLS: () => {
          console.log('🔐 RLS would be enabled here - restart provider with enableRLS=true');
        }
      };
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__supabaseDebug;
      }
    };
  }, [refreshAuthContext, testDatabaseConnection, userId, authContextSet, lastError]);

  const contextValue: EnhancedSupabaseContextType = {
    supabase,
    isAuthenticated,
    isLoading,
    refreshAuthContext,
    userId,
    authContextSet,
    lastError,
  };

  return (
    <EnhancedSupabaseContext.Provider value={contextValue}>
      {children}
    </EnhancedSupabaseContext.Provider>
  );
}

// Backwards compatibility wrapper
export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  return (
    <EnhancedSupabaseProvider enableRLS={false}>
      {children}
    </EnhancedSupabaseProvider>
  );
}