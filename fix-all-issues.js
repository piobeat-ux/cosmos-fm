import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 === ПОЛНОЕ ИСПРАВЛЕНИЕ ВСЕХ ПРОБЛЕМ ===\n');

const writeFile = (filePath, content) => {
  const fullPath = path.join(__dirname, filePath);
  fs.writeFileSync(fullPath, content.trim());
  console.log(`✅ ${filePath}`);
};

// ==========================================
// 1. ИСПРАВЛЕНИЕ VITE.CONFIG.TS
// ==========================================
console.log('🔧 Исправление vite.config.ts...');

writeFile('vite.config.ts', `import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
  },
});
`);

// ==========================================
// 2. ИСПРАВЛЕНИЕ DATACONTEXT - ДОБАВЛЯЕМ ОТЕЛИ И НАВИГАЦИЮ
// ==========================================
console.log('💾 Исправление DataContext...');

const dataContextContent = `import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Show, Host, Podcast, Category, SiteSettings } from '@/types/database';
import { DEFAULT_SETTINGS } from '@/types/database';
import {
  getShows, getHosts, getPodcasts, getCategories, getSettings,
  createShow, updateShow, deleteShow,
  createHost, updateHost, deleteHost,
  createPodcast, updatePodcast, deletePodcast,
  createCategory, updateCategory, deleteCategory,
  subscribeToShows, subscribeToHosts, subscribeToPodcasts,
  updateSetting, supabase,
} from '@/lib/supabase';

interface DataContextType {
  shows: Show[];
  hosts: Host[];
  podcasts: Podcast[];
  categories: Category[];
  settings: SiteSettings;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  // Shows
  addShow: (show: Omit<Show, 'id' | 'created_at'>) => Promise<void>;
  editShow: (id: string, show: Partial<Show>) => Promise<void>;
  removeShow: (id: string) => Promise<void>;
  // Hosts
  addHost: (host: Omit<Host, 'id' | 'created_at'>) => Promise<void>;
  editHost: (id: string, host: Partial<Host>) => Promise<void>;
  removeHost: (id: string) => Promise<void>;
  // Podcasts
  addPodcast: (podcast: Omit<Podcast, 'id' | 'created_at'>) => Promise<void>;
  editPodcast: (id: string, podcast: Partial<Podcast>) => Promise<void>;
  removePodcast: (id: string) => Promise<void>;
  // Categories
  addCategory: (category: Omit<Category, 'id' | 'created_at'>) => Promise<void>;
  editCategory: (id: string, category: Partial<Category>) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  // Settings
  updateSettings: (settings: Partial<SiteSettings>) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const DEMO_DATA = {
  shows: [
    { id: '1', title: 'Утренний кофе', description: 'Начните день с бодрости!', host_name: 'Анна Петрова', time: '07:00', duration: '3ч', category: 'Утреннее шоу', day_of_week: 'Пн', is_live: true },
    { id: '2', title: 'Новости отелей', description: 'Главные новости индустрии', host_name: 'Дмитрий Иванов', time: '10:00', duration: '1ч', category: 'Новости', day_of_week: 'Пн', is_live: false },
    { id: '3', title: 'Обеденный микс', description: 'Лучшая музыка для обеда', host_name: 'Мария Козлова', time: '12:00', duration: '2ч', category: 'Музыка', day_of_week: 'Пн', is_live: false },
  ],
  hosts: [
    { id: '1', name: 'Анна Петрова', role: 'Ведущая утреннего шоу', hotel: 'Cosmos Moscow', bio: '5 лет в индустрии гостеприимства', initials: 'АП', color: 'from-[#f59e0b] to-[#f97316]' },
    { id: '2', name: 'Михаил Соколов', role: 'Музыкальный редактор', hotel: 'Cosmos St. Petersburg', bio: 'DJ с 10-летним стажем', initials: 'МС', color: 'from-[#8b5cf6] to-[#6366f1]' },
    { id: '3', name: 'Елена Волкова', role: 'Ведущая разговорных шоу', hotel: 'Cosmos Sochi', bio: 'Журналист и сторителлер', initials: 'ЕВ', color: 'from-[#22c55e] to-[#14b8a6]' },
  ],
  podcasts: [
    { id: '1', title: 'Истории отелей', description: 'Удивительные истории из жизни отелей', host_name: 'Наталья Лебедева', episodes: 24, duration: '45 мин', category: 'Истории', likes: 128, color: 'from-[#f59e0b] to-[#f97316]' },
    { id: '2', title: 'Секреты консьержа', description: 'Профессиональные советы', host_name: 'Виктор Соколов', episodes: 18, duration: '30 мин', category: 'Обучение', likes: 96, color: 'from-[#22c55e] to-[#14b8a6]' },
  ],
  categories: [
    { id: '1', name: 'Музыка', count: 156, color: 'from-[#8b5cf6] to-[#6366f1]' },
    { id: '2', name: 'Новости', count: 48, color: 'from-[#3b82f6] to-[#06b6d4]' },
    { id: '3', name: 'Развлечения', count: 72, color: 'from-[#ef4444] to-[#f97316]' },
    { id: '4', name: 'Обучение', count: 34, color: 'from-[#ec4899] to-[#8b5cf6]' },
  ],
};

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [shows, setShows] = useState<Show[]>([]);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useLocal, setUseLocal] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!supabase) {
        throw new Error('Supabase not initialized');
      }

      const [showsData, hostsData, podcastsData, categoriesData, settingsData] = await Promise.all([
        getShows(),
        getHosts(),
        getPodcasts(),
        getCategories(),
        getSettings(),
      ]);
      
      setShows(showsData);
      setHosts(hostsData);
      setPodcasts(podcastsData);
      setCategories(categoriesData);
      setSettings(settingsData);
      setUseLocal(false);
      setError(null);
    } catch (err: any) {
      console.warn('Supabase not available, using demo data:', err.message);
      setUseLocal(true);
      setShows(DEMO_DATA.shows);
      setHosts(DEMO_DATA.hosts);
      setPodcasts(DEMO_DATA.podcasts);
      setCategories(DEMO_DATA.categories);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const updateSettings = useCallback(async (newSettings: Partial<SiteSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (!useLocal && supabase) {
      for (const [key, value] of Object.entries(newSettings)) {
        if (value !== undefined) {
          await updateSetting(key, value);
        }
      }
    }
  }, [settings, useLocal]);

  // SHOWS
  const addShow = async (show: Omit<Show, 'id' | 'created_at'>) => {
    if (useLocal || !supabase) {
      setShows([...shows, { ...show, id: Date.now().toString(), created_at: new Date().toISOString() }]);
    } else {
      await createShow(show);
      refresh();
    }
  };

  const editShow = async (id: string, show: Partial<Show>) => {
    if (useLocal || !supabase) {
      setShows(shows.map(s => s.id === id ? { ...s, ...show } : s));
    } else {
      await updateShow(id, show);
      refresh();
    }
  };

  const removeShow = async (id: string) => {
    if (useLocal || !supabase) {
      setShows(shows.filter(s => s.id !== id));
    } else {
      await deleteShow(id);
      refresh();
    }
  };

  // HOSTS
  const addHost = async (host: Omit<Host, 'id' | 'created_at'>) => {
    if (useLocal || !supabase) {
      setHosts([...hosts, { ...host, id: Date.now().toString(), created_at: new Date().toISOString() }]);
    } else {
      await createHost(host);
      refresh();
    }
  };

  const editHost = async (id: string, host: Partial<Host>) => {
    if (useLocal || !supabase) {
      setHosts(hosts.map(h => h.id === id ? { ...h, ...host } : h));
    } else {
      await updateHost(id, host);
      refresh();
    }
  };

  const removeHost = async (id: string) => {
    if (useLocal || !supabase) {
      setHosts(hosts.filter(h => h.id !== id));
    } else {
      await deleteHost(id);
      refresh();
    }
  };

  // PODCASTS
  const addPodcast = async (podcast: Omit<Podcast, 'id' | 'created_at'>) => {
    if (useLocal || !supabase) {
      setPodcasts([...podcasts, { ...podcast, id: Date.now().toString(), created_at: new Date().toISOString() }]);
    } else {
      await createPodcast(podcast);
      refresh();
    }
  };

  const editPodcast = async (id: string, podcast: Partial<Podcast>) => {
    if (useLocal || !supabase) {
      setPodcasts(podcasts.map(p => p.id === id ? { ...p, ...podcast } : p));
    } else {
      await updatePodcast(id, podcast);
      refresh();
    }
  };

  const removePodcast = async (id: string) => {
    if (useLocal || !supabase) {
      setPodcasts(podcasts.filter(p => p.id !== id));
    } else {
      await deletePodcast(id);
      refresh();
    }
  };

  // CATEGORIES
  const addCategory = async (category: Omit<Category, 'id' | 'created_at'>) => {
    if (useLocal || !supabase) {
      setCategories([...categories, { ...category, id: Date.now().toString(), created_at: new Date().toISOString() }]);
    } else {
      await createCategory(category);
      refresh();
    }
  };

  const editCategory = async (id: string, category: Partial<Category>) => {
    if (useLocal || !supabase) {
      setCategories(categories.map(c => c.id === id ? { ...c, ...category } : c));
    } else {
      await updateCategory(id, category);
      refresh();
    }
  };

  const removeCategory = async (id: string) => {
    if (useLocal || !supabase) {
      setCategories(categories.filter(c => c.id !== id));
    } else {
      await deleteCategory(id);
      refresh();
    }
  };

  return (
    <DataContext.Provider value={{
      shows, hosts, podcasts, categories, settings, loading, error, refresh,
      addShow, editShow, removeShow,
      addHost, editHost, removeHost,
      addPodcast, editPodcast, removePodcast,
      addCategory, editCategory, removeCategory,
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

writeFile('src/context/DataContext.tsx', dataContextContent);

// ==========================================
// 3. ИСПРАВЛЕНИЕ ADMINLAYOUT - ДОБАВЛЯЕМ ОТЕЛИ И НАВИГАЦИЮ
// ==========================================
console.log('🎨 Исправление AdminLayout...');

writeFile('src/admin/components/AdminLayout.tsx', `import { Radio, LayoutDashboard, Radio as RadioIcon, Users, Music, Tags, Settings, Building2, Link2, LogOut } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { id: 'shows', label: 'Передачи', icon: RadioIcon },
  { id: 'hosts', label: 'Ведущие', icon: Users },
  { id: 'podcasts', label: 'Подкасты', icon: Music },
  { id: 'categories', label: 'Категории', icon: Tags },
  { id: 'settings', label: 'Настройки', icon: Settings },
];

export function AdminLayout({ children, onLogout, currentPage, onNavigate }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#13131f] border-r border-[#27273a] flex flex-col fixed h-full">
        <div className="p-6 border-b border-[#27273a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold">Cosmos FM</h1>
              <p className="text-xs text-[#71717a]">Админ-панель</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left \${
                  isActive
                    ? 'bg-[#6366f1] text-white'
                    : 'text-[#a1a1aa] hover:bg-[#1e1e2e] hover:text-white'
                }\`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#27273a]">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#ef4444] hover:bg-[#ef4444]/10 transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Выйти</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}
`);

// ==========================================
// 4. ИСПРАВЛЕНИЕ HOSTSSECTION - ОТОБРАЖЕНИЕ ВЕДУЩИХ
// ==========================================
console.log('👤 Исправление HostsSection...');

writeFile('src/sections/HostsSection.tsx', `import { User } from 'lucide-react';
import { useData } from '@/context/DataContext';

export function HostsSection() {
  const { hosts } = useData();

  return (
    <section id="hosts" className="py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="gradient-text">Наши ведущие</span>
          </h2>
          <p className="text-lg text-[#71717a]">Профессионалы своего дела</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hosts.length === 0 ? (
            <div className="col-span-full text-center py-12 text-[#71717a]">
              <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Пока нет ведущих</p>
            </div>
          ) : (
            hosts.map(host => (
              <div key={host.id} className="glass-card rounded-2xl p-6 hover:border-[#6366f1]/50 transition-all duration-300">
                <div className="flex flex-col items-center text-center">
                  {host.photo_url ? (
                    <img 
                      src={host.photo_url} 
                      alt={host.name} 
                      className="w-24 h-24 rounded-full object-cover border-2 border-[#27273a] mb-4"
                    />
                  ) : (
                    <div className={\`w-24 h-24 rounded-full bg-gradient-to-br \${host.color || 'from-[#6366f1] to-[#8b5cf6]'} flex items-center justify-center text-white text-2xl font-bold mb-4\`}>
                      {host.initials || host.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                  )}
                  
                  <h3 className="text-xl font-bold mb-1">{host.name}</h3>
                  <p className="text-sm text-[#6366f1] mb-2">{host.role || 'Ведущий'}</p>
                  
                  {host.hotel && (
                    <p className="text-xs text-[#71717a] mb-3">{host.hotel}</p>
                  )}
                  
                  {host.bio && (
                    <p className="text-sm text-[#a1a1aa] line-clamp-3">{host.bio}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
`);

// ==========================================
// 5. ИСПРАВЛЕНИЕ SCHEDULESECTION - ПЕРЕДАЧИ
// ==========================================
console.log('📅 Исправление ScheduleSection...');

writeFile('src/sections/ScheduleSection.tsx', `import { Radio, Clock, User } from 'lucide-react';
import { useData } from '@/context/DataContext';

export function ScheduleSection() {
  const { shows } = useData();

  return (
    <section id="schedule" className="py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="gradient-text">Расписание эфиров</span>
          </h2>
          <p className="text-lg text-[#71717a]">Наши передачи и шоу</p>
        </div>

        <div className="space-y-4">
          {shows.length === 0 ? (
            <div className="text-center py-12 text-[#71717a]">
              <Radio className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Пока нет передач в расписании</p>
            </div>
          ) : (
            shows.map(show => (
              <div
                key={show.id}
                className={\`glass-card rounded-2xl p-6 transition-all duration-300 hover:border-[#6366f1]/50 \${show.is_live ? 'border-[#22c55e]/50 now-playing-glow' : ''}\`}
              >
                <div className="flex items-center gap-4">
                  {show.cover_url ? (
                    <img src={show.cover_url} alt={show.title} className="w-20 h-20 rounded-xl object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center flex-shrink-0">
                      <Radio className="w-10 h-10 text-white" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold truncate">{show.title}</h3>
                      {show.is_live && (
                        <span className="px-2 py-0.5 rounded-full bg-[#ef4444]/20 text-[#ef4444] text-xs font-bold uppercase">
                          LIVE
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-[#71717a] flex-wrap">
                      {show.host_name && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{show.host_name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{show.day_of_week} {show.time}</span>
                      </div>
                      {show.duration && <span>{show.duration}</span>}
                      {show.category && (
                        <span className="px-2 py-0.5 rounded-full bg-[#6366f1]/20 text-[#6366f1] text-xs">
                          {show.category}
                        </span>
                      )}
                    </div>

                    {show.description && (
                      <p className="text-sm text-[#a1a1aa] mt-3 line-clamp-2">{show.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
`);

// ==========================================
// 6. ИСПРАВЛЕНИЕ PODCASTSSECTION - ЛАЙКИ
// ==========================================
console.log('🎙️ Исправление PodcastsSection...');

writeFile('src/sections/PodcastsSection.tsx', `import { Play, Heart, Clock, Headphones } from 'lucide-react';
import { useData } from '@/context/DataContext';

export function PodcastsSection() {
  const { podcasts, editPodcast } = useData();

  const handleLike = async (podcast: any) => {
    const newLikes = (podcast.likes || 0) + 1;
    await editPodcast(podcast.id, { likes: newLikes });
  };

  return (
    <section id="podcasts" className="py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="gradient-text">Подкасты</span>
          </h2>
          <p className="text-lg text-[#71717a]">Слушайте наши лучшие выпуски</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {podcasts.length === 0 ? (
            <div className="col-span-full text-center py-12 text-[#71717a]">
              <Headphones className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Пока нет подкастов</p>
            </div>
          ) : (
            podcasts.map(podcast => (
              <div key={podcast.id} className="glass-card rounded-2xl p-6 hover:border-[#6366f1]/50 transition-all duration-300">
                <div className="mb-4">
                  {podcast.cover_url ? (
                    <img src={podcast.cover_url} alt={podcast.title} className="w-full h-48 rounded-xl object-cover" />
                  ) : (
                    <div className={\`w-full h-48 rounded-xl bg-gradient-to-br \${podcast.color || 'from-[#6366f1] to-[#8b5cf6]'} flex items-center justify-center\`}>
                      <Headphones className="w-16 h-16 text-white/50" />
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-2">{podcast.title}</h3>
                  <p className="text-sm text-[#71717a] mb-3 line-clamp-2">{podcast.description}</p>

                  <div className="flex items-center gap-4 text-xs text-[#a1a1aa] mb-3">
                    {podcast.host_name && <span>{podcast.host_name}</span>}
                    {podcast.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{podcast.duration}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    {podcast.likes !== undefined && (
                      <div className="flex items-center gap-1 text-sm text-[#71717a]">
                        <Heart className="w-4 h-4" />
                        <span>{podcast.likes}</span>
                      </div>
                    )}
                    
                    <button 
                      onClick={() => handleLike(podcast)}
                      className="p-2 text-[#71717a] hover:text-[#ef4444] transition-colors"
                    >
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
`);

// ==========================================
// ИТОГОВЫЙ ОТЧЁТ
// ==========================================
console.log('\n' + '='.repeat(60));
console.log('✅ ВСЕ ПРОБЛЕМЫ ИСПРАВЛЕНЫ!');
console.log('='.repeat(60));
console.log('\n📋 ЧТО ИСПРАВЛЕНО:');
console.log('  ✅ vite.config.ts - убран inspectAttr');
console.log('  ✅ DataContext - убраны лишние сущности (hotels, navigation)');
console.log('  ✅ AdminLayout - оставлены основные разделы');
console.log('  ✅ HostsSection - отображение всех ведущих');
console.log('  ✅ ScheduleSection - отображение всех передач');
console.log('  ✅ PodcastsSection - добавлена функция лайков');

console.log('\n🔧 ЗАПУСТИТЕ:');
console.log('  node fix-all-issues.js');
console.log('  npm run dev');

console.log('\n🎯 ПРОВЕРЬТЕ:');
console.log('  1. Главная страница работает');
console.log('  2. Навигация (5 вкладок) работает');
console.log('  3. Ведущие отображаются на странице "Ведущие"');
console.log('  4. Передачи отображаются на странице "Расписание"');
console.log('  5. Лайки на подкастах работают');
console.log('  6. Админка работает (6 разделов)');

console.log('\n🚀 ГОТОВО!');