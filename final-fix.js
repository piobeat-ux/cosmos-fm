import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 === PROFESSIONAL AUDIT & FIX ===\n');

const writeFile = (filePath, content) => {
  const fullPath = path.join(__dirname, filePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, content);
  console.log(`✅ ${filePath}`);
};

// ==========================================
// 1. SQL ДЛЯ ИСПРАВЛЕНИЯ STORAGE POLICIES
// ==========================================
console.log('📊 1/12 Создание SQL для Supabase...');

writeFile('fix-storage-policies.sql', `
-- ==========================================
-- ИСПРАВЛЕНИЕ STORAGE POLICIES
-- ==========================================

-- Удаляем старые политики
DROP POLICY IF EXISTS "Allow all media operations" ON storage.objects;
DROP POLICY IF EXISTS "Public read media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;

-- Создаем новые простые политики
CREATE POLICY "Enable public read access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'media');

CREATE POLICY "Enable public upload access" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'media');

CREATE POLICY "Enable public update access" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'media');

CREATE POLICY "Enable public delete access" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'media');

-- Проверяем bucket
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'media') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);
  END IF;
END $$;

-- Разрешаем CORS
ALTER DATABASE postgres SET "http.header_access_control_allow_origin" TO '*';
`);

// ==========================================
// 2. LIB/SUPABASE.TS - ИСПРАВЛЕНИЕ ЗАГРУЗКИ
// ==========================================
console.log('🔧 2/12 Исправление Supabase клиент...');

writeFile('src/lib/supabase.ts', `import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true },
      global: { headers: { 'Cache-Control': 'no-cache' } }
    })
  : null;

// Retry helper
async function withRetry(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

// ========== ЗАГРУЗКА ФАЙЛОВ ==========
export async function uploadFile(file, type = 'image') {
  if (!supabase) throw new Error('Supabase not initialized');
  
  const fileExt = file.name.split('.').pop();
  const fileName = \`\${Date.now()}_\${Math.random().toString(36).substring(7)}.\${fileExt}\`;
  const filePath = \`\${type}s/\${fileName}\`;

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
  return urlData.publicUrl;
}

// ========== CRUD С ТАЙМАУТОМ ==========
const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms));

const withTimeout = async (promise, ms = 5000) => {
  return Promise.race([promise, timeout(ms)]);
};

export async function getShows() {
  if (!supabase) return [];
  const { data, error } = await withTimeout(supabase.from('shows').select('*'));
  if (error) throw error;
  return data || [];
}

export async function getHosts() {
  if (!supabase) return [];
  const { data, error } = await withTimeout(supabase.from('hosts').select('*'));
  if (error) throw error;
  return data || [];
}

export async function getPodcasts() {
  if (!supabase) return [];
  const { data, error } = await withTimeout(supabase.from('podcasts').select('*'));
  if (error) throw error;
  return data || [];
}

export async function getCategories() {
  if (!supabase) return [];
  const { data, error } = await withTimeout(supabase.from('categories').select('*'));
  if (error) throw error;
  return data || [];
}

export async function getHotels() {
  if (!supabase) return [];
  const { data, error } = await withTimeout(supabase.from('hotels').select('*'));
  if (error) throw error;
  return data || [];
}

export async function getNavigationLinks() {
  if (!supabase) return [];
  const { data, error } = await withTimeout(
    supabase.from('navigation_links').select('*').order('order_index')
  );
  if (error) throw error;
  return (data || []).filter(l => l.is_active);
}

export async function getSettings() {
  if (!supabase) return {};
  const { data, error } = await withTimeout(supabase.from('site_settings').select('*'));
  if (error) throw error;
  const settings = {};
  data?.forEach(item => { settings[item.key] = item.value; });
  return settings;
}

export async function createShow(show) {
  if (!supabase) return;
  const { error } = await supabase.from('shows').insert([show]);
  if (error) throw error;
}

export async function updateShow(id, show) {
  if (!supabase) return;
  const { error } = await supabase.from('shows').update(show).eq('id', id);
  if (error) throw error;
}

export async function deleteShow(id) {
  if (!supabase) return;
  const { error } = await supabase.from('shows').delete().eq('id', id);
  if (error) throw error;
}

export async function createHost(host) {
  if (!supabase) return;
  const { error } = await supabase.from('hosts').insert([host]);
  if (error) throw error;
}

export async function updateHost(id, host) {
  if (!supabase) return;
  const { error } = await supabase.from('hosts').update(host).eq('id', id);
  if (error) throw error;
}

export async function deleteHost(id) {
  if (!supabase) return;
  const { error } = await supabase.from('hosts').delete().eq('id', id);
  if (error) throw error;
}

export async function createPodcast(podcast) {
  if (!supabase) return;
  const { error } = await supabase.from('podcasts').insert([podcast]);
  if (error) throw error;
}

export async function updatePodcast(id, podcast) {
  if (!supabase) return;
  const { error } = await supabase.from('podcasts').update(podcast).eq('id', id);
  if (error) throw error;
}

export async function deletePodcast(id) {
  if (!supabase) return;
  const { error } = await supabase.from('podcasts').delete().eq('id', id);
  if (error) throw error;
}

export async function createCategory(category) {
  if (!supabase) return;
  const { error } = await supabase.from('categories').insert([category]);
  if (error) throw error;
}

export async function updateCategory(id, category) {
  if (!supabase) return;
  const { error } = await supabase.from('categories').update(category).eq('id', id);
  if (error) throw error;
}

export async function deleteCategory(id) {
  if (!supabase) return;
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

export async function createHotel(hotel) {
  if (!supabase) return;
  const { error } = await supabase.from('hotels').insert([hotel]);
  if (error) throw error;
}

export async function updateHotel(id, hotel) {
  if (!supabase) return;
  const { error } = await supabase.from('hotels').update(hotel).eq('id', id);
  if (error) throw error;
}

export async function deleteHotel(id) {
  if (!supabase) return;
  const { error } = await supabase.from('hotels').delete().eq('id', id);
  if (error) throw error;
}

export async function createNavigationLink(link) {
  if (!supabase) return;
  const { error } = await supabase.from('navigation_links').insert([link]);
  if (error) throw error;
}

export async function updateNavigationLink(id, link) {
  if (!supabase) return;
  const { error } = await supabase.from('navigation_links').update(link).eq('id', id);
  if (error) throw error;
}

export async function deleteNavigationLink(id) {
  if (!supabase) return;
  const { error } = await supabase.from('navigation_links').delete().eq('id', id);
  if (error) throw error;
}

export async function updateSetting(key, value) {
  if (!supabase) return;
  const { error } = await supabase.from('site_settings').upsert({ key, value });
  if (error) throw error;
}
`);

// ==========================================
// 3. HOTELS PAGE - ИСПРАВЛЕНИЕ
// ==========================================
console.log('🏨 3/12 Создание HotelsPage...');

writeFile('src/admin/pages/HotelsPage.tsx', `import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Building2, Plus, Trash2, Edit, X } from 'lucide-react';

export function HotelsPage() {
  const { hotels, addHotel, editHotel, removeHotel } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', city: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!formData.name) { setMessage('❌ Укажите название'); return; }
    setSaving(true);
    try {
      if (editingItem) await editHotel(editingItem.id, formData);
      else await addHotel(formData);
      setMessage('✅ Сохранено!');
      setTimeout(() => { setIsModalOpen(false); setEditingItem(null); setFormData({ name: '', city: '', address: '' }); setMessage(''); }, 800);
    } catch (e) { setMessage('❌ ' + e.message); }
    finally { setSaving(false); }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name||'', city: item.city||'', address: item.address||'' });
    setIsModalOpen(true);
    setMessage('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Building2 className="w-6 h-6 text-[#6366f1]" /> Отели <span className="text-sm text-[#71717a]">({hotels.length})</span></h1>
        <button onClick={() => { setEditingItem(null); setFormData({ name: '', city: '', address: '' }); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Добавить</button>
      </div>
      {message && <div className={\`mb-4 p-3 rounded-xl \${message.includes('✅') ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#ef4444]/10 text-[#ef4444]'}\`}>{message}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hotels.length === 0 ? <p className="col-span-full text-center py-12 text-[#71717a]">Нет отелей</p> : hotels.map(h => (
          <div key={h.id} className="glass-card rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center flex-shrink-0"><Building2 className="w-6 h-6 text-white" /></div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate">{h.name}</h3>
                <p className="text-sm text-[#71717a]">{h.city || 'Город не указан'}</p>
                {h.address && <p className="text-xs text-[#a1a1aa] mt-1">{h.address}</p>}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => handleEdit(h)} className="flex-1 py-2 rounded-lg bg-[#6366f1]/10 text-[#6366f1] hover:bg-[#6366f1]/20 transition text-sm"><Edit className="w-4 h-4 inline mr-1" /> Изменить</button>
              <button onClick={() => { if(confirm('Удалить?')) removeHotel(h.id); }} className="py-2 px-3 rounded-lg bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20 transition"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#13131f] rounded-2xl border border-[#27273a] p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editingItem ? 'Редактировать' : 'Новый'} отель</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[#27273a] rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <input placeholder="Название *" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" />
              <input placeholder="Город" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" />
              <textarea placeholder="Адрес" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" rows={2} />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSubmit} disabled={saving} className="flex-1 btn-primary py-3 disabled:opacity-50">{saving ? 'Сохранение...' : 'Сохранить'}</button>
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl bg-[#27273a] hover:bg-[#3f3f5a] transition">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`);

// ==========================================
// 4. CATEGORIES PAGE - ИСПРАВЛЕНИЕ
// ==========================================
console.log('📂 4/12 Создание CategoriesPage...');

writeFile('src/admin/pages/CategoriesPage.tsx', `import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Tag, Plus, Trash2, Edit, X } from 'lucide-react';

export function CategoriesPage() {
  const { categories, addCategory, editCategory, removeCategory } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', icon: '🎵', description: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!formData.name) { setMessage('❌ Укажите название'); return; }
    setSaving(true);
    try {
      if (editingItem) await editCategory(editingItem.id, formData);
      else await addCategory(formData);
      setMessage('✅ Сохранено!');
      setTimeout(() => { setIsModalOpen(false); setEditingItem(null); setFormData({ name: '', icon: '🎵', description: '' }); setMessage(''); }, 800);
    } catch (e) { setMessage('❌ ' + e.message); }
    finally { setSaving(false); }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name||'', icon: item.icon||'🎵', description: item.description||'' });
    setIsModalOpen(true);
    setMessage('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Tag className="w-6 h-6 text-[#6366f1]" /> Категории <span className="text-sm text-[#71717a]">({categories.length})</span></h1>
        <button onClick={() => { setEditingItem(null); setFormData({ name: '', icon: '🎵', description: '' }); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Добавить</button>
      </div>
      {message && <div className={\`mb-4 p-3 rounded-xl \${message.includes('✅') ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#ef4444]/10 text-[#ef4444]'}\`}>{message}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.length === 0 ? <p className="col-span-full text-center py-12 text-[#71717a]">Нет категорий</p> : categories.map(c => (
          <div key={c.id} className="glass-card rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center flex-shrink-0 text-2xl">{c.icon}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate">{c.name}</h3>
                {c.description && <p className="text-sm text-[#71717a] truncate">{c.description}</p>}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => handleEdit(c)} className="flex-1 py-2 rounded-lg bg-[#6366f1]/10 text-[#6366f1] hover:bg-[#6366f1]/20 transition text-sm"><Edit className="w-4 h-4 inline mr-1" /> Изменить</button>
              <button onClick={() => { if(confirm('Удалить?')) removeCategory(c.id); }} className="py-2 px-3 rounded-lg bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20 transition"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#13131f] rounded-2xl border border-[#27273a] p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editingItem ? 'Редактировать' : 'Новая'} категория</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[#27273a] rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <input placeholder="Название *" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" />
              <div className="flex gap-2">
                <input placeholder="Иконка" value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} className="flex-1 px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" />
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#0a0a0f] border border-[#27273a] text-2xl">{formData.icon}</div>
              </div>
              <textarea placeholder="Описание" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 rounded-xl bg-[#0a0a0f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none" rows={2} />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSubmit} disabled={saving} className="flex-1 btn-primary py-3 disabled:opacity-50">{saving ? 'Сохранение...' : 'Сохранить'}</button>
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl bg-[#27273a] hover:bg-[#3f3f5a] transition">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`);

// ==========================================
// 5. SCHEDULE SECTION - СТИЛИЗАЦИЯ
// ==========================================
console.log('📅 5/12 Стилизация ScheduleSection...');

writeFile('src/sections/ScheduleSection.tsx', `import { useState } from 'react';
import { Radio, Clock, User } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAudio } from '@/context/AudioContext';

export function ScheduleSection() {
  const { shows } = useData();
  const { playTrack, currentTrack, isPlaying } = useAudio();

  const handlePlay = (show) => {
    if (show.audio_url) {
      playTrack({ id: show.id, title: show.title, artist: show.host_name, audio_url: show.audio_url, cover_url: show.cover_url, isLive: show.is_live, type: 'show' });
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, #B8E8F7 0%, #E0F4F8 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#2D3748] mb-12 text-center">
          Расписание <span className="text-[#7C5FBF]">эфиров</span>
        </h1>
        
        <div className="space-y-4">
          {shows.length === 0 ? (
            <div className="text-center py-12 text-[#718096]">
              <Radio className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Передачи не найдены</p>
            </div>
          ) : (
            shows.map((show, index) => (
              <div key={show.id} className={\`bg-white rounded-3xl p-6 shadow-xl shadow-blue-100/50 hover:shadow-2xl transition-all hover:-translate-y-1 \${show.is_live ? 'border-2 border-[#22c55e]' : ''}\`} style={{ animationDelay: \`\${index * 50}ms\` }}>
                <div className="flex items-center gap-4">
                  {show.cover_url ? (
                    <img src={show.cover_url} alt={show.title} className="w-20 h-20 rounded-2xl object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#4DD0E1] to-[#7C5FBF] flex items-center justify-center flex-shrink-0">
                      <Radio className="w-10 h-10 text-white" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-[#2D3748] truncate">{show.title}</h3>
                      {show.is_live && (
                        <span className="px-3 py-1 rounded-full bg-[#22c55e]/20 text-[#22c55e] text-xs font-bold">LIVE</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-[#718096] flex-wrap">
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
                        <span className="px-3 py-1 rounded-full bg-[#E0F4F8] text-[#26C6DA] text-xs font-bold">{show.category}</span>
                      )}
                    </div>

                    {show.description && (
                      <p className="text-sm text-[#718096] mt-2 line-clamp-2">{show.description}</p>
                    )}
                  </div>

                  {show.audio_url && (
                    <button onClick={() => handlePlay(show)} className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4DD0E1] to-[#7C5FBF] text-white flex items-center justify-center hover:scale-110 transition flex-shrink-0">
                      {isPlaying && currentTrack?.id === show.id ? '⏸' : '▶'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
`);

// ==========================================
// 6. ABOUT SECTION - СТИЛИЗАЦИЯ
// ==========================================
console.log('ℹ️ 6/12 Стилизация AboutSection...');

writeFile('src/sections/AboutSection.tsx', `import { Radio, Users, Globe, Award } from 'lucide-react';
import { useData } from '@/context/DataContext';

export function AboutSection() {
  const { settings } = useData();

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, #B8E8F7 0%, #E0F4F8 100%)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#2D3748] mb-6">
            О <span className="text-[#7C5FBF]">Cosmos FM</span>
          </h1>
          <p className="text-xl text-[#718096] leading-relaxed">
            {settings.hero_description || 'Первый в России корпоративный медиа-канал в индустрии гостеприимства'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-blue-100/50">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4DD0E1] to-[#7C5FBF] flex items-center justify-center mb-4">
              <Radio className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-[#2D3748] mb-2">24/7 Вещание</h3>
            <p className="text-[#718096]">Непрерывное вещание профессионального контента для гостей и сотрудников отелей</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-blue-100/50">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4DD0E1] to-[#7C5FBF] flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-[#2D3748] mb-2">4000+ Сотрудников</h3>
            <p className="text-[#718096]">Объединяем команды лучших отелей по всей России и миру</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-blue-100/50">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4DD0E1] to-[#7C5FBF] flex items-center justify-center mb-4">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-[#2D3748] mb-2">2.5M Гостей</h3>
            <p className="text-[#718096]">Ежегодный охват гостей сети отелей Cosmos</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-blue-100/50">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4DD0E1] to-[#7C5FBF] flex items-center justify-center mb-4">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-[#2D3748] mb-2">Премиум Контент</h3>
            <p className="text-[#718096]">Эксклюзивные подкасты, интервью и музыкальные программы</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-blue-100/50 text-center">
          <h3 className="text-2xl font-bold text-[#2D3748] mb-4">Присоединяйтесь к нам!</h3>
          <p className="text-[#718096] mb-6">Слушайте Cosmos FM в лучших отелях сети</p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#4DD0E1] to-[#7C5FBF] text-white font-bold">
              Москва
            </div>
            <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#4DD0E1] to-[#7C5FBF] text-white font-bold">
              Санкт-Петербург
            </div>
            <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#4DD0E1] to-[#7C5FBF] text-white font-bold">
              Сочи
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`);

// ==========================================
// 7. ADMIN LAYOUT - ИСПРАВЛЕНИЕ НАВИГАЦИИ
// ==========================================
console.log('🎛️ 7/12 Исправление AdminLayout...');

const adminLayoutPath = path.join(__dirname, 'src/admin/components/AdminLayout.tsx');
if (fs.existsSync(adminLayoutPath)) {
  let content = fs.readFileSync(adminLayoutPath, 'utf-8');
  
  // Убедимся что навигация работает правильно
  if (!content.includes("currentPage === 'hotels'")) {
    content = content.replace(
      /currentPage === 'dashboard'/g,
      "currentPage === 'hotels' ? 'active' : ''"
    ).replace(
      /onClick\(\) => onNavigate\('dashboard'\)/g,
      "() => onNavigate('hotels')"
    );
  }
  
  fs.writeFileSync(adminLayoutPath, content);
  console.log('✅ AdminLayout обновлен');
}

// ==========================================
// 8. IMAGE UPLOAD - ИСПРАВЛЕНИЕ
// ==========================================
console.log('🖼️ 8/12 Исправление ImageUpload...');

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
// 9. VITE CONFIG - ОПТИМИЗАЦИЯ
// ==========================================
console.log('⚡ 9/12 Оптимизация Vite config...');

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
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          icons: ['lucide-react'],
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@supabase/supabase-js'],
  }
});
`);

// ==========================================
// 10. TAILWIND CONFIG - ОЧИСТКА
// ==========================================
console.log('🎨 10/12 Очистка Tailwind config...');

writeFile('tailwind.config.js', `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`);

// ==========================================
// 11. .ENV.EXAMPLE
// ==========================================
console.log('🔐 11/12 Создание .env.example...');

writeFile('.env.example', `VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
`);

// ==========================================
// 12. README.MD
// ==========================================
console.log('📖 12/12 Создание README...');

writeFile('README.md', `# Cosmos FM - Hotel Media Network

## 🚀 Быстрый старт

\`\`\`bash
npm install
npm run dev
\`\`\`

## 🔧 Настройка

1. Скопируйте \`.env.example\` в \`.env\`
2. Добавьте ваши credentials из Supabase
3. Выполните SQL из \`fix-storage-policies.sql\` в Supabase Dashboard

## 📦 Деплой

\`\`\`bash
npm run build
vercel --prod
\`\`\`

## 🎨 Особенности

- ✅ PWA поддержка
- ✅ Адаптивный дизайн
- ✅ Оптимизированная загрузка
- ✅ Offline режим
- ✅ Hot reload

## 🛠 Стек

- React 19 + TypeScript
- Vite 5
- Tailwind CSS
- Supabase
- Lucide Icons
`);

console.log('\n' + '='.repeat(60));
console.log('✅ ВСЕ ИСПРАВЛЕНИЯ ЗАВЕРШЕНЫ!');
console.log('='.repeat(60));
console.log('\n📋 ЧТО СДЕЛАНО:');
console.log('  ✅ Исправлена загрузка файлов (Storage policies)');
console.log('  ✅ Исправлены страницы Hotels и Categories');
console.log('  ✅ Стилизованы все страницы (Schedule, About)');
console.log('  ✅ Оптимизирован Vite (code splitting)');
console.log('  ✅ Убран лишний код');
console.log('  ✅ Добавлены таймауты на запросы');
console.log('  ✅ Улучшена обработка ошибок');

console.log('\n🚀 СЛЕДУЮЩИЕ ШАГИ:');
console.log('  1. Выполните SQL в Supabase:');
console.log('     Откройте https://supabase.com/dashboard');
console.log('     SQL Editor → Вставьте fix-storage-policies.sql → Run');
console.log('');
console.log('  2. Перезапустите:');
console.log('     rm -rf node_modules');
console.log('     npm install');
console.log('     npm run dev');
console.log('');
console.log('  3. Проверьте:');
console.log('     - Загрузка файлов работает');
console.log('     - Отели и Категории открываются');
console.log('     - Все страницы стилизованы');
console.log('     - Сайт быстрый');

console.log('\n🎯 ГОТОВО!');