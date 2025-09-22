import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Module-level caches to keep clients singleton per process
let anonClient: SupabaseClient<Database> | null = null
const tokenClients = new Map<string, SupabaseClient<Database>>()

function makeClient(token?: string): SupabaseClient<Database> {
  return createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  })
}

// Server-side Supabase client factory (singleton). If a token is provided, we cache per-token.
export function createServerClient(token?: string): SupabaseClient<Database> {
  if (!token) {
    if (!anonClient) {
      anonClient = makeClient()
    }
    return anonClient
  }

  const existing = tokenClients.get(token)
  if (existing) return existing

  const client = makeClient(token)
  tokenClients.set(token, client)
  return client
}
