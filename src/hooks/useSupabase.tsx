import { useUser, useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import type { Database } from '@/integrations/supabase/types';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client';

/**
 * Custom hook that creates a Supabase client authenticated with Clerk
 * This ensures that Supabase RLS policies work correctly with Clerk users
 */
export function useSupabase() {
  const { isLoaded, userId } = useUser();
  const { getToken } = useAuth();
  const [supabase, setSupabase] = useState(() => 
    createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
  );

  useEffect(() => {
    if (!isLoaded) return;

    const createAuthenticatedClient = async () => {
      try {
        // Get the Supabase JWT token from Clerk
        const token = await getToken({ template: 'supabase' });
        
        // Create a new Supabase client with the Clerk JWT
        const authenticatedSupabase = createClient<Database>(
          SUPABASE_URL, 
          SUPABASE_PUBLISHABLE_KEY,
          {
            global: {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
            auth: {
              storage: localStorage,
              persistSession: false, // Let Clerk handle sessions
              autoRefreshToken: false, // Let Clerk handle token refresh
            },
          }
        );

        // Set the auth session manually
        if (token && userId) {
          await authenticatedSupabase.auth.setSession({
            access_token: token,
            refresh_token: '', // Not needed with Clerk
          });
        }

        setSupabase(authenticatedSupabase);
        console.log('✅ Supabase client authenticated with Clerk token');
      } catch (error) {
        console.error('❌ Failed to authenticate Supabase client:', error);
        // Fall back to unauthenticated client
        setSupabase(createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY));
      }
    };

    if (userId) {
      createAuthenticatedClient();
    } else {
      // User not authenticated, use default client
      setSupabase(createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY));
    }
  }, [isLoaded, userId, getToken]);

  return supabase;
}

/**
 * Alternative approach using a React context
 * This creates a single authenticated client for the entire app
 */
export function createClerkSupabaseClient(clerkToken: string) {
  return createClient<Database>(
    SUPABASE_URL, 
    SUPABASE_PUBLISHABLE_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${clerkToken}`,
        },
      },
      auth: {
        storage: localStorage,
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
