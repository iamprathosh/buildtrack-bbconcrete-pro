import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Server-side Supabase client
export const supabaseServer = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Utility types and functions for server-side use
export type DatabaseResult<T> = {
  data: T | null
  error: string | null
}

export const dbUtilsServer = {
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
      const result = await queryFn(supabaseServer)
      
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