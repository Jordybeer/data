import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_URL = (() => {
  const v = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!v) throw new Error('Missing env var: NEXT_PUBLIC_SUPABASE_URL');
  return v;
})();

export const SUPABASE_ANON_KEY = (() => {
  const v = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!v) throw new Error('Missing env var: NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return v;
})();


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
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY env var is required');
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
