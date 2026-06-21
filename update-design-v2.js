import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(' === FINAL DESIGN UPDATE (ALL PAGES) ===\n');

const writeFile = (filePath, content) => {
  const fullPath = path.join(__dirname, filePath);
  fs.writeFileSync(fullPath, content);
  console.log(`✅ ${filePath}`);
};

// ==========================================
// 1. DATACONTEXT - ДОБАВЛЯЕМ НАСТРОЙКУ ПЕРСОНАЖА
// ==========================================
console.log(' 1/6 Обновление DataContext...');

const dataContextPath = path.join(__dirname, 'src/context/DataContext.tsx');
if (fs.existsSync(dataContextPath)) {
  let content = fs.readFileSync(dataContextPath, 'utf-8');
  
  // Добавляем neppy_image в DEFAULT_SETTINGS
  content = content.replace(
    'const DEFAULT_SETTINGS = {',
    `const DEFAULT_SETTINGS = {\n  neppy_image: '',`
  );
  
  fs.writeFileSync(dataContextPath, content);
  console.log('✅ neppy_image добавлен в DataContext');
}

// ==========================================
// 2. HEADER - СТИЛИЗАЦИЯ
// ==========================================
console.log(' 2/6 Обновление Header.tsx...');

writeFile('src/components/Header.tsx', `import { Radio, Menu, X, Bell, Search, Moon, Sun } from 'lucide-react';
import { useData } from '@/context/DataContext';

export function Header({ onTabChange, activeTab }) {
  const { navigationLinks, settings } = useData();

  const navItems = navigationLinks.length > 0
    ? navigationLinks.map(link => ({
        id: link.url.replace('#/', '').replace('#', '') || 'home',
        label: link.label,
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
      <div className="max-w-7xl mx-auto bg-[#1a1a2e]/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl px-6 py-3 flex items-center justify-between">
        <button onClick={() => onTabChange('home')} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C5FBF] to-[#4DD0E1] flex items-center justify-center transform group-hover:rotate-12 transition-transform">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-wide" style={{ 
            background: 'linear-gradient(90deg, #FFFFFF, #4DD0E1)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent' 
          }}>
            Cosmos FM
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-1 bg-white/5 rounded-xl p-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={\`px-4 py-2 rounded-lg text-sm font-bold transition-all \${
                activeTab === item.id 
                  ? 'bg-gradient-to-r from-[#7C5FBF] to-[#6A4FB5] text-white shadow-lg shadow-purple-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }\`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
}
`);

// ==========================================
// 3. HOME SECTION - КЛИКАБЕЛЬНЫЕ БЛОКИ + ДИНАМИЧЕСКИЙ ПЕРСОНАЖ
// ==========================================
console.log('🏠 3/6 Обновление HomeSection...');

writeFile('src/sections/HomeSection.tsx', `import { useState, useEffect } from 'react';
import { Play, Pause, Radio, Music, Mic, Users, ChevronDown, Sparkles } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAudio } from '@/context/AudioContext';

export function HomeSection({ onTabChange }) {
  const { shows, settings } = useData();
  const { playLiveStream, playTrack, currentTrack, isPlaying, isLoading } = useAudio();
  const [isLoaded, setIsLoaded] = useState(false);
  const [characterAnimating, setCharacterAnimating] = useState(false);

  useEffect(() => { setIsLoaded(true); }, []);

  const liveShow = shows.find(show => show.is_live);

  const handlePlayClick = () => {
    setCharacterAnimating(true);
    setTimeout(() => setCharacterAnimating(false), 1000);
    
    if (liveShow?.audio_url) {
      playTrack({ id: liveShow.id, title: liveShow.title, artist: liveShow.host_name, audio_url: liveShow.audio_url, cover_url: liveShow.cover_url, isLive: true, type: 'show' });
    } else if (settings.stream_url) {
      playLiveStream(settings.stream_url, 'Cosmos FM Эфир');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #B8E8F7 0%, #E0F4F8 100%)' }}>
      {/* Background Shapes */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full opacity-20 animate-float" style={{ width: '400px', height: '400px', background: '#4DD0E1', top: '-10%', left: '-10%' }} />
        <div className="absolute rounded-full opacity-10 animate-float" style={{ width: '300px', height: '300px', background: '#7C5FBF', bottom: '10%', right: '-5%', animationDelay: '5s' }} />
      </div>

      <div className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Title Block */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur shadow-sm mb-6 animate-fade-in-up">
              <Sparkles className="w-4 h-4 text-[#7C5FBF]" />
              <span className="text-sm font-bold text-[#2D3748]">Голос вашего отеля</span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 text-[#2D3748] leading-tight">
              Первый в России <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C5FBF] to-[#4DD0E1]">корпоративный медиа-канал</span>
            </h1>
            <p className="text-xl text-[#718096] max-w-2xl mx-auto">
              В индустрии гостеприимства. Объединяем 4000+ сотрудников и 2.5M гостей по всему миру.
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {['4000+ сотрудников', '2.5M гостей', '24/7 вещание'].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl px-8 py-4 shadow-lg shadow-blue-100/50 border border-white/50 animate-fade-in-up" style={{ animationDelay: \`\${i * 100}ms\` }}>
                <span className="text-2xl font-bold text-[#2D3748]">{stat}</span>
              </div>
            ))}
          </div>

          {/* Interactive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column - Feature Cards (Clickable) */}
            <div className="space-y-6 animate-fade-in-left">
              <button onClick={() => onTabChange && onTabChange('home')} className="w-full bg-white rounded-3xl p-6 shadow-xl shadow-blue-100/50 hover:scale-[1.02] transition-all group border-2 border-transparent hover:border-[#4DD0E1] text-left">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4DD0E1] to-[#7C5FBF] flex items-center justify-center mb-4 text-white group-hover:rotate-6 transition-transform">
                  <Radio className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-[#2D3748] mb-2">Live Эфир</h3>
                <p className="text-[#718096]">Профессиональное радио 24/7</p>
              </button>

              <button onClick={() => onTabChange && onTabChange('podcasts')} className="w-full bg-white rounded-3xl p-6 shadow-xl shadow-blue-100/50 hover:scale-[1.02] transition-all group border-2 border-transparent hover:border-[#4DD0E1] text-left">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4DD0E1] to-[#7C5FBF] flex items-center justify-center mb-4 text-white group-hover:rotate-6 transition-transform">
                  <Music className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-[#2D3748] mb-2">Подкасты</h3>
                <p className="text-[#718096]">Эксклюзивный контент</p>
              </button>

              <button onClick={() => onTabChange && onTabChange('hosts')} className="w-full bg-white rounded-3xl p-6 shadow-xl shadow-blue-100/50 hover:scale-[1.02] transition-all group border-2 border-transparent hover:border-[#4DD0E1] text-left">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4DD0E1] to-[#7C5FBF] flex items-center justify-center mb-4 text-white group-hover:rotate-6 transition-transform">
                  <Mic className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-[#2D3748] mb-2">Артисты</h3>
                <p className="text-[#718096]">Таланты отелей</p>
              </button>
            </div>

            {/* Right Column - Character */}
            <div className="lg:col-span-2 flex justify-center relative animate-fade-in-right">
              {/* Character Container */}
              <div className={\`relative cursor-pointer transition-transform duration-300 \${isPlaying ? 'animate-bounce' : 'animate-float-character'}\`}>
                <div className="w-80 h-80 sm:w-96 sm:h-96 relative">
                  {/* Character Body */}
                  <div className="absolute inset-0 rounded-[50%_50%_45%_45%] shadow-2xl" style={{ background: 'linear-gradient(180deg, #4DD0E1 0%, #26C6DA 100%)' }}>
                    
                    {/* CUSTOM CHARACTER IMAGE OR CSS FALLBACK */}
                    {settings.neppy_image ? (
                      <img src={settings.neppy_image} alt="Neppy" className="w-full h-full object-cover rounded-[50%_50%_45%_45%]" />
                    ) : (
                      <>
                        {/* Green Spots */}
                        <div className="absolute top-16 left-12 w-4 h-6 rounded-full bg-[#A8E063] opacity-60" />
                        <div className="absolute top-24 right-16 w-3 h-5 rounded-full bg-[#A8E063] opacity-60" />
                        <div className="absolute top-32 left-20 w-5 h-7 rounded-full bg-[#A8E063] opacity-60" />
                        
                        {/* Face */}
                        <div className="absolute top-32 left-0 right-0 flex justify-center gap-12">
                          <div className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                            <div className="w-4 h-4 rounded-full bg-gray-800 relative"><div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-white" /></div>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                            <div className="w-4 h-4 rounded-full bg-gray-800 relative"><div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-white" /></div>
                          </div>
                        </div>
                        <div className="absolute top-52 left-0 right-0 flex justify-center"><div className="w-12 h-6 border-b-4 border-gray-700 rounded-full" /></div>
                        
                        {/* Arms */}
                        <div className="absolute top-40 -left-12 w-20 h-32 rounded-full bg-[#4DD0E1]" />
                        <div className="absolute top-40 -right-12 w-20 h-32 rounded-full bg-[#4DD0E1]" />

                        {/* Hat */}
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-24 bg-[#7C5FBF] rounded-t-full flex items-start justify-center pt-4">
                           <div className="bg-white px-3 py-1 rounded-lg text-xs font-bold text-[#7C5FBF]">COSMOS</div>
                           <div className="absolute -top-8 w-14 h-14 rounded-full bg-white" />
                        </div>
                      </>
                    )}

                    {/* Play Button Center */}
                    <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-white/90 backdrop-blur shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-20"
                      onClick={(e) => { e.stopPropagation(); handlePlayClick(); }}>
                      {isLoading ? <div className="animate-spin w-8 h-8 border-4 border-[#7C5FBF] border-t-transparent rounded-full" /> : 
                       isPlaying ? <Pause className="w-10 h-10 text-[#7C5FBF]" /> : <Play className="w-10 h-10 ml-1 text-[#7C5FBF]" />}
                    </button>
                  </div>
                  
                  {/* Speech Bubble */}
                  <div className="absolute -top-6 -right-6 bg-white px-6 py-3 rounded-2xl shadow-xl">
                    <p className="text-lg font-extrabold text-[#7C5FBF]">ПРИВЕТ! Я НЭППИ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Down */}
          <div className="flex justify-center mt-20 text-[#718096] animate-bounce cursor-pointer" onClick={() => window.scrollTo({top: window.innerHeight, behavior: 'smooth'})}>
             <ChevronDown className="w-8 h-8" />
          </div>

        </div>
      </div>
    </div>
  );
}
`);

// ==========================================
// 4. PODCASTS SECTION - STYLING
// ==========================================
console.log('🎙️ 4/6 Обновление PodcastsSection...');

writeFile('src/sections/PodcastsSection.tsx', `import { useState } from 'react';
import { Play, Pause, Headphones } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAudio } from '@/context/AudioContext';

export function PodcastsSection() {
  const { podcasts } = useData();
  const { playTrack, currentTrack, isPlaying } = useAudio();

  const handlePlay = (podcast) => {
    if (podcast.audio_url) {
      playTrack({ id: podcast.id, title: podcast.title, artist: podcast.host_name, audio_url: podcast.audio_url, cover_url: podcast.cover_url, isLive: false, type: 'podcast' });
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, #B8E8F7 0%, #E0F4F8 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#2D3748] mb-12 text-center">
          Подкасты <span className="text-[#7C5FBF]">Cosmos FM</span>
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {podcasts.map(podcast => (
            <div key={podcast.id} className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-blue-100/50 hover:shadow-2xl transition-all hover:-translate-y-2 group">
              <div className="relative h-48 bg-gradient-to-br from-[#4DD0E1] to-[#7C5FBF] overflow-hidden">
                {podcast.cover_url ? <img src={podcast.cover_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Headphones className="w-16 h-16 text-white/30" /></div>}
                <button onClick={() => handlePlay(podcast)} className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg">
                    {isPlaying && currentTrack?.id === podcast.id ? <Pause className="w-8 h-8 text-[#7C5FBF]" /> : <Play className="w-8 h-8 text-[#7C5FBF] ml-1" />}
                  </div>
                </button>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#2D3748] mb-2">{podcast.title}</h3>
                <p className="text-[#718096] line-clamp-2 mb-4">{podcast.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-sm font-semibold text-[#7C5FBF]">{podcast.host_name}</span>
                  <span className="text-xs font-bold bg-[#E0F4F8] text-[#26C6DA] px-3 py-1 rounded-full">{podcast.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
`);

// ==========================================
// 5. HOSTS SECTION - STYLING
// ==========================================
console.log('👤 5/6 Обновление HostsSection...');

writeFile('src/sections/HostsSection.tsx', `import { Users } from 'lucide-react';
import { useData } from '@/context/DataContext';

export function HostsSection() {
  const { hosts } = useData();

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, #B8E8F7 0%, #E0F4F8 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#2D3748] mb-12 text-center">
          Наши <span className="text-[#7C5FBF]">Ведущие</span>
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {hosts.map(host => (
            <div key={host.id} className="bg-white rounded-3xl p-8 shadow-xl shadow-blue-100/50 hover:shadow-2xl transition-all hover:-translate-y-2 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-[#4DD0E1] to-[#7C5FBF]" />
              <div className="relative z-10 mt-8">
                {host.photo_url ? (
                  <img src={host.photo_url} className="w-24 h-24 rounded-full border-4 border-white shadow-lg mx-auto mb-4 object-cover" />
                ) : (
                  <div className={\`w-24 h-24 rounded-full border-4 border-white shadow-lg mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white \${host.color || 'bg-[#7C5FBF]'}\`}>
                    {host.initials || host.name.substring(0, 1)}
                  </div>
                )}
                <h3 className="text-xl font-bold text-[#2D3748] mb-1">{host.name}</h3>
                <p className="text-[#7C5FBF] font-semibold text-sm mb-4">{host.role}</p>
                <div className="bg-[#E0F4F8] rounded-xl p-4 text-sm text-[#2D3748]">
                  {host.bio}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
`);

// ==========================================
// 6. SETTINGS PAGE - ЗАГРУЗКА ПЕРСОНАЖА
// ==========================================
console.log('⚙️ 6/6 Обновление SettingsPage...');

const settingsPath = path.join(__dirname, 'src/admin/pages/SettingsPage.tsx');
if (fs.existsSync(settingsPath)) {
  let content = fs.readFileSync(settingsPath, 'utf-8');
  
  // Ищем место после загрузки логотипа/фавикона и вставляем загрузку персонажа
  if (!content.includes('neppy_image')) {
    content = content.replace(
      `label="Логотип"`,
      `label="Логотип" />\n              <ImageUpload value={formData.neppy_image || ''} onChange={(v) => setFormData({...formData, neppy_image: v})} type="image" label="Изображение персонажа (Neppy)"`
    );
    fs.writeFileSync(settingsPath, content);
    console.log('✅ Поле для персонажа добавлено в админку');
  }
}

console.log('\n' + '='.repeat(60));
console.log('✅ ВСЕ ОБНОВЛЕНИЯ ЗАВЕРШЕНЫ!');
console.log('='.repeat(60));
console.log('\n ЧТО СДЕЛАНО:');
console.log('  ✅ Хедер стилизован (стекло + градиент)');
console.log('  ✅ Блоки на главной кликабельны');
console.log('  ✅ Персонаж динамический (можно менять в админке)');
console.log('  ✅ Подкасты и Ведущие в новом стиле');
console.log('  ✅ DataContext обновлен');

console.log('\n🚀 ЗАПУСТИТЕ:');
console.log('  npm run dev');