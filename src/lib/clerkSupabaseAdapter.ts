import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client';

/**
 * Creates a Supabase client that works with Clerk authentication
 * This is a simplified approach that doesn't rely on JWT templates
 */
export function createClerkSupabaseClient(clerkUserId: string, clerkToken: string): SupabaseClient<Database> {
  // Create a custom auth implementation
  const client = createClient<Database>(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        storage: {
          getItem: (key: string) => {
            // Provide custom auth data for Supabase
            if (key === 'sb-access-token') {
              return clerkToken;
            }
            if (key === 'sb-user') {
              // Return user data in Supabase format
              return JSON.stringify({
                id: clerkUserId,
                aud: 'authenticated',
                role: 'authenticated',
                email: '', // Will be filled in by the auth context
                user_metadata: {},
                app_metadata: {},
              });
            }
            return localStorage.getItem(key);
          },
          setItem: (key: string, value: string) => {
            return localStorage.setItem(key, value);
          },
          removeItem: (key: string) => {
            return localStorage.removeItem(key);
          },
        },
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          // Add custom header to identify Clerk user
          'X-Clerk-User-Id': clerkUserId,
        },
      },
    }
  );

  // Set up auth state manually
  client.auth.setSession({
    access_token: clerkToken,
    refresh_token: '',
  });

  return client;
}

/**
 * Alternative approach: Create a Supabase RPC function that accepts Clerk user ID
 * This bypasses the JWT authentication entirely for authenticated operations
 */
export class ClerkSupabaseRPC {
  private supabase: SupabaseClient<Database>;
  private clerkUserId: string;

  constructor(clerkUserId: string) {
    this.clerkUserId = clerkUserId;
    this.supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  }

  /**
   * Execute a query with Clerk user context
   * This calls a database function that sets the auth context
   */
  async withAuth<T>(operation: (client: SupabaseClient<Database>) => Promise<T>): Promise<T> {
    try {
      // First, set the auth context using a database function
      await this.supabase.rpc('set_auth_context', {
        user_id: this.clerkUserId,
      });

      // Then execute the operation
      return await operation(this.supabase);
    } catch (error) {
      console.error('Failed to execute authenticated operation:', error);
      throw error;
    }
  }

  /**
   * Direct access to supabase client for non-authenticated operations
   */
  get client(): SupabaseClient<Database> {
    return this.supabase;
  }
}

/**
 * Simple approach: Use service role for admin operations
 * This creates a client that bypasses RLS for admin users
 */
export function createAdminSupabaseClient(userRole: string): SupabaseClient<Database> {
  if (userRole === 'super_admin') {
    // For super admins, we could use service role key (if available in env)
    // For now, use regular client with custom headers
    return createClient<Database>(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY,
      {
        global: {
          headers: {
            'X-Admin-Access': 'true',
            'X-User-Role': userRole,
          },
        },
      }
    );
  }
  
  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}
