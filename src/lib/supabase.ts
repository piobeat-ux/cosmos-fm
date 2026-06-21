import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔌 Supabase Init:', { 
  url: supabaseUrl,
  keyLength: supabaseAnonKey?.length || 0
});

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'implicit'
      },
      global: {
        headers: {
          'Content-Type': 'application/json',
        }
      },
      db: {
        schema: 'public'
      },
      storage: {
        useResumable: false,
        limit: 50, // Увеличено до 50MB
      }
    })
  : null;

// ========== AUTH ==========
export async function signUpAdmin(email, password) {
  if (!supabase) throw new Error('Supabase not initialized');
  console.log('📝 Creating admin:', email);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role: 'admin', created_at: new Date().toISOString() } }
  });
  if (error) throw error;
  console.log('✅ Admin created:', data.user?.email);
  return data;
}

export async function signInAdmin(email, password) {
  if (!supabase) throw new Error('Supabase not initialized');
  console.log('🔐 Signing in:', email);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  console.log('✅ Login successful:', data.user?.email);
  return data;
}

export async function signOutAdmin() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

// ========== DATA ==========
export async function getShows() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.from('shows').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching shows:', err.message);
    return [];
  }
}

export async function getHosts() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.from('hosts').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching hosts:', err.message);
    return [];
  }
}

export async function getPodcasts() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.from('podcasts').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching podcasts:', err.message);
    return [];
  }
}

export async function getCategories() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.from('categories').select('*').order('created_at');
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching categories:', err.message);
    return [];
  }
}

export async function getHotels() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.from('hotels').select('*').order('created_at');
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching hotels:', err.message);
    return [];
  }
}

export async function getNavigationLinks() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.from('navigation_links').select('*').order('order_index');
    if (error) return [];
    return (data || []).filter(l => l.is_active);
  } catch (err) {
    console.error('Error fetching navigation:', err.message);
    return [];
  }
}

export async function getSettings() {
  if (!supabase) return {};
  try {
    const { data, error } = await supabase.from('site_settings').select('*');
    if (error) return {};
    const settings = {};
    data?.forEach(item => { settings[item.key] = item.value; });
    return settings;
  } catch (err) {
    console.error('Error fetching settings:', err.message);
    return {};
  }
}

// ========== CRUD ==========
export async function createShow(show) { 
  console.log('📝 Creating show:', show);
  const { data, error } = await supabase.from('shows').insert([show]).select();
  if (error) {
    console.error('❌ Error creating show:', error);
    throw error;
  }
  console.log('✅ Show created:', data);
  return data?.[0];
}

export async function updateShow(id, show) { 
  const { error } = await supabase.from('shows').update(show).eq('id', id);
  if (error) throw error;
}

export async function deleteShow(id) { 
  const { error } = await supabase.from('shows').delete().eq('id', id);
  if (error) throw error;
}

export async function createHost(host) { 
  console.log('📝 Creating host:', host);
  const { data, error } = await supabase.from('hosts').insert([host]).select();
  if (error) {
    console.error('❌ Error creating host:', error);
    throw error;
  }
  console.log('✅ Host created:', data);
  return data?.[0];
}

export async function updateHost(id, host) { 
  const { error } = await supabase.from('hosts').update(host).eq('id', id);
  if (error) throw error;
}

export async function deleteHost(id) { 
  const { error } = await supabase.from('hosts').delete().eq('id', id);
  if (error) throw error;
}

export async function createPodcast(podcast) { 
  console.log('📝 Creating podcast:', podcast);
  const { data, error } = await supabase.from('podcasts').insert([podcast]).select();
  if (error) {
    console.error('❌ Error creating podcast:', error);
    throw error;
  }
  console.log('✅ Podcast created:', data);
  return data?.[0];
}

export async function updatePodcast(id, podcast) { 
  const { error } = await supabase.from('podcasts').update(podcast).eq('id', id);
  if (error) throw error;
}

export async function deletePodcast(id) { 
  const { error } = await supabase.from('podcasts').delete().eq('id', id);
  if (error) throw error;
}

export async function createCategory(category) { 
  console.log('📝 Creating category:', category);
  const { data, error } = await supabase.from('categories').insert([category]).select();
  if (error) {
    console.error('❌ Error creating category:', error);
    throw error;
  }
  console.log('✅ Category created:', data);
  return data?.[0];
}

export async function updateCategory(id, category) { 
  const { error } = await supabase.from('categories').update(category).eq('id', id);
  if (error) throw error;
}

export async function deleteCategory(id) { 
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

export async function createHotel(hotel) { 
  console.log('📝 Creating hotel:', hotel);
  const { data, error } = await supabase.from('hotels').insert([hotel]).select();
  if (error) {
    console.error('❌ Error creating hotel:', error);
    throw error;
  }
  console.log('✅ Hotel created:', data);
  return data?.[0];
}

export async function updateHotel(id, hotel) { 
  const { error } = await supabase.from('hotels').update(hotel).eq('id', id);
  if (error) throw error;
}

export async function deleteHotel(id) { 
  const { error } = await supabase.from('hotels').delete().eq('id', id);
  if (error) throw error;
}

export async function createNavigationLink(link) { 
  console.log('📝 Creating navigation link:', link);
  const { data, error } = await supabase.from('navigation_links').insert([link]).select();
  if (error) {
    console.error('❌ Error creating navigation link:', error);
    throw error;
  }
  console.log('✅ Navigation link created:', data);
  return data?.[0];
}

export async function updateNavigationLink(id, link) { 
  const { error } = await supabase.from('navigation_links').update(link).eq('id', id);
  if (error) throw error;
}

export async function deleteNavigationLink(id) { 
  const { error } = await supabase.from('navigation_links').delete().eq('id', id);
  if (error) throw error;
}

export async function updateSetting(key, value) {
  const { error } = await supabase.from('site_settings').upsert({ 
    key, 
    value,
    updated_at: new Date().toISOString()
  });
  if (error) throw error;
}

// ========== ЗАГРУЗКА ФАЙЛОВ (50MB) ==========
export async function uploadFile(file, type = 'image') {
  if (!supabase) throw new Error('Supabase not initialized');
  
  console.log('📤 Uploading file:', {
    name: file.name,
    size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
    type: file.type,
    uploadType: type
  });
  
  // Увеличен лимит до 50MB
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    throw new Error(`Файл слишком большой. Максимальный размер: 50MB. Ваш файл: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
  }
  
  const fileExt = file.name.split('.').pop().toLowerCase();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `${type}s/${fileName}`;
  
  console.log('📁 File path:', filePath);
  
  try {
    const { data, error } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
        duplex: 'half',
      });
    
    if (error) {
      console.error('❌ Upload error:', error);
      throw new Error(`Ошибка загрузки: ${error.message}`);
    }
    
    console.log('✅ File uploaded:', data);
    
    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);
    
    console.log('🔗 Public URL:', urlData.publicUrl);
    
    return urlData.publicUrl;
  } catch (err) {
    console.error('❌ Upload failed:', err);
    throw err;
  }
}

export async function deleteFile(filePath) {
  if (!supabase) throw new Error('Supabase not initialized');
  
  const { error } = await supabase.storage
    .from('media')
    .remove([filePath]);
  
  if (error) throw error;
}
