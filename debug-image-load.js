import fs from 'fs';

console.log('🔍 Adding detailed debug logging...\n');

const homeContent = `import { useState, useEffect } from 'react';
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
  const [localNeppyImage, setLocalNeppyImage] = useState('');
  const [localNeppyPhrase, setLocalNeppyPhrase] = useState('ПРИВЕТ! Я НЭППИ');

  // Debug: Log all settings
  useEffect(() => {
    console.log('='.repeat(60));
    console.log('🔍 DEBUG - Settings received in HomeSection:');
    console.log('Full settings object:', settings);
    console.log('settings.neppy_image:', settings?.neppy_image);
    console.log('settings.neppy_phrase:', settings?.neppy_phrase);
    console.log('Version:', version);
    console.log('='.repeat(60));
    
    if (settings?.neppy_image && settings.neppy_image.trim() !== '') {
      console.log('✅ neppy_image exists, setting:', settings.neppy_image);
      setLocalNeppyImage(settings.neppy_image);
      setImageLoaded(false);
      setImageError(false);
    } else {
      console.log('❌ neppy_image is empty or not set');
      setLocalNeppyImage('');
    }
    
    if (settings?.neppy_phrase) {
      setLocalNeppyPhrase(settings.neppy_phrase);
    }
  }, [settings, version]);

  const liveShow = shows.find(show => show.is_live);

  const handlePlayClick = () => {
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

  const hasValidImage = localNeppyImage && localNeppyImage.trim() !== '' && !imageError && imageLoaded;

  console.log('📊 Render - localNeppyImage:', localNeppyImage);
  console.log('📊 Render - hasValidImage:', hasValidImage);
  console.log('📊 Render - imageLoaded:', imageLoaded);
  console.log('📊 Render - imageError:', imageError);

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: COLORS.bg }}>
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full opacity-40" style={{ width: '500px', height: '500px', background: 'radial-gradient(circle, #28B9D0 0%, transparent 70%)', top: '-10%', left: '-10%', filter: 'blur(100px)' }} />
        <div className="absolute rounded-full opacity-30" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle, #685096 0%, transparent 70%)', bottom: '10%', right: '-5%', filter: 'blur(100px)' }} />
        <div className="absolute rounded-full opacity-35" style={{ width: '300px', height: '300px', background: 'radial-gradient(circle, #AFCB31 0%, transparent 70%)', top: '50%', left: '40%', filter: 'blur(80px)' }} />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8">
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
          
          <div className="flex-1 flex items-center justify-center mb-8 sm:mb-12 relative" style={{ minHeight: '60vh' }}>
            
            {isPlaying && (
              <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                <div className="hidden md:block absolute inset-0">
                  <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="absolute top-0 left-0 w-full h-full" style={{ animation: 'waveFlowH 4s ease-in-out infinite' }}>
                    <path d="M 0 500 Q 250 300 500 500 T 1000 500" fill="none" stroke="#28B9D0" strokeWidth="3" opacity="0.4" />
                  </svg>
                  <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="absolute top-0 left-0 w-full h-full" style={{ animation: 'waveFlowH 4s ease-in-out infinite 0.5s' }}>
                    <path d="M 0 500 Q 250 700 500 500 T 1000 500" fill="none" stroke="#685096" strokeWidth="2" opacity="0.3" />
                  </svg>
                  <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="absolute top-0 left-0 w-full h-full" style={{ animation: 'waveFlowH 4s ease-in-out infinite 1s' }}>
                    <path d="M 0 500 Q 250 200 500 500 T 1000 500" fill="none" stroke="#AFCB31" strokeWidth="2" opacity="0.25" />
                  </svg>
                </div>
                
                <div className="block md:hidden absolute inset-0">
                  <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="absolute top-0 left-0 w-full h-full" style={{ animation: 'waveFlowV 4s ease-in-out infinite' }}>
                    <path d="M 500 0 Q 300 250 500 500 T 500 1000" fill="none" stroke="#28B9D0" strokeWidth="3" opacity="0.4" />
                  </svg>
                  <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="absolute top-0 left-0 w-full h-full" style={{ animation: 'waveFlowV 4s ease-in-out infinite 0.5s' }}>
                    <path d="M 500 0 Q 700 250 500 500 T 500 1000" fill="none" stroke="#685096" strokeWidth="2" opacity="0.3" />
                  </svg>
                  <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="absolute top-0 left-0 w-full h-full" style={{ animation: 'waveFlowV 4s ease-in-out infinite 1s' }}>
                    <path d="M 500 0 Q 200 250 500 500 T 500 1000" fill="none" stroke="#AFCB31" strokeWidth="2" opacity="0.25" />
                  </svg>
                </div>

                <div className="absolute top-1/4 left-1/4" style={{ animation: 'particleDrift 3s ease-in-out infinite' }}>
                  <div className="w-4 h-4 rounded-full" style={{ background: COLORS.neppy, boxShadow: '0 0 20px ' + COLORS.neppy }} />
                </div>
                <div className="absolute top-1/2 left-1/2" style={{ animation: 'particleDrift 3s ease-in-out infinite 1s' }}>
                  <div className="w-3 h-3 rounded-full" style={{ background: COLORS.purple, boxShadow: '0 0 20px ' + COLORS.purple }} />
                </div>
                <div className="absolute top-3/4 left-3/4" style={{ animation: 'particleDrift 3s ease-in-out infinite 2s' }}>
                  <div className="w-5 h-5 rounded-full" style={{ background: COLORS.green, boxShadow: '0 0 20px ' + COLORS.green }} />
                </div>
              </div>
            )}

            <div className="relative z-20 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 lg:gap-16 w-full">
              
              <div className="relative flex-shrink-0 w-[280px] h-[340px] sm:w-[350px] sm:h-[420px] md:w-[400px] md:h-[480px] lg:w-[450px] lg:h-[540px]">
                {hasValidImage ? (
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 blur-3xl opacity-60" style={{ 
                      background: 'radial-gradient(circle, #28B9D0 0%, transparent 70%)',
                      transform: 'scale(1.3)',
                      animation: isPlaying ? 'cosmicPulse 2s ease-in-out infinite' : 'none'
                    }} />
                    
                    <img 
                      key={localNeppyImage}
                      src={localNeppyImage}
                      alt="Neppy Character" 
                      className="relative w-full h-full object-contain"
                      style={{
                        animation: isPlaying ? 'bounceCharacter 0.6s ease-in-out infinite' : 'float 6s ease-in-out infinite',
                        filter: isPlaying ? 'drop-shadow(0 0 60px rgba(40, 185, 208, 0.9))' : 'drop-shadow(0 20px 50px rgba(0,0,0,0.25))'
                      }}
                      onLoad={() => { 
                        console.log('✅ IMAGE LOADED SUCCESSFULLY!');
                        console.log('   URL:', localNeppyImage);
                        setImageLoaded(true); 
                        setImageError(false); 
                      }}
                      onError={(e) => { 
                        console.error('❌ IMAGE LOAD FAILED!');
                        console.error('   URL:', localNeppyImage);
                        console.error('   Error:', e);
                        setImageError(true); 
                        setImageLoaded(false);
                      }}
                    />
                    
                    <div className="absolute top-2 right-0 sm:top-6 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-xl z-40" style={{ 
                      background: COLORS.white,
                      border: '2px solid ' + COLORS.neppy + '40'
                    }}>
                      <div className="absolute -bottom-2 left-5 sm:left-7 w-3 h-3 rotate-45" style={{ 
                        background: COLORS.white,
                        borderRight: '2px solid ' + COLORS.neppy + '40',
                        borderBottom: '2px solid ' + COLORS.neppy + '40'
                      }} />
                      <p className="text-xs sm:text-base font-extrabold text-transparent bg-clip-text whitespace-nowrap" style={{ 
                        backgroundImage: 'linear-gradient(135deg, #28B9D0, #685096)'
                      }}>
                        {localNeppyPhrase}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/50 rounded-3xl">
                    <div className="text-center p-6">
                      <Loader2 className="w-16 h-16 sm:w-20 sm:h-20 animate-spin mx-auto mb-4" style={{ color: COLORS.purple }} />
                      <p className="text-sm sm:text-base font-bold" style={{ color: COLORS.text }}>
                        {imageError ? 'Ошибка загрузки' : 'Загрузка персонажа...'}
                      </p>
                      {imageError && (
                        <p className="text-xs mt-2" style={{ color: '#EF4444' }}>
                          Проверьте URL в админке
                        </p>
                      )}
                      {!localNeppyImage && (
                        <p className="text-xs mt-2" style={{ color: COLORS.textMuted }}>
                          Добавьте URL в настройках
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-shrink-0 md:-mt-0 -mt-4">
                <button 
                  className="relative group"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    e.preventDefault();
                    handlePlayClick(); 
                  }}
                >
                  <div className="absolute inset-0 rounded-full blur-xl opacity-60 group-hover:opacity-80 transition-opacity" style={{ 
                    background: 'radial-gradient(circle, #28B9D0 0%, #685096 100%)',
                    transform: 'scale(1.2)',
                    animation: isPlaying ? 'playerPulse 2s ease-in-out infinite' : 'none'
                  }} />
                  
                  <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{ 
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 249, 255, 0.95) 100%)',
                    boxShadow: '0 15px 50px rgba(104, 80, 150, 0.5), 0 0 0 6px rgba(255,255,255,0.4), inset 0 2px 15px rgba(255,255,255,0.6)',
                    border: '3px solid rgba(40, 185, 208, 0.4)'
                  }}>
                    {isLoading ? (
                      <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 animate-spin" style={{ color: COLORS.purple }} />
                    ) : isPlaying ? (
                      <Pause className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 transition-transform group-hover:scale-110" style={{ color: COLORS.purple }} />
                    ) : (
                      <Play className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 ml-1 transition-transform group-hover:scale-110" style={{ color: COLORS.purple }} />
                    )}
                  </div>
                  
                  {isPlaying && (
                    <>
                      <div className="absolute inset-0 rounded-full" style={{ animation: 'orbit 4s linear infinite' }}>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ background: COLORS.neppy, boxShadow: '0 0 15px ' + COLORS.neppy }} />
                      </div>
                      <div className="absolute inset-0 rounded-full" style={{ animation: 'orbit 4s linear infinite 1.3s' }}>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ background: COLORS.purple, boxShadow: '0 0 15px ' + COLORS.purple }} />
                      </div>
                      <div className="absolute inset-0 rounded-full" style={{ animation: 'orbit 4s linear infinite 2.6s' }}>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ background: COLORS.green, boxShadow: '0 0 15px ' + COLORS.green }} />
                      </div>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-auto pb-8">
            <button 
              onClick={() => onTabChange && onTabChange('home')} 
              className="group rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl hover:scale-105 transition-all text-left"
              style={{ background: COLORS.white }}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 text-white group-hover:rotate-6 transition-transform" style={{ background: 'linear-gradient(135deg, #28B9D0, #685096)' }}>
                <Radio className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: COLORS.text }}>Live Эфир</h3>
              <p className="text-sm sm:text-base" style={{ color: COLORS.textMuted }}>Профессиональное радио 24/7</p>
            </button>

            <button 
              onClick={() => onTabChange && onTabChange('podcasts')} 
              className="group rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl hover:scale-105 transition-all text-left"
              style={{ background: COLORS.white }}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 text-white group-hover:rotate-6 transition-transform" style={{ background: 'linear-gradient(135deg, #685096, #28B9D0)' }}>
                <Music className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: COLORS.text }}>Подкасты</h3>
              <p className="text-sm sm:text-base" style={{ color: COLORS.textMuted }}>Эксклюзивный контент</p>
            </button>

            <button 
              onClick={() => onTabChange && onTabChange('hosts')} 
              className="group rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl hover:scale-105 transition-all text-left sm:col-span-2 lg:col-span-1"
              style={{ background: COLORS.white }}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 text-white group-hover:rotate-6 transition-transform" style={{ background: 'linear-gradient(135deg, #AFCB31, #28B9D0)' }}>
                <Mic className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: COLORS.text }}>Артисты</h3>
              <p className="text-sm sm:text-base" style={{ color: COLORS.textMuted }}>Таланты отелей</p>
            </button>
          </div>
        </div>
      </div>

      <style>{\`
        @keyframes bounceCharacter {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.03); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes cosmicPulse {
          0%, 100% { opacity: 0.6; transform: scale(1.3); }
          50% { opacity: 0.9; transform: scale(1.4); }
        }
        @keyframes waveFlowH {
          0% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-20px); opacity: 0.6; }
          100% { transform: translateY(0); opacity: 0.4; }
        }
        @keyframes waveFlowV {
          0% { transform: translateX(0); opacity: 0.4; }
          50% { transform: translateX(-15px); opacity: 0.6; }
          100% { transform: translateX(0); opacity: 0.4; }
        }
        @keyframes particleDrift {
          0%, 100% { transform: translate(0, 0); opacity: 1; }
          50% { transform: translate(30px, -20px); opacity: 0.5; }
        }
        @keyframes playerPulse {
          0%, 100% { transform: scale(1.2); opacity: 0.6; }
          50% { transform: scale(1.4); opacity: 0.9; }
        }
        @keyframes orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      \`}</style>
    </div>
  );
}
`;

fs.writeFileSync('src/sections/HomeSection.tsx', homeContent);
console.log('✅ Added detailed debug logging');

console.log('\n📋 Теперь откройте консоль браузера (F12) и посмотрите:');
console.log('1. Должны появиться логи с "🔍 DEBUG - Settings received"');
console.log('2. Проверьте что settings.neppy_image содержит ваш URL');
console.log('3. Если URL есть - проверьте что он правильный (скопируйте и откройте в новой вкладке)');
console.log('4. Если URL правильный но не грузится - проверьте CORS и доступность файла');

console.log('\n🔍 Что проверить:');
console.log('- Откройте админку → Настройки');
console.log('- Скопируйте URL из поля "Обложка Hero"');
console.log('- Вставьте в новую вкладку браузера');
console.log('- Если изображение показывается - URL правильный');
console.log('- Если ошибка 404 - файл не найден в Storage');

console.log('\n🚀 Run: npm run dev');
