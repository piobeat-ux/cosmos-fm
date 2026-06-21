import fs from 'fs';

const url = 'https://ozchhkjsrstdnowutsow.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96Y2hra2pzcnN0ZG5vd3V0c293Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyOTc1MjAsImV4cCI6MjA5Njg3MzUyMH0.4NsMSVyrSz5joTrVROt8SwUizjp3pNtEpak_TuubvHs';

console.log('🔍 ПРОВЕРКА ПРОЕКТА SUPABASE\n');
console.log('URL:', url);
console.log('Project ID:', url.match(/https:\/\/(.+)\.supabase\.co/)?.[1]);
console.log('');

async function check() {
  // 1. Проверка доступности проекта
  console.log('1. Проверка доступности проекта...');
  try {
    const res = await fetch(url, { method: 'HEAD' });
    console.log('   Статус:', res.status, res.statusText);
    if (res.status === 404) {
      console.log('   ❌ ПРОЕКТ НЕ НАЙДЕН! Возможно удален.');
    } else if (res.status === 200) {
      console.log('   ✅ Проект доступен');
    }
  } catch (e) {
    console.log('   ❌ Ошибка сети:', e.message);
  }

  // 2. Проверка REST API
  console.log('\n2. Проверка REST API...');
  try {
    const res = await fetch(`${url}/rest/v1/`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Prefer': 'count=exact'
      }
    });
    
    console.log('   Статус:', res.status, res.statusText);
    const text = await res.text();
    
    if (res.status === 401) {
      console.log('   ❌ НЕВЕРНЫЙ КЛЮЧ API');
      console.log('   Ответ:', text.substring(0, 200));
    } else if (res.status === 404) {
      console.log('   ❌ REST API НЕ НАЙДЕН');
      console.log('   Возможно проект не инициализирован');
    } else {
      console.log('   ✅ API работает');
      console.log('   Ответ:', text.substring(0, 200));
    }
  } catch (e) {
    console.log('   ❌ Ошибка:', e.message);
  }

  // 3. Проверка Auth API
  console.log('\n3. Проверка Auth API...');
  try {
    const res = await fetch(`${url}/auth/v1/settings`, {
      headers: { 'apikey': key }
    });
    console.log('   Статус:', res.status, res.statusText);
  } catch (e) {
    console.log('   ❌ Ошибка:', e.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('РЕКОМЕНДАЦИЯ:');
  console.log('='.repeat(60));
  console.log('1. Откройте: https://supabase.com/dashboard');
  console.log('2. Проверьте существует ли проект ozchhkjsrstdnowutsow');
  console.log('3. Если проект удален - создайте новый');
  console.log('4. Если на паузе - нажмите "Restore project"');
}

check();