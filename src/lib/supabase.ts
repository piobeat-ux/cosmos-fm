import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials missing');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: (url, options = {}) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      return fetch(url, {
        ...options,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));
    },
  },
});

export async function signInAdmin(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

export async function signUpAdmin(email, password) {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
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
    const { data, error } = await supabase.from('navigation_links').select('*').order('order_index', { ascending: true });
    return { data: data || [], error };
  } catch (err) {
    return { data: [], error: err };
  }
}

export async function getSettings() {
  try {
    const { data, error } = await supabase.from('site_settings').select('*');
    return { data: data || [], error };
  } catch (err) {
    return { data: [], error: err };
  }
}

export async function updateSetting(key, value) {
  try {
    // Delete existing record first, then insert
    await supabase.from('site_settings').delete().eq('key', key);
    const { data, error } = await supabase.from('site_settings').insert({ key, value });
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

export async function updateSettings(settings) {
  try {
    const results = [];
    for (const [key, value] of Object.entries(settings)) {
      await supabase.from('site_settings').delete().eq('key', key);
      const { data, error } = await supabase.from('site_settings').insert({ key, value });
      results.push({ data, error });
    }
    return results;
  } catch (err) {
    return [null];
  }
}
