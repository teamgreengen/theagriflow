import { createClient } from '@supabase/supabase-js';

export const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseURL, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const supabaseAdmin = createClient(supabaseURL, supabaseAnonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export default supabase;