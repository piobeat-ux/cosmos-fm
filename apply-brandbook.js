import fs from 'fs';
import path from 'path';

console.log('🎨 === ПРИМЕНЕНИЕ БРЕНДБУКА COSMOS/NEPPY ===\n');

// Цвета из брендбука
const COLORS = {
  bg: '#B6E0EE',          // PANTONE 628C - основной фон
  neppy: '#28B9D0',       // PANTONE 3125C - цвет Нэппи
  purple: '#685096',      // PANTONE 2088C - шапка
  green: '#AFCB31',       // PANTONE 382C - пятна
  white: '#FFFFFF',
  text: '#1A2B3C',        // Темный для читаемости
  textMuted: '#4A6578',
};

const writeFile = (filePath, content) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content);
  console.log(`✅ ${filePath}`);
};

// ==========================================
// 1. INDEX.CSS - только цвета и стили
// ==========================================
console.log('1/5 Обновление index.css (цвета брендбука)...');

const cssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    border-color: ${COLORS.neppy}40;
  }
  html {
    scroll-behavior: smooth;
  }
  body {
    background-color: ${COLORS.bg};
    color: ${COLORS.text};
    font-family: 'Circe', 'Inter', system-ui, sans-serif;
    margin: 0;
    padding: 0;
    min-height: 100vh;
    width: 100%;
    overflow-x: hidden;
  }
}

@layer components {
  .gradient-text {
    background-clip: text;
    -webkit-background-clip: text;
    background-image: linear-gradient(135deg, ${COLORS.neppy} 0%, ${COLORS.purple} 100%);
  }
  
  .glass-card {
    background-color: ${COLORS.white}E6;
    backdrop-filter: blur(12px);
    border: 1px solid ${COLORS.neppy}30;
    box-shadow: 0 8px 32px ${COLORS.purple}15;
  }
  
  .glass-player {
    background-color: ${COLORS.white}F5;
    backdrop-filter: blur(24px);
    border-top: 2px solid ${COLORS.neppy};
    box-shadow: 0 -4px 20px ${COLORS.purple}20;
  }
  
  .btn-primary {
    position: relative;
    padding: 0.75rem 1.5rem;
    border-radius: 0.75rem;
    font-weight: 600;
    color: white;
    overflow: hidden;
    transition: all 0.3s;
    background: linear-gradient(135deg, ${COLORS.neppy} 0%, ${COLORS.purple} 100%);
    box-shadow: 0 4px 15px ${COLORS.neppy}40;
  }
  .btn-primary:hover {
    transform: scale(1.02);
    filter: brightness(1.1);
  }
  
  .btn-secondary {
    padding: 0.75rem 1.5rem;
    border-radius: 0.75rem;
    font-weight: 600;
    color: ${COLORS.purple};
    border: 2px solid ${COLORS.purple};
    background: transparent;
    transition: all 0.3s;
  }
  .btn-secondary:hover {
    background: ${COLORS.purple};
    color: white;
  }
  
  .section-padding {
    padding-left: 1rem;
    padding-right: 1rem;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  @media (min-width: 640px) {
    .section-padding {
      padding-left: 1.5rem;
      padding-right: 1.5rem;
    }
  }
  @media (min-width: 1024px) {
    .section-padding {
      padding-left: 2rem;
      padding-right: 2rem;
    }
  }
  
  .search-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    background-color: ${COLORS.white};
    border: 2px solid ${COLORS.neppy}40;
    outline: none;
    color: ${COLORS.text};
  }
  .search-input:focus {
    border-color: ${COLORS.neppy};
    box-shadow: 0 0 0 3px ${COLORS.neppy}20;
  }
  
  .filter-chip {
    padding: 0.5rem 1rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.3s;
    cursor: pointer;
    white-space: nowrap;
  }
  .filter-chip.active {
    background: linear-gradient(135deg, ${COLORS.neppy}, ${COLORS.purple});
    color: white;
  }
  .filter-chip:not(.active) {
    background-color: ${COLORS.white};
    color: ${COLORS.textMuted};
    border: 1px solid ${COLORS.neppy}30;
  }
  .filter-chip:not(.active):hover {
    background-color: ${COLORS.neppy}10;
    border-color: ${COLORS.neppy};
  }
  
  .show-card {
    background-color: ${COLORS.white}E6;
    backdrop-filter: blur(12px);
    border: 1px solid ${COLORS.neppy}30;
    border-radius: 1rem;
    padding: 1rem;
    transition: all 0.3s;
  }
  .show-card:hover {
    border-color: ${COLORS.neppy};
    transform: translateY(-2px);
    box-shadow: 0 12px 32px ${COLORS.purple}20;
  }
  .show-card.live {
    border-color: ${COLORS.green};
    box-shadow: 0 8px 24px ${COLORS.green}30;
  }
  
  .category-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    background: ${COLORS.neppy}20;
    color: ${COLORS.purple};
  }
  
  .fade-in { animation: fadeIn 0.5s ease-in; }
  .slide-up { animation: slideUp 0.5s ease-out; }
  
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar { display: none; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

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
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes float-card {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.animate-float { animation: float 20s ease-in-out infinite; }
.animate-float-character { animation: float-character 6s ease-in-out infinite; }
.animate-fade-in-right { animation: fade-in-right 0.8s ease-out both; }
.animate-float-card { animation: float-card 4s ease-in-out infinite; }
.animate-float-card-delayed {
  animation: float-card 4s ease-in-out infinite;
  animation-delay: 2s;
}

html, body {
  width: 100%;
  overflow-x: hidden;
}

img { max-width: 100%; height: auto; }

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

::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: ${COLORS.bg}; }
::-webkit-scrollbar-thumb { background: ${COLORS.neppy}; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: ${COLORS.purple}; }

::selection {
  background: ${COLORS.neppy}60;
  color: ${COLORS.text};
}
`;

writeFile('src/index.css', cssContent);

// ==========================================
// 2. HOMESECTION - цвета брендбука
// ==========================================
console.log('2/5 Обновление HomeSection.tsx (цвета)...');

const homeContent = `import { useState, useEffect } from 'react';
import { Play, Pause, Radio, Music, Mic, ChevronDown, Sparkles } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAudio } from '@/context/AudioContext';

const COLORS = {
  bg: '#B6E0EE',
  neppy: '#28B9D0',
  purple: '#685096',
  green: '#AFCB31',
  white: '#FFFFFF',
  text: '#1A2B3C',
  textMuted: '#4A6578',
};

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
    <div className="min-h-screen relative overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 -mt-20" style={{ background: COLORS.bg }}>
      {/* Background Shapes - цвета брендбука */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full opacity-30 animate-float" style={{ width: '400px', height: '400px', background: COLORS.neppy, top: '-10%', left: '-10%', filter: 'blur(80px)' }} />
        <div className="absolute rounded-full opacity-20 animate-float" style={{ width: '300px', height: '300px', background: COLORS.purple, bottom: '10%', right: '-5%', animationDelay: '5s', filter: 'blur(80px)' }} />
        <div className="absolute rounded-full opacity-25 animate-float" style={{ width: '200px', height: '200px', background: COLORS.green, top: '50%', left: '40%', animationDelay: '10s', filter: 'blur(60px)' }} />
      </div>

      <div className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Title */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-sm mb-6 animate-fade-in-up" style={{ background: COLORS.white + 'CC' }}>
              <Sparkles className="w-4 h-4" style={{ color: COLORS.purple }} />
              <span className="text-sm font-bold" style={{ color: COLORS.text }}>Голос вашего отеля</span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 leading-tight" style={{ color: COLORS.text }}>
              Первый в России <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r" style={{ backgroundImage: \`linear-gradient(135deg, \${COLORS.neppy}, \${COLORS.purple})\` }}>
                корпоративный медиа-канал
              </span>
            </h1>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: COLORS.textMuted }}>
              В индустрии гостеприимства. Объединяем 4000+ сотрудников и 2.5M гостей по всему миру.
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {['4000+ сотрудников', '2.5M гостей', '24/7 вещание'].map((stat, i) => (
              <div key={i} className="rounded-2xl px-8 py-4 shadow-lg border-2 animate-fade-in-up" style={{ 
                background: COLORS.white, 
                borderColor: COLORS.neppy + '40',
                animationDelay: \`\${i * 100}ms\` 
              }}>
                <span className="text-2xl font-bold" style={{ color: COLORS.text }}>{stat}</span>
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column - Cards */}
            <div className="space-y-6 animate-fade-in-left">
              <button onClick={() => onTabChange && onTabChange('home')} className="w-full rounded-3xl p-6 shadow-xl hover:scale-[1.02] transition-all group border-2 text-left" style={{ background: COLORS.white, borderColor: 'transparent' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-white group-hover:rotate-6 transition-transform" style={{ background: \`linear-gradient(135deg, \${COLORS.neppy}, \${COLORS.purple})\` }}>
                  <Radio className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>Live Эфир</h3>
                <p style={{ color: COLORS.textMuted }}>Профессиональное радио 24/7</p>
              </button>

              <button onClick={() => onTabChange && onTabChange('podcasts')} className="w-full rounded-3xl p-6 shadow-xl hover:scale-[1.02] transition-all group border-2 text-left" style={{ background: COLORS.white, borderColor: 'transparent' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-white group-hover:rotate-6 transition-transform" style={{ background: \`linear-gradient(135deg, \${COLORS.neppy}, \${COLORS.purple})\` }}>
                  <Music className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>Подкасты</h3>
                <p style={{ color: COLORS.textMuted }}>Эксклюзивный контент</p>
              </button>

              <button onClick={() => onTabChange && onTabChange('hosts')} className="w-full rounded-3xl p-6 shadow-xl hover:scale-[1.02] transition-all group border-2 text-left" style={{ background: COLORS.white, borderColor: 'transparent' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-white group-hover:rotate-6 transition-transform" style={{ background: \`linear-gradient(135deg, \${COLORS.neppy}, \${COLORS.purple})\` }}>
                  <Mic className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>Артисты</h3>
                <p style={{ color: COLORS.textMuted }}>Таланты отелей</p>
              </button>
            </div>

            {/* Right Column - Character */}
            <div className="lg:col-span-2 flex justify-center relative animate-fade-in-right">
              <div className={\`relative cursor-pointer transition-transform duration-300 \${characterAnimating ? 'scale-95' : 'hover:scale-105'} \${isPlaying ? 'animate-bounce' : 'animate-float-character'}\`}>
                <div className="w-80 h-80 sm:w-96 sm:h-96 relative">
                  
                  {/* Character Body - точные цвета из брендбука */}
                  <div className="absolute inset-0 rounded-[50%_50%_45%_45%] shadow-2xl" style={{ 
                    background: \`linear-gradient(180deg, \${COLORS.neppy} 0%, #1FA8C0 100%)\`,
                    boxShadow: \`0 20px 60px \${COLORS.neppy}60, inset 0 -10px 30px rgba(0,0,0,0.1)\`
                  }}>
                    
                    {settings.neppy_image ? (
                      <img src={settings.neppy_image} alt="Neppy" className="w-full h-full object-cover rounded-[50%_50%_45%_45%]" />
                    ) : (
                      <>
                        {/* Green Spots - Pantone 382C */}
                        <div className="absolute top-16 left-12 w-4 h-6 rounded-full opacity-70" style={{ background: COLORS.green }} />
                        <div className="absolute top-24 right-16 w-3 h-5 rounded-full opacity-70" style={{ background: COLORS.green }} />
                        <div className="absolute top-32 left-20 w-5 h-7 rounded-full opacity-70" style={{ background: COLORS.green }} />
                        <div className="absolute top-40 right-24 w-4 h-6 rounded-full opacity-70" style={{ background: COLORS.green }} />
                        <div className="absolute top-48 left-28 w-3 h-5 rounded-full opacity-70" style={{ background: COLORS.green }} />
                        
                        {/* Face */}
                        <div className="absolute top-32 left-0 right-0 flex justify-center gap-12">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: COLORS.white, boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
                            <div className="w-4 h-4 rounded-full bg-gray-800 relative"><div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full" style={{ background: COLORS.white }} /></div>
                          </div>
                          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: COLORS.white, boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
                            <div className="w-4 h-4 rounded-full bg-gray-800 relative"><div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full" style={{ background: COLORS.white }} /></div>
                          </div>
                        </div>
                        <div className="absolute top-52 left-0 right-0 flex justify-center"><div className="w-12 h-6 border-b-4 rounded-full" style={{ borderColor: COLORS.text }} /></div>
                        
                        {/* Arms */}
                        <div className="absolute top-40 -left-12 w-20 h-32 rounded-full" style={{ background: \`linear-gradient(180deg, \${COLORS.neppy} 0%, #1FA8C0 100%)\` }} />
                        <div className="absolute top-40 -right-12 w-20 h-32 rounded-full" style={{ background: \`linear-gradient(180deg, \${COLORS.neppy} 0%, #1FA8C0 100%)\` }} />

                        {/* Hat - Pantone 2088C */}
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-24 rounded-t-full flex items-start justify-center pt-4" style={{ 
                          background: \`linear-gradient(180deg, \${COLORS.purple} 0%, #553D80 100%)\`,
                          boxShadow: \`0 4px 20px \${COLORS.purple}40\`
                        }}>
                           <div className="px-3 py-1 rounded-lg text-xs font-bold" style={{ background: COLORS.white, color: COLORS.purple }}>COSMOS</div>
                           <div className="absolute -top-8 w-14 h-14 rounded-full" style={{ background: COLORS.white, boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }} />
                        </div>
                      </>
                    )}

                    {/* Play Button */}
                    <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full backdrop-blur shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-20"
                      style={{ background: COLORS.white + 'EE', boxShadow: \`0 8px 30px \${COLORS.purple}40\` }}
                      onClick={(e) => { e.stopPropagation(); handlePlayClick(); }}>
                      {isLoading ? (
                        <div className="animate-spin w-8 h-8 border-4 rounded-full" style={{ borderColor: COLORS.purple, borderTopColor: 'transparent' }} />
                      ) : isPlaying ? (
                        <Pause className="w-10 h-10" style={{ color: COLORS.purple }} />
                      ) : (
                        <Play className="w-10 h-10 ml-1" style={{ color: COLORS.purple }} />
                      )}
                    </button>
                  </div>
                  
                  {/* Speech Bubble */}
                  <div className="absolute -top-6 -right-6 px-6 py-3 rounded-2xl shadow-xl" style={{ background: COLORS.white }}>
                    <p className="text-lg font-extrabold" style={{ color: COLORS.purple }}>ПРИВЕТ! Я НЭППИ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-20 animate-bounce cursor-pointer" style={{ color: COLORS.purple }} onClick={() => window.scrollTo({top: window.innerHeight, behavior: 'smooth'})}>
             <ChevronDown className="w-8 h-8" />
          </div>
        </div>
      </div>
    </div>
  );
}
`;

writeFile('src/sections/HomeSection.tsx', homeContent);

// ==========================================
// 3. HEADER - цвета брендбука
// ==========================================
console.log('3/5 Обновление Header.tsx...');

const headerContent = `import { Radio, Menu, X, Bell, Search } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useState } from 'react';

const COLORS = {
  bg: '#B6E0EE',
  neppy: '#28B9D0',
  purple: '#685096',
  green: '#AFCB31',
  white: '#FFFFFF',
  text: '#1A2B3C',
  textMuted: '#4A6578',
};

export function Header({ onTabChange, activeTab }) {
  const { navigationLinks } = useData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <div className="max-w-7xl mx-auto rounded-2xl border-2 px-6 py-3 flex items-center justify-between shadow-lg" style={{ 
        background: COLORS.white + 'F0', 
        backdropFilter: 'blur(20px)',
        borderColor: COLORS.neppy + '40'
      }}>
        <button onClick={() => onTabChange('home')} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform" style={{ 
            background: \`linear-gradient(135deg, \${COLORS.neppy}, \${COLORS.purple})\` 
          }}>
            <Radio className="w-5 h-5" style={{ color: COLORS.white }} />
          </div>
          <span className="text-xl font-bold tracking-wide text-transparent bg-clip-text" style={{ 
            backgroundImage: \`linear-gradient(90deg, \${COLORS.purple}, \${COLORS.neppy})\`
          }}>
            Cosmos FM
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-1 rounded-xl p-1" style={{ background: COLORS.bg + '60' }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
              style={activeTab === item.id 
                ? { background: \`linear-gradient(135deg, \${COLORS.neppy}, \${COLORS.purple})\`, color: COLORS.white, boxShadow: \`0 4px 12px \${COLORS.purple}40\` }
                : { color: COLORS.text, background: 'transparent' }
              }
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg transition" style={{ color: COLORS.textMuted }}>
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg transition relative" style={{ color: COLORS.textMuted }}>
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: COLORS.green }} />
          </button>
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X style={{ color: COLORS.text }} /> : <Menu style={{ color: COLORS.text }} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden mt-2 rounded-2xl border-2 p-4 shadow-xl" style={{ 
          background: COLORS.white + 'F5',
          borderColor: COLORS.neppy + '40'
        }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { onTabChange(item.id); setMobileMenuOpen(false); }}
              className="w-full text-left px-4 py-3 rounded-lg font-bold transition-all mb-1"
              style={activeTab === item.id
                ? { background: \`linear-gradient(135deg, \${COLORS.neppy}, \${COLORS.purple})\`, color: COLORS.white }
                : { color: COLORS.text }
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
`;

writeFile('src/components/Header.tsx', headerContent);

// ==========================================
// 4. MINIPLAYER - цвета брендбука
// ==========================================
console.log('4/5 Обновление MiniPlayer.tsx...');

const miniPlayerPath = 'src/components/MiniPlayer.tsx';
if (fs.existsSync(miniPlayerPath)) {
  let content = fs.readFileSync(miniPlayerPath, 'utf-8');
  // Заменяем только цвета
  content = content
    .replace(/#0a0a0f/g, '#FFFFFF')
    .replace(/#13131f/g, '#F5FBFD')
    .replace(/#6366f1/g, '#685096')
    .replace(/#8b5cf6/g, '#28B9D0')
    .replace(/#a1a1aa/g, '#4A6578')
    .replace(/#71717a/g, '#4A6578')
    .replace(/#27273a/g, '#B6E0EE')
    .replace(/text-white/g, 'text-[#1A2B3C]');
  writeFile(miniPlayerPath, content);
}

// ==========================================
// 5. BOTTOMNAV - цвета брендбука
// ==========================================
console.log('5/5 Обновление BottomNav.tsx...');

const bottomNavPath = 'src/components/BottomNav.tsx';
if (fs.existsSync(bottomNavPath)) {
  let content = fs.readFileSync(bottomNavPath, 'utf-8');
  content = content
    .replace(/#0a0a0f/g, '#FFFFFF')
    .replace(/#13131f/g, '#F5FBFD')
    .replace(/#6366f1/g, '#28B9D0')
    .replace(/#8b5cf6/g, '#685096')
    .replace(/#a1a1aa/g, '#4A6578')
    .replace(/#71717a/g, '#4A6578');
  writeFile(bottomNavPath, content);
}

console.log('\n' + '='.repeat(60));
console.log('✅ БРЕНДБУК ПРИМЕНЕН!');
console.log('='.repeat(60));
console.log('\n🎨 ЦВЕТА ИЗ БРЕНДБУКА:');
console.log('  🩵 Фон:        #B6E0EE (Pantone 628C)');
console.log('  🩵 Нэппи:      #28B9D0 (Pantone 3125C)');
console.log('  💜 Фиолетовый: #685096 (Pantone 2088C)');
console.log('  💚 Салатовый:  #AFCB31 (Pantone 382C)');
console.log('\n🔒 ЛОГИКА НЕ ИЗМЕНЕНА:');
console.log('  ✅ App.tsx не изменен');
console.log('  ✅ DataContext не изменен');
console.log('  ✅ AudioContext не изменен');
console.log('  ✅ lib/supabase.ts не изменен');
console.log('  ✅ Плееры работают как раньше');
console.log('\n🚀 ЗАПУСТИТЕ: npm run dev');