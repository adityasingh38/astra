import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';
export const configured = Boolean(supabaseUrl && supabaseKey && process.env.EXPO_PUBLIC_API_URL);
export const supabase = createClient(supabaseUrl || 'https://unconfigured.supabase.co', supabaseKey || 'unconfigured', { auth: { ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}), autoRefreshToken: true, persistSession: true, detectSessionInUrl: false } });
if (Platform.OS !== 'web') AppState.addEventListener('change', (state) => { if (state === 'active') supabase.auth.startAutoRefresh(); else supabase.auth.stopAutoRefresh(); });

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) throw new Error('Sign in to continue.');
  const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}`, ...options.headers } });
  const body = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(typeof body?.detail === 'string' ? body.detail : `Request failed (${response.status})`);
  return body as T;
}
