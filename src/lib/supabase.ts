import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const URL  = import.meta.env.VITE_SUPABASE_URL  as string | undefined;
const KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const hasSupabase = Boolean(URL && KEY);

export const sb: SupabaseClient | null = hasSupabase
  ? createClient(URL!, KEY!, { auth: { persistSession: false } })
  : null;

export interface VerifyResponse {
  ok: boolean;
  reason?: string;
  session_token?: string;
  user_id?: number;
  kind?: string;
  name_page?: string;
  hexa?: number;
  expires_at?: number;
}

export interface ValidateResponse {
  ok: boolean;
  user_id?: number;
  kind?: string;
  name_page?: string;
  expires_at?: number;
}
