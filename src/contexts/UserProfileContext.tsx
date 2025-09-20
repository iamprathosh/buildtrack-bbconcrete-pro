'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'

export type UserRole = 'worker' | 'project_manager' | 'super_admin'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

interface UserProfileContextType {
  profile: UserProfile | null
  loading: boolean
  error: string | null
  user: any // eslint-disable-line @typescript-eslint/no-explicit-any
  isLoaded: boolean
  // Helper functions
  isWorker: () => boolean
  isManager: () => boolean
  isAdmin: () => boolean
  isManagerOrAdmin: () => boolean
  // Actions
  refreshProfile: () => Promise<void>
  syncProfile: () => Promise<void>
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined)

interface UserProfileProviderProps {
  children: React.ReactNode
}

// Cache for profiles to prevent unnecessary API calls
const profileCache = new Map<string, { profile: UserProfile; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function UserProfileProvider({ children }: UserProfileProviderProps) {
  const { user, isLoaded } = useUser()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Memoized sync function with caching and retry logic
  const syncUserProfile = useCallback(async (clerkUser: any, skipCache = false): Promise<UserProfile> => { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.log('🔄 [UserProfileProvider] Syncing profile for:', clerkUser.id)
    
    // Check cache first (unless skipping cache)
    if (!skipCache) {
      const cached = profileCache.get(clerkUser.id)
      if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
        console.log('📱 [UserProfileProvider] Using cached profile')
        return cached.profile
      }
    }
    
    try {
      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', clerkUser.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ [UserProfileProvider] Error fetching profile:', fetchError)
        throw new Error(`Failed to fetch profile: ${fetchError.message}`)
      }

      if (existingProfile) {
        console.log('✅ [UserProfileProvider] Profile exists, checking for updates...')
        
        // Check if we need to update any fields
        const currentEmail = clerkUser.emailAddresses[0]?.emailAddress || ''
        const currentName = clerkUser.fullName || clerkUser.firstName || 'User'
        
        const needsUpdate = 
          existingProfile.email !== currentEmail || 
          existingProfile.full_name !== currentName

        if (needsUpdate) {
          console.log('📝 [UserProfileProvider] Updating profile...')
          const { data: updatedProfile, error: updateError } = await supabase
            .from('user_profiles')
            .update({
              email: currentEmail,
              full_name: currentName,
              updated_at: new Date().toISOString()
            })
            .eq('id', clerkUser.id)
            .select()
            .single()

          if (updateError) {
            console.error('❌ [UserProfileProvider] Error updating profile:', updateError)
            throw new Error(`Failed to update profile: ${updateError.message}`)
          }

          console.log('✅ [UserProfileProvider] Profile updated')
          return updatedProfile!
        }

        return existingProfile
      }

      // Create new profile
      console.log('➕ [UserProfileProvider] Creating new profile...')
      
      // Check for pending role from registration
      const pendingRole = localStorage.getItem('pendingUserRole') as UserRole || 'worker'
      console.log('📝 [UserProfileProvider] Using role:', pendingRole)
      
      const profileData = {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        full_name: clerkUser.fullName || clerkUser.firstName || 'User',
        role: pendingRole,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: newProfile, error: insertError } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single()

      if (insertError) {
        console.error('❌ [UserProfileProvider] Error creating profile:', insertError)
        // Handle duplicate key error - profile might have been created by another instance
        if (insertError.code === '23505') {
          console.log('🔄 [UserProfileProvider] Profile already exists, refetching...')
          const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', clerkUser.id)
            .single()
          
          if (existingProfile) {
            return existingProfile
          }
        }
        throw new Error(`Failed to create profile: ${insertError.message}`)
      }

      // Clear pending role
      localStorage.removeItem('pendingUserRole')
      
      console.log('✅ [UserProfileProvider] Profile created successfully')
      
      // Cache the profile
      profileCache.set(clerkUser.id, { profile: newProfile!, timestamp: Date.now() })
      return newProfile!
      
    } catch (err) {
      console.error('💥 [UserProfileProvider] Error syncing profile:', err)
      throw err
    }
  }, [])

  // Add profiles to cache when they're fetched or updated
  const cacheProfile = useCallback((profile: UserProfile) => {
    profileCache.set(profile.id, { profile, timestamp: Date.now() })
  }, [])

  // Load and sync profile with retry logic
  const loadProfile = useCallback(async (skipCache = false, isRetry = false) => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      if (!isRetry) {
        setError(null)
        setRetryCount(0)
      }
      console.log('🔍 [UserProfileProvider] Loading profile for user:', user.id)
      
      const userProfile = await syncUserProfile(user, skipCache)
      cacheProfile(userProfile)
      setProfile(userProfile)
      setRetryCount(0) // Reset retry count on success
      console.log('✅ [UserProfileProvider] Profile loaded successfully:', userProfile.role)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user profile'
      console.error('❌ [UserProfileProvider] Error loading profile:', errorMessage)
      setError(errorMessage)
      
      // Retry logic with exponential backoff
      if (retryCount < 3 && !isRetry) {
        const delay = Math.pow(2, retryCount) * 1000 // 1s, 2s, 4s
        console.log(`🔄 [UserProfileProvider] Retrying in ${delay}ms... (attempt ${retryCount + 1}/3)`)
        setRetryCount(prev => prev + 1)
        
        setTimeout(() => {
          loadProfile(skipCache, true)
        }, delay)
      }
    } finally {
      if (!isRetry || retryCount >= 3) {
        setLoading(false)
      }
    }
  }, [user, syncUserProfile, cacheProfile, retryCount])

  // Effect to load profile when user changes
  useEffect(() => {
    if (!isLoaded) return
    loadProfile()
  }, [isLoaded, loadProfile])

  // Memoized helper functions
  const helperFunctions = useMemo(() => ({
    isWorker: () => profile?.role === 'worker',
    isManager: () => profile?.role === 'project_manager',
    isAdmin: () => profile?.role === 'super_admin',
    isManagerOrAdmin: () => profile?.role === 'project_manager' || profile?.role === 'super_admin'
  }), [profile])

  // Refresh function for manual updates (skips cache)
  const refreshProfile = useCallback(async () => {
    if (!user) return
    await loadProfile(true) // Skip cache for refresh
  }, [user, loadProfile])

  // Public sync function (uses cache)
  const syncProfile = useCallback(async () => {
    if (!user) return
    await loadProfile(false) // Use cache for sync
  }, [user, loadProfile])

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    profile,
    loading,
    error,
    user,
    isLoaded,
    ...helperFunctions,
    refreshProfile,
    syncProfile
  }), [
    profile,
    loading,
    error,
    user,
    isLoaded,
    helperFunctions,
    refreshProfile,
    syncProfile
  ])

  return (
    <UserProfileContext.Provider value={contextValue}>
      {children}
    </UserProfileContext.Provider>
  )
}

// Custom hook to use the user profile context
export function useUserProfile(): UserProfileContextType {
  const context = useContext(UserProfileContext)
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider')
  }
  return context
}