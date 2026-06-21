import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎨 === ОБНОВЛЕНИЕ COSMOS FM - HAPPY DESIGN ===\n');

const writeFile = (filePath, content) => {
  const fullPath = path.join(__dirname, filePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, content);
  console.log(`✅ ${filePath}`);
};

// ==========================================
// 1. INDEX.HTML
// ==========================================
console.log('📄 1/3 Обновление index.html...');

writeFile('index.html', `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%237C5FBF'/%3E%3Ctext x='50' y='65' font-size='40' text-anchor='middle' fill='white'%3E📻%3C/text%3E%3C/svg%3E" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="theme-color" content="#7C5FBF" />
    <meta name="description" content="Cosmos FM - Голос вашего отеля" />
    <title>Cosmos FM</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`);

// ==========================================
// 2. INDEX.CSS - ДОБАВЛЕНИЕ АНИМАЦИЙ
// ==========================================
console.log('🎨 2/3 Обновление index.css...');

const cssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * { @apply border-border; }
  html { scroll-behavior: smooth; }
  body { 
    @apply bg-[#0a0a0f] text-white antialiased; 
    font-family: 'Inter', system-ui, sans-serif;
    margin: 0;
    padding: 0;
    min-height: 100vh;
    width: 100%;
    overflow-x: hidden;
  }
}

@layer components {
  .gradient-text { 
    @apply bg-clip-text text-transparent; 
    background-image: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%); 
  }
  .glass-card { 
    @apply bg-[#13131f]/90 backdrop-blur-xl; 
    border: 1px solid rgba(39, 39, 58, 0.5); 
  }
  .glass-player { 
    @apply bg-[#0a0a0f]/95 backdrop-blur-2xl; 
    border-top: 1px solid rgba(39, 39, 58, 0.5); 
  }
  .btn-primary { 
    @apply relative px-6 py-3 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300; 
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); 
  }
  .btn-primary:hover { transform: scale(1.02); filter: brightness(1.1); }
  .btn-secondary { 
    @apply px-6 py-3 rounded-xl font-semibold text-white border border-[#6366f1] bg-transparent transition-all; 
  }
  .section-padding { 
    @apply px-4 sm:px-6 lg:px-8;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  .search-input { @apply w-full px-4 py-3 rounded-xl bg-[#13131f] border border-[#27273a] focus:border-[#6366f1] focus:outline-none; }
  .filter-chip { @apply px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer whitespace-nowrap; }
  .filter-chip.active { @apply bg-[#6366f1] text-white; }
  .filter-chip:not(.active) { @apply bg-[#13131f] text-[#a1a1aa] hover:bg-[#1e1e2e]; }
  .show-card { @apply glass-card rounded-2xl p-4 transition-all duration-300; }
  .show-card:hover { border-color: rgba(99, 102, 241, 0.5); }
  .show-card.live { border-color: rgba(34, 197, 94, 0.5); box-shadow: 0 0 30px rgba(99, 102, 241, 0.4); }
  .category-badge { @apply inline-flex items-center px-3 py-1 rounded-full text-xs font-medium; }
  .fade-in { animation: fadeIn 0.5s ease-in; }
  .slide-up { animation: slideUp 0.5s ease-out; }
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  .scrollbar-hide::-webkit-scrollbar { display: none; }
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

html, body {
  width: 100%;
  overflow-x: hidden;
}

img {
  max-width: 100%;
  height: auto;
}

@media (max-width: 640px) {
  h1 { font-size: 2rem !important; }
  h2 { font-size: 1.5rem !important; }
  .section-padding { padding-left: 0.75rem; padding-right: 0.75rem; }
}

@media (max-width: 480px) {
  h1 { font-size: 1.75rem !important; }
  h2 { font-size: 1.25rem !important; }
  .section-padding { padding-left: 0.5rem; padding-right: 0.5rem; }
}

::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: #0a0a0f; }
::-webkit-scrollbar-thumb { background: #27273a; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #6366f1; }

::selection { background: rgba(99, 102, 241, 0.3); color: white; }

/* Happy Design Animations */
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  33% { transform: translateY(-30px) rotate(120deg); }
  66% { transform: translateY(30px) rotate(240deg); }
}

@keyframes float-character {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes fade-in-right {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes float-card {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.animate-float {
  animation: float 20s ease-in-out infinite;
}

.animate-float-character {
  animation: float-character 6s ease-in-out infinite;
}

.animate-fade-in-right {
  animation: fade-in-right 0.8s ease-out both;
}

.animate-float-card {
  animation: float-card 4s ease-in-out infinite;
}

.animate-float-card-delayed {
  animation: float-card 4s ease-in-out infinite;
  animation-delay: 2s;
}
`;

writeFile('src/index.css', cssContent);

// ==========================================
// 3. HOMESECTION.TSX - HAPPY DESIGN
// ==========================================
console.log('🏠 3/3 Обновление HomeSection.tsx...');

writeFile('src/sections/HomeSection.tsx', `import { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAudio } from '@/context/AudioContext';

export function HomeSection() {
  const { shows, settings } = useData();
  const { playLiveStream, playTrack, currentTrack, isPlaying, isLoading } = useAudio();
  const [isLoaded, setIsLoaded] = useState(false);
  const [characterAnimating, setCharacterAnimating] = useState(false);

  useEffect(() => { 
    setIsLoaded(true); 
  }, []);

  const liveShow = shows.find(show => show.is_live);

  const handlePlayClick = () => {
    setCharacterAnimating(true);
    setTimeout(() => setCharacterAnimating(false), 1000);
    
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
      playLiveStream(settings.stream_url, 'Cosmos FM Эфир');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #B8E8F7 0%, #E0F4F8 100%)' }}>
      {/* Floating Background Shapes */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full opacity-20 animate-float" style={{ width: '300px', height: '300px', background: '#4DD0E1', top: '10%', left: '10%' }} />
        <div className="absolute rounded-full opacity-15 animate-float" style={{ width: '200px', height: '200px', background: '#7C5FBF', top: '60%', right: '10%', animationDelay: '5s' }} />
        <div className="absolute rounded-full opacity-20 animate-float" style={{ width: '150px', height: '150px', background: '#A8E063', bottom: '20%', left: '20%', animationDelay: '10s' }} />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Text Content */}
            <div className={\`transition-all duration-700 \${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}\`}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-lg mb-6">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-bold" style={{ color: '#7C5FBF' }}>Сейчас в эфире: 24/7</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight" style={{ color: '#2D3748' }}>
                Голос вашего
                <span className="block" style={{ background: 'linear-gradient(135deg, #7C5FBF, #4DD0E1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>отеля</span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl mb-8 leading-relaxed" style={{ color: '#718096' }}>
                Первый в России корпоративный медиа-канал в индустрии гостеприимства. 
                Объединяем 4000+ сотрудников и 2.5M гостей по всему миру.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-3xl p-4 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-2xl sm:text-3xl font-extrabold mb-1" style={{ background: 'linear-gradient(135deg, #7C5FBF, #4DD0E1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>4000+</div>
                  <div className="text-xs sm:text-sm font-semibold" style={{ color: '#718096' }}>сотрудников</div>
                </div>
                <div className="bg-white rounded-3xl p-4 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-2xl sm:text-3xl font-extrabold mb-1" style={{ background: 'linear-gradient(135deg, #7C5FBF, #4DD0E1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>2.5M</div>
                  <div className="text-xs sm:text-sm font-semibold" style={{ color: '#718096' }}>гостей</div>
                </div>
                <div className="bg-white rounded-3xl p-4 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-2xl sm:text-3xl font-extrabold mb-1" style={{ background: 'linear-gradient(135deg, #7C5FBF, #4DD0E1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>24/7</div>
                  <div className="text-xs sm:text-sm font-semibold" style={{ color: '#718096' }}>вещание</div>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl mb-3 flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg, #4DD0E1, #7C5FBF)' }}>🎙️</div>
                  <h3 className="font-bold mb-1" style={{ color: '#2D3748' }}>Live эфир</h3>
                  <p className="text-xs" style={{ color: '#718096' }}>Профессиональное радио</p>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl mb-3 flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg, #4DD0E1, #7C5FBF)' }}>🎧</div>
                  <h3 className="font-bold mb-1" style={{ color: '#2D3748' }}>Подкасты</h3>
                  <p className="text-xs" style={{ color: '#718096' }}>Эксклюзивный контент</p>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl mb-3 flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg, #4DD0E1, #7C5FBF)' }}>🌟</div>
                  <h3 className="font-bold mb-1" style={{ color: '#2D3748' }}>Артисты</h3>
                  <p className="text-xs" style={{ color: '#718096' }}>Таланты отелей</p>
                </div>
              </div>
            </div>

            {/* Right Side - Character with Play Button */}
            <div className={\`flex justify-center items-center transition-all duration-700 delay-200 \${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}\`}>
              <div className="relative">
                <div className={\`relative cursor-pointer transition-transform duration-300 \${characterAnimating ? 'scale-95' : 'hover:scale-105'} \${isPlaying ? 'animate-bounce' : 'animate-float-character'}\`} onClick={handlePlayClick}>
                  {/* Character Body */}
                  <div className="relative w-80 h-96 sm:w-96 sm:h-[28rem]">
                    {/* Main Body */}
                    <div className="absolute inset-0 rounded-[50%_50%_45%_45%] shadow-2xl" style={{ background: 'linear-gradient(180deg, #4DD0E1 0%, #26C6DA 100%)', boxShadow: '0 20px 60px rgba(77, 208, 225, 0.4), inset 0 -10px 30px rgba(0,0,0,0.1)' }}>
                      {/* Green Spots */}
                      {[
                        { top: 'top-16', left: 'left-12', w: 'w-4', h: 'h-6' },
                        { top: 'top-24', left: 'right-16', w: 'w-3', h: 'h-5' },
                        { top: 'top-32', left: 'left-20', w: 'w-5', h: 'h-7' },
                        { top: 'top-40', left: 'right-24', w: 'w-4', h: 'h-6' },
                        { top: 'top-48', left: 'left-28', w: 'w-3', h: 'h-5' },
                        { top: 'top-56', left: 'right-32', w: 'w-4', h: 'h-6' },
                        { top: 'absolute bottom-32', left: 'left-16', w: 'w-4', h: 'h-6' },
                        { top: 'bottom-24', left: 'right-20', w: 'w-3', h: 'h-5' },
                      ].map((spot, i) => (
                        <div key={i} className={\`absolute \${spot.top} \${spot.left} \${spot.w} \${spot.h} rounded-full opacity-60\`} style={{ background: '#A8E063' }} />
                      ))}

                      {/* Face */}
                      <div className="absolute top-28 left-0 right-0">
                        <div className="flex justify-center gap-12 mb-6">
                          {[0, 1].map((i) => (
                            <div key={i} className="relative">
                              <div className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                                <div className="w-4 h-4 rounded-full bg-gray-800 relative">
                                  <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full bg-white" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-center">
                          <div className="w-12 h-6 border-b-4 border-gray-700 rounded-full" />
                        </div>
                      </div>

                      {/* Arms */}
                      <div className="absolute top-32 -left-8 w-16 h-32 rounded-full" style={{ background: 'linear-gradient(180deg, #4DD0E1 0%, #26C6DA 100%)' }} />
                      <div className="absolute top-32 -right-8 w-16 h-32 rounded-full" style={{ background: 'linear-gradient(180deg, #4DD0E1 0%, #26C6DA 100%)' }} />

                      {/* Purple Hat */}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                        <div className="relative">
                          <div className="w-32 h-20 rounded-t-full" style={{ background: 'linear-gradient(180deg, #7C5FBF 0%, #6A4FB5 100%)', boxShadow: '0 4px 15px rgba(124, 95, 191, 0.3)' }}>
                            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-lg">
                              <span className="text-xs font-bold" style={{ color: '#7C5FBF' }}>COSMOS</span>
                            </div>
                          </div>
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-white shadow-lg" />
                        </div>
                      </div>

                      {/* Play Button */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                        <button
                          className={\`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl hover:scale-110 \${isPlaying ? 'bg-white scale-95' : 'bg-white/90 hover:bg-white'}\`}
                          style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}
                          onClick={(e) => { e.stopPropagation(); handlePlayClick(); }}
                        >
                          {isLoading ? (
                            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                          ) : isPlaying ? (
                            <Pause className="w-10 h-10" style={{ color: '#7C5FBF' }} />
                          ) : (
                            <Play className="w-10 h-10 ml-1" style={{ color: '#7C5FBF' }} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Speech Bubble */}
                    <div className="absolute -top-4 -right-4 sm:right-8 bg-white px-6 py-4 rounded-3xl shadow-xl animate-fade-in-right" style={{ animationDelay: '0.5s' }}>
                      <p className="text-lg sm:text-xl font-extrabold" style={{ color: '#7C5FBF' }}>ПРИВЕТ!<br />Я НЭППИ</p>
                      <div className="absolute bottom-4 -left-2 w-4 h-4 transform rotate-45" style={{ background: 'white' }} />
                    </div>

                    {/* Floating Cards */}
                    <div className="absolute -left-4 top-20 bg-white px-4 py-3 rounded-2xl shadow-lg animate-float-card">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: 'linear-gradient(135deg, #4DD0E1, #7C5FBF)' }}>🎵</div>
                        <div>
                          <div className="text-xs font-bold" style={{ color: '#2D3748' }}>Live эфир</div>
                          <div className="text-xs" style={{ color: '#718096' }}>Сейчас играет</div>
                        </div>
                      </div>
                    </div>

                    <div className="absolute -right-4 bottom-32 bg-white px-4 py-3 rounded-2xl shadow-lg animate-float-card-delayed">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: 'linear-gradient(135deg, #4DD0E1, #7C5FBF)' }}>🎙️</div>
                        <div>
                          <div className="text-xs font-bold" style={{ color: '#2D3748' }}>Подкасты</div>
                          <div className="text-xs" style={{ color: '#718096' }}>12 новых</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`);

// ==========================================
// ИТОГ
// ==========================================
console.log('\n' + '='.repeat(60));
console.log('✅ ВСЕ ФАЙЛЫ ОБНОВЛЕНЫ!');
console.log('='.repeat(60));
console.log('\n📋 ЧТО ОБНОВЛЕНО:');
console.log('  ✅ index.html - исправлена структура');
console.log('  ✅ src/index.css - добавлены анимации');
console.log('  ✅ src/sections/HomeSection.tsx - Happy Design');

console.log('\n🎨 ДИЗАЙН:');
console.log('  💙 Цветовая палитра Нэппи');
console.log('  👾 Персонаж с кнопкой Play');
console.log('  🎵 Клик по персонажу запускает эфир');
console.log('  🎨 Парящие анимации');
console.log('  📱 Полная адаптивность');

console.log('\n🚀 ЗАПУСТИТЕ:');
console.log('  npm run dev');
console.log('\nОткройте http://localhost:5173 и наслаждайтесь!');
console.log('Кликните по Нэппи или кнопке Play для запуска эфира! 🎉');