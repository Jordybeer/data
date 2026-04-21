import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  'https://xopixygydpqnswsqwyum.supabase.co';

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvcGl4eWd5ZHBxbnN3c3F3eXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3ODU5NTAsImV4cCI6MjA5MjM2MTk1MH0.Hy0WdRwqzFcVu-ginoCMUk7IyUaUyeUDvz3HkAp03AU';

let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _supabase;
}

export function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? SUPABASE_ANON_KEY;
    _supabaseAdmin = createClient(SUPABASE_URL, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _supabaseAdmin;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get: (_t, prop) => getSupabase()[prop as keyof SupabaseClient],
});

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get: (_t, prop) => getSupabaseAdmin()[prop as keyof SupabaseClient],
});
