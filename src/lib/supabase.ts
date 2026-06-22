import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials missing. Check .env file');
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
export async function signInAdmin(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

export async function signUpAdmin(email, password) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

export async function signOutAdmin() {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err) {
    return { error: err };
  }
}

// Data helpers
export async function getShows() {
  try {
    const { data, error } = await supabase.from('shows').select('*').order('time');
    return { data: data || [], error };
  } catch (err) {
    return { data: [], error: err };
  }
}

export async function getHosts() {
  try {
    const { data, error } = await supabase.from('hosts').select('*');
    return { data: data || [], error };
  } catch (err) {
    return { data: [], error: err };
  }
}

export async function getPodcasts() {
  try {
    const { data, error } = await supabase.from('podcasts').select('*');
    return { data: data || [], error };
  } catch (err) {
    return { data: [], error: err };
  }
}

export async function getCategories() {
  try {
    const { data, error } = await supabase.from('categories').select('*');
    return { data: data || [], error };
  } catch (err) {
    return { data: [], error: err };
  }
}

export async function getHotels() {
  try {
    const { data, error } = await supabase.from('hotels').select('*');
    return { data: data || [], error };
  } catch (err) {
    return { data: [], error: err };
  }
}

export async function getNavigation() {
  try {
    const { data, error } = await supabase.from('navigation').select('*').order('order');
    return { data: data || [], error };
  } catch (err) {
    return { data: [], error: err };
  }
}

export async function getSettings() {
  try {
    const { data, error } = await supabase.from('settings').select('*');
    return { data: data || [], error };
  } catch (err) {
    return { data: [], error: err };
  }
}

export async function updateSetting(key, value) {
  try {
    const { data, error } = await supabase
      .from('settings')
      .upsert({ key, value }, { onConflict: 'key' });
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

export async function updateSettings(settings) {
  try {
    const updates = Object.entries(settings).map(([key, value]) =>
      supabase.from('settings').upsert({ key, value }, { onConflict: 'key' })
    );
    const results = await Promise.all(updates);
    return results;
  } catch (err) {
    return [null];
  }
}
