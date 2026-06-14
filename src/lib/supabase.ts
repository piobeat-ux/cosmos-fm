import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found');
}

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true },
      global: { headers: { 'x-client-info': 'cosmos-fm' } }
    })
  : null;

// Retry helper
async function withRetry(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.warn(`Retry ${i + 1}/${retries}...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

// ========== ЗАГРУЗКА ФАЙЛОВ ==========
export async function uploadFile(file, type = 'image') {
  if (!supabase) throw new Error('Supabase not initialized');
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${type}s/${fileName}`;

  console.log('Uploading:', filePath, 'Size:', file.size);

  const { data, error } = await supabase.storage
    .from('media')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type
    });

  if (error) {
    console.error('Upload error:', error);
    throw error;
  }

  const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath);
  console.log('Upload success:', urlData.publicUrl);
  return urlData.publicUrl;
}

// ========== CRUD С RETRY ==========
export async function getShows() {
  return withRetry(async () => {
    const { data, error } = await supabase.from('shows').select('*');
    if (error) throw error;
    return data || [];
  });
}

export async function getHosts() {
  return withRetry(async () => {
    const { data, error } = await supabase.from('hosts').select('*');
    if (error) throw error;
    return data || [];
  });
}

export async function getPodcasts() {
  return withRetry(async () => {
    const { data, error } = await supabase.from('podcasts').select('*');
    if (error) throw error;
    return data || [];
  });
}

export async function getCategories() {
  return withRetry(async () => {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) throw error;
    return data || [];
  });
}

export async function getHotels() {
  return withRetry(async () => {
    const { data, error } = await supabase.from('hotels').select('*');
    if (error) throw error;
    return data || [];
  });
}

export async function getNavigationLinks() {
  return withRetry(async () => {
    const { data, error } = await supabase.from('navigation_links').select('*');
    if (error) throw error;
    return (data || []).filter(l => l.is_active);
  });
}

export async function getSettings() {
  return withRetry(async () => {
    const { data, error } = await supabase.from('site_settings').select('*');
    if (error) throw error;
    const settings = {};
    data?.forEach(item => { settings[item.key] = item.value; });
    return settings;
  });
}

export async function createShow(show) {
  return withRetry(async () => {
    const { error } = await supabase.from('shows').insert([show]);
    if (error) throw error;
  });
}

export async function updateShow(id, show) {
  return withRetry(async () => {
    const { error } = await supabase.from('shows').update(show).eq('id', id);
    if (error) throw error;
  });
}

export async function deleteShow(id) {
  return withRetry(async () => {
    const { error } = await supabase.from('shows').delete().eq('id', id);
    if (error) throw error;
  });
}

export async function createHost(host) {
  return withRetry(async () => {
    const { error } = await supabase.from('hosts').insert([host]);
    if (error) throw error;
  });
}

export async function updateHost(id, host) {
  return withRetry(async () => {
    const { error } = await supabase.from('hosts').update(host).eq('id', id);
    if (error) throw error;
  });
}

export async function deleteHost(id) {
  return withRetry(async () => {
    const { error } = await supabase.from('hosts').delete().eq('id', id);
    if (error) throw error;
  });
}

export async function createPodcast(podcast) {
  return withRetry(async () => {
    const { error } = await supabase.from('podcasts').insert([podcast]);
    if (error) throw error;
  });
}

export async function updatePodcast(id, podcast) {
  return withRetry(async () => {
    const { error } = await supabase.from('podcasts').update(podcast).eq('id', id);
    if (error) throw error;
  });
}

export async function deletePodcast(id) {
  return withRetry(async () => {
    const { error } = await supabase.from('podcasts').delete().eq('id', id);
    if (error) throw error;
  });
}

export async function createCategory(category) {
  return withRetry(async () => {
    const { error } = await supabase.from('categories').insert([category]);
    if (error) throw error;
  });
}

export async function updateCategory(id, category) {
  return withRetry(async () => {
    const { error } = await supabase.from('categories').update(category).eq('id', id);
    if (error) throw error;
  });
}

export async function deleteCategory(id) {
  return withRetry(async () => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  });
}

export async function createHotel(hotel) {
  return withRetry(async () => {
    const { error } = await supabase.from('hotels').insert([hotel]);
    if (error) throw error;
  });
}

export async function updateHotel(id, hotel) {
  return withRetry(async () => {
    const { error } = await supabase.from('hotels').update(hotel).eq('id', id);
    if (error) throw error;
  });
}

export async function deleteHotel(id) {
  return withRetry(async () => {
    const { error } = await supabase.from('hotels').delete().eq('id', id);
    if (error) throw error;
  });
}

export async function createNavigationLink(link) {
  return withRetry(async () => {
    const { error } = await supabase.from('navigation_links').insert([link]);
    if (error) throw error;
  });
}

export async function updateNavigationLink(id, link) {
  return withRetry(async () => {
    const { error } = await supabase.from('navigation_links').update(link).eq('id', id);
    if (error) throw error;
  });
}

export async function deleteNavigationLink(id) {
  return withRetry(async () => {
    const { error } = await supabase.from('navigation_links').delete().eq('id', id);
    if (error) throw error;
  });
}

export async function updateSetting(key, value) {
  return withRetry(async () => {
    const { error } = await supabase.from('site_settings').upsert({ key, value });
    if (error) throw error;
  });
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}