import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 === ПОЛНАЯ ИНТЕГРАЦИЯ SUPABASE ===\n');

const writeFile = (filePath, content) => {
  const fullPath = path.join(__dirname, filePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content.trim());
  console.log(`✅ ${filePath}`);
};

// ==========================================
// 1. ПОЛНЫЙ SQL ДЛЯ SUPABASE
// ==========================================
console.log('📊 1/8 Создание полного SQL скрипта...');

writeFile('supabase-complete.sql', `
-- ==========================================
-- COSMOS FM - ПОЛНАЯ СХЕМА БАЗЫ ДАННЫХ
-- ==========================================

-- 1. ОЧИСТКА СТАРЫХ ТАБЛИЦ
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.shows CASCADE;
DROP TABLE IF EXISTS public.hosts CASCADE;
DROP TABLE IF EXISTS public.podcasts CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.hotels CASCADE;
DROP TABLE IF EXISTS public.navigation_links CASCADE;
DROP TABLE IF EXISTS public.site_settings CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. ТАБЛИЦА ПРОФИЛЕЙ (ПОЛЬЗОВАТЕЛИ)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ТАБЛИЦА ОТЕЛЕЙ
CREATE TABLE public.hotels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ТАБЛИЦА ВЕДУЩИХ
CREATE TABLE public.hosts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  hotel_id UUID REFERENCES public.hotels(id) ON DELETE SET NULL,
  hotel TEXT,
  bio TEXT,
  photo_url TEXT,
  shows TEXT[],
  schedule TEXT,
  color TEXT,
  initials TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ТАБЛИЦА КАТЕГОРИЙ
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ТАБЛИЦА ПЕРЕДАЧ
CREATE TABLE public.shows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  host_id UUID REFERENCES public.hosts(id) ON DELETE SET NULL,
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

-- 7. ТАБЛИЦА ПОДКАСТОВ
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

-- 8. ТАБЛИЦА ЛАЙКОВ (отдельная для отслеживания кто лайкнул)
CREATE TABLE public.likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  podcast_id UUID REFERENCES public.podcasts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(podcast_id, user_id)
);

-- 9. ТАБЛИЦА НАВИГАЦИИ
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

-- 10. ТАБЛИЦА НАСТРОЕК САЙТА
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- RLS ПОЛИТИКИ (БЕЗОПАСНОСТЬ)
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Профили
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Отели
CREATE POLICY "Public read hotels" ON public.hotels FOR SELECT USING (true);
CREATE POLICY "Admin write hotels" ON public.hotels FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Ведущие
CREATE POLICY "Public read hosts" ON public.hosts FOR SELECT USING (true);
CREATE POLICY "Admin write hosts" ON public.hosts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Категории
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin write categories" ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Передачи
CREATE POLICY "Public read shows" ON public.shows FOR SELECT USING (true);
CREATE POLICY "Admin write shows" ON public.shows FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Подкасты
CREATE POLICY "Public read podcasts" ON public.podcasts FOR SELECT USING (true);
CREATE POLICY "Admin write podcasts" ON public.podcasts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Лайки
CREATE POLICY "Public read likes" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Навигация
CREATE POLICY "Public read navigation" ON public.navigation_links FOR SELECT USING (true);
CREATE POLICY "Admin write navigation" ON public.navigation_links FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Настройки
CREATE POLICY "Public read settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admin write settings" ON public.site_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ==========================================
-- STORAGE BUCKET ДЛЯ МЕДИА
-- ==========================================

-- Удаляем старый bucket если есть
DELETE FROM storage.objects WHERE bucket_id = 'media';
DELETE FROM storage.buckets WHERE id = 'media';

-- Создаем новый bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Политики для storage
CREATE POLICY "Public read media" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Authenticated users can upload media" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'media' AND auth.uid() IS NOT NULL
);
CREATE POLICY "Users can update own media" ON storage.objects FOR UPDATE USING (
  bucket_id = 'media' AND auth.uid() IS NOT NULL
);
CREATE POLICY "Admin can delete media" ON storage.objects FOR DELETE USING (
  bucket_id = 'media' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ==========================================
-- ТРИГГЕР АВТО-АДМИНА
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  IF user_count = 0 THEN
    INSERT INTO public.profiles (id, email, role) VALUES (NEW.id, NEW.email, 'admin');
  ELSE
    INSERT INTO public.profiles (id, email, role) VALUES (NEW.id, NEW.email, 'user');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
// НАЧАЛЬНЫЕ ДАННЫЕ
// ==========================================

-- Настройки сайта
INSERT INTO public.site_settings (key, value) VALUES
('site_title', 'Cosmos FM'),
('hero_title', 'Голос вашего отеля'),
('hero_subtitle', 'Звуки вашего космоса'),
('hero_description', 'Первый в России корпоративный медиа-канал в индустрии гостеприимства'),
('stream_url', ''),
('primary_color', '#6366f1'),
('contact_email', 'radio@cosmosfm.ru'),
('contact_phone', '+7 (999) 000-00-00')
ON CONFLICT (key) DO NOTHING;

-- Отели
INSERT INTO public.hotels (name, city) VALUES
('Cosmos Moscow', 'Москва'),
('Cosmos St. Petersburg', 'Санкт-Петербург'),
('Cosmos Sochi', 'Сочи')
ON CONFLICT DO NOTHING;

-- Категории
INSERT INTO public.categories (name, count, color) VALUES
('Музыка', 156, 'from-[#8b5cf6] to-[#6366f1]'),
('Новости', 48, 'from-[#3b82f6] to-[#06b6d4]'),
('Развлечения', 72, 'from-[#ef4444] to-[#f97316]'),
('Обучение', 34, 'from-[#ec4899] to-[#8b5cf6]')
ON CONFLICT DO NOTHING;

-- Ведущие
INSERT INTO public.hosts (name, role, hotel, bio, initials, color) VALUES
('Анна Петрова', 'Ведущая утреннего шоу', 'Cosmos Moscow', '5 лет в индустрии гостеприимства. Любит кофе и добрые утренние разговоры.', 'АП', 'from-[#f59e0b] to-[#f97316]'),
('Михаил Соколов', 'Музыкальный редактор', 'Cosmos St. Petersburg', 'DJ с 10-летним стажем. Подбирает идеальный саундтрек.', 'МС', 'from-[#8b5cf6] to-[#6366f1]'),
('Елена Волкова', 'Ведущая разговорных шоу', 'Cosmos Sochi', 'Журналист и сторителлер. Умеет найти интересную историю.', 'ЕВ', 'from-[#22c55e] to-[#14b8a6]')
ON CONFLICT DO NOTHING;

-- Передачи
INSERT INTO public.shows (title, description, host_name, time, duration, category, day_of_week, is_live) VALUES
('Утренний кофе', 'Начните день с бодрости!', 'Анна Петрова', '07:00', '3ч', 'Утреннее шоу', 'Пн', true),
('Новости отелей', 'Главные новости индустрии', 'Дмитрий Иванов', '10:00', '1ч', 'Новости', 'Пн', false),
('Обеденный микс', 'Лучшая музыка для обеда', 'Мария Козлова', '12:00', '2ч', 'Музыка', 'Пн', false),
('Кофе-брейк', 'Разговоры за чашкой кофе', 'Елена Волкова', '15:00', '1ч', 'Разговорное', 'Пн', false),
('Вечерний чилл', 'Расслабляющая музыка', 'Алексей Смирнов', '18:00', '3ч', 'Музыка', 'Пн', false)
ON CONFLICT DO NOTHING;

-- Подкасты
INSERT INTO public.podcasts (title, description, host_name, episodes, duration, category, likes, color) VALUES
('Истории отелей', 'Удивительные истории из жизни отелей', 'Наталья Лебедева', 24, '45 мин', 'Истории', 128, 'from-[#f59e0b] to-[#f97316]'),
('Секреты консьержа', 'Профессиональные советы', 'Виктор Соколов', 18, '30 мин', 'Обучение', 96, 'from-[#22c55e] to-[#14b8a6]'),
('Кухня шеф-повара', 'Кулинарные секреты', 'Павел Кузнецов', 32, '60 мин', 'Обучение', 215, 'from-[#ef4444] to-[#f97316]')
ON CONFLICT DO NOTHING;

-- Навигация
INSERT INTO public.navigation_links (label, url, type, order_index, is_active) VALUES
('Эфир', '#/', 'anchor', 1, true),
('Расписание', '#/schedule', 'anchor', 2, true),
('Ведущие', '#/hosts', 'anchor', 3, true),
('Подкасты', '#/podcasts', 'anchor', 4, true),
('О нас', '#/about', 'anchor', 5, true)
ON CONFLICT DO NOTHING;
`);

// ==========================================
// 2. LIB/SUPABASE.TS - ПОЛНЫЕ CRUD + ЗАГРУЗКА ФАЙЛОВ
// ==========================================
console.log('🔧 2/8 Обновление lib/supabase.ts...');

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

  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('media').getPublicUrl(filePath);
  return data.publicUrl;
}

export async function deleteFile(url: string): Promise<void> {
  if (!supabase || !url) return;
  
  // Извлекаем путь из URL
  const urlParts = url.split('/storage/v1/object/public/media/');
  if (urlParts.length < 2) return;
  
  const filePath = urlParts[1];
  const { error } = await supabase.storage.from('media').remove([filePath]);
  if (error) throw error;
}

// ========== SHOWS ==========
export async function getShows() {
  if (!supabase) throw new Error('Supabase not initialized');
  const { data, error } = await supabase.from('shows').select('*').order('time', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createShow(show) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('shows').insert([show]);
  if (error) throw error;
}

export async function updateShow(id, show) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('shows').update(show).eq('id', id);
  if (error) throw error;
}

export async function deleteShow(id) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('shows').delete().eq('id', id);
  if (error) throw error;
}

export function subscribeToShows(callback) {
  if (!supabase) return { unsubscribe: () => {} };
  return supabase.channel('shows')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'shows' },
      () => getShows().then(callback).catch(console.error))
    .subscribe();
}

// ========== HOSTS ==========
export async function getHosts() {
  if (!supabase) throw new Error('Supabase not initialized');
  const { data, error } = await supabase.from('hosts').select('*').order('name');
  if (error) throw error;
  return data || [];
}

export async function createHost(host) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('hosts').insert([host]);
  if (error) throw error;
}

export async function updateHost(id, host) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('hosts').update(host).eq('id', id);
  if (error) throw error;
}

export async function deleteHost(id) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('hosts').delete().eq('id', id);
  if (error) throw error;
}

export function subscribeToHosts(callback) {
  if (!supabase) return { unsubscribe: () => {} };
  return supabase.channel('hosts')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'hosts' },
      () => getHosts().then(callback).catch(console.error))
    .subscribe();
}

// ========== PODCASTS ==========
export async function getPodcasts() {
  if (!supabase) throw new Error('Supabase not initialized');
  const { data, error } = await supabase.from('podcasts').select('*').order('title');
  if (error) throw error;
  return data || [];
}

export async function createPodcast(podcast) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('podcasts').insert([podcast]);
  if (error) throw error;
}

export async function updatePodcast(id, podcast) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('podcasts').update(podcast).eq('id', id);
  if (error) throw error;
}

export async function deletePodcast(id) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('podcasts').delete().eq('id', id);
  if (error) throw error;
}

export function subscribeToPodcasts(callback) {
  if (!supabase) return { unsubscribe: () => {} };
  return supabase.channel('podcasts')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'podcasts' },
      () => getPodcasts().then(callback).catch(console.error))
    .subscribe();
}

// ========== CATEGORIES ==========
export async function getCategories() {
  if (!supabase) throw new Error('Supabase not initialized');
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) throw error;
  return data || [];
}

export async function createCategory(category) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('categories').insert([category]);
  if (error) throw error;
}

export async function updateCategory(id, category) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('categories').update(category).eq('id', id);
  if (error) throw error;
}

export async function deleteCategory(id) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

// ========== HOTELS ==========
export async function getHotels() {
  if (!supabase) throw new Error('Supabase not initialized');
  const { data, error } = await supabase.from('hotels').select('*').order('name');
  if (error) throw error;
  return data || [];
}

export async function createHotel(hotel) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('hotels').insert([hotel]);
  if (error) throw error;
}

export async function updateHotel(id, hotel) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('hotels').update(hotel).eq('id', id);
  if (error) throw error;
}

export async function deleteHotel(id) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('hotels').delete().eq('id', id);
  if (error) throw error;
}

// ========== NAVIGATION ==========
export async function getNavigationLinks() {
  if (!supabase) throw new Error('Supabase not initialized');
  const { data, error } = await supabase
    .from('navigation_links')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createNavigationLink(link) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('navigation_links').insert([link]);
  if (error) throw error;
}

export async function updateNavigationLink(id, link) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('navigation_links').update(link).eq('id', id);
  if (error) throw error;
}

export async function deleteNavigationLink(id) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('navigation_links').delete().eq('id', id);
  if (error) throw error;
}

// ========== SETTINGS ==========
export async function getSettings() {
  if (!supabase) throw new Error('Supabase not initialized');
  const { data, error } = await supabase.from('site_settings').select('*');
  if (error) throw error;
  const settings = {};
  data?.forEach(item => { settings[item.key] = item.value; });
  return settings;
}

export async function updateSetting(key, value) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('site_settings').upsert({ key, value }, { onConflict: 'key' });
  if (error) throw error;
}

// ========== LIKES ==========
export async function toggleLike(podcastId, userId) {
  if (!supabase) throw new Error('Supabase not initialized');
  
  // Проверяем есть ли уже лайк
  const { data: existingLike } = await supabase
    .from('likes')
    .select('id')
    .eq('podcast_id', podcastId)
    .eq('user_id', userId)
    .single();
  
  if (existingLike) {
    // Удаляем лайк
    await supabase.from('likes').delete().eq('id', existingLike.id);
    return false;
  } else {
    // Добавляем лайк
    await supabase.from('likes').insert([{ podcast_id: podcastId, user_id: userId }]);
    return true;
  }
}

export async function getLikeCount(podcastId) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { count } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('podcast_id', podcastId);
  return count || 0;
}

// ========== AUTH ==========
export async function signIn(email, password) {
  if (!supabase) throw new Error('Supabase not initialized');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(email, password) {
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
// 3. DATACONTEXT - ПОЛНАЯ ИНТЕГРАЦИЯ
// ==========================================
console.log('💾 3/8 Обновление DataContext...');

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
  subscribeToShows, subscribeToHosts, subscribeToPodcasts,
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
  contact_email: 'radio@cosmosfm.ru',
  contact_phone: '+7 (999) 000-00-00',
};

const DEMO_DATA = {
  shows: [
    { id: '1', title: 'Утренний кофе', description: 'Начните день с бодрости!', host_name: 'Анна Петрова', time: '07:00', duration: '3ч', category: 'Утреннее шоу', day_of_week: 'Пн', is_live: true },
    { id: '2', title: 'Новости отелей', description: 'Главные новости индустрии', host_name: 'Дмитрий Иванов', time: '10:00', duration: '1ч', category: 'Новости', day_of_week: 'Пн', is_live: false },
  ],
  hosts: [
    { id: '1', name: 'Анна Петрова', role: 'Ведущая утреннего шоу', hotel: 'Cosmos Moscow', bio: '5 лет в индустрии гостеприимства', initials: 'АП', color: 'from-[#f59e0b] to-[#f97316]' },
    { id: '2', name: 'Михаил Соколов', role: 'Музыкальный редактор', hotel: 'Cosmos St. Petersburg', bio: 'DJ с 10-летним стажем', initials: 'МС', color: 'from-[#8b5cf6] to-[#6366f1]' },
  ],
  podcasts: [
    { id: '1', title: 'Истории отелей', description: 'Удивительные истории из жизни отелей', host_name: 'Наталья Лебедева', episodes: 24, duration: '45 мин', category: 'Истории', likes: 128, color: 'from-[#f59e0b] to-[#f97316]' },
  ],
  categories: [
    { id: '1', name: 'Музыка', count: 156, color: 'from-[#8b5cf6] to-[#6366f1]' },
    { id: '2', name: 'Новости', count: 48, color: 'from-[#3b82f6] to-[#06b6d4]' },
  ],
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
  const [error, setError] = useState(null);
  const [useLocal, setUseLocal] = useState(false);

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
      setUseLocal(false);
      setError(null);
    } catch (err) {
      console.warn('Using demo data:', err.message);
      setUseLocal(true);
      setShows(DEMO_DATA.shows);
      setHosts(DEMO_DATA.hosts);
      setPodcasts(DEMO_DATA.podcasts);
      setCategories(DEMO_DATA.categories);
      setHotels(DEFAULT_HOTELS);
      setNavigationLinks(DEFAULT_NAV);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (useLocal || !supabase) return;
    const subs = [
      subscribeToShows(setShows),
      subscribeToHosts(setHosts),
      subscribeToPodcasts(setPodcasts),
    ];
    return () => { subs.forEach(sub => sub.unsubscribe()); };
  }, [useLocal]);

  const refresh = useCallback(() => { loadData(); }, [loadData]);

  // FILE UPLOAD
  const uploadMedia = async (file, type) => {
    try {
      const url = await uploadFile(file, type);
      return url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const deleteMedia = async (url) => {
    try {
      await deleteFile(url);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  // SETTINGS
  const updateSettings = async (newSettings) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (!useLocal && supabase) {
      for (const [key, value] of Object.entries(newSettings)) {
        if (value !== undefined) await updateSetting(key, value);
      }
    }
  };

  // SHOWS
  const addShow = async (show) => {
    if (useLocal || !supabase) {
      setShows([...shows, { ...show, id: Date.now().toString() }]);
    } else {
      await createShow(show);
      refresh();
    }
  };

  const editShow = async (id, show) => {
    if (useLocal || !supabase) {
      setShows(shows.map(s => s.id === id ? { ...s, ...show } : s));
    } else {
      await updateShow(id, show);
      refresh();
    }
  };

  const removeShow = async (id) => {
    if (useLocal || !supabase) {
      setShows(shows.filter(s => s.id !== id));
    } else {
      await deleteShow(id);
      refresh();
    }
  };

  // HOSTS
  const addHost = async (host) => {
    if (useLocal || !supabase) {
      setHosts([...hosts, { ...host, id: Date.now().toString() }]);
    } else {
      await createHost(host);
      refresh();
    }
  };

  const editHost = async (id, host) => {
    if (useLocal || !supabase) {
      setHosts(hosts.map(h => h.id === id ? { ...h, ...host } : h));
    } else {
      await updateHost(id, host);
      refresh();
    }
  };

  const removeHost = async (id) => {
    if (useLocal || !supabase) {
      setHosts(hosts.filter(h => h.id !== id));
    } else {
      await deleteHost(id);
      refresh();
    }
  };

  // PODCASTS
  const addPodcast = async (podcast) => {
    if (useLocal || !supabase) {
      setPodcasts([...podcasts, { ...podcast, id: Date.now().toString() }]);
    } else {
      await createPodcast(podcast);
      refresh();
    }
  };

  const editPodcast = async (id, podcast) => {
    if (useLocal || !supabase) {
      setPodcasts(podcasts.map(p => p.id === id ? { ...p, ...podcast } : p));
    } else {
      await updatePodcast(id, podcast);
      refresh();
    }
  };

  const removePodcast = async (id) => {
    if (useLocal || !supabase) {
      setPodcasts(podcasts.filter(p => p.id !== id));
    } else {
      await deletePodcast(id);
      refresh();
    }
  };

  // CATEGORIES
  const addCategory = async (category) => {
    if (useLocal || !supabase) {
      setCategories([...categories, { ...category, id: Date.now().toString() }]);
    } else {
      await createCategory(category);
      refresh();
    }
  };

  const editCategory = async (id, category) => {
    if (useLocal || !supabase) {
      setCategories(categories.map(c => c.id === id ? { ...c, ...category } : c));
    } else {
      await updateCategory(id, category);
      refresh();
    }
  };

  const removeCategory = async (id) => {
    if (useLocal || !supabase) {
      setCategories(categories.filter(c => c.id !== id));
    } else {
      await deleteCategory(id);
      refresh();
    }
  };

  // HOTELS
  const addHotel = async (hotel) => {
    if (useLocal || !supabase) {
      setHotels([...hotels, { ...hotel, id: Date.now().toString() }]);
    } else {
      await createHotel(hotel);
      refresh();
    }
  };

  const editHotel = async (id, hotel) => {
    if (useLocal || !supabase) {
      setHotels(hotels.map(h => h.id === id ? { ...h, ...hotel } : h));
    } else {
      await updateHotel(id, hotel);
      refresh();
    }
  };

  const removeHotel = async (id) => {
    if (useLocal || !supabase) {
      setHotels(hotels.filter(h => h.id !== id));
    } else {
      await deleteHotel(id);
      refresh();
    }
  };

  // NAVIGATION
  const addNavigationLink = async (link) => {
    if (useLocal || !supabase) {
      setNavigationLinks([...navigationLinks, { ...link, id: Date.now().toString() }]);
    } else {
      await createNavigationLink(link);
      refresh();
    }
  };

  const editNavigationLink = async (id, link) => {
    if (useLocal || !supabase) {
      setNavigationLinks(navigationLinks.map(l => l.id === id ? { ...l, ...link } : l));
    } else {
      await updateNavigationLink(id, link);
      refresh();
    }
  };

  const removeNavigationLink = async (id) => {
    if (useLocal || !supabase) {
      setNavigationLinks(navigationLinks.filter(l => l.id !== id));
    } else {
      await deleteNavigationLink(id);
      refresh();
    }
  };

  return (
    <DataContext.Provider value={{
      shows, hosts, podcasts, categories, hotels, navigationLinks, settings, loading, error, refresh,
      uploadMedia, deleteMedia,
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
// 4. IMAGEUPLOAD COMPONENT - ЗАГРУЗКА ФАЙЛОВ
// ==========================================
console.log('🖼️ 4/8 Обновление ImageUpload...');

writeFile('src/admin/components/ImageUpload.tsx', `
import { useState } from 'react';
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

    // Проверка размера (макс 10 МБ)
    if (file.size > 10 * 1024 * 1024) {
      setError('Файл слишком большой (макс 10 МБ)');
      return;
    }

    setUploading(true);
    try {
      const url = await uploadMedia(file, type);
      onChange(url);
      setError('');
    } catch (err) {
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
// 5. SHOWSPAGE - С ЗАГРУЗКОЙ ФАЙЛОВ
// ==========================================
console.log('📻 5/8 Обновление ShowsPage...');

writeFile('src/admin/pages/ShowsPage.tsx', `
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { ImageUpload } from '@/admin/components/ImageUpload';
import { Plus, Radio, Trash2, Edit, X } from 'lucide-react';

const DAYS_OF_WEEK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const CATEGORIES = ['Музыка', 'Новости', 'Развлечения', 'Обучение', 'Истории', 'Утреннее шоу', 'Разговорное'];

export function ShowsPage() {
  const { shows, addShow, editShow, removeShow } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!formData.title) {
      setMessage('❌ Укажите название передачи');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      if (editingItem) {
        await editShow(editingItem.id, formData);
        setMessage('✅ Передача обновлена!');
      } else {
        await addShow(formData);
        setMessage('✅ Передача создана!');
      }
      setTimeout(() => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({});
        setMessage('');
      }, 1000);
    } catch (error) {
      setMessage('❌ Ошибка: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
    setMessage('');
  };

  const handleDelete = async (id) => {
    if (confirm('Удалить передачу?')) {
      await removeShow(id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Radio className="w-6 h-6 text-[#6366f1]" />
          <h1 className="text-2xl font-bold">Передачи</h1>
          <span className="text-sm text-[#71717a]">({shows.length})</span>
        </div>
        <button onClick={() => { setEditingItem(null); setFormData({ day_of_week: 'Пн', time: '12:00', is_live: false }); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Добавить
        </button>
      </div>

      {message && (
        <div className={\`mb-4 p-3 rounded-xl \${message.includes('✅') ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#ef4444]/10 text-[#ef4444]'}\`}>
          {message}
        </div>
      )}

      <div className="space-y-3">
        {shows.length === 0 ? (
          <div className="text-center py-12 text-[#71717a]">
            <Radio className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Нет передач. Добавьте первую!</p>
          </div>
        ) : (
          shows.map(show => (
            <div key={show.id} className="glass-card rounded-xl p-4 flex items-center gap-4">
              {show.cover_url ? (
                <img src={show.cover_url} alt={show.title} className="w-16 h-16 rounded-lg object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
                  <Radio className="w-8 h-8 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold truncate">{show.title}</h3>
                  {show.is_live && <span className="px-2 py-0.5 rounded-full bg-[#ef4444]/20 text-[#ef4444] text-xs font-bold">LIVE</span>}
                </div>
                <p className="text-sm text-[#71717a] truncate">{show.description || 'Нет описания'}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-[#a1a1aa]">
                  <span>{show.day_of_week} {show.time}</span>
                  <span>•</span>
                  <span>{show.host_name || 'Ведущий не указан'}</span>
                  <span>•</span>
                  <span>{show.category || 'Без категории'}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(show)} className="p-2 text-[#6366f1] hover:bg-[#6366f1]/10 rounded-lg transition">
                  <Edit className="w-5 h-5" />
                </button>
                <button onClick={() => handleDelete(show.id)} className="p-2 text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg transition">
                  <Trash2 className="w-5 h-5" />
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
              <h2 className="text-xl font-bold">{editingItem ? 'Редактировать' : 'Новая'} передачу</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[#27273a] rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#a1a1aa] mb-2">Название *</label>
                <input type="text" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-[#a1a1aa] mb-2">Описание</label>
                <textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#a1a1aa] mb-2">День недели</label>
                  <select value={formData.day_of_week || 'Пн'} onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none">
                    {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#a1a1aa] mb-2">Время</label>
                  <input type="text" value={formData.time || ''} onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" placeholder="12:00" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#a1a1aa] mb-2">Ведущий</label>
                  <input type="text" value={formData.host_name || ''} onChange={(e) => setFormData({ ...formData, host_name: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-[#a1a1aa] mb-2">Длительность</label>
                  <input type="text" value={formData.duration || ''} onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" placeholder="2ч" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#a1a1aa] mb-2">Категория</label>
                <select value={formData.category || ''} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none">
                  <option value="">Выберите категорию</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <ImageUpload value={formData.cover_url || ''} onChange={(url) => setFormData({ ...formData, cover_url: url })} type="image" label="Обложка" />
              <ImageUpload value={formData.audio_url || ''} onChange={(url) => setFormData({ ...formData, audio_url: url })} type="audio" label="Аудио / Поток" />
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.is_live || false} onChange={(e) => setFormData({ ...formData, is_live: e.target.checked })} className="w-5 h-5 accent-[#6366f1]" />
                <span className="text-sm">Прямой эфир (LIVE)</span>
              </label>
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
// 6. HOSTSPAGE - С ЗАГРУЗКОЙ ФОТО
// ==========================================
console.log('👤 6/8 Обновление HostsPage...');

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
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!formData.name) {
      setMessage(' Укажите имя ведущего');
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
        setFormData({});
        setMessage('');
      }, 1000);
    } catch (error) {
      setMessage('❌ Ошибка: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
    setMessage('');
  };

  const handleDelete = async (id) => {
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
        <button onClick={() => { setEditingItem(null); setFormData({ color: DEFAULT_COLORS[0] }); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
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
                  {hotels.map(h => <option key={h.id} value={h.name}>{h.name} ({h.city})</option>)}
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
// 7. PODCASTSPAGE - С ЗАГРУЗКОЙ АУДИО И ОБЛОЖЕК
// ==========================================
console.log('🎙️ 7/8 Обновление PodcastsPage...');

writeFile('src/admin/pages/PodcastsPage.tsx', `
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { ImageUpload } from '@/admin/components/ImageUpload';
import { Plus, Music, Trash2, Edit, X } from 'lucide-react';

export function PodcastsPage() {
  const { podcasts, addPodcast, editPodcast, removePodcast } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!formData.title) {
      setMessage('❌ Укажите название подкаста');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      if (editingItem) {
        await editPodcast(editingItem.id, formData);
        setMessage('✅ Подкаст обновлён!');
      } else {
        await addPodcast(formData);
        setMessage('✅ Подкаст добавлен!');
      }
      setTimeout(() => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({});
        setMessage('');
      }, 1000);
    } catch (error) {
      setMessage('❌ Ошибка: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
    setMessage('');
  };

  const handleDelete = async (id) => {
    if (confirm('Удалить подкаст?')) {
      await removePodcast(id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Music className="w-6 h-6 text-[#6366f1]" />
          <h1 className="text-2xl font-bold">Подкасты</h1>
          <span className="text-sm text-[#71717a]">({podcasts.length})</span>
        </div>
        <button onClick={() => { setEditingItem(null); setFormData({}); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
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
        {podcasts.length === 0 ? (
          <div className="col-span-full text-center py-12 text-[#71717a]">
            <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Нет подкастов. Добавьте первый!</p>
          </div>
        ) : (
          podcasts.map(podcast => (
            <div key={podcast.id} className="glass-card rounded-xl p-4">
              <div className="flex items-start gap-3">
                {podcast.cover_url ? (
                  <img src={podcast.cover_url} alt={podcast.title} className="w-16 h-16 rounded-lg object-cover" />
                ) : (
                  <div className={\`w-16 h-16 rounded-lg bg-gradient-to-br \${podcast.color || 'from-[#6366f1] to-[#8b5cf6]'} flex items-center justify-center\`}>
                    <Music className="w-8 h-8 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate">{podcast.title}</h3>
                  <p className="text-sm text-[#71717a] truncate">{podcast.description || 'Нет описания'}</p>
                  <p className="text-xs text-[#a1a1aa] mt-1">{podcast.host_name || 'Автор не указан'}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => handleEdit(podcast)} className="flex-1 py-2 rounded-lg bg-[#6366f1]/10 text-[#6366f1] hover:bg-[#6366f1]/20 transition text-sm">
                  <Edit className="w-4 h-4 inline mr-1" /> Изменить
                </button>
                <button onClick={() => handleDelete(podcast.id)} className="py-2 px-3 rounded-lg bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20 transition">
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
              <h2 className="text-xl font-bold">{editingItem ? 'Редактировать' : 'Новый'} подкаст</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[#27273a] rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#a1a1aa] mb-2">Название *</label>
                <input type="text" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-[#a1a1aa] mb-2">Описание</label>
                <textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#a1a1aa] mb-2">Автор</label>
                  <input type="text" value={formData.host_name || ''} onChange={(e) => setFormData({ ...formData, host_name: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-[#a1a1aa] mb-2">Категория</label>
                  <input type="text" value={formData.category || ''} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#a1a1aa] mb-2">Эпизодов</label>
                  <input type="number" value={formData.episodes || 0} onChange={(e) => setFormData({ ...formData, episodes: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-[#a1a1aa] mb-2">Длительность</label>
                  <input type="text" value={formData.duration || ''} onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" placeholder="45 мин" />
                </div>
              </div>
              <ImageUpload value={formData.cover_url || ''} onChange={(url) => setFormData({ ...formData, cover_url: url })} type="image" label="Обложка" />
              <ImageUpload value={formData.audio_url || ''} onChange={(url) => setFormData({ ...formData, audio_url: url })} type="audio" label="Аудио файл" />
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
// 8. ИТОГ
// ==========================================
console.log('\n' + '='.repeat(60));
console.log('✅ ПОЛНАЯ ИНТЕГРАЦИЯ SUPABASE ЗАВЕРШЕНА!');
console.log('='.repeat(60));
console.log('\n📋 СОЗДАНО/ОБНОВЛЕНО 8 ФАЙЛОВ:');
console.log('  1. supabase-complete.sql - полная схема БД');
console.log('  2. src/lib/supabase.ts - CRUD + загрузка файлов');
console.log('  3. src/context/DataContext.tsx - полная интеграция');
console.log('  4. src/admin/components/ImageUpload.tsx - загрузка медиа');
console.log('  5. src/admin/pages/ShowsPage.tsx - с загрузкой файлов');
console.log('  6. src/admin/pages/HostsPage.tsx - с загрузкой фото');
console.log('  7. src/admin/pages/PodcastsPage.tsx - с загрузкой аудио');
console.log('  8. fix-complete.js - этот скрипт');

console.log('\n🎯 СЛЕДУЮЩИЕ ШАГИ:');
console.log('  1. Выполните SQL в Supabase:');
console.log('     → Откройте https://supabase.com/dashboard');
console.log('     → SQL Editor → New query');
console.log('     → Вставьте содержимое supabase-complete.sql');
console.log('     → Нажмите RUN');
console.log('');
console.log('  2. Перезапустите сервер:');
console.log('     npm run dev');
console.log('');
console.log('  3. Проверьте:');
console.log('     • Админка: http://localhost:5173/#/admin');
console.log('     • Загрузка файлов работает (картинки и аудио)');
console.log('     • Все данные сохраняются в Supabase');
console.log('     • Файлы загружаются в Storage bucket "media"');

console.log('\n🚀 ГОТОВО!');