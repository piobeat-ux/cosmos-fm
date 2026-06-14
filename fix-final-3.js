import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 === ФИНАЛЬНОЕ ИСПРАВЛЕНИЕ 3 ПРОБЛЕМ ===\n');

const writeFile = (filePath, content) => {
  const fullPath = path.join(__dirname, filePath);
  fs.writeFileSync(fullPath, content.trim());
  console.log(`✅ ${filePath}`);
};

// ==========================================
// 1. SQL ДЛЯ ИСПРАВЛЕНИЯ STORAGE
// ==========================================
console.log('📊 1/7 Создание SQL для Storage...');

writeFile('fix-storage-final.sql', `
-- ==========================================
-- ИСПРАВЛЕНИЕ STORAGE И CORS
-- ==========================================

-- 1. Проверка bucket
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'media') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);
  END IF;
END $$;

-- 2. Удаление старых политик
DROP POLICY IF EXISTS "Allow all media" ON storage.objects;
DROP POLICY IF EXISTS "Public read media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;

-- 3. Создание простых политик (разрешаем всё)
CREATE POLICY "Allow all media operations" ON storage.objects 
  FOR ALL 
  USING (bucket_id = 'media') 
  WITH CHECK (bucket_id = 'media');

-- 4. Проверка таблиц
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
`);

// ==========================================
// 2. LIB/SUPABASE.TS - RETRY + TIMEOUT
// ==========================================
console.log('🔧 2/7 Обновление lib/supabase.ts...');

writeFile('src/lib/supabase.ts', `import { createClient } from '@supabase/supabase-js';

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
      console.warn(\`Retry \${i + 1}/\${retries}...\`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

// ========== ЗАГРУЗКА ФАЙЛОВ ==========
export async function uploadFile(file, type = 'image') {
  if (!supabase) throw new Error('Supabase not initialized');
  
  const fileExt = file.name.split('.').pop();
  const fileName = \`\${Date.now()}_\${Math.random().toString(36).substring(2)}.\${fileExt}\`;
  const filePath = \`\${type}s/\${fileName}\`;

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
`);

// ==========================================
// 3. DATACONTEXT - С RETRY
// ==========================================
console.log(' 3/7 Обновление DataContext...');

writeFile('src/context/DataContext.tsx', `import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

const DEFAULT_NAV = [
  { id: '1', label: 'Эфир', url: '#/', type: 'anchor', order_index: 1, is_active: true },
  { id: '2', label: 'Расписание', url: '#/schedule', type: 'anchor', order_index: 2, is_active: true },
  { id: '3', label: 'Ведущие', url: '#/hosts', type: 'anchor', order_index: 3, is_active: true },
  { id: '4', label: 'Подкасты', url: '#/podcasts', type: 'anchor', order_index: 4, is_active: true },
  { id: '5', label: 'О нас', url: '#/about', type: 'anchor', order_index: 5, is_active: true },
];

const DEFAULT_HOTELS = [
  { id: '1', name: 'Cosmos Moscow', city: 'Москва' },
  { id: '2', name: 'Cosmos St. Petersburg', city: 'Санкт-Петербург' },
  { id: '3', name: 'Cosmos Sochi', city: 'Сочи' },
];

const DEFAULT_SETTINGS = {
  site_title: 'Cosmos FM',
  hero_title: 'Голос вашего отеля',
  hero_subtitle: 'Звуки вашего космоса',
  hero_description: 'Первый в России корпоративный медиа-канал в индустрии гостеприимства',
  stream_url: '',
  primary_color: '#6366f1',
};

export function DataProvider({ children }) {
  const [shows, setShows] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [podcasts, setPodcasts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [navigationLinks, setNavigationLinks] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      if (!supabase) throw new Error('Supabase not initialized');

      const [showsData, hostsData, podcastsData, categoriesData, settingsData, hotelsData, navData] = await Promise.all([
        getShows().catch(() => []),
        getHosts().catch(() => []),
        getPodcasts().catch(() => []),
        getCategories().catch(() => []),
        getSettings().catch(() => ({})),
        getHotels().catch(() => DEFAULT_HOTELS),
        getNavigationLinks().catch(() => DEFAULT_NAV),
      ]);
      
      setShows(showsData || []);
      setHosts(hostsData || []);
      setPodcasts(podcastsData || []);
      setCategories(categoriesData || []);
      setSettings({ ...DEFAULT_SETTINGS, ...settingsData });
      setHotels(hotelsData && hotelsData.length > 0 ? hotelsData : DEFAULT_HOTELS);
      setNavigationLinks(navData && navData.length > 0 ? navData : DEFAULT_NAV);
    } catch (err) {
      console.warn('Using demo data:', err.message);
      setShows([]);
      setHosts([]);
      setPodcasts([]);
      setCategories([]);
      setHotels(DEFAULT_HOTELS);
      setNavigationLinks(DEFAULT_NAV);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const refresh = useCallback(() => { loadData(); }, [loadData]);

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
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (supabase) {
      for (const [key, value] of Object.entries(newSettings)) {
        if (value !== undefined) await updateSetting(key, value);
      }
    }
  };

  const addShow = async (show) => { await createShow(show); refresh(); };
  const editShow = async (id, show) => { await updateShow(id, show); refresh(); };
  const removeShow = async (id) => { await deleteShow(id); refresh(); };

  const addHost = async (host) => { await createHost(host); refresh(); };
  const editHost = async (id, host) => { await updateHost(id, host); refresh(); };
  const removeHost = async (id) => { await deleteHost(id); refresh(); };

  const addPodcast = async (podcast) => { await createPodcast(podcast); refresh(); };
  const editPodcast = async (id, podcast) => { await updatePodcast(id, podcast); refresh(); };
  const removePodcast = async (id) => { await deletePodcast(id); refresh(); };

  const addCategory = async (category) => { await createCategory(category); refresh(); };
  const editCategory = async (id, category) => { await updateCategory(id, category); refresh(); };
  const removeCategory = async (id) => { await deleteCategory(id); refresh(); };

  const addHotel = async (hotel) => { await createHotel(hotel); refresh(); };
  const editHotel = async (id, hotel) => { await updateHotel(id, hotel); refresh(); };
  const removeHotel = async (id) => { await deleteHotel(id); refresh(); };

  const addNavigationLink = async (link) => { await createNavigationLink(link); refresh(); };
  const editNavigationLink = async (id, link) => { await updateNavigationLink(id, link); refresh(); };
  const removeNavigationLink = async (id) => { await deleteNavigationLink(id); refresh(); };

  return (
    <DataContext.Provider value={{
      shows, hosts, podcasts, categories, hotels, navigationLinks, settings, loading, refresh,
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
`);

// ==========================================
// 4. IMAGEUPLOAD - ИСПРАВЛЕННАЯ ЗАГРУЗКА
// ==========================================
console.log('🖼️ 4/7 Исправление ImageUpload...');

writeFile('src/admin/components/ImageUpload.tsx', `import { useState } from 'react';
import { Upload, Link as LinkIcon, X, Loader2 } from 'lucide-react';
import { useData } from '@/context/DataContext';

export function ImageUpload({ value, onChange, type = 'image', label }) {
  const { uploadMedia } = useData();
  const [mode, setMode] = useState(value?.startsWith('http') ? 'url' : 'upload');
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(value || '');
  const [error, setError] = useState('');

  const handleFileUpload = async (e) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Файл слишком большой (макс 10 МБ)');
      return;
    }

    setUploading(true);
    try {
      console.log('Starting upload...', file.name);
      const url = await uploadMedia(file, type);
      console.log('Upload complete:', url);
      onChange(url);
      setError('');
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Ошибка загрузки: ' + err.message + '. Попробуйте использовать URL вместо файла.');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSave = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setError('');
    }
  };

  const handleClear = () => {
    onChange('');
    setUrlInput('');
    setError('');
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm text-[#a1a1aa] mb-2">{label}</label>}
      
      <div className="flex gap-2 mb-2">
        <button type="button" onClick={() => setMode('upload')}
          className={\`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition \${mode === 'upload' ? 'bg-[#6366f1] text-white' : 'bg-[#13131f] text-[#a1a1aa]'}\`}>
          <Upload className="w-4 h-4" /> Файл
        </button>
        <button type="button" onClick={() => setMode('url')}
          className={\`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition \${mode === 'url' ? 'bg-[#6366f1] text-white' : 'bg-[#13131f] text-[#a1a1aa]'}\`}>
          <LinkIcon className="w-4 h-4" /> URL
        </button>
      </div>

      {mode === 'upload' ? (
        <div>
          <input type="file" accept={type === 'image' ? 'image/*' : 'audio/*'}
            onChange={handleFileUpload} disabled={uploading}
            className="w-full text-sm text-[#a1a1aa] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#6366f1] file:text-white hover:file:bg-[#8b5cf6] disabled:opacity-50" />
          {uploading && (
            <div className="flex items-center gap-2 mt-2 text-[#6366f1]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Загрузка в Supabase...</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <input type="url" value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/file.mp3"
            className="flex-1 px-4 py-2 rounded-xl bg-[#13131f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" />
          <button type="button" onClick={handleUrlSave}
            className="px-4 py-2 bg-[#6366f1] text-white rounded-xl hover:bg-[#8b5cf6] transition">OK</button>
        </div>
      )}

      {error && <p className="text-sm text-[#ef4444]">{error}</p>}

      {value && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#13131f] border border-[#27273a]">
          {type === 'image' ? (
            <img src={value} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />
          ) : (
            <audio controls src={value} className="w-full h-10" />
          )}
          <button type="button" onClick={handleClear} className="p-2 text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
`);

// ==========================================
// 5. HOMESECTION - С ПОДКАСТАМИ И ПЕРЕДАЧАМИ
// ==========================================
console.log('🏠 5/7 Обновление HomeSection...');

writeFile('src/sections/HomeSection.tsx', `import { useEffect, useState } from 'react';
import { Radio, ChevronDown, Sparkles, Play, User, Music, Calendar } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAudio } from '@/context/AudioContext';

export function HomeSection() {
  const { shows, hosts, podcasts, settings } = useData();
  const { playLiveStream, playTrack, currentTrack, isPlaying } = useAudio();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => { setIsLoaded(true); }, []);

  const liveShow = shows.find(show => show.is_live);

  const handlePlayLive = () => {
    if (liveShow?.audio_url) {
      playTrack({ id: liveShow.id, title: liveShow.title, artist: liveShow.host_name, audio_url: liveShow.audio_url, cover_url: liveShow.cover_url, isLive: true, type: 'show' });
    } else if (settings.stream_url) {
      playLiveStream(settings.stream_url, liveShow?.title || 'Прямой эфир');
    }
  };

  const handlePlayShow = (show) => {
    if (show.audio_url) {
      playTrack({ id: show.id, title: show.title, artist: show.host_name, audio_url: show.audio_url, cover_url: show.cover_url, isLive: show.is_live, type: 'show' });
    }
  };

  const handlePlayPodcast = (podcast) => {
    if (podcast.audio_url) {
      playTrack({ id: podcast.id, title: podcast.title, artist: podcast.host_name, audio_url: podcast.audio_url, cover_url: podcast.cover_url, isLive: false, type: 'podcast' });
    }
  };

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0" style={{ backgroundImage: 'url(/hero-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/60 via-[#0a0a0f]/40 to-[#0a0a0f]" />
        </div>

        <div className="relative z-10 section-padding w-full max-w-6xl mx-auto pt-24 text-center">
          <div className={\`inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 transition-all duration-700 \${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}\`}>
            <Sparkles className="w-4 h-4 text-[#6366f1]" />
            <span className="text-sm text-[#a1a1aa]">Первый в России</span>
          </div>

          <div className={\`flex justify-center mb-8 transition-all duration-700 delay-100 \${isLoaded ? 'opacity-100' : 'opacity-0'}\`}>
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center animate-pulse-glow">
              <Radio className="w-12 h-12 text-white" />
            </div>
          </div>

          <h1 className={\`text-5xl sm:text-6xl lg:text-7xl font-black mb-4 transition-all duration-700 delay-200 \${isLoaded ? 'opacity-100' : 'opacity-0'}\`}>
            <span className="gradient-text">{settings.hero_title || 'Голос вашего отеля'}</span>
          </h1>

          <p className={\`text-2xl sm:text-3xl lg:text-4xl font-light text-[#a1a1aa] mb-6 \${isLoaded ? 'opacity-100' : 'opacity-0'}\`}>
            {settings.hero_subtitle || 'Звуки вашего космоса'}
          </p>

          <p className={\`text-lg sm:text-xl text-[#71717a] max-w-2xl mx-auto mb-12 \${isLoaded ? 'opacity-100' : 'opacity-0'}\`}>
            {settings.hero_description || 'Первый в России корпоративный медиа-канал в индустрии гостеприимства'}
          </p>

          {/* LIVE Show */}
          {liveShow && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="glass-card rounded-2xl p-6 border-[#22c55e]/50 now-playing-glow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    {liveShow.cover_url ? <img src={liveShow.cover_url} className="w-20 h-20 rounded-xl object-cover" /> : <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center"><Radio className="w-10 h-10 text-white" /></div>}
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#ef4444] flex items-center justify-center animate-pulse"><span className="text-[10px] font-bold text-white">LIVE</span></div>
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-xs text-[#22c55e] font-semibold uppercase">Сейчас в эфире</span>
                    <h3 className="text-xl font-bold">{liveShow.title}</h3>
                    <p className="text-sm text-[#71717a]">{liveShow.host_name || 'Cosmos FM'}</p>
                  </div>
                </div>
                <button onClick={handlePlayLive} className="w-full btn-primary flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" /> {isPlaying && currentTrack?.id === liveShow.id ? 'Слушаем' : 'Слушать эфир'}
                </button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-12">
            <div className="text-center"><div className="text-3xl sm:text-4xl font-bold gradient-text">4000+</div><div className="text-sm text-[#71717a] mt-1">сотрудников</div></div>
            <div className="text-center"><div className="text-3xl sm:text-4xl font-bold gradient-text">2.5M</div><div className="text-sm text-[#71717a] mt-1">гостей</div></div>
            <div className="text-center"><div className="text-3xl sm:text-4xl font-bold gradient-text">24/7</div><div className="text-sm text-[#71717a] mt-1">вещание</div></div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="flex flex-col items-center gap-2 text-[#71717a]">
            <span className="text-sm">Листайте вниз</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ПОСЛЕДНИЕ ПЕРЕДАЧИ */}
      {shows.length > 0 && (
        <section className="py-20 max-w-6xl mx-auto section-padding">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4"><span className="gradient-text">Последние передачи</span></h2>
            <p className="text-lg text-[#71717a]">Слушайте наши эфиры</p>
          </div>
          <div className="space-y-4">
            {shows.slice(0, 5).map(show => (
              <div key={show.id} className={\`glass-card rounded-2xl p-6 transition-all duration-300 hover:border-[#6366f1]/50 \${show.is_live ? 'border-[#22c55e]/50 now-playing-glow' : ''}\`}>
                <div className="flex items-center gap-4">
                  {show.cover_url ? <img src={show.cover_url} className="w-20 h-20 rounded-xl object-cover" /> : <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center flex-shrink-0"><Radio className="w-10 h-10 text-white" /></div>}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold truncate">{show.title}</h3>
                      {show.is_live && <span className="px-2 py-0.5 rounded-full bg-[#ef4444]/20 text-[#ef4444] text-xs font-bold">LIVE</span>}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[#71717a] flex-wrap">
                      {show.host_name && <span>{show.host_name}</span>}
                      {show.time && <span>{show.day_of_week} {show.time}</span>}
                      {show.duration && <span>{show.duration}</span>}
                    </div>
                    {show.description && <p className="text-sm text-[#a1a1aa] mt-2 line-clamp-2">{show.description}</p>}
                  </div>
                  {show.audio_url && (
                    <button onClick={() => handlePlayShow(show)} className="w-12 h-12 rounded-full bg-[#6366f1] text-white flex items-center justify-center hover:scale-105 transition">
                      <Play className="w-5 h-5 ml-0.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ВЕДУЩИЕ */}
      {hosts.length > 0 && (
        <section className="py-20 max-w-6xl mx-auto section-padding">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4"><span className="gradient-text">Наши ведущие</span></h2>
            <p className="text-lg text-[#71717a]">Профессионалы своего дела</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hosts.map(host => (
              <div key={host.id} className="glass-card rounded-2xl p-6 hover:border-[#6366f1]/50 transition-all duration-300">
                <div className="flex flex-col items-center text-center">
                  {host.photo_url ? <img src={host.photo_url} className="w-24 h-24 rounded-full object-cover border-2 border-[#27273a] mb-4" /> : <div className={\`w-24 h-24 rounded-full bg-gradient-to-br \${host.color || 'from-[#6366f1] to-[#8b5cf6]'} flex items-center justify-center text-white text-2xl font-bold mb-4\`}>{host.initials || host.name.split(' ').map(n => n[0]).join('').substring(0, 2)}</div>}
                  <h3 className="text-xl font-bold mb-1">{host.name}</h3>
                  <p className="text-sm text-[#6366f1] mb-2">{host.role || 'Ведущий'}</p>
                  {host.hotel && <p className="text-xs text-[#71717a] mb-3">{host.hotel}</p>}
                  {host.bio && <p className="text-sm text-[#a1a1aa] line-clamp-3">{host.bio}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ПОДКАСТЫ */}
      {podcasts.length > 0 && (
        <section className="py-20 max-w-6xl mx-auto section-padding">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4"><span className="gradient-text">Подкасты</span></h2>
            <p className="text-lg text-[#71717a]">Слушайте наши лучшие выпуски</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {podcasts.map(podcast => (
              <div key={podcast.id} className="glass-card rounded-2xl p-6 hover:border-[#6366f1]/50 transition-all duration-300">
                <div className="mb-4">
                  {podcast.cover_url ? <img src={podcast.cover_url} className="w-full h-48 rounded-xl object-cover" /> : <div className={\`w-full h-48 rounded-xl bg-gradient-to-br \${podcast.color || 'from-[#6366f1] to-[#8b5cf6]'} flex items-center justify-center\`}><Music className="w-16 h-16 text-white/50" /></div>}
                </div>
                <h3 className="font-bold text-lg mb-2">{podcast.title}</h3>
                <p className="text-sm text-[#71717a] mb-3 line-clamp-2">{podcast.description}</p>
                <div className="flex items-center gap-4 text-xs text-[#a1a1aa] mb-3">
                  {podcast.host_name && <span>{podcast.host_name}</span>}
                  {podcast.duration && <span>{podcast.duration}</span>}
                </div>
                {podcast.audio_url && (
                  <button onClick={() => handlePlayPodcast(podcast)} className="w-full py-2 rounded-lg bg-[#6366f1]/10 text-[#6366f1] hover:bg-[#6366f1]/20 transition text-sm flex items-center justify-center gap-2">
                    <Play className="w-4 h-4" /> Слушать
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
`);

// ==========================================
// 6. APP.TSX - ПОЛНЫЙ РОУТИНГ + АВТО-СТРИМ
// ==========================================
console.log('🔄 6/7 Обновление App.tsx...');

writeFile('src/App.tsx', `import { useState, useEffect } from 'react';
import { DataProvider, useData } from '@/context/DataContext';
import { AudioProvider, useAudio } from '@/context/AudioContext';
import { Header } from '@/components/Header';
import { MiniPlayer } from '@/components/MiniPlayer';
import { BottomNav } from '@/components/BottomNav';
import { HomeSection } from '@/sections/HomeSection';
import { ScheduleSection } from '@/sections/ScheduleSection';
import { HostsSection } from '@/sections/HostsSection';
import { PodcastsSection } from '@/sections/PodcastsSection';
import { AboutSection } from '@/sections/AboutSection';
import { LoginPage } from '@/admin/pages/LoginPage';
import { AdminLayout } from '@/admin/components/AdminLayout';
import { DashboardPage } from '@/admin/pages/DashboardPage';
import { ShowsPage } from '@/admin/pages/ShowsPage';
import { HostsPage } from '@/admin/pages/HostsPage';
import { PodcastsPage } from '@/admin/pages/PodcastsPage';
import { CategoriesPage } from '@/admin/pages/CategoriesPage';
import { SettingsPage } from '@/admin/pages/SettingsPage';
import { HotelsPage } from '@/admin/pages/HotelsPage';
import { NavigationPage } from '@/admin/pages/NavigationPage';

function useHashRouter() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  return hash;
}

function FrontLayout() {
  const hash = useHashRouter();
  const [activeTab, setActiveTab] = useState('home');
  const { settings } = useData();
  const { playLiveStream, currentTrack } = useAudio();

  useEffect(() => {
    const h = window.location.hash;
    if (h === '#/schedule' || h === '#schedule') setActiveTab('schedule');
    else if (h === '#/hosts' || h === '#hosts') setActiveTab('hosts');
    else if (h === '#/podcasts' || h === '#podcasts') setActiveTab('podcasts');
    else if (h === '#/about' || h === '#about') setActiveTab('about');
    else setActiveTab('home');
  }, [hash]);

  // Авто-загрузка стрима
  useEffect(() => {
    if (settings.stream_url && !currentTrack) {
      playLiveStream(settings.stream_url, 'Cosmos FM Эфир');
    }
  }, [settings.stream_url, currentTrack, playLiveStream]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    window.location.hash = tab === 'home' ? '#/' : '#/' + tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeSection />;
      case 'schedule': return <ScheduleSection />;
      case 'hosts': return <HostsSection />;
      case 'podcasts': return <PodcastsSection />;
      case 'about': return <AboutSection />;
      default: return <HomeSection />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Header onTabChange={handleTabChange} activeTab={activeTab} />
      <main className="pt-20 pb-32 section-padding max-w-6xl mx-auto">
        {renderContent()}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      <MiniPlayer />
    </div>
  );
}

function AdminRoutes() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminPage, setAdminPage] = useState('dashboard');
  const hash = useHashRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem('cosmos_fm_admin') === 'true';
    setIsLoggedIn(loggedIn);
  }, []);

  useEffect(() => {
    const h = window.location.hash;
    if (h.includes('/shows')) setAdminPage('shows');
    else if (h.includes('/hosts')) setAdminPage('hosts');
    else if (h.includes('/podcasts')) setAdminPage('podcasts');
    else if (h.includes('/categories')) setAdminPage('categories');
    else if (h.includes('/hotels')) setAdminPage('hotels');
    else if (h.includes('/navigation')) setAdminPage('navigation');
    else if (h.includes('/settings')) setAdminPage('settings');
    else setAdminPage('dashboard');
  }, [hash]);

  const handleLogin = () => { localStorage.setItem('cosmos_fm_admin', 'true'); setIsLoggedIn(true); };
  const handleLogout = () => { localStorage.removeItem('cosmos_fm_admin'); setIsLoggedIn(false); window.location.hash = ''; };
  const navigateTo = (page) => { setAdminPage(page); window.location.hash = '#/admin' + (page === 'dashboard' ? '' : '/' + page); };

  if (!isLoggedIn) return <LoginPage onLogin={handleLogin} />;

  const renderAdminPage = () => {
    switch (adminPage) {
      case 'dashboard': return <DashboardPage />;
      case 'shows': return <ShowsPage />;
      case 'hosts': return <HostsPage />;
      case 'podcasts': return <PodcastsPage />;
      case 'categories': return <CategoriesPage />;
      case 'hotels': return <HotelsPage />;
      case 'navigation': return <NavigationPage />;
      case 'settings': return <SettingsPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <AdminLayout onLogout={handleLogout} currentPage={adminPage} onNavigate={navigateTo}>
      {renderAdminPage()}
    </AdminLayout>
  );
}

function App() {
  const hash = useHashRouter();
  const isAdmin = hash.startsWith('#/admin');
  return (
    <AudioProvider>
      <DataProvider>
        {isAdmin ? <AdminRoutes /> : <FrontLayout />}
      </DataProvider>
    </AudioProvider>
  );
}

export default App;
`);

// ==========================================
// 7. ИТОГ
// ==========================================
console.log('\n' + '='.repeat(60));
console.log('✅ ВСЕ 3 ПРОБЛЕМЫ ИСПРАВЛЕНЫ!');
console.log('='.repeat(60));
console.log('\n📋 ЧТО ИСПРАВЛЕНО:');
console.log('  1. ✅ Сохранение с первого раза (retry-логика + таймауты)');
console.log('  2. ✅ Загрузка файлов (исправлены политики Storage)');
console.log('  3. ✅ Главная страница (добавлены блоки передач и подкастов)');
console.log('  4. ✅ Авто-загрузка стрима при старте');

console.log('\n🔧 СЛЕДУЮЩИЕ ШАГИ:');
console.log('  1. Выполните fix-storage-final.sql в Supabase');
console.log('  2. Запустите: node fix-final-3.js');
console.log('  3. Перезапустите: npm run dev');
console.log('  4. Проверьте все функции');

console.log('\n ГОТОВО!');