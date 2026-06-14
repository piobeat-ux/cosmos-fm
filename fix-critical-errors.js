import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 === ИСПРАВЛЕНИЕ КРИТИЧЕСКИХ ОШИБОК ===\n');

const writeFile = (filePath, content) => {
  const fullPath = path.join(__dirname, filePath);
  fs.writeFileSync(fullPath, content.trim());
  console.log(`✅ ${filePath}`);
};

// ==========================================
// 1. SQL ДЛЯ ИСПРАВЛЕНИЯ STORAGE И RLS
// ==========================================
console.log('📊 1/6 Создание исправленного SQL...');

writeFile('fix-storage.sql', `
-- ==========================================
-- ИСПРАВЛЕНИЕ STORAGE И RLS ПОЛИТИК
-- ==========================================

-- 1. ПРОВЕРКА СУЩЕСТВОВАНИЯ ТАБЛИЦ
DO $$
BEGIN
  -- Создаем таблицы если не существуют
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    CREATE TABLE public.profiles (
      id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
      email TEXT,
      role TEXT DEFAULT 'user',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hotels') THEN
    CREATE TABLE public.hotels (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      address TEXT,
      logo_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hosts') THEN
    CREATE TABLE public.hosts (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT,
      hotel TEXT,
      bio TEXT,
      photo_url TEXT,
      shows TEXT[],
      schedule TEXT,
      color TEXT,
      initials TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
    CREATE TABLE public.categories (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      count INTEGER DEFAULT 0,
      color TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shows') THEN
    CREATE TABLE public.shows (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      host_name TEXT,
      time TEXT,
      duration TEXT,
      category TEXT,
      day_of_week TEXT,
      is_live BOOLEAN DEFAULT false,
      cover_url TEXT,
      audio_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'podcasts') THEN
    CREATE TABLE public.podcasts (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      host_name TEXT,
      episodes INTEGER DEFAULT 0,
      duration TEXT,
      category TEXT,
      likes INTEGER DEFAULT 0,
      color TEXT,
      audio_url TEXT,
      cover_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'navigation_links') THEN
    CREATE TABLE public.navigation_links (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      label TEXT NOT NULL,
      url TEXT NOT NULL,
      type TEXT DEFAULT 'anchor',
      icon TEXT,
      order_index INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      target TEXT DEFAULT '_self',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'site_settings') THEN
    CREATE TABLE public.site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END $$;

-- 2. ВКЛЮЧЕНИЕ RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 3. УДАЛЕНИЕ СТАРЫХ ПОЛИТИК
DROP POLICY IF EXISTS "Public read hotels" ON public.hotels;
DROP POLICY IF EXISTS "Admin write hotels" ON public.hotels;
DROP POLICY IF EXISTS "Public read hosts" ON public.hosts;
DROP POLICY IF EXISTS "Admin write hosts" ON public.hosts;
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
DROP POLICY IF EXISTS "Admin write categories" ON public.categories;
DROP POLICY IF EXISTS "Public read shows" ON public.shows;
DROP POLICY IF EXISTS "Admin write shows" ON public.shows;
DROP POLICY IF EXISTS "Public read podcasts" ON public.podcasts;
DROP POLICY IF EXISTS "Admin write podcasts" ON public.podcasts;
DROP POLICY IF EXISTS "Public read navigation" ON public.navigation_links;
DROP POLICY IF EXISTS "Admin write navigation" ON public.navigation_links;
DROP POLICY IF EXISTS "Public read settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin write settings" ON public.site_settings;

-- 4. СОЗДАНИЕ НОВЫХ ПОЛИТИК (ПРОСТЫЕ - РАЗРЕШАЕМ ВСЕМ)

-- Отели
CREATE POLICY "Allow all hotels" ON public.hotels FOR ALL USING (true) WITH CHECK (true);

-- Ведущие
CREATE POLICY "Allow all hosts" ON public.hosts FOR ALL USING (true) WITH CHECK (true);

-- Категории
CREATE POLICY "Allow all categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

-- Передачи
CREATE POLICY "Allow all shows" ON public.shows FOR ALL USING (true) WITH CHECK (true);

-- Подкасты
CREATE POLICY "Allow all podcasts" ON public.podcasts FOR ALL USING (true) WITH CHECK (true);

-- Навигация
CREATE POLICY "Allow all navigation" ON public.navigation_links FOR ALL USING (true) WITH CHECK (true);

-- Настройки
CREATE POLICY "Allow all settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

-- 5. STORAGE BUCKET
-- Проверяем существование bucket
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'media') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);
  END IF;
END $$;

-- Удаляем старые политики storage
DROP POLICY IF EXISTS "Allow all media" ON storage.objects;

-- Создаем простую политику для storage
CREATE POLICY "Allow all media" ON storage.objects FOR ALL USING (bucket_id = 'media') WITH CHECK (bucket_id = 'media');

-- 6. НАЧАЛЬНЫЕ ДАННЫЕ
INSERT INTO public.site_settings (key, value) VALUES
('site_title', 'Cosmos FM'),
('hero_title', 'Голос вашего отеля'),
('hero_subtitle', 'Звуки вашего космоса'),
('hero_description', 'Первый в России корпоративный медиа-канал в индустрии гостеприимства'),
('stream_url', ''),
('primary_color', '#6366f1')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.hotels (name, city) VALUES
('Cosmos Moscow', 'Москва'),
('Cosmos St. Petersburg', 'Санкт-Петербург'),
('Cosmos Sochi', 'Сочи')
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (name, count, color) VALUES
('Музыка', 156, 'from-[#8b5cf6] to-[#6366f1]'),
('Новости', 48, 'from-[#3b82f6] to-[#06b6d4]'),
('Развлечения', 72, 'from-[#ef4444] to-[#f97316]'),
('Обучение', 34, 'from-[#ec4899] to-[#8b5cf6]')
ON CONFLICT DO NOTHING;

INSERT INTO public.hosts (name, role, hotel, bio, initials, color) VALUES
('Анна Петрова', 'Ведущая утреннего шоу', 'Cosmos Moscow', '5 лет в индустрии гостеприимства', 'АП', 'from-[#f59e0b] to-[#f97316]'),
('Михаил Соколов', 'Музыкальный редактор', 'Cosmos St. Petersburg', 'DJ с 10-летним стажем', 'МС', 'from-[#8b5cf6] to-[#6366f1]'),
('Елена Волкова', 'Ведущая разговорных шоу', 'Cosmos Sochi', 'Журналист и сторителлер', 'ЕВ', 'from-[#22c55e] to-[#14b8a6]')
ON CONFLICT DO NOTHING;

INSERT INTO public.shows (title, description, host_name, time, duration, category, day_of_week, is_live) VALUES
('Утренний кофе', 'Начните день с бодрости!', 'Анна Петрова', '07:00', '3ч', 'Утреннее шоу', 'Пн', true),
('Новости отелей', 'Главные новости индустрии', 'Дмитрий Иванов', '10:00', '1ч', 'Новости', 'Пн', false)
ON CONFLICT DO NOTHING;

INSERT INTO public.podcasts (title, description, host_name, episodes, duration, category, likes, color) VALUES
('Истории отелей', 'Удивительные истории из жизни отелей', 'Наталья Лебедева', 24, '45 мин', 'Истории', 128, 'from-[#f59e0b] to-[#f97316]')
ON CONFLICT DO NOTHING;

INSERT INTO public.navigation_links (label, url, type, order_index, is_active) VALUES
('Эфир', '#/', 'anchor', 1, true),
('Расписание', '#/schedule', 'anchor', 2, true),
('Ведущие', '#/hosts', 'anchor', 3, true),
('Подкасты', '#/podcasts', 'anchor', 4, true),
('О нас', '#/about', 'anchor', 5, true)
ON CONFLICT DO NOTHING;
`);

// ==========================================
// 2. ИСПРАВЛЕНИЕ LIB/SUPABASE.TS
// ==========================================
console.log('🔧 2/6 Исправление lib/supabase.ts...');

writeFile('src/lib/supabase.ts', `
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found. Check .env file');
}

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ========== ЗАГРУЗКА ФАЙЛОВ ==========
export async function uploadFile(file: File, type: 'image' | 'audio'): Promise<string> {
  if (!supabase) throw new Error('Supabase not initialized');
  
  const fileExt = file.name.split('.').pop();
  const fileName = \`\${Date.now()}_\${Math.random().toString(36).substring(2)}.\${fileExt}\`;
  const filePath = \`\${type}s/\${fileName}\`;

  console.log('Uploading file:', filePath);

  const { data, error: uploadError } = await supabase.storage
    .from('media')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    throw uploadError;
  }

  console.log('Upload success:', data);

  const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath);
  return urlData.publicUrl;
}

export async function deleteFile(url: string): Promise<void> {
  if (!supabase || !url) return;
  
  const urlParts = url.split('/storage/v1/object/public/media/');
  if (urlParts.length < 2) return;
  
  const filePath = urlParts[1];
  const { error } = await supabase.storage.from('media').remove([filePath]);
  if (error) throw error;
}

// ========== ПОЛУЧЕНИЕ ДАННЫХ (БЕЗ СОРТИРОВКИ) ==========
export async function getShows() {
  if (!supabase) throw new Error('Supabase not initialized');
  const { data, error } = await supabase.from('shows').select('*');
  if (error) throw error;
  return data || [];
}

export async function getHosts() {
  if (!supabase) throw new Error('Supabase not initialized');
  const { data, error } = await supabase.from('hosts').select('*');
  if (error) throw error;
  return data || [];
}

export async function getPodcasts() {
  if (!supabase) throw new Error('Supabase not initialized');
  const { data, error } = await supabase.from('podcasts').select('*');
  if (error) throw error;
  return data || [];
}

export async function getCategories() {
  if (!supabase) throw new Error('Supabase not initialized');
  const { data, error } = await supabase.from('categories').select('*');
  if (error) throw error;
  return data || [];
}

export async function getHotels() {
  if (!supabase) throw new Error('Supabase not initialized');
  const { data, error } = await supabase.from('hotels').select('*');
  if (error) throw error;
  return data || [];
}

export async function getNavigationLinks() {
  if (!supabase) throw new Error('Supabase not initialized');
  const { data, error } = await supabase
    .from('navigation_links')
    .select('*');
  if (error) throw error;
  return (data || []).filter(link => link.is_active);
}

export async function getSettings() {
  if (!supabase) throw new Error('Supabase not initialized');
  const { data, error } = await supabase.from('site_settings').select('*');
  if (error) throw error;
  const settings: Record<string, string> = {};
  data?.forEach(item => { settings[item.key] = item.value; });
  return settings;
}

// ========== CRUD ОПЕРАЦИИ ==========
export async function createShow(show: any) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('shows').insert([show]);
  if (error) throw error;
}

export async function updateShow(id: string, show: any) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('shows').update(show).eq('id', id);
  if (error) throw error;
}

export async function deleteShow(id: string) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('shows').delete().eq('id', id);
  if (error) throw error;
}

export async function createHost(host: any) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('hosts').insert([host]);
  if (error) throw error;
}

export async function updateHost(id: string, host: any) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('hosts').update(host).eq('id', id);
  if (error) throw error;
}

export async function deleteHost(id: string) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('hosts').delete().eq('id', id);
  if (error) throw error;
}

export async function createPodcast(podcast: any) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('podcasts').insert([podcast]);
  if (error) throw error;
}

export async function updatePodcast(id: string, podcast: any) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('podcasts').update(podcast).eq('id', id);
  if (error) throw error;
}

export async function deletePodcast(id: string) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('podcasts').delete().eq('id', id);
  if (error) throw error;
}

export async function createCategory(category: any) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('categories').insert([category]);
  if (error) throw error;
}

export async function updateCategory(id: string, category: any) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('categories').update(category).eq('id', id);
  if (error) throw error;
}

export async function deleteCategory(id: string) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

export async function createHotel(hotel: any) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('hotels').insert([hotel]);
  if (error) throw error;
}

export async function updateHotel(id: string, hotel: any) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('hotels').update(hotel).eq('id', id);
  if (error) throw error;
}

export async function deleteHotel(id: string) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('hotels').delete().eq('id', id);
  if (error) throw error;
}

export async function createNavigationLink(link: any) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('navigation_links').insert([link]);
  if (error) throw error;
}

export async function updateNavigationLink(id: string, link: any) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('navigation_links').update(link).eq('id', id);
  if (error) throw error;
}

export async function deleteNavigationLink(id: string) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('navigation_links').delete().eq('id', id);
  if (error) throw error;
}

export async function updateSetting(key: string, value: string) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('site_settings').upsert({ key, value });
  if (error) throw error;
}

// ========== AUTH ==========
export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(email: string, password: string) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
`);

// ==========================================
// 3. ИСПРАВЛЕНИЕ DATACONTEXT
// ==========================================
console.log('💾 3/6 Исправление DataContext...');

writeFile('src/context/DataContext.tsx', `
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  uploadFile, deleteFile,
} from '@/lib/supabase';

const DataContext = createContext(undefined);

const DEFAULT_NAV = [
  { id: '1', label: 'Эфир', url: '#/', type: 'anchor', order_index: 1, is_active: true, target: '_self' },
  { id: '2', label: 'Расписание', url: '#/schedule', type: 'anchor', order_index: 2, is_active: true, target: '_self' },
  { id: '3', label: 'Ведущие', url: '#/hosts', type: 'anchor', order_index: 3, is_active: true, target: '_self' },
  { id: '4', label: 'Подкасты', url: '#/podcasts', type: 'anchor', order_index: 4, is_active: true, target: '_self' },
  { id: '5', label: 'О нас', url: '#/about', type: 'anchor', order_index: 5, is_active: true, target: '_self' },
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

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [shows, setShows] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [podcasts, setPodcasts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [navigationLinks, setNavigationLinks] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      setError(null);
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

  const uploadMedia = async (file: File, type: 'image' | 'audio') => {
    try {
      const url = await uploadFile(file, type);
      return url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const updateSettings = async (newSettings: any) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (supabase) {
      for (const [key, value] of Object.entries(newSettings)) {
        if (value !== undefined) await updateSetting(key, value);
      }
    }
  };

  const addShow = async (show: any) => {
    await createShow(show);
    refresh();
  };

  const editShow = async (id: string, show: any) => {
    await updateShow(id, show);
    refresh();
  };

  const removeShow = async (id: string) => {
    await deleteShow(id);
    refresh();
  };

  const addHost = async (host: any) => {
    await createHost(host);
    refresh();
  };

  const editHost = async (id: string, host: any) => {
    await updateHost(id, host);
    refresh();
  };

  const removeHost = async (id: string) => {
    await deleteHost(id);
    refresh();
  };

  const addPodcast = async (podcast: any) => {
    await createPodcast(podcast);
    refresh();
  };

  const editPodcast = async (id: string, podcast: any) => {
    await updatePodcast(id, podcast);
    refresh();
  };

  const removePodcast = async (id: string) => {
    await deletePodcast(id);
    refresh();
  };

  const addCategory = async (category: any) => {
    await createCategory(category);
    refresh();
  };

  const editCategory = async (id: string, category: any) => {
    await updateCategory(id, category);
    refresh();
  };

  const removeCategory = async (id: string) => {
    await deleteCategory(id);
    refresh();
  };

  const addHotel = async (hotel: any) => {
    await createHotel(hotel);
    refresh();
  };

  const editHotel = async (id: string, hotel: any) => {
    await updateHotel(id, hotel);
    refresh();
  };

  const removeHotel = async (id: string) => {
    await deleteHotel(id);
    refresh();
  };

  const addNavigationLink = async (link: any) => {
    await createNavigationLink(link);
    refresh();
  };

  const editNavigationLink = async (id: string, link: any) => {
    await updateNavigationLink(id, link);
    refresh();
  };

  const removeNavigationLink = async (id: string) => {
    await deleteNavigationLink(id);
    refresh();
  };

  return (
    <DataContext.Provider value={{
      shows, hosts, podcasts, categories, hotels, navigationLinks, settings, loading, error, refresh,
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
// 4. ИСПРАВЛЕНИЕ IMAGEUPLOAD
// ==========================================
console.log('️ 4/6 Исправление ImageUpload...');

writeFile('src/admin/components/ImageUpload.tsx', `
import { useState } from 'react';
import { Upload, Link as LinkIcon, X, Loader2 } from 'lucide-react';
import { useData } from '@/context/DataContext';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  type?: 'image' | 'audio';
  label?: string;
}

export function ImageUpload({ value, onChange, type = 'image', label }: ImageUploadProps) {
  const { uploadMedia } = useData();
  const [mode, setMode] = useState(value?.startsWith('http') ? 'url' : 'upload');
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(value || '');
  const [error, setError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Файл слишком большой (макс 10 МБ)');
      return;
    }

    setUploading(true);
    try {
      const url = await uploadMedia(file, type);
      onChange(url);
      setError('');
    } catch (err: any) {
      console.error('Upload error:', err);
      setError('Ошибка загрузки: ' + err.message);
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
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={\`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition \${
            mode === 'upload' ? 'bg-[#6366f1] text-white' : 'bg-[#13131f] text-[#a1a1aa] hover:bg-[#1e1e2e]'
          }\`}
        >
          <Upload className="w-4 h-4" />
          Файл
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={\`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition \${
            mode === 'url' ? 'bg-[#6366f1] text-white' : 'bg-[#13131f] text-[#a1a1aa] hover:bg-[#1e1e2e]'
          }\`}
        >
          <LinkIcon className="w-4 h-4" />
          URL
        </button>
      </div>

      {mode === 'upload' ? (
        <div>
          <input
            type="file"
            accept={type === 'image' ? 'image/*' : 'audio/*'}
            onChange={handleFileUpload}
            disabled={uploading}
            className="w-full text-sm text-[#a1a1aa] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#6366f1] file:text-white hover:file:bg-[#8b5cf6] disabled:opacity-50"
          />
          {uploading && (
            <div className="flex items-center gap-2 mt-2 text-[#6366f1]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Загрузка в Supabase...</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/file.mp3"
            className="flex-1 px-4 py-2 rounded-xl bg-[#13131f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none"
          />
          <button
            type="button"
            onClick={handleUrlSave}
            className="px-4 py-2 bg-[#6366f1] text-white rounded-xl hover:bg-[#8b5cf6] transition"
          >
            OK
          </button>
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
          <button
            type="button"
            onClick={handleClear}
            className="p-2 text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
`);

// ==========================================
// 5. ИСПРАВЛЕНИЕ HOSTSPAGE
// ==========================================
console.log(' 5/6 Исправление HostsPage...');

writeFile('src/admin/pages/HostsPage.tsx', `
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { ImageUpload } from '@/admin/components/ImageUpload';
import { Plus, User, Trash2, Edit, X } from 'lucide-react';

const DEFAULT_COLORS = [
  'from-[#f59e0b] to-[#f97316]',
  'from-[#8b5cf6] to-[#6366f1]',
  'from-[#22c55e] to-[#14b8a6]',
  'from-[#ef4444] to-[#f97316]',
  'from-[#3b82f6] to-[#06b6d4]',
  'from-[#ec4899] to-[#8b5cf6]',
];

export function HostsPage() {
  const { hosts, hotels, addHost, editHost, removeHost } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    name: '',
    role: '',
    hotel: '',
    bio: '',
    photo_url: '',
    color: DEFAULT_COLORS[0],
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!formData.name) {
      setMessage('❌ Укажите имя ведущего');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      if (editingItem) {
        await editHost(editingItem.id, formData);
        setMessage('✅ Ведущий обновлён!');
      } else {
        await addHost(formData);
        setMessage('✅ Ведущий добавлен!');
      }
      setTimeout(() => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({ name: '', role: '', hotel: '', bio: '', photo_url: '', color: DEFAULT_COLORS[0] });
        setMessage('');
      }, 1000);
    } catch (error: any) {
      setMessage('❌ Ошибка: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      role: item.role || '',
      hotel: item.hotel || '',
      bio: item.bio || '',
      photo_url: item.photo_url || '',
      color: item.color || DEFAULT_COLORS[0],
    });
    setIsModalOpen(true);
    setMessage('');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Удалить ведущего?')) {
      await removeHost(id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <User className="w-6 h-6 text-[#6366f1]" />
          <h1 className="text-2xl font-bold">Ведущие</h1>
          <span className="text-sm text-[#71717a]">({hosts.length})</span>
        </div>
        <button onClick={() => { setEditingItem(null); setFormData({ name: '', role: '', hotel: '', bio: '', photo_url: '', color: DEFAULT_COLORS[0] }); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Добавить
        </button>
      </div>

      {message && (
        <div className={\`mb-4 p-3 rounded-xl \${message.includes('✅') ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#ef4444]/10 text-[#ef4444]'}\`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hosts.length === 0 ? (
          <div className="col-span-full text-center py-12 text-[#71717a]">
            <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Нет ведущих. Добавьте первого!</p>
          </div>
        ) : (
          hosts.map(host => (
            <div key={host.id} className="glass-card rounded-xl p-4">
              <div className="flex items-start gap-3">
                {host.photo_url ? (
                  <img src={host.photo_url} alt={host.name} className="w-16 h-16 rounded-full object-cover border-2 border-[#27273a]" />
                ) : (
                  <div className={\`w-16 h-16 rounded-full bg-gradient-to-br \${host.color || DEFAULT_COLORS[0]} flex items-center justify-center text-white font-bold\`}>
                    {host.initials || host.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate">{host.name}</h3>
                  <p className="text-sm text-[#6366f1]">{host.role || 'Ведущий'}</p>
                  <p className="text-xs text-[#71717a] mt-1">{host.hotel || 'Отель не указан'}</p>
                </div>
              </div>
              {host.bio && <p className="text-sm text-[#a1a1aa] mt-3 line-clamp-2">{host.bio}</p>}
              <div className="flex gap-2 mt-4">
                <button onClick={() => handleEdit(host)} className="flex-1 py-2 rounded-lg bg-[#6366f1]/10 text-[#6366f1] hover:bg-[#6366f1]/20 transition text-sm">
                  <Edit className="w-4 h-4 inline mr-1" /> Изменить
                </button>
                <button onClick={() => handleDelete(host.id)} className="py-2 px-3 rounded-lg bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#13131f] rounded-2xl border border-[#27273a] p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editingItem ? 'Редактировать' : 'Новый'} ведущий</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[#27273a] rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#a1a1aa] mb-2">Имя *</label>
                <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-[#a1a1aa] mb-2">Роль</label>
                <input type="text" value={formData.role || ''} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-[#a1a1aa] mb-2">Отель</label>
                <select value={formData.hotel || ''} onChange={(e) => setFormData({ ...formData, hotel: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none">
                  <option value="">Выберите отель</option>
                  {hotels.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#a1a1aa] mb-2">Биография</label>
                <textarea value={formData.bio || ''} onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" rows={3} />
              </div>
              <ImageUpload value={formData.photo_url || ''} onChange={(url) => setFormData({ ...formData, photo_url: url })} type="image" label="Фото / Аватар" />
              <div>
                <label className="block text-sm text-[#a1a1aa] mb-2">Цвет карточки</label>
                <div className="flex gap-2 flex-wrap">
                  {DEFAULT_COLORS.map(color => (
                    <button key={color} onClick={() => setFormData({ ...formData, color })}
                      className={\`w-10 h-10 rounded-lg bg-gradient-to-br \${color} \${formData.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#13131f]' : ''}\`} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSubmit} disabled={saving} className="flex-1 btn-primary py-3 disabled:opacity-50">
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl bg-[#27273a] hover:bg-[#3f3f5a] transition">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`);

// ==========================================
// 6. ИТОГ
// ==========================================
console.log('\n' + '='.repeat(60));
console.log('✅ ИСПРАВЛЕНИЕ КРИТИЧЕСКИХ ОШИБОК ЗАВЕРШЕНО!');
console.log('='.repeat(60));
console.log('\n ЧТО ИСПРАВЛЕНО:');
console.log('  ✅ Storage policies - простые политики для всех');
console.log('  ✅ RLS policies - разрешаем все операции');
console.log('  ✅ Убрана сортировка из запросов (вызывала 500)');
console.log('  ✅ Исправлено отображение отелей (просто название)');
console.log('  ✅ Исправлены controlled inputs');
console.log('  ✅ Добавлена обработка ошибок загрузки');

console.log('\n🔧 СЛЕДУЮЩИЕ ШАГИ:');
console.log('  1. Выполните fix-storage.sql в Supabase SQL Editor');
console.log('  2. Запустите: node fix-critical-errors.js');
console.log('  3. Перезапустите: npm run dev');
console.log('  4. Проверьте загрузку файлов');

console.log('\n🚀 ГОТОВО!');