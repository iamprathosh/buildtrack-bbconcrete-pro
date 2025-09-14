import { useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client';
import { useMemo } from 'react';

export function useSupabaseClient() {
  const { getToken } = useAuth();

  const supabase = useMemo(
    () =>
      createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        global: {
          fetch: async (url, options: RequestInit = {}) => {
            const clerkToken = await getToken({ template: 'supabase' });

            return fetch(url, {
              ...options,
              headers: {
                ...(options.headers || {}),
                Authorization: `Bearer ${clerkToken}`,
              },
            });
          },
        },
      }),
    [getToken]
  );

  return supabase;
}