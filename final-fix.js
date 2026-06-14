import fs from 'fs';

// 1. ИСПРАВЛЯЕМ vite.config.ts
fs.writeFileSync('vite.config.ts', `import path from "path"
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

console.log('✅ vite.config.ts исправлен');

// 2. ИСПРАВЛЯЕМ App.tsx - добавляем useEffect в FrontLayout
let appContent = fs.readFileSync('src/App.tsx', 'utf-8');

// Добавляем useEffect в FrontLayout
appContent = appContent.replace(
  `function FrontLayout() {
const [activeTab, setActiveTab] = useState('home');
const renderContent = () => {`,
  `function FrontLayout() {
const [activeTab, setActiveTab] = useState('home');

useEffect(() => {
  const hash = window.location.hash;
  if (hash === '#/schedule' || hash === '#schedule') setActiveTab('schedule');
  else if (hash === '#/hosts' || hash === '#hosts') setActiveTab('hosts');
  else if (hash === '#/podcasts' || hash === '#podcasts') setActiveTab('podcasts');
  else if (hash === '#/about' || hash === '#about') setActiveTab('about');
  else setActiveTab('home');
}, []);

const handleTabChange = (tab) => {
  setActiveTab(tab);
  window.location.hash = tab === 'home' ? '#' : \`#/\${tab}\`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const renderContent = () => {`
);

// Заменяем onTabChange={setActiveTab} на onTabChange={handleTabChange}
appContent = appContent.replace(
  /<Header onTabChange={setActiveTab} activeTab={activeTab} \/>/g,
  '<Header onTabChange={handleTabChange} activeTab={activeTab} />'
);

appContent = appContent.replace(
  /<BottomNav activeTab={activeTab} onTabChange={setActiveTab} \/>/g,
  '<BottomNav activeTab={activeTab} onTabChange={handleTabChange} />'
);

fs.writeFileSync('src/App.tsx', appContent);

console.log('✅ App.tsx исправлен - добавлена синхронизация с hash');

console.log('\n🎉 ГОТОВО!');
console.log('\nПерезапустите сервер:');
console.log('  npm run dev');

console.log('\nПроверьте:');
console.log('  1. Откройте http://localhost:5173');
console.log('  2. Нажмите "Расписание" - должна открыться страница');
console.log('  3. Нажмите "Ведущие" - должны появиться ведущие');
console.log('  4. Нажмите "Подкасты" - должны быть подкасты');
console.log('  5. Нажмите "О нас" - информация о проекте');