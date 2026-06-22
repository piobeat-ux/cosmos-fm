import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials missing');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: (url, options = {}) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      return fetch(url, {
        ...options,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));
    },
  },
});

// Admin authentication helpers
export async function signInAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signUpAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

export async function signOutAdmin() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// Data helpers
export async function getShows() {
  const { data, error } = await supabase.from('shows').select('*').order('time');
  return { data: data || [], error };
}

export async function getHosts() {
  const { data, error } = await supabase.from('hosts').select('*');
  return { data: data || [], error };
}

export async function getPodcasts() {
  const { data, error } = await supabase.from('podcasts').select('*');
  return { data: data || [], error };
}

export async function getCategories() {
  const { data, error } = await supabase.from('categories').select('*');
  return { data: data || [], error };
}

export async function getHotels() {
  const { data, error } = await supabase.from('hotels').select('*');
  return { data: data || [], error };
}

export async function getNavigation() {
  const { data, error } = await supabase.from('navigation').select('*').order('order');
  return { data: data || [], error };
}

export async function getSettings() {
  const { data, error } = await supabase.from('settings').select('*');
  return { data: data || [], error };
}

export async function updateSetting(key: string, value: any) {
  const { data, error } = await supabase
    .from('settings')
    .upsert({ key, value }, { onConflict: 'key' });
  return { data, error };
}

export async function updateSettings(settings: Record<string, any>) {
  const updates = Object.entries(settings).map(([key, value]) =>
    supabase.from('settings').upsert({ key, value }, { onConflict: 'key' })
  );
  const results = await Promise.all(updates);
  return results;
}
