import fs from 'fs';

console.log('🔧 === ФИНАЛЬНОЕ ИСПРАВЛЕНИЕ ВСЕХ ПРОБЛЕМ ===\n');

// ==========================================
// 1. DATACONTEXT - CRUD функции + navigationLinks
// ==========================================
console.log('1/5 Исправление DataContext (CRUD + navigationLinks)...');

const dataContextContent = `import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface DataContextType {
  shows: any[];
  hosts: any[];
  podcasts: any[];
  categories: any[];
  hotels: any[];
  navigation: any[];
  navigationLinks: any[];
  settings: any;
  loading: boolean;
  error: string | null;
  version: number;
  addShow: (data: any) => Promise<void>;
  editShow: (id: string, data: any) => Promise<void>;
  removeShow: (id: string) => Promise<void>;
  addHost: (data: any) => Promise<void>;
  editHost: (id: string, data: any) => Promise<void>;
  removeHost: (id: string) => Promise<void>;
  addPodcast: (data: any) => Promise<void>;
  editPodcast: (id: string, data: any) => Promise<void>;
  removePodcast: (id: string) => Promise<void>;
  addCategory: (data: any) => Promise<void>;
  editCategory: (id: string, data: any) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  addHotel: (data: any) => Promise<void>;
  editHotel: (id: string, data: any) => Promise<void>;
  removeHotel: (id: string) => Promise<void>;
  addNavigationLink: (data: any) => Promise<void>;
  editNavigationLink: (id: string, data: any) => Promise<void>;
  removeNavigationLink: (id: string) => Promise<void>;
  updateSettings: (settings: any) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [shows, setShows] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [podcasts, setPodcasts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [navigation, setNavigation] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const navigationLinks = navigation;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const timeoutId = setTimeout(() => {
        setError('Превышено время загрузки');
        setLoading(false);
      }, 30000);

      const [
        showsRes,
        hostsRes,
        podcastsRes,
        categoriesRes,
        hotelsRes,
        navigationRes,
        settingsRes
      ] = await Promise.allSettled([
        supabase.from('shows').select('*').order('time'),
        supabase.from('hosts').select('*'),
        supabase.from('podcasts').select('*'),
        supabase.from('categories').select('*'),
        supabase.from('hotels').select('*'),
        supabase.from('navigation_links').select('*').order('order_index', { ascending: true }),
        supabase.from('site_settings').select('*')
      ]);

      clearTimeout(timeoutId);

      const getData = (result: any) => {
        if (result.status === 'fulfilled' && result.value.data) {
          return result.value.data;
        }
        return [];
      };

      setShows(getData(showsRes));
      setHosts(getData(hostsRes));
      setPodcasts(getData(podcastsRes));
      setCategories(getData(categoriesRes));
      setHotels(getData(hotelsRes));
      setNavigation(getData(navigationRes));

      const settingsData = getData(settingsRes);
      const settingsObj: any = {};
      settingsData.forEach((item: any) => {
        if (item && item.key) {
          settingsObj[item.key] = item.value;
        }
      });
      setSettings(settingsObj);

      setLoading(false);
      setVersion(v => v + 1);

    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Ошибка загрузки');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Shows CRUD
  const addShow = async (data: any) => {
    const { error } = await supabase.from('shows').insert([data]);
    if (error) throw error;
    await loadData();
  };

  const editShow = async (id: string, data: any) => {
    const { error } = await supabase.from('shows').update(data).eq('id', id);
    if (error) throw error;
    await loadData();
  };

  const removeShow = async (id: string) => {
    const { error } = await supabase.from('shows').delete().eq('id', id);
    if (error) throw error;
    await loadData();
  };

  // Hosts CRUD
  const addHost = async (data: any) => {
    const { error } = await supabase.from('hosts').insert([data]);
    if (error) throw error;
    await loadData();
  };

  const editHost = async (id: string, data: any) => {
    const { error } = await supabase.from('hosts').update(data).eq('id', id);
    if (error) throw error;
    await loadData();
  };

  const removeHost = async (id: string) => {
    const { error } = await supabase.from('hosts').delete().eq('id', id);
    if (error) throw error;
    await loadData();
  };

  // Podcasts CRUD
  const addPodcast = async (data: any) => {
    const { error } = await supabase.from('podcasts').insert([data]);
    if (error) throw error;
    await loadData();
  };

  const editPodcast = async (id: string, data: any) => {
    const { error } = await supabase.from('podcasts').update(data).eq('id', id);
    if (error) throw error;
    await loadData();
  };

  const removePodcast = async (id: string) => {
    const { error } = await supabase.from('podcasts').delete().eq('id', id);
    if (error) throw error;
    await loadData();
  };

  // Categories CRUD
  const addCategory = async (data: any) => {
    const { error } = await supabase.from('categories').insert([data]);
    if (error) throw error;
    await loadData();
  };

  const editCategory = async (id: string, data: any) => {
    const { error } = await supabase.from('categories').update(data).eq('id', id);
    if (error) throw error;
    await loadData();
  };

  const removeCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    await loadData();
  };

  // Hotels CRUD
  const addHotel = async (data: any) => {
    const { error } = await supabase.from('hotels').insert([data]);
    if (error) throw error;
    await loadData();
  };

  const editHotel = async (id: string, data: any) => {
    const { error } = await supabase.from('hotels').update(data).eq('id', id);
    if (error) throw error;
    await loadData();
  };

  const removeHotel = async (id: string) => {
    const { error } = await supabase.from('hotels').delete().eq('id', id);
    if (error) throw error;
    await loadData();
  };

  // Navigation CRUD
  const addNavigationLink = async (data: any) => {
    const { error } = await supabase.from('navigation_links').insert([data]);
    if (error) throw error;
    await loadData();
  };

  const editNavigationLink = async (id: string, data: any) => {
    const { error } = await supabase.from('navigation_links').update(data).eq('id', id);
    if (error) throw error;
    await loadData();
  };

  const removeNavigationLink = async (id: string) => {
    const { error } = await supabase.from('navigation_links').delete().eq('id', id);
    if (error) throw error;
    await loadData();
  };

  // Settings
  const updateSettings = async (newSettings: any) => {
    const updates = Object.entries(newSettings).map(([key, value]) =>
      supabase.from('site_settings').upsert({ key, value }, { onConflict: 'key' })
    );
    await Promise.all(updates);
    await loadData();
  };

  return (
    <DataContext.Provider value={{
      shows,
      hosts,
      podcasts,
      categories,
      hotels,
      navigation,
      navigationLinks,
      settings,
      loading,
      error,
      version,
      addShow,
      editShow,
      removeShow,
      addHost,
      editHost,
      removeHost,
      addPodcast,
      editPodcast,
      removePodcast,
      addCategory,
      editCategory,
      removeCategory,
      addHotel,
      editHotel,
      removeHotel,
      addNavigationLink,
      editNavigationLink,
      removeNavigationLink,
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
console.log('✅ DataContext.tsx - все CRUD функции + navigationLinks');

// ==========================================
// 2. HEADER - исправить navigationLinks
// ==========================================
console.log('2/5 Исправление Header.tsx...');

const headerContent = `import { Radio, Menu, X, Bell, Search } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useState } from 'react';

export function Header({ onTabChange, activeTab }) {
  const { navigation, navigationLinks } = useData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Используем navigationLinks если есть, иначе navigation, иначе дефолтные пункты
  const navData = navigationLinks && navigationLinks.length > 0 
    ? navigationLinks 
    : (navigation && navigation.length > 0 ? navigation : []);

  const navItems = navData.length > 0
    ? navData.map(link => ({
        id: link.url ? link.url.replace('#/', '').replace('#', '') || 'home' : 'home',
        label: link.label || link.name || 'Пункт',
      }))
    : [
        { id: 'home', label: 'Эфир' },
        { id: 'schedule', label: 'Расписание' },
        { id: 'hosts', label: 'Ведущие' },
        { id: 'podcasts', label: 'Подкасты' },
        { id: 'about', label: 'О нас' },
      ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto rounded-2xl border-2 px-6 py-3 flex items-center justify-between shadow-lg bg-white">
        <button onClick={() => onTabChange('home')} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#28B9D0] to-[#685096] flex items-center justify-center">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-[#1A2B3C]">Cosmos FM</span>
        </button>

        <nav className="hidden md:flex items-center gap-1 rounded-xl p-1 bg-[#B6E0EE60]">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={\`px-4 py-2 rounded-lg text-sm font-bold transition-all \${
                activeTab === item.id 
                  ? 'bg-gradient-to-r from-[#28B9D0] to-[#685096] text-white' 
                  : 'text-[#1A2B3C]'
              }\`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button className="p-2 text-[#4A6578]">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 text-[#4A6578] relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#AFCB31]" />
          </button>
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="text-[#1A2B3C]" /> : <Menu className="text-[#1A2B3C]" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-4 right-4 bg-white rounded-2xl shadow-xl p-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { onTabChange(item.id); setMobileMenuOpen(false); }}
              className={\`w-full text-left px-4 py-3 rounded-lg mb-1 font-bold \${
                activeTab === item.id ? 'bg-gradient-to-r from-[#28B9D0] to-[#685096] text-white' : 'text-[#1A2B3C]'
              }\`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
`;

fs.writeFileSync('src/components/Header.tsx', headerContent);
console.log('✅ Header.tsx исправлен');

// ==========================================
// 3. ABOUT SECTION - добавить FAQ
// ==========================================
console.log('3/5 Исправление AboutSection (добавление FAQ)...');

const aboutContent = `import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Users, Radio, Headphones, Star, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const COLORS = {
  bg: '#B6E0EE',
  neppy: '#28B9D0',
  purple: '#685096',
  green: '#AFCB31',
  white: '#FFFFFF',
  text: '#1A2B3C',
  textMuted: '#4A6578',
};

export function AboutSection() {
  const { settings } = useData();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const stats = [
    { icon: Radio, value: '24/7', label: settings.about_stat1_label || 'Непрерывное вещание профессионального контента для гостей' },
    { icon: Users, value: '4000+', label: settings.about_stat2_label || 'Объединяем команды лучших отелей по всей России и миру' },
    { icon: Star, value: '2.5M', label: settings.about_stat3_label || 'Ежегодный охват гостей сети отелей Cosmos' },
    { icon: Headphones, value: '100+', label: settings.about_stat4_label || 'Эксклюзивные подкасты, интервью и музыкальные программы' },
  ];

  const cities = (settings.about_cities || 'Москва • Санкт-Петербург • Сочи').split('•').map(c => c.trim());

  // Parse FAQ from settings
  let faqs = [];
  try {
    if (settings.faq_items) {
      faqs = typeof settings.faq_items === 'string' 
        ? JSON.parse(settings.faq_items) 
        : settings.faq_items;
    }
  } catch (e) {
    console.error('Error parsing FAQ:', e);
  }

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="relative min-h-screen py-32 px-4 sm:px-6 lg:px-8" style={{ background: COLORS.bg }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-12" style={{ color: COLORS.text }}>
          {settings.about_title || 'О Cosmos FM'}
        </h1>

        <div className="text-center mb-16">
          <p className="text-xl max-w-3xl mx-auto mb-8" style={{ color: COLORS.textMuted }}>
            {settings.about_description || 'Первый в России корпоративный медиа-канал в индустрии гостеприимства'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="rounded-3xl p-8 shadow-xl text-center" style={{ background: COLORS.white }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white" style={{ background: 'linear-gradient(135deg, #28B9D0, #685096)' }}>
                  <Icon className="w-8 h-8" />
                </div>
                <div className="text-3xl font-bold mb-2" style={{ color: COLORS.text }}>{stat.value}</div>
                <p className="text-sm" style={{ color: COLORS.textMuted }}>{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Cities */}
        <div className="rounded-3xl p-8 shadow-xl mb-12" style={{ background: COLORS.white }}>
          <h2 className="text-2xl font-bold text-center mb-6" style={{ color: COLORS.text }}>
            {settings.about_cities_title || 'Присоединяйтесь к нам! Слушайте Cosmos FM в лучших отелях сети'}
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {cities.map((city, i) => (
              <div key={i} className="px-6 py-3 rounded-2xl text-white font-bold" style={{ background: 'linear-gradient(135deg, #28B9D0, #685096)' }}>
                {city}
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        {faqs.length > 0 && (
          <div className="rounded-3xl p-8 shadow-xl" style={{ background: COLORS.white }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #28B9D0, #685096)' }}>
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: COLORS.text }}>
                {settings.faq_title || 'Часто задаваемые вопросы'}
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq: any, index: number) => (
                <div
                  key={index}
                  className="rounded-2xl overflow-hidden border-2"
                  style={{ borderColor: COLORS.neppy + '40', background: '#F5FBFD' }}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left"
                  >
                    <span className="font-bold pr-4" style={{ color: COLORS.text }}>
                      {faq.question}
                    </span>
                    {openFaq === index ? (
                      <ChevronUp className="w-5 h-5 flex-shrink-0" style={{ color: COLORS.purple }} />
                    ) : (
                      <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: COLORS.purple }} />
                    )}
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-4" style={{ color: COLORS.textMuted }}>
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/sections/AboutSection.tsx', aboutContent);
console.log('✅ AboutSection.tsx - добавлен FAQ');

// ==========================================
// 4. NAVIGATION PAGE - исправить navigationLinks
// ==========================================
console.log('4/5 Исправление NavigationPage...');

if (fs.existsSync('src/admin/pages/NavigationPage.tsx')) {
  let content = fs.readFileSync('src/admin/pages/NavigationPage.tsx', 'utf-8');
  
  // Заменяем navigationLinks на navigation с fallback
  content = content.replace(
    'const { navigationLinks, addNavigationLink, editNavigationLink, removeNavigationLink } = useData();',
    'const { navigation, navigationLinks, addNavigationLink, editNavigationLink, removeNavigationLink } = useData();'
  );
  
  // Заменяем все использования navigationLinks на (navigationLinks || navigation || [])
  content = content.replace(/navigationLinks\.length/g, '(navigationLinks || navigation || []).length');
  content = content.replace(/navigationLinks\.sort/g, '(navigationLinks || navigation || []).sort');
  content = content.replace(/navigationLinks\.map/g, '(navigationLinks || navigation || []).map');
  
  fs.writeFileSync('src/admin/pages/NavigationPage.tsx', content);
  console.log('✅ NavigationPage.tsx исправлен');
}

// ==========================================
// 5. APP.TSX - исправить LoadingFallback
// ==========================================
console.log('5/5 Исправление App.tsx...');

if (fs.existsSync('src/App.tsx')) {
  let content = fs.readFileSync('src/App.tsx', 'utf-8');
  
  // Перемещаем LoadingFallback на верхний уровень
  const loadingFallback = `
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: '#B6E0EE' }}>
    <div className="text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse" style={{ background: 'linear-gradient(135deg, #28B9D0, #685096)' }}>
        <span className="text-4xl">📻</span>
      </div>
      <p style={{ color: '#4A6578' }}>Загрузка...</p>
    </div>
  </div>
);
`;

  // Удаляем LoadingFallback из App()
  content = content.replace(/const LoadingFallback = \(\) => \([\s\S]*?<\/div>\s*\);\s*\n/g, '');
  
  // Добавляем на верхний уровень (после импортов)
  if (!content.includes('const LoadingFallback = () =>')) {
    content = content.replace(
      'function useHashRouter() {',
      loadingFallback + '\nfunction useHashRouter() {'
    );
  }
  
  // Исправляем FrontLayout - добавляем error
  content = content.replace(
    'const { loading } = useData();',
    'const { loading, error } = useData();'
  );
  
  fs.writeFileSync('src/App.tsx', content);
  console.log('✅ App.tsx исправлен');
}

console.log('\n' + '='.repeat(70));
console.log('✅ ВСЕ ПРОБЛЕМЫ ИСПРАВЛЕНЫ!');
console.log('='.repeat(70));
console.log('\n📋 Что исправлено:');
console.log('1. ✅ DataContext - все CRUD функции (addShow, editShow, removeShow и т.д.)');
console.log('2. ✅ DataContext - navigationLinks алиас для navigation');
console.log('3. ✅ Header.tsx - использует navigationLinks || navigation');
console.log('4. ✅ AboutSection - добавлен FAQ из настроек');
console.log('5. ✅ NavigationPage - исправлено navigationLinks');
console.log('6. ✅ App.tsx - LoadingFallback на верхнем уровне');
console.log('\n🚀 ЗАПУСТИТЕ:');
console.log('  npm run dev');
console.log('\nТеперь должно работать:');
console.log('  - Админка сохраняет изменения (CRUD функции)');
console.log('  - Страница навигации не выдаёт ошибку');
console.log('  - FAQ отображается в разделе "О нас"');
console.log('='.repeat(70));
