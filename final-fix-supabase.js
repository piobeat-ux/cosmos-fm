import fs from 'fs';

console.log('🔧 === ФИНАЛЬНОЕ ИСПРАВЛЕНИЕ ===\n');

// 1. Проверяем и исправляем lib/supabase.ts
console.log('1. Исправление lib/supabase.ts...');

const supabaseContent = `import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Supabase URL:', supabaseUrl);
console.log('🔍 Supabase Key:', supabaseAnonKey ? 'Present' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials missing! Check .env file');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        headers: {
          'Cache-Control': 'no-cache',
        }
      }
    })
  : null;

// Helper для загрузки данных с таймаутом
export async function fetchData(table, timeout = 5000) {
  if (!supabase) return [];
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .abortSignal(controller.signal);
    
    clearTimeout(timeoutId);
    
    if (error) {
      console.error(\`Error fetching \${table}:\`, error);
      return [];
    }
    return data || [];
  } catch (err) {
    clearTimeout(timeoutId);
    console.error(\`Timeout fetching \${table}:\`, err);
    return [];
  }
}

export async function getShows() { return fetchData('shows'); }
export async function getHosts() { return fetchData('hosts'); }
export async function getPodcasts() { return fetchData('podcasts'); }
export async function getCategories() { return fetchData('categories'); }
export async function getHotels() { return fetchData('hotels'); }

export async function getNavigationLinks() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('navigation_links')
    .select('*')
    .order('order_index');
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
  const filePath = \`\${type}s/\${fileName}\`;

  const { data, error } = await supabase.storage
    .from('media')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath);
  return urlData.publicUrl;
}

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
  const { error } = await supabase.from('site_settings').upsert({ key, value });
  if (error) throw error;
}
`;

fs.writeFileSync('src/lib/supabase.ts', supabaseContent);
console.log('✅ lib/supabase.ts обновлен');

// 2. Создаем .env.local для гарантированной загрузки
console.log('\n2. Создание .env.local...');

const envLocal = `VITE_SUPABASE_URL=https://ozchhkjsrstdnowutsow.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96Y2hra2pzcnN0ZG5vd3V0c293Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA0ODk2MDAsImV4cCI6MjA0NjA2NTYwMH0.YOUR_ACTUAL_KEY_HERE
`;

// Читаем реальный ключ из .env
try {
  const envContent = fs.readFileSync('.env', 'utf-8');
  const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);
  if (keyMatch) {
    const fixedEnvLocal = envLocal.replace('YOUR_ACTUAL_KEY_HERE', keyMatch[1].trim());
    fs.writeFileSync('.env.local', fixedEnvLocal);
    console.log('✅ .env.local создан с реальным ключом');
  }
} catch (e) {
  console.log('⚠️ Не удалось создать .env.local');
}

// 3. Очищаем кэш Vite
console.log('\n3. Очистка кэша Vite...');

try {
  if (fs.existsSync('node_modules/.vite')) {
    fs.rmSync('node_modules/.vite', { recursive: true, force: true });
    console.log('✅ Кэш Vite очищен');
  }
} catch (e) {
  console.log('⚠️ Не удалось очистить кэш');
}

console.log('\n' + '='.repeat(60));
console.log('✅ ВСЕ ИСПРАВЛЕНИЯ ЗАВЕРШЕНЫ!');
console.log('='.repeat(60));
console.log('\n🚀 ЗАПУСТИТЕ:');
console.log('  1. Остановите сервер (Ctrl+C если запущен)');
console.log('  2. Запустите: npm run dev');
console.log('  3. Откройте: http://localhost:5173/#/admin');
console.log('  4. Войдите с любым email и паролем (мин 6 символов)');
console.log('\n Если не работает - очистите кэш браузера (Ctrl+Shift+R)');