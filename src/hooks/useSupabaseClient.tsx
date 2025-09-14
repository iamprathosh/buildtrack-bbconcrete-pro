import { useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { useMemo } from 'react';

const SUPABASE_URL = "https://xyvnqtjxnlongywzhhnd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5dm5xdGp4bmxvbmd5d3poaG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0Mzc0ODcsImV4cCI6MjA3MzAxMzQ4N30.hVEutxPFwQpTeqOiE1zlXcGH5WEdG-28w-ctjZLny5w";

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