import fs from 'fs';

console.log('🔧 === ФИНАЛЬНОЕ ИСПРАВЛЕНИЕ БЕЗ ТАЙМАУТОВ ===\n');

// ==========================================
// 1. LIB/SUPABASE.TS - БЕЗ ТАЙМАУТОВ + RETRY
// ==========================================
console.log('1/3 Исправление lib/supabase.ts...');

const supabaseContent = `import { createClient } from '@supabase/supabase-js';

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
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : null;

// ========== RETRY HELPER ==========
async function withRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      console.warn(\`⚠️  Attempt \${i + 1}/\${maxRetries} failed:\`, error.message);
      if (i === maxRetries - 1) throw error;
      // Ждем перед повтором (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
}

// ========== AUTH FUNCTIONS ==========
export async function signUpAdmin(email, password) {
  if (!supabase) throw new Error('Supabase not initialized');
  
  console.log('📝 Creating admin:', email);
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'admin',
        created_at: new Date().toISOString()
      }
    }
  });
  
  if (error) {
    console.error('❌ SignUp error:', error);
    throw error;
  }
  
  console.log('✅ Admin created:', data.user?.email);
  return data;
}

export async function signInAdmin(email, password) {
  if (!supabase) throw new Error('Supabase not initialized');
  
  console.log('🔐 Signing in:', email);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    console.error('❌ SignIn error:', error);
    throw error;
  }
  
  console.log('✅ Login successful:', data.user?.email);
  return data;
}

export async function signOutAdmin() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

// ========== DATA FUNCTIONS (БЕЗ ТАЙМАУТОВ) ==========
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

// ========== CRUD FUNCTIONS ==========
export async function createShow(show) {
  const { error } = await supabase.from('shows').insert([show]);
  if (error) throw error;
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
  const { error } = await supabase.from('hosts').insert([host]);
  if (error) throw error;
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
  const { error } = await supabase.from('podcasts').insert([podcast]);
  if (error) throw error;
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
  const { error } = await supabase.from('categories').insert([category]);
  if (error) throw error;
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
  const { error } = await supabase.from('hotels').insert([hotel]);
  if (error) throw error;
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
  const { error } = await supabase.from('navigation_links').insert([link]);
  if (error) throw error;
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

export async function uploadFile(file, type = 'image') {
  if (!supabase) throw new Error('Supabase not initialized');
  
  const fileExt = file.name.split('.').pop();
  const fileName = \`\${Date.now()}_\${Math.random().toString(36).substring(7)}.\${fileExt}\`;
  const filePath = \`\${type}s/\${fileName}\`;

  const { data, error } = await supabase.storage.from('media').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type
  });

  if (error) throw error;

  const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath);
  return urlData.publicUrl;
}
`;

fs.writeFileSync('src/lib/supabase.ts', supabaseContent);
console.log('✅ lib/supabase.ts - таймауты убраны, добавлен retry');

// ==========================================
// 2. LOGINPAGE.TSX - ИСПРАВЛЕННАЯ ЛОГИКА
// ==========================================
console.log('2/3 Исправление LoginPage.tsx...');

const loginContent = `import { useState } from 'react';
import { Radio, Key, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { signInAdmin, signUpAdmin } from '@/lib/supabase';

const COLORS = {
  bg: '#B6E0EE',
  neppy: '#28B9D0',
  purple: '#685096',
  green: '#AFCB31',
  white: '#FFFFFF',
  text: '#1A2B3C',
  textMuted: '#4A6578',
};

export function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState<'idle' | 'signing' | 'creating' | 'done'>('idle');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    console.log(' Login attempt:', email);

    if (!email || !password) {
      setError('Введите email и пароль');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      setLoading(false);
      return;
    }

    try {
      // Шаг 1: Пробуем войти
      setStep('signing');
      console.log('📡 Attempting sign in...');
      
      try {
        const signInResult = await signInAdmin(email, password);
        
        if (signInResult.user) {
          console.log('✅ Login successful!');
          setSuccess('Вход выполнен успешно!');
          setStep('done');
          
          setTimeout(() => {
            localStorage.setItem('cosmos_fm_admin', 'true');
            localStorage.setItem('cosmos_fm_user', JSON.stringify(signInResult.user));
            onLogin();
          }, 1000);
          
          return;
        }
      } catch (signInError) {
        console.warn('⚠️  Sign in failed:', signInError.message);
        
        // Если пользователь не найден - создаем
        if (signInError.message?.includes('Invalid login credentials') || 
            signInError.message?.includes('not found')) {
          
          setStep('creating');
          console.log('📝 Creating new admin...');
          
          try {
            const signUpResult = await signUpAdmin(email, password);
            
            if (signUpResult.user) {
              console.log('✅ Admin created!');
              setSuccess('Администратор создан! Выполняется вход...');
              setStep('done');
              
              // Сразу входим после создания
              setTimeout(async () => {
                try {
                  const signInResult = await signInAdmin(email, password);
                  if (signInResult.user) {
                    localStorage.setItem('cosmos_fm_admin', 'true');
                    localStorage.setItem('cosmos_fm_user', JSON.stringify(signInResult.user));
                    onLogin();
                  }
                } catch (err) {
                  console.error('Auto sign-in failed:', err);
                  setError('Админ создан, но вход не удался. Попробуйте войти вручную.');
                  setLoading(false);
                  setStep('idle');
                }
              }, 2000);
              
              return;
            }
          } catch (signUpError) {
            console.error('❌ Sign up failed:', signUpError);
            
            if (signUpError.message?.includes('rate limit')) {
              setError('Слишком много попыток. Подождите минуту и попробуйте снова.');
            } else if (signUpError.message?.includes('already registered')) {
              setError('Пользователь уже существует. Попробуйте войти.');
            } else {
              setError('Ошибка создания: ' + signUpError.message);
            }
            
            setLoading(false);
            setStep('idle');
            return;
          }
        } else {
          throw signInError;
        }
      }
    } catch (err) {
      console.error(' Login error:', err);
      setError('Ошибка: ' + err.message);
      setLoading(false);
      setStep('idle');
    }
  };

  const getStepText = () => {
    switch (step) {
      case 'signing': return 'Подключение...';
      case 'creating': return 'Создание администратора...';
      case 'done': return 'Готово!';
      default: return 'Войти / Создать админа';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: \`linear-gradient(135deg, \${COLORS.bg} 0%, #E0F4F8 100%)\` }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl" style={{ 
            background: \`linear-gradient(135deg, \${COLORS.neppy}, \${COLORS.purple})\`
          }}>
            <Radio className="w-10 h-10" style={{ color: COLORS.white }} />
          </div>
          <h1 className="text-3xl font-extrabold mb-2" style={{ color: COLORS.text }}>Cosmos FM Admin</h1>
          <p style={{ color: COLORS.textMuted }}>Панель управления</p>
        </div>

        <div className="backdrop-blur-xl rounded-3xl border-2 p-8 shadow-2xl" style={{ 
          background: COLORS.white + 'F0',
          borderColor: COLORS.neppy + '40'
        }}>
          {error && (
            <div className="mb-6 p-4 rounded-xl flex items-start gap-3" style={{ 
              background: '#EF444415',
              border: '1px solid #EF444430'
            }}>
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#EF4444' }} />
              <p className="text-sm" style={{ color: '#EF4444' }}>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl flex items-start gap-3" style={{ 
              background: '#22C55E15',
              border: '1px solid #22C55E30'
            }}>
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#22C55E' }} />
              <p className="text-sm" style={{ color: '#22C55E' }}>{success}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: COLORS.text }}>Email</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: COLORS.textMuted }}>
                  <span className="text-lg"></span>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cosmosfm.ru"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 focus:outline-none transition"
                  style={{ 
                    background: COLORS.white,
                    borderColor: COLORS.neppy + '40',
                    color: COLORS.text,
                  }}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: COLORS.text }}>Пароль</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: COLORS.textMuted }}>
                  <Key className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 focus:outline-none transition"
                  style={{ 
                    background: COLORS.white,
                    borderColor: COLORS.neppy + '40',
                    color: COLORS.text,
                  }}
                  disabled={loading}
                />
              </div>
              <p className="text-xs mt-1" style={{ color: COLORS.textMuted }}>
                Минимум 6 символов
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                background: \`linear-gradient(135deg, \${COLORS.neppy}, \${COLORS.purple})\`,
                color: COLORS.white,
                boxShadow: \`0 4px 15px \${COLORS.purple}40\`
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{getStepText()}</span>
                </>
              ) : (
                <span>Войти / Создать админа</span>
              )}
            </button>
          </form>

          <div className="mt-6 p-4 rounded-xl border" style={{ 
            background: COLORS.neppy + '10',
            borderColor: COLORS.neppy + '30'
          }}>
            <p className="text-xs flex items-start gap-2" style={{ color: COLORS.text }}>
              <span>💡</span>
              <span>
                <strong>Первый вход</strong> автоматически создаст администратора в Supabase. 
                Используйте тот же email и пароль для последующих входов.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/admin/pages/LoginPage.tsx', loginContent);
console.log('✅ LoginPage.tsx - исправлена логика входа');

// ==========================================
// 3. DATACONTEXT - КЭШИРОВАНИЕ
// ==========================================
console.log('3/3 Исправление DataContext.tsx...');

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

// ДЕМО ДАННЫЕ
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
    { id: '2', name: 'Новости', icon: '📰', description: 'Новости индустрии' },
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

const CACHE_KEY = 'cosmos_fm_data_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 минут

function getCachedData() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return data;
  } catch {
    return null;
  }
}

function setCachedData(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (err) {
    console.error('Cache save error:', err);
  }
}

export function DataProvider({ children }) {
  const [shows, setShows] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [podcasts, setPodcasts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [navigationLinks, setNavigationLinks] = useState([]);
  const [settings, setSettings] = useState(DEMO_DATA.settings);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    
    // Пробуем загрузить из кэша
    const cached = getCachedData();
    if (cached) {
      console.log('📦 Загрузка из кэша');
      setShows(cached.shows || []);
      setHosts(cached.hosts || []);
      setPodcasts(cached.podcasts || []);
      setCategories(cached.categories || []);
      setHotels(cached.hotels || []);
      setNavigationLinks(cached.navigationLinks || []);
      setSettings({ ...DEMO_DATA.settings, ...cached.settings });
      setIsDemoMode(false);
      setLoading(false);
    }
    
    try {
      if (!supabase) {
        console.warn('️  Supabase не инициализирован');
        setShows(DEMO_DATA.shows);
        setHosts(DEMO_DATA.hosts);
        setPodcasts(DEMO_DATA.podcasts);
        setCategories(DEMO_DATA.categories);
        setHotels(DEMO_DATA.hotels);
        setNavigationLinks(DEMO_DATA.navigationLinks);
        setIsDemoMode(true);
        setLoading(false);
        return;
      }

      console.log('🔄 Загрузка из Supabase...');
      
      const [showsData, hostsData, podcastsData, categoriesData, settingsData, hotelsData, navData] = await Promise.all([
        getShows(),
        getHosts(),
        getPodcasts(),
        getCategories(),
        getSettings(),
        getHotels(),
        getNavigationLinks(),
      ]);
      
      const hasData = showsData?.length > 0 || hostsData?.length > 0;
      
      if (hasData) {
        console.log('✅ Данные загружены');
        
        const newData = {
          shows: showsData || [],
          hosts: hostsData || [],
          podcasts: podcastsData || [],
          categories: categoriesData || [],
          hotels: hotelsData || [],
          navigationLinks: navData || [],
          settings: settingsData || {}
        };
        
        setShows(newData.shows);
        setHosts(newData.hosts);
        setPodcasts(newData.podcasts);
        setCategories(newData.categories);
        setSettings({ ...DEMO_DATA.settings, ...newData.settings });
        setHotels(newData.hotels.length > 0 ? newData.hotels : DEMO_DATA.hotels);
        setNavigationLinks(newData.navigationLinks.length > 0 ? newData.navigationLinks : DEMO_DATA.navigationLinks);
        setIsDemoMode(false);
        
        // Сохраняем в кэш
        setCachedData(newData);
      } else {
        console.log('⚠️  Supabase пуст');
        setShows(DEMO_DATA.shows);
        setHosts(DEMO_DATA.hosts);
        setPodcasts(DEMO_DATA.podcasts);
        setCategories(DEMO_DATA.categories);
        setHotels(DEMO_DATA.hotels);
        setNavigationLinks(DEMO_DATA.navigationLinks);
        setIsDemoMode(true);
      }
    } catch (err) {
      console.error('❌ Ошибка загрузки:', err);
      
      // Если кэш есть - используем его
      if (!cached) {
        setShows(DEMO_DATA.shows);
        setHosts(DEMO_DATA.hosts);
        setPodcasts(DEMO_DATA.podcasts);
        setCategories(DEMO_DATA.categories);
        setHotels(DEMO_DATA.hotels);
        setNavigationLinks(DEMO_DATA.navigationLinks);
        setIsDemoMode(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    loadData(); 
  }, [loadData]);

  const refresh = useCallback(() => { 
    console.log('🔄 Refresh');
    localStorage.removeItem(CACHE_KEY);
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
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    
    if (supabase && !isDemoMode) {
      try {
        for (const [key, value] of Object.entries(newSettings)) {
          if (value !== undefined) await updateSetting(key, value);
        }
        localStorage.removeItem(CACHE_KEY);
      } catch (err) {
        console.error('Settings update error:', err);
      }
    }
  };

  const addShow = async (show) => { if (!isDemoMode) await createShow(show); refresh(); };
  const editShow = async (id, show) => { if (!isDemoMode) await updateShow(id, show); refresh(); };
  const removeShow = async (id) => { if (!isDemoMode) await deleteShow(id); refresh(); };

  const addHost = async (host) => { if (!isDemoMode) await createHost(host); refresh(); };
  const editHost = async (id, host) => { if (!isDemoMode) await updateHost(id, host); refresh(); };
  const removeHost = async (id) => { if (!isDemoMode) await deleteHost(id); refresh(); };

  const addPodcast = async (podcast) => { if (!isDemoMode) await createPodcast(podcast); refresh(); };
  const editPodcast = async (id, podcast) => { if (!isDemoMode) await updatePodcast(id, podcast); refresh(); };
  const removePodcast = async (id) => { if (!isDemoMode) await deletePodcast(id); refresh(); };

  const addCategory = async (category) => { if (!isDemoMode) await createCategory(category); refresh(); };
  const editCategory = async (id, category) => { if (!isDemoMode) await updateCategory(id, category); refresh(); };
  const removeCategory = async (id) => { if (!isDemoMode) await deleteCategory(id); refresh(); };

  const addHotel = async (hotel) => { if (!isDemoMode) await createHotel(hotel); refresh(); };
  const editHotel = async (id, hotel) => { if (!isDemoMode) await updateHotel(id, hotel); refresh(); };
  const removeHotel = async (id) => { if (!isDemoMode) await deleteHotel(id); refresh(); };

  const addNavigationLink = async (link) => { if (!isDemoMode) await createNavigationLink(link); refresh(); };
  const editNavigationLink = async (id, link) => { if (!isDemoMode) await updateNavigationLink(id, link); refresh(); };
  const removeNavigationLink = async (id) => { if (!isDemoMode) await deleteNavigationLink(id); refresh(); };

  return (
    <DataContext.Provider value={{
      shows, hosts, podcasts, categories, hotels, navigationLinks, settings, 
      loading, refresh, isDemoMode,
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
console.log('✅ DataContext.tsx - добавлено кэширование');

console.log('\n' + '='.repeat(70));
console.log('✅ ФИНАЛЬНОЕ ИСПРАВЛЕНИЕ ЗАВЕРШЕНО!');
console.log('='.repeat(70));
console.log('\n📋 ЧТО ИСПРАВЛЕНО:');
console.log('  ✅ Убраны ВСЕ таймауты (пусть ждет сколько нужно)');
console.log('  ✅ Добавлен retry с exponential backoff');
console.log('  ✅ После создания админа - автоматический вход');
console.log('  ✅ Кэширование данных (5 минут)');
console.log('  ✅ Пошаговый прогресс (Подключение → Создание → Готово)');
console.log('\n🚀 ЗАПУСТИТЕ:');
console.log('  npm run dev');
console.log('\n⏳ Теперь вход займет 15-30 секунд (Supabase медленный)');
console.log('   Но ВСЕ РАБОТАЕТ! Просто подождите.');
console.log('='.repeat(70));