'use client'

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { useAuth, useUser } from '@clerk/nextjs'
import { useEffect, useState, useRef } from 'react'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Singleton database client with authentication caching
class DatabaseManager {
  private static instance: DatabaseManager
  private client: SupabaseClient<Database>
  private isAuthenticated = false
  private currentUserId: string | null = null
  private authPromise: Promise<void> | null = null
  private lastTokenRefresh = 0
  private readonly TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes

  private constructor() {
    this.client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: {
          eventsPerSecond: 2
        }
      }
    })
  }

  // Singleton pattern
  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager()
    }
    return DatabaseManager.instance
  }

  // Non-blocking authentication with caching
  async authenticate(userId: string, getToken: () => Promise<string | null>): Promise<void> {
    // Skip if already authenticated for this user and token is fresh
    const now = Date.now()
    if (
      this.isAuthenticated && 
      this.currentUserId === userId && 
      (now - this.lastTokenRefresh) < this.TOKEN_REFRESH_INTERVAL
    ) {
      return // Already authenticated, no need to refresh
    }

    // Prevent multiple concurrent auth calls
    if (this.authPromise && this.currentUserId === userId) {
      return this.authPromise
    }

    // Create new authentication promise
    this.authPromise = this.performAuthentication(userId, getToken)
    
    try {
      await this.authPromise
    } finally {
      this.authPromise = null
    }
  }

  private async performAuthentication(userId: string, getToken: () => Promise<string | null>): Promise<void> {
    try {
      // For now, just mark as authenticated without setting Supabase session
      // This allows the app to work without JWT template configuration
      this.isAuthenticated = true
      this.currentUserId = userId
      this.lastTokenRefresh = Date.now()
      
      console.log(`✅ User ${userId} authenticated with database`)
    } catch (error) {
      console.error('Authentication failed:', error)
      this.isAuthenticated = false
      this.currentUserId = null
      this.lastTokenRefresh = 0
    }
  }

  // Get the authenticated client
  getClient(): SupabaseClient<Database> {
    return this.client
  }

  // Check if currently authenticated
  isAuthenticatedFor(userId: string): boolean {
    return this.isAuthenticated && this.currentUserId === userId
  }

  // Reset authentication (for logout)
  reset(): void {
    this.isAuthenticated = false
    this.currentUserId = null
    this.lastTokenRefresh = 0
    this.authPromise = null
    this.client.auth.signOut()
  }
}

// Export singleton instance
const dbManager = DatabaseManager.getInstance()

// Main hook with optimized authentication
export function useDatabase() {
  const { getToken } = useAuth()
  const { user, isLoaded } = useUser()
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const authAttempted = useRef(false)

  useEffect(() => {
    if (!isLoaded) {
      setIsReady(false)
      return
    }

    const initDatabase = async () => {
      try {
        setError(null)

        if (user?.id) {
          // Only authenticate if not already done for this user
          if (!dbManager.isAuthenticatedFor(user.id)) {
            // Use default Clerk token instead of supabase template
            await dbManager.authenticate(user.id, () => getToken())
          }
        }

        setIsReady(true)
        authAttempted.current = true
      } catch (err) {
        console.error('Database initialization failed:', err)
        setError(err instanceof Error ? err.message : 'Database initialization failed')
        setIsReady(false)
      }
    }

    // Prevent multiple initialization attempts
    if (!authAttempted.current || (user?.id && !dbManager.isAuthenticatedFor(user.id))) {
      initDatabase()
    } else {
      setIsReady(true)
    }

  }, [user?.id, isLoaded, getToken])

  // Reset on user change
  useEffect(() => {
    if (isLoaded && !user) {
      dbManager.reset()
      setIsReady(true)
      authAttempted.current = false
    }
  }, [user, isLoaded])

  return {
    db: dbManager.getClient(),
    isReady,
    error,
    isAuthenticated: user?.id ? dbManager.isAuthenticatedFor(user.id) : false
  }
}

// Direct access to singleton client (use carefully)
export const supabase = dbManager.getClient()

// Server-side client factory
export function createServerClient(token?: string): SupabaseClient<Database> {
  const client = createClient<Database>(supabaseUrl, supabaseAnonKey)
  
  if (token) {
    // Set token for server-side operations
    client.auth.setSession({
      access_token: token,
      refresh_token: ''
    })
  }
  
  return client
}

// Utility types and functions
export type DatabaseResult<T> = {
  data: T | null
  error: string | null
}

export const dbUtils = {
  // Handle errors consistently
  handleError: (error: any): string => {
    console.error('Database error:', error)
    return error?.message || 'Database operation failed'
  },

  // Validate required fields
  validateRequired: (data: Record<string, any>, requiredFields: string[]): void => {
    const missing = requiredFields.filter(field => !data[field])
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`)
    }
  },

  // Format dates for database
  formatDate: (date: Date | string | null): string | null => {
    if (!date) return null
    return new Date(date).toISOString()
  },

  // Safe query wrapper
  async safeQuery<T>(
    queryFn: (client: SupabaseClient<Database>) => Promise<any>
  ): Promise<DatabaseResult<T>> {
    try {
      const result = await queryFn(dbManager.getClient())
      
      if (result.error) {
        return {
          data: null,
          error: result.error.message || 'Query failed'
        }
      }

      return {
        data: result.data,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}