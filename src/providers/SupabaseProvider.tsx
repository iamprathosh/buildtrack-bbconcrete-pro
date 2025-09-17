import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { supabase as defaultSupabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

interface SupabaseContextType {
  supabase: SupabaseClient<Database>;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshAuthContext: () => void;
  userId: string | null;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function useSupabaseClient() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabaseClient must be used within a SupabaseProvider');
  }
  return context;
}

interface SupabaseProviderProps {
  children: React.ReactNode;
}

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  // Use centralized auth context instead of direct Clerk hooks
  const { user, userId, isAuthenticated: authContextAuthenticated, isLoaded, isLoading: authLoading } = useAuthContext();
  
  const [supabase] = useState<SupabaseClient<Database>>(() => defaultSupabase);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Cache for auth context state to prevent repeated calls
  const [lastAuthContextSet, setLastAuthContextSet] = useState<string | null>(null);

  // Optimized auth setup with caching
  const setupSupabaseAuth = useCallback(async (forceRefresh = false) => {
    try {
      if (!userId) {
        console.log('👤 No user ID, clearing auth context');
        setIsAuthenticated(false);
        setLastAuthContextSet(null);
        setIsLoading(false);
        return;
      }

      // Check if we already set auth context for this user (avoid redundant calls)
      if (!forceRefresh && lastAuthContextSet === userId) {
        console.log('📋 Auth context already set for user:', userId);
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      console.log('🔄 Setting up auth context for user:', userId);
      setIsLoading(true);

      try {
        // Set the auth context using our database function
        await supabase.rpc('set_auth_context', {
          user_id: userId
        });
        
        setIsAuthenticated(true);
        setLastAuthContextSet(userId);
        console.log('✅ Auth context set for user:', userId);
      } catch (error) {
        console.error('❌ Failed to set auth context:', error);
        
        // Handle rate limiting gracefully
        if (error && typeof error === 'object' && 'message' in error) {
          const errorMessage = (error as any).message;
          if (errorMessage?.includes('rate') || errorMessage?.includes('429')) {
            console.log('⚠️ Rate limited, but continuing (RLS disabled)');
            setIsAuthenticated(true);
            setLastAuthContextSet(userId);
          } else {
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('💥 Failed to setup authentication:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [userId, supabase, lastAuthContextSet]);

  useEffect(() => {
    console.log('🔄 SupabaseProvider effect:', {
      isLoaded,
      authLoading,
      userId,
      authContextAuthenticated
    });

    // Wait for auth context to be loaded
    if (!isLoaded || authLoading) {
      setIsLoading(true);
      return;
    }

    // Setup auth context when user changes
    setupSupabaseAuth();
  }, [isLoaded, authLoading, userId, setupSupabaseAuth]);

  // Refresh auth context manually when needed (no automatic intervals to avoid rate limits)
  const refreshAuthContext = useCallback(() => {
    console.log('🔄 Manual auth context refresh requested');
    setupSupabaseAuth(true); // Force refresh
  }, [setupSupabaseAuth]);

  // Expose refresh function for manual use
  useEffect(() => {
    // Store refresh function globally for debugging/manual refresh if needed
    (window as any).__supabaseRefreshAuth = refreshAuthContext;
    
    return () => {
      delete (window as any).__supabaseRefreshAuth;
    };
  }, [refreshAuthContext]);

  const contextValue: SupabaseContextType = {
    supabase,
    isAuthenticated,
    isLoading,
    refreshAuthContext,
    userId,
  };

  return (
    <SupabaseContext.Provider value={contextValue}>
      {children}
    </SupabaseContext.Provider>
  );
}
