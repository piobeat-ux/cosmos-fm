import fs from 'fs';
import { execSync } from 'child_process';

console.log(' === АУДИТ ПРОИЗВОДИТЕЛЬНОСТИ ===\n');

// 1. Проверка Vite конфигурации
console.log('1/8 Анализ Vite конфигурации...');
const viteConfig = fs.existsSync('vite.config.ts') 
  ? fs.readFileSync('vite.config.ts', 'utf-8')
  : fs.existsSync('vite.config.js')
  ? fs.readFileSync('vite.config.js', 'utf-8')
  : null;

if (viteConfig) {
  console.log('✅ Vite config найден');
  
  const hasBuildConfig = viteConfig.includes('build:');
  const hasChunkSizeWarning = viteConfig.includes('chunkSizeWarningLimit');
  const hasMinify = viteConfig.includes('minify:');
  const hasTarget = viteConfig.includes('target:');
  
  console.log(`   - build config: ${hasBuildConfig ? '✅' : '❌'}`);
  console.log(`   - chunkSizeWarningLimit: ${hasChunkSizeWarning ? '✅' : '❌'}`);
  console.log(`   - minify: ${hasMinify ? '✅' : '❌'}`);
  console.log(`   - target: ${hasTarget ? '✅' : '❌'}`);
} else {
  console.log(' Vite config не найден');
}

// 2. Проверка Vercel конфигурации
console.log('\n2/8 Анализ Vercel конфигурации...');
const vercelConfig = fs.existsSync('vercel.json') 
  ? JSON.parse(fs.readFileSync('vercel.json', 'utf-8'))
  : null;

if (vercelConfig) {
  console.log('✅ vercel.json найден');
  console.log('   Конфигурация:', JSON.stringify(vercelConfig, null, 2));
} else {
  console.log('❌ vercel.json не найден');
}

// 3. Анализ package.json
console.log('\n3/8 Анализ зависимостей...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

const deps = {
  total: Object.keys(packageJson.dependencies || {}).length,
  devDeps: Object.keys(packageJson.devDependencies || {}).length,
  hasReact: !!packageJson.dependencies?.react,
  hasVite: !!packageJson.devDependencies?.vite,
  hasSupabase: !!packageJson.dependencies?.['@supabase/supabase-js'],
};

console.log(`   - Всего зависимостей: ${deps.total}`);
console.log(`   - Dev зависимостей: ${deps.devDeps}`);
console.log(`   - React: ${deps.hasReact ? '✅' : '❌'}`);
console.log(`   - Vite: ${deps.hasVite ? '✅' : '❌'}`);
console.log(`   - Supabase: ${deps.hasSupabase ? '✅' : '❌'}`);

// 4. Проверка размера бандла
console.log('\n4/8 Анализ размера бандла...');
try {
  const distSize = execSync('du -sh dist 2>/dev/null || echo "dist не найден"').toString().trim();
  console.log(`   Размер dist: ${distSize}`);
} catch (e) {
  console.log('   ⚠️ dist папка не найдена (нужен build)');
}

// 5. Проверка Serverless Functions
console.log('\n5/8 Проверка Serverless Functions...');
const apiDir = fs.existsSync('api') ? 'api' : fs.existsSync('src/api') ? 'src/api' : null;

if (apiDir) {
  const functions = fs.readdirSync(apiDir).filter(f => f.endsWith('.js') || f.endsWith('.ts'));
  console.log(`   ✅ Найдено функций: ${functions.length}`);
  functions.forEach(f => {
    const size = fs.statSync(`${apiDir}/${f}`).size;
    console.log(`   - ${f}: ${(size / 1024).toFixed(2)} KB`);
  });
} else {
  console.log('   ℹ️ Serverless Functions не найдены');
}

// 6. Проверка кэширования
console.log('\n6/8 Анализ кэширования...');
const hasCacheHeaders = viteConfig?.includes('headers') || vercelConfig?.headers;
console.log(`   - Cache headers: ${hasCacheHeaders ? '✅' : '❌'}`);

// 7. Проверка изображений
console.log('\n7/8 Анализ изображений...');
const publicDir = fs.existsSync('public') ? 'public' : null;
if (publicDir) {
  const images = execSync(`find ${publicDir} -type f \\( -name "*.jpg" -o -name "*.png" -o -name "*.webp" \\) 2>/dev/null | wc -l`).toString().trim();
  console.log(`   - Изображений в public: ${images}`);
}

// 8. Проверка SSR/SSG
console.log('\n8/8 Проверка SSR/SSG стратегии...');
const hasSSR = viteConfig?.includes('ssr') || packageJson.dependencies?.['@vitejs/plugin-react-ssr'];
console.log(`   - SSR/SSG: ${hasSSR ? '✅ Настроено' : ' Не настроено (SPA)'}`);

console.log('\n' + '='.repeat(70));
console.log('📊 РЕЗУЛЬТАТЫ АУДИТА:');
console.log('='.repeat(70));

const issues = [];

if (!viteConfig?.includes('build:')) issues.push('❌ Отсутствует оптимизация билда');
if (!vercelConfig?.headers) issues.push('❌ Отсутствуют cache headers');
if (!hasSSR) issues.push('⚠️ Используется SPA (медленнее чем SSR)');
if (deps.total > 50) issues.push('⚠️ Большое количество зависимостей');

if (issues.length === 0) {
  console.log('✅ Критических проблем не найдено');
} else {
  console.log('Найдены проблемы:');
  issues.forEach(i => console.log(`   ${i}`));
}

console.log('\n🎯 РЕКОМЕНДАЦИИ:');
console.log('1. Оптимизировать Vite build конфигурацию');
console.log('2. Настроить cache headers в Vercel');
console.log('3. Добавить code splitting');
console.log('4. Оптимизировать изображения');
console.log('5. Настроить prefetching');
console.log('='.repeat(70));
