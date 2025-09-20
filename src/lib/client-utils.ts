'use client'

import { useUser, useAuth } from '@clerk/nextjs'
import { supabase } from './supabase'
import { useEffect } from 'react'

/**
 * Custom hook to sync Clerk authentication with Supabase
 * This ensures the Supabase client uses the Clerk session token
 */
export function useSupabaseAuth() {
  const { getToken } = useAuth()
  const { user, isLoaded } = useUser()

  useEffect(() => {
    const syncAuth = async () => {
      if (!isLoaded) return

      if (user) {
        // Get the Clerk session token
        const token = await getToken({ template: 'supabase' })
        
        if (token) {
          // Set the auth token in Supabase
          await supabase.auth.setSession({
            access_token: token,
            refresh_token: '', // Clerk handles refresh
          })
        }
      } else {
        // Sign out from Supabase when user signs out from Clerk
        await supabase.auth.signOut()
      }
    }

    syncAuth()
  }, [user, isLoaded, getToken])

  return { user, isLoaded, supabase }
}

/**
 * Get the current Supabase session with Clerk integration
 */
export async function getSupabaseSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

/**
 * Sign out from both Clerk and Supabase
 */
export async function signOutAll() {
  await supabase.auth.signOut()
  // Clerk sign out is handled by the ClerkProvider
}

/**
 * Check if the current environment variables are properly set
 */
export function validateEnvironmentVariables() {
  const requiredVars = [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]

  const missingVars = requiredVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
  }

  return true
}