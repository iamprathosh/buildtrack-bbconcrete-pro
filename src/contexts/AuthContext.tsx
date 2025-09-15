import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import type { User } from '@clerk/clerk-react';

interface AuthContextType {
  // Core auth state (cached)
  user: User | null;
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoaded: boolean;
  
  // Clerk auth utilities
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
  
  // Cache management
  refreshAuthData: () => Promise<void>;
  clearAuthCache: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Use Clerk hooks only once at the top level
  const { isLoaded: authLoaded, isSignedIn, signOut: clerkSignOut, getToken: clerkGetToken } = useAuth();
  const { user: clerkUser, isLoaded: userLoaded } = useUser();

  // Cached auth state
  const [cachedUser, setCachedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cache key for localStorage persistence
  const AUTH_CACHE_KEY = 'clerk-auth-cache';
  const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

  // Load cached auth data from localStorage
  const loadAuthCache = useCallback(() => {
    try {
      const cached = localStorage.getItem(AUTH_CACHE_KEY);
      if (cached) {
        const { user: cachedUserData, timestamp } = JSON.parse(cached);
        const now = Date.now();
        
        // Check if cache is still valid
        if (now - timestamp < CACHE_DURATION) {
          console.log('📋 Loading user from cache:', cachedUserData?.id);
          setCachedUser(cachedUserData);
          return true;
        } else {
          console.log('🗑️ Cache expired, clearing...');
          localStorage.removeItem(AUTH_CACHE_KEY);
        }
      }
    } catch (error) {
      console.error('❌ Failed to load auth cache:', error);
      localStorage.removeItem(AUTH_CACHE_KEY);
    }
    return false;
  }, []);

  // Save auth data to cache
  const saveAuthCache = useCallback((user: User | null) => {
    try {
      if (user) {
        const cacheData = {
          user: {
            id: user.id,
            emailAddresses: user.emailAddresses,
            fullName: user.fullName,
            firstName: user.firstName,
            lastName: user.lastName,
            imageUrl: user.imageUrl,
            // Only cache essential user data, not the full Clerk user object
          },
          timestamp: Date.now()
        };
        
        localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(cacheData));
        console.log('💾 User cached:', user.id);
      } else {
        localStorage.removeItem(AUTH_CACHE_KEY);
        console.log('🗑️ Cache cleared');
      }
    } catch (error) {
      console.error('❌ Failed to save auth cache:', error);
    }
  }, []);

  // Clear auth cache
  const clearAuthCache = useCallback(() => {
    localStorage.removeItem(AUTH_CACHE_KEY);
    setCachedUser(null);
    console.log('🗑️ Auth cache cleared');
  }, []);

  // Refresh auth data from Clerk (only when explicitly needed)
  const refreshAuthData = useCallback(async () => {
    console.log('🔄 Refreshing auth data from Clerk...');
    // This will trigger the effect below to update cached data
    // We don't directly call Clerk APIs here to avoid rate limits
  }, []);

  // Custom sign out that clears cache
  const signOut = useCallback(async () => {
    console.log('👋 Signing out...');
    clearAuthCache();
    await clerkSignOut();
  }, [clerkSignOut, clearAuthCache]);

  // Custom getToken that handles errors gracefully
  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      return await clerkGetToken();
    } catch (error) {
      console.error('❌ Failed to get token:', error);
      return null;
    }
  }, [clerkGetToken]);

  // Main effect to manage auth state
  useEffect(() => {
    console.log('🔄 Auth effect triggered:', { 
      authLoaded, 
      userLoaded, 
      isSignedIn, 
      hasClerkUser: !!clerkUser,
      hasCachedUser: !!cachedUser 
    });

    // Load cache on first mount
    if (!cachedUser) {
      const cacheLoaded = loadAuthCache();
      if (cacheLoaded) {
        setIsLoading(false);
        return; // Use cached data until Clerk is fully loaded
      }
    }

    // Wait for Clerk to be fully loaded
    if (!authLoaded || !userLoaded) {
      console.log('⏳ Waiting for Clerk to load...');
      setIsLoading(true);
      return;
    }

    setIsLoading(true);

    if (isSignedIn && clerkUser) {
      // User is authenticated
      console.log('✅ User authenticated:', clerkUser.id);
      
      // Only update cache if user data has changed
      const userChanged = !cachedUser || cachedUser.id !== clerkUser.id;
      
      if (userChanged) {
        console.log('📝 Updating cached user data');
        setCachedUser(clerkUser);
        saveAuthCache(clerkUser);
      } else {
        console.log('📋 Using existing cached user data');
      }
    } else {
      // User is not authenticated
      console.log('❌ User not authenticated');
      setCachedUser(null);
      saveAuthCache(null);
    }

    setIsLoading(false);
  }, [authLoaded, userLoaded, isSignedIn, clerkUser, cachedUser, loadAuthCache, saveAuthCache]);

  // Cleanup cache on unmount
  useEffect(() => {
    return () => {
      // Don't clear cache on unmount - we want it to persist
      console.log('🧹 AuthProvider cleanup');
    };
  }, []);

  const contextValue: AuthContextType = {
    user: cachedUser,
    userId: cachedUser?.id || null,
    isAuthenticated: !!cachedUser,
    isLoading,
    isLoaded: authLoaded && userLoaded,
    signOut,
    getToken,
    refreshAuthData,
    clearAuthCache,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
