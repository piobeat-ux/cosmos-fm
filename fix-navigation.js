import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 === ИСПРАВЛЕНИЕ НАВИГАЦИИ И ВЕРСТКИ ===\n');

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
// 1. ОБНОВЛЕНИЕ LIB/SUPABASE.TS
// ==========================================
console.log('🔧 Обновление lib/supabase.ts...');

const supabasePath = path.join(__dirname, 'src/lib/supabase.ts');
let supabaseContent = '';

if (fs.existsSync(supabasePath)) {
  supabaseContent = fs.readFileSync(supabasePath, 'utf-8');
}

// Добавляем функции для navigation_links
const navigationFunctions = `
// ========== NAVIGATION LINKS ==========
export interface NavigationLink {
  id: string;
  label: string;
  url: string;
  type: 'internal' | 'external' | 'anchor';
  icon?: string;
  order_index: number;
  is_active: boolean;
  target: '_self' | '_blank';
  created_at?: string;
}

export async function getNavigationLinks(): Promise<NavigationLink[]> {
  if (!supabase) throw new Error('Supabase not initialized');
  const { data, error } = await supabase
    .from('navigation_links')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createNavigationLink(link: Omit<NavigationLink, 'id' | 'created_at'>): Promise<void> {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('navigation_links').insert([link]);
  if (error) throw error;
}

export async function updateNavigationLink(id: string, link: Partial<NavigationLink>): Promise<void> {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('navigation_links').update(link).eq('id', id);
  if (error) throw error;
}

export async function deleteNavigationLink(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.from('navigation_links').delete().eq('id', id);
  if (error) throw error;
}
`;

if (!supabaseContent.includes('getNavigationLinks')) {
  fs.writeFileSync(supabasePath, supabaseContent + '\n' + navigationFunctions);
  console.log('✅ Добавлены функции для navigation_links');
} else {
  console.log('⏭️  Функции уже существуют');
}

// ==========================================
// 2. ОБНОВЛЕНИЕ DATACONTEXT
// ==========================================
console.log('💾 Обновление DataContext...');

const dataContextPath = path.join(__dirname, 'src/context/DataContext.tsx');
let dataContextContent = fs.readFileSync(dataContextPath, 'utf-8');

// Добавляем импорт navigation functions
if (!dataContextContent.includes('getNavigationLinks')) {
  dataContextContent = dataContextContent.replace(
    /import \{([^}]+)\} from '@\/lib\/supabase';/,
    (match, imports) => {
      const newImports = imports + ', getNavigationLinks, createNavigationLink, updateNavigationLink, deleteNavigationLink, NavigationLink';
      return `import {${newImports}} from '@/lib/supabase';`;
    }
  );
}

// Добавляем navigationLinks в интерфейс
if (!dataContextContent.includes('navigationLinks: NavigationLink[]')) {
  dataContextContent = dataContextContent.replace(
    /hotels: Hotel\[\];/,
    'hotels: Hotel[];\n  navigationLinks: NavigationLink[];'
  );
}

// Добавляем состояние
if (!dataContextContent.includes('const [navigationLinks, setNavigationLinks]')) {
  dataContextContent = dataContextContent.replace(
    /const \[hotels, setHotels\] = useState<Hotel\[\]>\(\[\]\);/,
    'const [hotels, setHotels] = useState<Hotel[]>([]);\n  const [navigationLinks, setNavigationLinks] = useState<NavigationLink[]>([]);'
  );
}

// Добавляем загрузку
if (!dataContextContent.includes('getNavigationLinks()')) {
  dataContextContent = dataContextContent.replace(
    /const \[showsData, hostsData, podcastsData, categoriesData, settingsData, hotelsData\] = await Promise\.all\(\[/,
    'const [showsData, hostsData, podcastsData, categoriesData, settingsData, hotelsData, navData] = await Promise.all(['
  );
  dataContextContent = dataContextContent.replace(
    /getHotels\(\),/,
    'getHotels(),\n        getNavigationLinks(),'
  );
  dataContextContent = dataContextContent.replace(
    /setHotels\(hotelsData\);/,
    'setHotels(hotelsData);\n      setNavigationLinks(navData);'
  );
}

// Добавляем CRUD функции
if (!dataContextContent.includes('addNavigationLink')) {
  const crudFunctions = `
  const addNavigationLink = async (link: Omit<NavigationLink, 'id' | 'created_at'>) => {
    if (useLocal || !supabase) {
      setNavigationLinks([...navigationLinks, { ...link, id: Date.now().toString(), created_at: new Date().toISOString() }]);
    } else {
      await createNavigationLink(link);
      refresh();
    }
  };

  const editNavigationLink = async (id: string, link: Partial<NavigationLink>) => {
    if (useLocal || !supabase) {
      setNavigationLinks(navigationLinks.map(l => l.id === id ? { ...l, ...link } : l));
    } else {
      await updateNavigationLink(id, link);
      refresh();
    }
  };

  const removeNavigationLink = async (id: string) => {
    if (useLocal || !supabase) {
      setNavigationLinks(navigationLinks.filter(l => l.id !== id));
    } else {
      await deleteNavigationLink(id);
      refresh();
    }
  };
`;
  
  dataContextContent = dataContextContent.replace(
    /return \(\s*<DataContext\.Provider value=\{\{/,
    crudFunctions + '\n  return (\n    <DataContext.Provider value={{'
  );
  
  dataContextContent = dataContextContent.replace(
    /hotels, settings, loading, error, refresh,/,
    'hotels, navigationLinks, settings, loading, error, refresh,'
  );
  
  dataContextContent = dataContextContent.replace(
    /addHotel, editHotel, removeHotel,/,
    'addHotel, editHotel, removeHotel,\n      addNavigationLink, editNavigationLink, removeNavigationLink,'
  );
}

fs.writeFileSync(dataContextPath, dataContextContent);
console.log('✅ DataContext обновлен');

// ==========================================
// 3. ВОССТАНОВЛЕНИЕ HOMESECTION
// ==========================================
console.log('🏠 Восстановление HomeSection...');

writeFile('src/sections/HomeSection.tsx', `
import { useEffect, useState } from 'react';
import { Radio, ChevronDown, Sparkles, Play } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAudio } from '@/context/AudioContext';

export function HomeSection() {
  const { shows, settings } = useData();
  const { playLiveStream, playTrack, currentTrack, isPlaying } = useAudio();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const liveShow = shows.find(show => show.is_live);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePlayLive = () => {
    if (liveShow?.audio_url) {
      playTrack({
        id: liveShow.id,
        title: liveShow.title,
        artist: liveShow.host_name,
        audio_url: liveShow.audio_url,
        cover_url: liveShow.cover_url,
        isLive: true,
        type: 'show',
      });
    } else if (settings.stream_url) {
      playLiveStream(settings.stream_url, liveShow?.title || 'Прямой эфир');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/hero-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/60 via-[#0a0a0f]/40 to-[#0a0a0f]" />
      </div>

      {/* Floating Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20 floating"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
            animationDelay: '0s',
          }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full opacity-15 floating"
          style={{
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, transparent 70%)',
            animationDelay: '2s',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 section-padding w-full max-w-6xl mx-auto pt-24">
        <div className="text-center">
          {/* Badge */}
          <div className={\`inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 transition-all duration-700 \${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}\`}>
            <Sparkles className="w-4 h-4 text-[#6366f1]" />
            <span className="text-sm text-[#a1a1aa]">Первый в России</span>
          </div>

          {/* Logo */}
          <div className={\`flex justify-center mb-8 transition-all duration-700 delay-100 \${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}\`}>
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center animate-pulse-glow">
                <Radio className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-[#6366f1]/30 to-[#8b5cf6]/30 blur-xl" />
            </div>
          </div>

          {/* Title */}
          <h1 className={\`text-5xl sm:text-6xl lg:text-7xl font-black mb-4 transition-all duration-700 delay-200 \${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}\`}>
            <span className="gradient-text">{settings.hero_title || 'Голос вашего отеля'}</span>
          </h1>

          {/* Subtitle */}
          <p className={\`text-2xl sm:text-3xl lg:text-4xl font-light text-[#a1a1aa] mb-6 transition-all duration-700 delay-300 \${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}\`}>
            {settings.hero_subtitle || 'Звуки вашего космоса'}
          </p>

          {/* Description */}
          <p className={\`text-lg sm:text-xl text-[#71717a] max-w-2xl mx-auto mb-12 transition-all duration-700 delay-400 \${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}\`}>
            {settings.hero_description || 'Первый в России корпоративный медиа-канал в индустрии гостеприимства'}
          </p>

          {/* LIVE Show */}
          {liveShow && (
            <div className={\`max-w-2xl mx-auto mb-8 transition-all duration-700 delay-500 \${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}\`}>
              <div className="glass-card rounded-2xl p-6 border-[#22c55e]/50 now-playing-glow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    {liveShow.cover_url ? (
                      <img src={liveShow.cover_url} alt={liveShow.title} className="w-20 h-20 rounded-xl object-cover" />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
                        <Radio className="w-10 h-10 text-white" />
                      </div>
                    )}
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#ef4444] flex items-center justify-center animate-pulse">
                      <span className="text-[10px] font-bold text-white">LIVE</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 text-left">
                    <span className="text-xs text-[#22c55e] font-semibold uppercase tracking-wider">Сейчас в эфире</span>
                    <h3 className="text-xl font-bold mb-1">{liveShow.title}</h3>
                    <p className="text-sm text-[#71717a]">{liveShow.host_name || 'Cosmos FM'}</p>
                  </div>
                </div>

                <button onClick={handlePlayLive} className="w-full btn-primary flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" />
                  {isPlaying && currentTrack?.id === liveShow.id ? 'Слушаем' : 'Слушать эфир'}
                </button>
              </div>
            </div>
          )}

          {/* CTA Buttons */}
          <div className={\`flex flex-col sm:flex-row gap-4 justify-center mb-16 transition-all duration-700 delay-500 \${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}\`}>
            <button onClick={() => scrollToSection('#schedule')} className="btn-primary text-lg">
              Расписание
            </button>
            <button onClick={() => scrollToSection('#about')} className="btn-secondary text-lg">
              О нас
            </button>
          </div>

          {/* Stats */}
          <div className={\`grid grid-cols-3 gap-8 max-w-lg mx-auto transition-all duration-700 delay-600 \${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}\`}>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold gradient-text">4000+</div>
              <div className="text-sm text-[#71717a] mt-1">сотрудников</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold gradient-text">2.5M</div>
              <div className="text-sm text-[#71717a] mt-1">гостей</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold gradient-text">24/7</div>
              <div className="text-sm text-[#71717a] mt-1">вещание</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <button onClick={() => scrollToSection('#schedule')} className="flex flex-col items-center gap-2 text-[#71717a] hover:text-white transition-colors">
          <span className="text-sm">Листайте вниз</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </button>
      </div>
    </section>
  );
}
`);

// ==========================================
// 4. СТРАНИЦА NAVIGATIONPAGE
// ==========================================
console.log('🔗 Создание NavigationPage...');

writeFile('src/admin/pages/NavigationPage.tsx', `
import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Plus, Link2, Trash2, Edit, X, GripVertical } from 'lucide-react';

export function NavigationPage() {
  const { navigationLinks, addNavigationLink, editNavigationLink, removeNavigationLink } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!formData.label || !formData.url) {
      setMessage('❌ Заполните название и URL');
      return;
    }

    setSaving(true);
    setMessage('');
    
    try {
      if (editingItem) {
        await editNavigationLink(editingItem.id, formData);
        setMessage('✅ Ссылка обновлена!');
      } else {
        await addNavigationLink(formData);
        setMessage('✅ Ссылка добавлена!');
      }
      
      setTimeout(() => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({});
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
    setFormData(item);
    setIsModalOpen(true);
    setMessage('');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Удалить ссылку?')) {
      try {
        await removeNavigationLink(id);
        setMessage('✅ Удалено');
        setTimeout(() => setMessage(''), 2000);
      } catch (error: any) {
        setMessage('❌ Ошибка: ' + error.message);
      }
    }
  };

  const handleNew = () => {
    setEditingItem(null);
    setFormData({
      type: 'anchor',
      target: '_self',
      is_active: true,
      order_index: navigationLinks.length + 1,
    });
    setIsModalOpen(true);
    setMessage('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link2 className="w-6 h-6 text-[#6366f1]" />
          <h1 className="text-2xl font-bold">Навигация</h1>
          <span className="text-sm text-[#71717a]">({navigationLinks.length})</span>
        </div>
        <button onClick={handleNew} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Добавить ссылку
        </button>
      </div>

      {message && (
        <div className={\`mb-4 p-3 rounded-xl \${message.includes('✅') ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#ef4444]/10 text-[#ef4444]'}\`}>
          {message}
        </div>
      )}

      <div className="space-y-3">
        {navigationLinks.length === 0 ? (
          <div className="text-center py-12 text-[#71717a]">
            <Link2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Нет ссылок. Добавьте первую!</p>
          </div>
        ) : (
          navigationLinks.map((link) => (
            <div key={link.id} className="glass-card rounded-xl p-4 flex items-center gap-4">
              <GripVertical className="w-5 h-5 text-[#71717a] cursor-move" />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold">{link.label}</h3>
                  <span className={\`px-2 py-0.5 rounded-full text-xs font-medium \${
                    link.type === 'internal' ? 'bg-[#6366f1]/20 text-[#6366f1]' :
                    link.type === 'external' ? 'bg-[#06b6d4]/20 text-[#06b6d4]' :
                    'bg-[#22c55e]/20 text-[#22c55e]'
                  }\`}>
                    {link.type}
                  </span>
                </div>
                <p className="text-sm text-[#71717a] truncate">{link.url}</p>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={link.is_active}
                    onChange={(e) => editNavigationLink(link.id, { is_active: e.target.checked })}
                    className="w-5 h-5 accent-[#6366f1]"
                  />
                  <span className="text-sm text-[#a1a1aa]">Активна</span>
                </label>

                <button onClick={() => handleEdit(link)} className="p-2 text-[#6366f1] hover:bg-[#6366f1]/10 rounded-lg transition">
                  <Edit className="w-5 h-5" />
                </button>
                <button onClick={() => handleDelete(link.id)} className="p-2 text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg transition">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#13131f] rounded-2xl border border-[#27273a] p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {editingItem ? 'Редактировать ссылку' : 'Новая ссылка'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[#27273a] rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#a1a1aa] mb-2">Название *</label>
                <input
                  type="text"
                  value={formData.label || ''}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none"
                  placeholder="Расписание"
                />
              </div>

              <div>
                <label className="block text-sm text-[#a1a1aa] mb-2">URL *</label>
                <input
                  type="text"
                  value={formData.url || ''}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none"
                  placeholder="#/schedule или https://example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#a1a1aa] mb-2">Тип</label>
                  <select
                    value={formData.type || 'anchor'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none"
                  >
                    <option value="anchor">Якорь (внутренняя навигация)</option>
                    <option value="internal">Внутренняя ссылка</option>
                    <option value="external">Внешняя ссылка</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[#a1a1aa] mb-2">Порядок</label>
                  <input
                    type="number"
                    value={formData.order_index || 0}
                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#a1a1aa] mb-2">Цель открытия</label>
                <select
                  value={formData.target || '_self'}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none"
                >
                  <option value="_self">В текущей вкладке</option>
                  <option value="_blank">В новой вкладке</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active || false}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 accent-[#6366f1]"
                />
                <span className="text-sm">Активна</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 btn-primary py-3 disabled:opacity-50"
              >
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 rounded-xl bg-[#27273a] hover:bg-[#3f3f5a] transition"
              >
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
// 5. ОБНОВЛЕНИЕ HEADER
// ==========================================
console.log('🔝 Обновление Header...');

writeFile('src/components/Header.tsx', `
import { useState } from 'react';
import { Radio, Menu, X, Bell, Search } from 'lucide-react';
import { useData } from '@/context/DataContext';

interface HeaderProps {
  onTabChange: (tab: string) => void;
  activeTab: string;
}

export function Header({ onTabChange, activeTab }: HeaderProps) {
  const { navigationLinks } = useData();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (link: any) => {
    if (link.type === 'anchor') {
      const section = link.url.replace('#/', '').replace('#', '');
      onTabChange(section || 'home');
    } else if (link.type === 'external') {
      window.open(link.url, link.target);
    } else {
      window.location.hash = link.url;
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-player">
      <div className="section-padding">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => onTabChange('home')} className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">Cosmos FM</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigationLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link)}
                className={\`px-4 py-2 rounded-xl text-sm font-medium transition-all \${
                  activeTab === link.url.replace('#/', '').replace('#', '')
                    ? 'bg-[#6366f1]/20 text-[#6366f1]'
                    : 'text-[#a1a1aa] hover:text-white hover:bg-[#13131f]'
                }\`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl hover:bg-[#13131f] transition-colors">
              <Search className="w-5 h-5 text-[#71717a]" />
            </button>
            <button className="p-2 rounded-xl hover:bg-[#13131f] transition-colors relative">
              <Bell className="w-5 h-5 text-[#71717a]" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ef4444]" />
            </button>
            
            <button
              className="md:hidden p-2 rounded-xl hover:bg-[#13131f] transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5 text-[#71717a]" /> : <Menu className="w-5 h-5 text-[#71717a]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden glass-player border-t border-[#27273a]/50">
          <nav className="flex flex-col p-4 gap-1">
            {navigationLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link)}
                className={\`px-4 py-3 rounded-xl text-left text-sm font-medium transition-all \${
                  activeTab === link.url.replace('#/', '').replace('#', '')
                    ? 'bg-[#6366f1]/20 text-[#6366f1]'
                    : 'text-[#a1a1aa] hover:text-white hover:bg-[#13131f]'
                }\`}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
`);

// ==========================================
// 6. ОБНОВЛЕНИЕ APP.TSX
// ==========================================
console.log('🔄 Обновление App.tsx...');

const appPath = path.join(__dirname, 'src/App.tsx');
let appContent = fs.readFileSync(appPath, 'utf-8');

// Добавляем импорт NavigationPage
if (!appContent.includes('NavigationPage')) {
  appContent = appContent.replace(
    /import \{ SettingsPage \} from '@\/admin\/pages\/SettingsPage';/,
    "import { SettingsPage } from '@/admin/pages/SettingsPage';\nimport { NavigationPage } from '@/admin/pages/NavigationPage';"
  );
  
  appContent = appContent.replace(
    /else if \(hash\.includes\('\/settings'\)\) setAdminPage\('settings'\);/,
    "else if (hash.includes('/settings')) setAdminPage('settings');\n    else if (hash.includes('/navigation')) setAdminPage('navigation');"
  );
  
  appContent = appContent.replace(
    /case 'settings': return <SettingsPage \/>;/,
    "case 'settings': return <SettingsPage />;\n      case 'navigation': return <NavigationPage />;"
  );
}

fs.writeFileSync(appPath, appContent);
console.log('✅ App.tsx обновлен');

// ==========================================
// 7. ОБНОВЛЕНИЕ ADMINLAYOUT
// ==========================================
console.log('🎨 Обновление AdminLayout...');

const adminLayoutPath = path.join(__dirname, 'src/admin/components/AdminLayout.tsx');
let adminLayoutContent = fs.readFileSync(adminLayoutPath, 'utf-8');

// Добавляем пункт навигации
if (!adminLayoutContent.includes('navigation')) {
  adminLayoutContent = adminLayoutContent.replace(
    /import \{[^}]+\} from 'lucide-react';/,
    (match) => match.replace('}', ', Link2 }')
  );
  
  adminLayoutContent = adminLayoutContent.replace(
    /\{ id: 'settings', label: 'Настройки', icon: Settings \},/,
    "{ id: 'settings', label: 'Настройки', icon: Settings },\n  { id: 'navigation', label: 'Навигация', icon: Link2 },"
  );
}

fs.writeFileSync(adminLayoutPath, adminLayoutContent);
console.log('✅ AdminLayout обновлен');

// ==========================================
// ИТОГОВЫЙ ОТЧЁТ
// ==========================================
console.log('\n' + '='.repeat(60));
console.log('✅ НАВИГАЦИЯ И ВЕРСТКА ИСПРАВЛЕНЫ!');
console.log('='.repeat(60));
console.log('\n📋 ЧТО СДЕЛАНО:');
console.log('  ✅ Восстановлена оригинальная верстка HomeSection');
console.log('  ✅ Создана страница NavigationPage в админке');
console.log('  ✅ Обновлен Header для работы с динамическими ссылками');
console.log('  ✅ Добавлены функции CRUD для navigation_links');
console.log('  ✅ Обновлен DataContext с navigationLinks');
console.log('  ✅ Обновлен App.tsx и AdminLayout');

console.log('\n🔧 СЛЕДУЮЩИЕ ШАГИ:');
console.log('  1. Выполните supabase-navigation.sql в Supabase SQL Editor');
console.log('  2. Запустите: node fix-navigation.js');
console.log('  3. Перезапустите: npm run dev');
console.log('  4. Откройте админку -> Навигация -> добавьте ссылки');
console.log('  5. Проверьте навигацию на главной странице');

console.log('\n🎯 КАК РАБОТАЕТ:');
console.log('  • В админке можно добавлять/редактировать/удалять ссылки');
console.log('  • Типы ссылок: anchor (внутренняя), internal, external');
console.log('  • Порядок отображения регулируется полем order_index');
console.log('  • Можно открывать в новой вкладке (target: _blank)');
console.log('  • Можно деактивировать ссылку без удаления');

console.log('\n🚀 ГОТОВО! Запускайте!');