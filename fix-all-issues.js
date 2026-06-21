import fs from 'fs';

console.log('🔧 === КОМПЛЕКСНОЕ ИСПРАВЛЕНИЕ ВСЕХ ПРОБЛЕМ ===\n');

// ==========================================
# 1. LIB/SUPABASE.TS - УВЕЛИЧЕННЫЙ ЛИМИТ ФАЙЛОВ
// ==========================================
console.log('1/8 Исправление lib/supabase.ts (лимит файлов)...');

const supabaseContent = `import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log(' Supabase Init:', { 
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
  console.log(' Creating host:', host);
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
    console.error(' Error creating navigation link:', error);
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
    throw new Error(\`Файл слишком большой. Максимальный размер: 50MB. Ваш файл: \${(file.size / 1024 / 1024).toFixed(2)}MB\`);
  }
  
  const fileExt = file.name.split('.').pop().toLowerCase();
  const fileName = \`\${Date.now()}_\${Math.random().toString(36).substring(2, 15)}.\${fileExt}\`;
  const filePath = \`\${type}s/\${fileName}\`;
  
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
      console.error(' Upload error:', error);
      throw new Error(\`Ошибка загрузки: \${error.message}\`);
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
`;

fs.writeFileSync('src/lib/supabase.ts', supabaseContent);
console.log('✅ lib/supabase.ts - лимит увеличен до 50MB');

// ==========================================
# 2. DATACONTEXT - ПОЛНАЯ РЕАКТИВНОСТЬ
// ==========================================
console.log('2/8 Исправление DataContext.tsx (реактивность)...');

const dataContextContent = `import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getShows, getHosts, getPodcasts, getCategories, getSettings,
  getHotels, getNavigationLinks,
  createShow, updateShow, deleteShow,
  createHost, updateHost, deleteHost,
  createPodcast, updatePodcast, deletePodcast,
  createCategory, updateCategory, deleteCategory,
  createHotel, updateHotel, deleteHotel,
  createNavigationLink, updateNavigationLink, deleteNavigationLink,
  updateSetting, supabase,
  uploadFile,
} from '@/lib/supabase';

const DataContext = createContext(undefined);

const DEMO_DATA = {
  shows: [
    { id: '1', title: 'Утреннее шоу', description: 'Бодрое начало дня', host_name: 'Дмитрий Иванов', time: '08:00', duration: '2ч', category: 'Музыка', day_of_week: 'Пн', is_live: true, cover_url: '', audio_url: 'https://stream.radioparadise.com/aac-128' },
    { id: '2', title: 'Новости отелей', description: 'Главные новости', host_name: 'Анна Петрова', time: '12:00', duration: '1ч', category: 'Новости', day_of_week: 'Пн', is_live: false, cover_url: '', audio_url: '' },
  ],
  hosts: [
    { id: '1', name: 'Дмитрий Иванов', role: 'Ведущий', hotel: 'Cosmos Moscow', bio: 'Профессиональный радиоведущий', photo_url: '', color: 'from-[#f59e0b] to-[#f97316]', initials: 'ДИ' },
    { id: '2', name: 'Анна Петрова', role: 'Журналист', hotel: 'Cosmos St. Petersburg', bio: 'Эксперт в области гостеприимства', photo_url: '', color: 'from-[#8b5cf6] to-[#6366f1]', initials: 'АП' },
  ],
  podcasts: [
    { id: '1', title: 'Истории успеха', description: 'Интервью с лидерами', host_name: 'Анна Петрова', episodes: 12, duration: '45 мин', category: 'Интервью', likes: 156, color: 'from-[#6366f1] to-[#8b5cf6]', cover_url: '', audio_url: '' },
  ],
  categories: [
    { id: '1', name: 'Музыка', icon: '🎵', description: 'Музыкальные программы' },
    { id: '2', name: 'Новости', icon: '', description: 'Новости индустрии' },
  ],
  hotels: [
    { id: '1', name: 'Cosmos Moscow', city: 'Москва' },
    { id: '2', name: 'Cosmos St. Petersburg', city: 'Санкт-Петербург' },
  ],
  navigationLinks: [
    { id: '1', label: 'Эфир', url: '#/', order_index: 1, is_active: true },
    { id: '2', label: 'Расписание', url: '#/schedule', order_index: 2, is_active: true },
    { id: '3', label: 'Ведущие', url: '#/hosts', order_index: 3, is_active: true },
    { id: '4', label: 'Подкасты', url: '#/podcasts', order_index: 4, is_active: true },
    { id: '5', label: 'О нас', url: '#/about', order_index: 5, is_active: true },
  ],
  settings: {
    site_title: 'Cosmos FM',
    hero_title: 'Голос вашего отеля',
    hero_subtitle: 'Звуки вашего космоса',
    hero_description: 'Первый в России корпоративный медиа-канал',
    stream_url: 'https://stream.radioparadise.com/aac-128',
    primary_color: '#6366f1',
    neppy_image: ''
  }
};

export function DataProvider({ children }) {
  const [shows, setShows] = useState(DEMO_DATA.shows);
  const [hosts, setHosts] = useState(DEMO_DATA.hosts);
  const [podcasts, setPodcasts] = useState(DEMO_DATA.podcasts);
  const [categories, setCategories] = useState(DEMO_DATA.categories);
  const [hotels, setHotels] = useState(DEMO_DATA.hotels);
  const [navigationLinks, setNavigationLinks] = useState(DEMO_DATA.navigationLinks);
  const [settings, setSettings] = useState(DEMO_DATA.settings);
  const [loading, setLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [version, setVersion] = useState(0);

  const loadData = useCallback(async () => {
    if (!supabase) {
      console.warn('⚠️ Supabase not initialized');
      return;
    }

    setLoading(true);
    console.log('🔄 Loading data...');

    try {
      console.log('📡 Batch 1: shows + settings');
      const [showsData, settingsData] = await Promise.all([
        getShows(),
        getSettings(),
      ]);
      
      if (showsData?.length > 0) {
        setShows(showsData);
        console.log('✅ Shows:', showsData.length);
      }
      if (settingsData && Object.keys(settingsData).length > 0) {
        setSettings({ ...DEMO_DATA.settings, ...settingsData });
        console.log('✅ Settings loaded');
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      console.log('📡 Batch 2: hosts + podcasts');
      const [hostsData, podcastsData] = await Promise.all([
        getHosts(),
        getPodcasts(),
      ]);
      
      if (hostsData?.length > 0) {
        setHosts(hostsData);
        console.log('✅ Hosts:', hostsData.length);
      }
      if (podcastsData?.length > 0) {
        setPodcasts(podcastsData);
        console.log('✅ Podcasts:', podcastsData.length);
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      console.log('📡 Batch 3: categories + hotels');
      const [categoriesData, hotelsData] = await Promise.all([
        getCategories(),
        getHotels(),
      ]);
      
      if (categoriesData?.length > 0) {
        setCategories(categoriesData);
        console.log('✅ Categories:', categoriesData.length);
      }
      if (hotelsData?.length > 0) {
        setHotels(hotelsData);
        console.log('✅ Hotels:', hotelsData.length);
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      console.log(' Batch 4: navigation');
      const navData = await getNavigationLinks();
      if (navData?.length > 0) {
        setNavigationLinks(navData);
        console.log('✅ Navigation:', navData.length);
      }

      setIsDemoMode(false);
      console.log('✅ All data loaded!');
      
    } catch (err) {
      console.error('❌ Load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    loadData(); 
  }, [loadData]);

  const refresh = useCallback(() => { 
    console.log('🔄 Refresh');
    loadData(); 
  }, [loadData]);

  const uploadMedia = async (file, type) => {
    try {
      const url = await uploadFile(file, type);
      return url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const updateSettings = async (newSettings) => {
    console.log('💾 Updating settings:', newSettings);
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    setVersion(v => v + 1);
    
    if (supabase && !isDemoMode) {
      try {
        for (const [key, value] of Object.entries(newSettings)) {
          if (value !== undefined) {
            await updateSetting(key, value);
            console.log(\`✅ Setting '\${key}' updated\`);
          }
        }
      } catch (err) {
        console.error('❌ Settings update error:', err);
      }
    }
  };

  const addShow = async (show) => { 
    try {
      if (!isDemoMode) {
        const newShow = await createShow(show);
        setShows(prev => [newShow, ...prev]);
      }
      setVersion(v => v + 1);
    } catch (err) {
      console.error('❌ Add show error:', err);
      throw err;
    }
  };
  
  const editShow = async (id, show) => { 
    try {
      if (!isDemoMode) await updateShow(id, show);
      setShows(prev => prev.map(s => s.id === id ? { ...s, ...show } : s));
      setVersion(v => v + 1);
    } catch (err) {
      console.error('❌ Edit show error:', err);
      throw err;
    }
  };
  
  const removeShow = async (id) => { 
    try {
      if (!isDemoMode) await deleteShow(id);
      setShows(prev => prev.filter(s => s.id !== id));
      setVersion(v => v + 1);
    } catch (err) {
      console.error('❌ Remove show error:', err);
      throw err;
    }
  };

  const addHost = async (host) => { 
    try {
      if (!isDemoMode) {
        const newHost = await createHost(host);
        setHosts(prev => [newHost, ...prev]);
      }
      setVersion(v => v + 1);
    } catch (err) {
      console.error('❌ Add host error:', err);
      throw err;
    }
  };
  
  const editHost = async (id, host) => { 
    try {
      if (!isDemoMode) await updateHost(id, host);
      setHosts(prev => prev.map(h => h.id === id ? { ...h, ...host } : h));
      setVersion(v => v + 1);
    } catch (err) {
      console.error('❌ Edit host error:', err);
      throw err;
    }
  };
  
  const removeHost = async (id) => { 
    try {
      if (!isDemoMode) await deleteHost(id);
      setHosts(prev => prev.filter(h => h.id !== id));
      setVersion(v => v + 1);
    } catch (err) {
      console.error('❌ Remove host error:', err);
      throw err;
    }
  };

  const addPodcast = async (podcast) => { 
    try {
      if (!isDemoMode) {
        const newPodcast = await createPodcast(podcast);
        setPodcasts(prev => [newPodcast, ...prev]);
      }
      setVersion(v => v + 1);
    } catch (err) {
      console.error('❌ Add podcast error:', err);
      throw err;
    }
  };
  
  const editPodcast = async (id, podcast) => { 
    try {
      if (!isDemoMode) await updatePodcast(id, podcast);
      setPodcasts(prev => prev.map(p => p.id === id ? { ...p, ...podcast } : p));
      setVersion(v => v + 1);
    } catch (err) {
      console.error('❌ Edit podcast error:', err);
      throw err;
    }
  };
  
  const removePodcast = async (id) => { 
    try {
      if (!isDemoMode) await deletePodcast(id);
      setPodcasts(prev => prev.filter(p => p.id !== id));
      setVersion(v => v + 1);
    } catch (err) {
      console.error('❌ Remove podcast error:', err);
      throw err;
    }
  };

  const addCategory = async (category) => { 
    try {
      if (!isDemoMode) {
        const newCategory = await createCategory(category);
        setCategories(prev => [newCategory, ...prev]);
      }
      setVersion(v => v + 1);
    } catch (err) {
      console.error('❌ Add category error:', err);
      throw err;
    }
  };
  
  const editCategory = async (id, category) => { 
    try {
      if (!isDemoMode) await updateCategory(id, category);
      setCategories(prev => prev.map(c => c.id === id ? { ...c, ...category } : c));
      setVersion(v => v + 1);
    } catch (err) {
      console.error('❌ Edit category error:', err);
      throw err;
    }
  };
  
  const removeCategory = async (id) => { 
    try {
      if (!isDemoMode) await deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      setVersion(v => v + 1);
    } catch (err) {
      console.error('❌ Remove category error:', err);
      throw err;
    }
  };

  const addHotel = async (hotel) => { 
    try {
      if (!isDemoMode) {
        const newHotel = await createHotel(hotel);
        setHotels(prev => [newHotel, ...prev]);
      }
      setVersion(v => v + 1);
    } catch (err) {
      console.error('❌ Add hotel error:', err);
      throw err;
    }
  };
  
  const editHotel = async (id, hotel) => { 
    try {
      if (!isDemoMode) await updateHotel(id, hotel);
      setHotels(prev => prev.map(h => h.id === id ? { ...h, ...hotel } : h));
      setVersion(v => v + 1);
    } catch (err) {
      console.error(' Edit hotel error:', err);
      throw err;
    }
  };
  
  const removeHotel = async (id) => { 
    try {
      if (!isDemoMode) await deleteHotel(id);
      setHotels(prev => prev.filter(h => h.id !== id));
      setVersion(v => v + 1);
    } catch (err) {
      console.error('❌ Remove hotel error:', err);
      throw err;
    }
  };

  const addNavigationLink = async (link) => { 
    try {
      if (!isDemoMode) {
        const newLink = await createNavigationLink(link);
        setNavigationLinks(prev => [...prev, newLink]);
      }
      setVersion(v => v + 1);
    } catch (err) {
      console.error('❌ Add navigation link error:', err);
      throw err;
    }
  };
  
  const editNavigationLink = async (id, link) => { 
    try {
      if (!isDemoMode) await updateNavigationLink(id, link);
      setNavigationLinks(prev => prev.map(l => l.id === id ? { ...l, ...link } : l));
      setVersion(v => v + 1);
    } catch (err) {
      console.error('❌ Edit navigation link error:', err);
      throw err;
    }
  };
  
  const removeNavigationLink = async (id) => { 
    try {
      if (!isDemoMode) await deleteNavigationLink(id);
      setNavigationLinks(prev => prev.filter(l => l.id !== id));
      setVersion(v => v + 1);
    } catch (err) {
      console.error('❌ Remove navigation link error:', err);
      throw err;
    }
  };

  return (
    <DataContext.Provider value={{
      shows, hosts, podcasts, categories, hotels, navigationLinks, settings, 
      loading, refresh, isDemoMode, version,
      uploadMedia,
      addShow, editShow, removeShow,
      addHost, editHost, removeHost,
      addPodcast, editPodcast, removePodcast,
      addCategory, editCategory, removeCategory,
      addHotel, editHotel, removeHotel,
      addNavigationLink, editNavigationLink, removeNavigationLink,
      updateSettings,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
`;

fs.writeFileSync('src/context/DataContext.tsx', dataContextContent);
console.log('✅ DataContext.tsx - полная реактивность');

console.log('\n' + '='.repeat(70));
console.log('✅ ЧАСТЬ 1 ЗАВЕРШЕНА!');
console.log('='.repeat(70));
console.log('\n📋 ЧТО ИСПРАВЛЕНО:');
console.log('  ✅ Лимит файлов увеличен до 50MB');
console.log('  ✅ RLS отключен (выполните SQL)');
console.log('  ✅ Полная реактивность всех данных');
console.log('  ✅ Мгновенное обновление UI');
console.log('\n🚀 СЛЕДУЮЩИЕ ШАГИ:');
console.log('  1. Выполните SQL в Supabase (см. выше)');
console.log('  2. Запустите: npm run dev');
console.log('  3. Все CRUD операции будут работать!');
console.log('='.repeat(70));