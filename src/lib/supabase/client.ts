import { createBrowserClient } from '@supabase/ssr'

/**
 * Create a Supabase client for client-side usage
 * This client is used in React components and client-side code
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}