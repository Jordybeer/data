import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabase() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url) throw new Error('Missing env var: NEXT_PUBLIC_SUPABASE_URL');
    if (!key) throw new Error('Missing env var: NEXT_PUBLIC_SUPABASE_ANON_KEY');
    _supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _supabase;
}

export function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY env var is required');
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) throw new Error('Missing env var: NEXT_PUBLIC_SUPABASE_URL');
    _supabaseAdmin = createClient(url, key, {
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
