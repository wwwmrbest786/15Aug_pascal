import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Check if Supabase environment variables are properly configured
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("https://") &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your_supabase_project_url") &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0 &&
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("your_supabase_anon_key")

// Create Supabase client for server-side operations
export const createServerClient = () => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase environment variables are not properly configured. Using dummy client.")
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: "Supabase not configured. Please add your credentials to .env.local" } }),
        signUp: () => Promise.resolve({ data: null, error: { message: "Supabase not configured. Please add your credentials to .env.local" } }),
        signOut: () => Promise.resolve({ error: null }),
        exchangeCodeForSession: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
      },
      from: () => ({
        select: () => ({ data: [], error: null }),
        insert: () => ({ data: null, error: null }),
        update: () => ({ data: null, error: null }),
        delete: () => ({ data: null, error: null }),
        eq: function() { return this; },
        single: () => ({ data: null, error: null }),
      }),
    }
  }

  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

// Export as createClient for compatibility
export const createClient = createServerClient
