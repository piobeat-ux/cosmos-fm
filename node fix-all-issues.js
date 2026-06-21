cat > fix-all-issues.js << 'ENDOFSCRIPT'
import fs from 'fs';

console.log('🔧 Fixing all issues...\n');

// 1. Fix HomeSection.tsx
const homeSectionContent = `import { useState, useEffect } from 'react';
import { Radio, Music, Mic, Play, Pause, Loader2 } from 'lucide-react';
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
  const { shows, settings, version } = useData();
  const { playLiveStream, playTrack, isPlaying, isLoading } = useAudio();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    console.log('Settings updated:', settings);
    console.log('Neppy image:', settings?.neppy_image);
    setImageLoaded(false);
    setImageError(false);
  }, [settings, version]);

  const liveShow = shows.find(show => show.is_live);

  const handlePlayClick = () => {
    console.log('Play clicked');
    if (liveShow?.audio_url) {
      playTrack({
        id: liveShow.id,
        title: liveShow.title,
        artist: liveShow.host_name,
        audio_url: liveShow.audio_url,
        isLive: true,
        type: 'show',
      });
    } else if (settings.stream_url) {
      playLiveStream(settings.stream_url, settings.site_title || 'Cosmos FM');
    }
  };

  const neppyImageUrl = settings?.neppy_image;
  const hasValidImage = neppyImageUrl && neppyImageUrl.trim() !== '' && !imageError;

  return (
    <div className="relative min-h-screen" style={{ background: COLORS.bg }}>
      {/* Background Shapes */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full opacity-30 animate-float" style={{ width: '400px', height: '400px', background: COLORS.neppy, top: '-10%', left: '-10%', filter: 'blur(80px)' }} />
        <div className="absolute rounded-full opacity-20 animate-float" style={{ width: '300px', height: '300px', background: COLORS.purple, bottom: '10%', right: '-5%', animationDelay: '5s', filter: 'blur(80px)' }} />
        <div className="absolute rounded-full opacity-25 animate-float" style={{ width: '200px', height: '200px', background: COLORS.green, top: '50%', left: '40%', animationDelay: '10s', filter: 'blur(60px)' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Character Container - AT THE TOP */}
          <div className="flex justify-center mb-16">
            <div className="relative w-80 h-80 sm:w-96 sm:h-96">
              
              {/* Image OR SVG */}
              {hasValidImage ? (
                <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl" style={{
                  boxShadow: isPlaying ? '0 0 60px rgba(40, 185, 208, 0.5)' : '0 20px 60px rgba(0,0,0,0.3)'
                }}>
                  <img 
                    key={neppyImageUrl}
                    src={neppyImageUrl}
                    alt="Neppy" 
                    className="w-full h-full object-cover"
                    style={{ 
                      transition: 'transform 0.5s ease',
                      transform: isPlaying ? 'scale(1.1)' : 'scale(1)',
                    }}
                    onLoad={() => {
                      console.log('Image loaded!');
                      setImageLoaded(true);
                      setImageError(false);
                    }}
                    onError={(e) => {
                      console.error('Image load failed:', neppyImageUrl);
                      setImageError(true);
                      setImageLoaded(false);
                    }}
                    crossOrigin="anonymous"
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 100%)', opacity: 0.5 }} />
                  {!imageLoaded && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <Loader2 className="w-8 h-8 animate-spin text-white" />
                    </div>
                  )}
                </div>
              ) : (
                <svg viewBox="0 0 400 500" className="w-full h-full">
                  <ellipse cx="200" cy="280" rx="100" ry="140" fill={COLORS.neppy} />
                  <ellipse cx="170" cy="220" rx="8" ry="12" fill={COLORS.green} opacity="0.7" />
                  <ellipse cx="230" cy="240" rx="6" ry="10" fill={COLORS.green} opacity="0.7" />
                  <ellipse cx="190" cy="260" rx="7" ry="11" fill={COLORS.green} opacity="0.7" />
                  <ellipse cx="220" cy="280" rx="8" ry="12" fill={COLORS.green} opacity="0.7" />
                  <path d="M 120 250 Q 80 280 70 350 Q 65 380 80 400 Q 90 410 100 400 Q 110 390 115 370 Q 120 340 130 300" fill={COLORS.neppy} />
                  <path d="M 280 250 Q 320 280 330 350 Q 335 380 320 400 Q 310 410 300 400 Q 290 390 285 370 Q 280 340 270 300" fill={COLORS.neppy} />
                  <ellipse cx="170" cy="420" rx="20" ry="15" fill={COLORS.neppy} />
                  <ellipse cx="230" cy="420" rx="20" ry="15" fill={COLORS.neppy} />
                  <path d="M 140 180 Q 140 140 200 140 Q 260 140 260 180 L 260 200 Q 260 210 250 210 L 150 210 Q 140 210 140 200 Z" fill={COLORS.purple} />
                  <circle cx="200" cy="130" r="25" fill={COLORS.white} />
                  <circle cx="175" cy="240" r="18" fill={COLORS.white} />
                  <circle cx="225" cy="240" r="18" fill={COLORS.white} />
                  <circle cx="178" cy="242" r="8" fill="#1A2B3C" />
                  <circle cx="228" cy="242" r="8" fill="#1A2B3C" />
                  <path d="M 190 270 Q 200 280 210 270" fill="none" stroke="#1A2B3C" strokeWidth="3" strokeLinecap="round" />
                </svg>
              )}

              {/* Play Button */}
              <button 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full backdrop-blur-xl shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 z-30"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.95)', 
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 4px rgba(255,255,255,0.25)',
                }}
                onClick={(e) => { 
                  e.stopPropagation(); 
                  e.preventDefault();
                  handlePlayClick(); 
                }}
              >
                {isLoading ? (
                  <Loader2 className="w-10 h-10 animate-spin" style={{ color: COLORS.purple }} />
                ) : isPlaying ? (
                  <Pause className="w-10 h-10" style={{ color: COLORS.purple }} />
                ) : (
                  <Play className="w-10 h-10 ml-1" style={{ color: COLORS.purple }} />
                )}
              </button>

              {isPlaying && (
                <div className="absolute inset-0 rounded-3xl pointer-events-none z-20">
                  <div className="absolute inset-0 rounded-3xl animate-ping" style={{ border: '3px solid ' + COLORS.neppy, opacity: 0.5 }} />
                </div>
              )}
            </div>
            
            <div className="absolute -top-6 -right-6 px-6 py-3 rounded-2xl shadow-xl z-40" style={{ background: COLORS.white }}>
              <p className="text-lg font-extrabold" style={{ color: COLORS.purple }}>ПРИВЕТ! Я НЭППИ</p>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="space-y-6">
              <button 
                onClick={() => onTabChange && onTabChange('home')} 
                className="w-full rounded-3xl p-6 shadow-xl hover:scale-105 transition-all group border-2 text-left" 
                style={{ background: COLORS.white, borderColor: 'transparent' }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-white group-hover:rotate-6 transition-transform" style={{ background: 'linear-gradient(135deg, ' + COLORS.neppy + ', ' + COLORS.purple + ')' }}>
                  <Radio className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>Live Эфир</h3>
                <p style={{ color: COLORS.textMuted }}>Профессиональное радио 24/7</p>
              </button>

              <button 
                onClick={() => onTabChange && onTabChange('podcasts')} 
                className="w-full rounded-3xl p-6 shadow-xl hover:scale-105 transition-all group border-2 text-left" 
                style={{ background: COLORS.white, borderColor: 'transparent' }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-white group-hover:rotate-6 transition-transform" style={{ background: 'linear-gradient(135deg, ' + COLORS.neppy + ', ' + COLORS.purple + ')' }}>
                  <Music className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>Подкасты</h3>
                <p style={{ color: COLORS.textMuted }}>Эксклюзивный контент</p>
              </button>

              <button 
                onClick={() => onTabChange && onTabChange('hosts')} 
                className="w-full rounded-3xl p-6 shadow-xl hover:scale-105 transition-all group border-2 text-left" 
                style={{ background: COLORS.white, borderColor: 'transparent' }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-white group-hover:rotate-6 transition-transform" style={{ background: 'linear-gradient(135deg, ' + COLORS.neppy + ', ' + COLORS.purple + ')' }}>
                  <Mic className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>Артисты</h3>
                <p style={{ color: COLORS.textMuted }}>Таланты отелей</p>
              </button>
            </div>
            <div className="md:col-span-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/sections/HomeSection.tsx', homeSectionContent);
console.log('✅ Fixed HomeSection.tsx');

// 2. Fix index.css for readable text
const cssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    border-color: #28B9D040;
  }
  html {
    scroll-behavior: smooth;
  }
  body {
    background-color: #B6E0EE;
    color: #1A2B3C;
    font-family: 'Circe', 'Inter', system-ui, sans-serif;
  }
  h1, h2, h3, h4, h5, h6 {
    color: #1A2B3C;
    font-weight: 700;
  }
}

@layer components {
  .btn-primary {
    padding: 0.75rem 1.5rem;
    border-radius: 0.75rem;
    font-weight: 600;
    color: white;
    background: linear-gradient(135deg, #28B9D0 0%, #685096 100%);
  }
  .glass-card {
    background-color: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(40, 185, 208, 0.2);
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  33% { transform: translateY(-30px) rotate(120deg); }
  66% { transform: translateY(30px) rotate(240deg); }
}

.animate-float { animation: float 20s ease-in-out infinite; }
`;

fs.writeFileSync('src/index.css', cssContent);
console.log('✅ Fixed index.css');

console.log('\n✅ All fixes applied!');
console.log('\nRun: npm run dev');
console.log('\nCheck:');
console.log('1. Character at top of page (not fixed)');
console.log('2. Image from admin should appear');
console.log('3. Check browser console for logs');
ENDOFSCRIPT

node fix-all-issues.js