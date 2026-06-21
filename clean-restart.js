import fs from 'fs';
import { execSync } from 'child_process';

console.log('🧹 === ПОЛНАЯ ОЧИСТКА ===\n');

// 1. Очищаем кэш Vite
console.log('1. Очистка кэша Vite...');
try {
  if (fs.existsSync('node_modules/.vite')) {
    fs.rmSync('node_modules/.vite', { recursive: true, force: true });
    console.log('   ✅ Кэш Vite очищен');
  }
} catch (e) {
  console.log('   ⚠️ Не удалось очистить кэш Vite');
}

// 2. Добавляем логирование в lib/supabase.ts
console.log('\n2. Добавление логирования...');

const supabaseContent = `import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 SUPABASE INIT');
console.log('   URL:', supabaseUrl);
console.log('   Key:', supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'MISSING');
console.log('   Key length:', supabaseAnonKey?.length || 0);

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      debug: true
    })
  : null;

if (!supabase) {
  console.error('❌ Supabase client NOT created! Check .env file');
}

// Простые функции без таймаутов
export async function getShows() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('shows').select('*');
  if (error) console.error('Error shows:', error);
  return data || [];
}

export async function getHosts() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('hosts').select('*');
  if (error) console.error('Error hosts:', error);
  return data || [];
}

export async function getPodcasts() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('podcasts').select('*');
  if (error) console.error('Error podcasts:', error);
  return data || [];
}

export async function getCategories() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('categories').select('*');
  if (error) console.error('Error categories:', error);
  return data || [];
}

export async function getHotels() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('hotels').select('*');
  if (error) console.error('Error hotels:', error);
  return data || [];
}

export async function getNavigationLinks() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('navigation_links').select('*').order('order_index');
  if (error) return [];
  return (data || []).filter(l => l.is_active);
}

export async function getSettings() {
  if (!supabase) return {};
  const { data, error } = await supabase.from('site_settings').select('*');
  if (error) return {};
  const settings = {};
  data?.forEach(item => { settings[item.key] = item.value; });
  return settings;
}

export async function uploadFile(file, type = 'image') {
  if (!supabase) throw new Error('Supabase not initialized');
  const fileExt = file.name.split('.').pop();
  const fileName = \`\${Date.now()}_\${Math.random().toString(36).substring(7)}.\${fileExt}\`;
  const { data, error } = await supabase.storage.from('media').upload(fileName, file);
  if (error) throw error;
  const { data: urlData } = supabase.storage.from('media').getPublicUrl(fileName);
  return urlData.publicUrl;
}

export async function createShow(show) { const { error } = await supabase.from('shows').insert([show]); if (error) throw error; }
export async function updateShow(id, show) { const { error } = await supabase.from('shows').update(show).eq('id', id); if (error) throw error; }
export async function deleteShow(id) { const { error } = await supabase.from('shows').delete().eq('id', id); if (error) throw error; }

export async function createHost(host) { const { error } = await supabase.from('hosts').insert([host]); if (error) throw error; }
export async function updateHost(id, host) { const { error } = await supabase.from('hosts').update(host).eq('id', id); if (error) throw error; }
export async function deleteHost(id) { const { error } = await supabase.from('hosts').delete().eq('id', id); if (error) throw error; }

export async function createPodcast(podcast) { const { error } = await supabase.from('podcasts').insert([podcast]); if (error) throw error; }
export async function updatePodcast(id, podcast) { const { error } = await supabase.from('podcasts').update(podcast).eq('id', id); if (error) throw error; }
export async function deletePodcast(id) { const { error } = await supabase.from('podcasts').delete().eq('id', id); if (error) throw error; }

export async function createCategory(category) { const { error } = await supabase.from('categories').insert([category]); if (error) throw error; }
export async function updateCategory(id, category) { const { error } = await supabase.from('categories').update(category).eq('id', id); if (error) throw error; }
export async function deleteCategory(id) { const { error } = await supabase.from('categories').delete().eq('id', id); if (error) throw error; }

export async function createHotel(hotel) { const { error } = await supabase.from('hotels').insert([hotel]); if (error) throw error; }
export async function updateHotel(id, hotel) { const { error } = await supabase.from('hotels').update(hotel).eq('id', id); if (error) throw error; }
export async function deleteHotel(id) { const { error } = await supabase.from('hotels').delete().eq('id', id); if (error) throw error; }

export async function createNavigationLink(link) { const { error } = await supabase.from('navigation_links').insert([link]); if (error) throw error; }
export async function updateNavigationLink(id, link) { const { error } = await supabase.from('navigation_links').update(link).eq('id', id); if (error) throw error; }
export async function deleteNavigationLink(id) { const { error } = await supabase.from('navigation_links').delete().eq('id', id); if (error) throw error; }

export async function updateSetting(key, value) { const { error } = await supabase.from('site_settings').upsert({ key, value }); if (error) throw error; }
`;

fs.writeFileSync('src/lib/supabase.ts', supabaseContent);
console.log('   ✅ Добавлено логирование');

// 3. Проверяем .env
console.log('\n3. Проверка .env файла...');
try {
  const envContent = fs.readFileSync('.env', 'utf-8');
  const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
  const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);
  
  if (urlMatch && keyMatch) {
    const url = urlMatch[1].trim();
    const key = keyMatch[1].trim();
    
    console.log('   ✅ URL:', url);
    console.log('   ✅ Key starts with:', key.substring(0, 15) + '...');
    console.log('   ✅ Key length:', key.length);
    
    if (!key.startsWith('eyJ')) {
      console.log('   ⚠️ WARNING: Key должен начинаться с "eyJ"');
    }
  }
} catch (e) {
  console.log('   ❌ .env файл не найден!');
}

console.log('\n' + '='.repeat(60));
console.log('✅ ГОТОВО!');
console.log('='.repeat(60));
console.log('\n🚀 ТЕПЕРЬ ВЫПОЛНИТЕ:');
console.log('  1. Остановите сервер (Ctrl+C)');
console.log('  2. Запустите: npm run dev');
console.log('  3. Откройте консоль браузера (F12)');
console.log('  4. Найдите строки "🔍 SUPABASE INIT"');
console.log('  5. Покажите что там - там будет видно какой ключ загружен');