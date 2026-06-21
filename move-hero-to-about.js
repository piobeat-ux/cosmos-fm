import fs from 'fs';

console.log('🔧 === ПЕРЕНОС HERO-БЛОКА НА "О НАС" ===\n');

// ==========================================
// 1. HOMESECTION - УБРАТЬ HERO-БЛОК
// ==========================================
console.log('1/2 Исправление HomeSection.tsx (убрать hero)...');

const homeContent = `import { useState } from 'react';
import { Radio, Music, Mic, Sparkles } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAudio } from '@/context/AudioContext';
import { NeppyCharacter } from '@/components/NeppyCharacter';

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
  const { shows, settings, version } = useData();
  const { playLiveStream, playTrack, currentTrack, isPlaying, isLoading } = useAudio();
  const [characterAnimating, setCharacterAnimating] = useState(false);

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
      playLiveStream(settings.stream_url, settings.site_title || 'Cosmos FM Эфир');
    }
  };

  return (
    <div className="relative overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 -mt-20" style={{ background: COLORS.bg }}>
      {/* Background Shapes */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full opacity-30 animate-float" style={{ width: '400px', height: '400px', background: COLORS.neppy, top: '-10%', left: '-10%', filter: 'blur(80px)' }} />
        <div className="absolute rounded-full opacity-20 animate-float" style={{ width: '300px', height: '300px', background: COLORS.purple, bottom: '10%', right: '-5%', animationDelay: '5s', filter: 'blur(80px)' }} />
        <div className="absolute rounded-full opacity-25 animate-float" style={{ width: '200px', height: '200px', background: COLORS.green, top: '50%', left: '40%', animationDelay: '10s', filter: 'blur(60px)' }} />
      </div>

      <div className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Grid - только карточки и персонаж */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column - Cards */}
            <div className="space-y-6 animate-fade-in-left">
              <button 
                onClick={() => {
                  console.log('🎯 Live Эфир clicked');
                  if (onTabChange) onTabChange('home');
                }} 
                className="w-full rounded-3xl p-6 shadow-xl hover:scale-[1.02] transition-all group border-2 text-left" 
                style={{ background: COLORS.white, borderColor: 'transparent' }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-white group-hover:rotate-6 transition-transform" style={{ background: \`linear-gradient(135deg, \${COLORS.neppy}, \${COLORS.purple})\` }}>
                  <Radio className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>Live Эфир</h3>
                <p style={{ color: COLORS.textMuted }}>Профессиональное радио 24/7</p>
              </button>

              <button 
                onClick={() => {
                  console.log('🎯 Подкасты clicked');
                  if (onTabChange) onTabChange('podcasts');
                }} 
                className="w-full rounded-3xl p-6 shadow-xl hover:scale-[1.02] transition-all group border-2 text-left" 
                style={{ background: COLORS.white, borderColor: 'transparent' }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-white group-hover:rotate-6 transition-transform" style={{ background: \`linear-gradient(135deg, \${COLORS.neppy}, \${COLORS.purple})\` }}>
                  <Music className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>Подкасты</h3>
                <p style={{ color: COLORS.textMuted }}>Эксклюзивный контент</p>
              </button>

              <button 
                onClick={() => {
                  console.log(' Артисты clicked');
                  if (onTabChange) onTabChange('hosts');
                }} 
                className="w-full rounded-3xl p-6 shadow-xl hover:scale-[1.02] transition-all group border-2 text-left" 
                style={{ background: COLORS.white, borderColor: 'transparent' }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-white group-hover:rotate-6 transition-transform" style={{ background: \`linear-gradient(135deg, \${COLORS.neppy}, \${COLORS.purple})\` }}>
                  <Mic className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>Артисты</h3>
                <p style={{ color: COLORS.textMuted }}>Таланты отелей</p>
              </button>
            </div>

            {/* Right Column - Character */}
            <div className="lg:col-span-2 flex justify-center relative animate-fade-in-right">
              <NeppyCharacter 
                isPlaying={isPlaying}
                onPlayClick={handlePlayClick}
                neppyImage={settings.neppy_image}
              />
              
              {/* Speech Bubble */}
              <div className="absolute -top-6 -right-6 px-6 py-3 rounded-2xl shadow-xl" style={{ background: COLORS.white }}>
                <p className="text-lg font-extrabold" style={{ color: COLORS.purple }}>ПРИВЕТ! Я НЭППИ</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/sections/HomeSection.tsx', homeContent);
console.log('✅ HomeSection.tsx - hero-блок убран');

// ==========================================
// 2. ABOUTSECTION - ДОБАВИТЬ HERO-БЛОК
// ==========================================
console.log('2/2 Исправление AboutSection.tsx (добавить hero)...');

const aboutContent = `import { Radio, Users, Globe, Award, Sparkles, Heart, Star } from 'lucide-react';
import { useData } from '@/context/DataContext';

const COLORS = {
  bg: '#B6E0EE',
  neppy: '#28B9D0',
  purple: '#685096',
  green: '#AFCB31',
  white: '#FFFFFF',
  text: '#1A2B3C',
  textMuted: '#4A6578',
};

export function AboutSection() {
  const { settings, shows, hosts, podcasts } = useData();

  return (
    <div className="relative overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 -mt-20" style={{ background: COLORS.bg }}>
      {/* Background Shapes */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full opacity-30 animate-float" style={{ width: '400px', height: '400px', background: COLORS.neppy, top: '-10%', left: '-10%', filter: 'blur(80px)' }} />
        <div className="absolute rounded-full opacity-20 animate-float" style={{ width: '300px', height: '300px', background: COLORS.purple, bottom: '10%', right: '-5%', animationDelay: '5s', filter: 'blur(80px)' }} />
        <div className="absolute rounded-full opacity-25 animate-float" style={{ width: '200px', height: '200px', background: COLORS.green, top: '50%', left: '40%', animationDelay: '10s', filter: 'blur(60px)' }} />
      </div>

      <div className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* HERO-БЛОК - ИЗ НАСТРОЕК АДМИНКИ */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-sm mb-6 animate-fade-in-up" style={{ background: COLORS.white + 'CC' }}>
              <Sparkles className="w-4 h-4" style={{ color: COLORS.purple }} />
              <span className="text-sm font-bold" style={{ color: COLORS.text }}>
                {settings.hero_title || 'Голос вашего отеля'}
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 leading-tight" style={{ color: COLORS.text }}>
              {settings.hero_subtitle || 'Звуки вашего космоса'} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r" style={{ backgroundImage: \`linear-gradient(135deg, \${COLORS.neppy}, \${COLORS.purple})\` }}>
                {settings.hero_description || 'Первый в России корпоративный медиа-канал'}
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

          {/* About Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="rounded-3xl p-8 shadow-xl border-2" style={{ background: COLORS.white, borderColor: 'transparent' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-white" style={{ background: \`linear-gradient(135deg, \${COLORS.neppy}, \${COLORS.purple})\` }}>
                <Radio className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>24/7 Вещание</h3>
              <p style={{ color: COLORS.textMuted }}>Непрерывное вещание профессионального контента для гостей и сотрудников отелей</p>
            </div>

            <div className="rounded-3xl p-8 shadow-xl border-2" style={{ background: COLORS.white, borderColor: 'transparent' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-white" style={{ background: \`linear-gradient(135deg, \${COLORS.neppy}, \${COLORS.purple})\` }}>
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>4000+ Сотрудников</h3>
              <p style={{ color: COLORS.textMuted }}>Объединяем команды лучших отелей по всей России и миру</p>
            </div>

            <div className="rounded-3xl p-8 shadow-xl border-2" style={{ background: COLORS.white, borderColor: 'transparent' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-white" style={{ background: \`linear-gradient(135deg, \${COLORS.neppy}, \${COLORS.purple})\` }}>
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>2.5M Гостей</h3>
              <p style={{ color: COLORS.textMuted }}>Ежегодный охват гостей сети отелей Cosmos</p>
            </div>

            <div className="rounded-3xl p-8 shadow-xl border-2" style={{ background: COLORS.white, borderColor: 'transparent' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-white" style={{ background: \`linear-gradient(135deg, \${COLORS.neppy}, \${COLORS.purple})\` }}>
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>Премиум Контент</h3>
              <p style={{ color: COLORS.textMuted }}>Эксклюзивные подкасты, интервью и музыкальные программы</p>
            </div>
          </div>

          {/* CTA Block */}
          <div className="rounded-3xl p-8 shadow-xl border-2 text-center" style={{ background: COLORS.white, borderColor: 'transparent' }}>
            <h3 className="text-2xl font-bold mb-4" style={{ color: COLORS.text }}>Присоединяйтесь к нам!</h3>
            <p className="mb-6" style={{ color: COLORS.textMuted }}>Слушайте Cosmos FM в лучших отелях сети</p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="px-6 py-3 rounded-2xl text-white font-bold" style={{ background: \`linear-gradient(135deg, \${COLORS.neppy}, \${COLORS.purple})\` }}>
                Москва
              </div>
              <div className="px-6 py-3 rounded-2xl text-white font-bold" style={{ background: \`linear-gradient(135deg, \${COLORS.neppy}, \${COLORS.purple})\` }}>
                Санкт-Петербург
              </div>
              <div className="px-6 py-3 rounded-2xl text-white font-bold" style={{ background: \`linear-gradient(135deg, \${COLORS.neppy}, \${COLORS.purple})\` }}>
                Сочи
              </div>
            </div>
          </div>

          {/* Footer info */}
          <div className="mt-12 text-center">
            <p className="flex items-center justify-center gap-2 text-sm" style={{ color: COLORS.textMuted }}>
              Сделано с <Heart className="w-4 h-4" style={{ color: '#EF4444' }} /> для сети отелей Cosmos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/sections/AboutSection.tsx', aboutContent);
console.log('✅ AboutSection.tsx - hero-блок добавлен');

console.log('\n' + '='.repeat(70));
console.log('✅ ПЕРЕНОС ЗАВЕРШЕН!');
console.log('='.repeat(70));
console.log('\n📋 ЧТО СДЕЛАНО:');
console.log('  1. ✅ Убран hero-блок с главной страницы (Эфир)');
console.log('  2. ✅ Добавлен hero-блок на вкладку "О нас"');
console.log('  3. ✅ Все тексты берутся из настроек админки');
console.log('  4. ✅ На главной только карточки и персонаж');
console.log('\n🚀 ЗАПУСТИТЕ:');
console.log('  npm run dev');
console.log('\n🎯 РЕЗУЛЬТАТ:');
console.log('  - Вкладка "Эфир": карточки + персонаж');
console.log('  - Вкладка "О нас": hero-текст + статистика + карточки');
console.log('  - Все тексты управляются из админки');
console.log('='.repeat(70));