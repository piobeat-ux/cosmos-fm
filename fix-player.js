import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 === ИСПРАВЛЕНИЕ ЛОГИКИ ПЛЕЕРА ===\n');

const writeFile = (filePath, content) => {
  const fullPath = path.join(__dirname, filePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content.trim());
  console.log(`✅ ${filePath}`);
};

// ==========================================
// 1. AUDIOCONTEXT - ЕДИНОЕ СОСТОЯНИЕ ПЛЕЕРА
// ==========================================
console.log('🎵 Обновление AudioContext...');

writeFile('src/context/AudioContext.tsx', `
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

interface Track {
  id: string;
  title: string;
  artist?: string;
  audio_url?: string;
  cover_url?: string;
  isLive?: boolean;
  type?: 'show' | 'podcast' | 'stream';
}

interface AudioContextType {
  isPlaying: boolean;
  currentTrack: Track | null;
  volume: number;
  progress: number;
  duration: number;
  isLiveStream: boolean;
  playTrack: (track: Track) => void;
  playLiveStream: (url: string, title?: string) => void;
  togglePlay: () => void;
  pause: () => void;
  setVolume: (volume: number) => void;
  toggleExpanded: () => void;
  isExpanded: boolean;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [volume, setVolumeState] = useState(80);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLiveStream, setIsLiveStream] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Инициализация аудио
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume / 100;

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    const handleError = (e: Event) => {
      console.error('Audio error:', e);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, []);

  // Обновление громкости
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const playTrack = useCallback((track: Track) => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    
    // Если это live стрим
    if (track.isLive || track.type === 'stream') {
      setIsLiveStream(true);
      audio.src = track.audio_url || '';
      audio.play().then(() => {
        setIsPlaying(true);
        setCurrentTrack(track);
      }).catch(err => {
        console.error('Play error:', err);
      });
    } else {
      // Обычный трек/подкаст
      setIsLiveStream(false);
      audio.src = track.audio_url || '';
      audio.play().then(() => {
        setIsPlaying(true);
        setCurrentTrack(track);
      }).catch(err => {
        console.error('Play error:', err);
      });
    }
  }, []);

  const playLiveStream = useCallback((url: string, title?: string) => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    setIsLiveStream(true);
    audio.src = url;
    audio.play().then(() => {
      setIsPlaying(true);
      setCurrentTrack({
        id: 'live-stream',
        title: title || 'Прямой эфир',
        artist: 'Cosmos FM',
        audio_url: url,
        isLive: true,
        type: 'stream',
      });
    }).catch(err => {
      console.error('Stream play error:', err);
    });
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;

    const audio = audioRef.current;
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error('Play error:', err);
      });
    }
  }, [isPlaying, currentTrack]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
  }, []);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  return (
    <AudioContext.Provider value={{
      isPlaying,
      currentTrack,
      volume,
      progress,
      duration,
      isLiveStream,
      playTrack,
      playLiveStream,
      togglePlay,
      pause,
      setVolume,
      toggleExpanded,
      isExpanded,
    }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within AudioProvider');
  return context;
}
`);

// ==========================================
// 2. MINIPLAYER - ОТОБРАЖЕНИЕ ТЕКУЩЕГО ТРЕКА
// ==========================================
console.log('🎨 Обновление MiniPlayer...');

writeFile('src/components/MiniPlayer.tsx', `
import { Play, Pause, Volume2, ChevronUp, Radio, X } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';

export function MiniPlayer() {
  const { 
    isPlaying, 
    currentTrack, 
    volume, 
    progress,
    isLiveStream,
    togglePlay, 
    setVolume, 
    toggleExpanded 
  } = useAudio();

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass-player">
      {/* Progress bar */}
      {!isLiveStream && (
        <div className="w-full h-1 bg-[#27273a]">
          <div 
            className="h-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] transition-all duration-300"
            style={{ width: \`\${progress}%\` }}
          />
        </div>
      )}
      
      <div className="section-padding py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Track Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
              {currentTrack.cover_url ? (
                <img src={currentTrack.cover_url} alt={currentTrack.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
                  <Radio className="w-6 h-6 text-white" />
                </div>
              )}
              {isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="flex gap-0.5">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-white rounded-full animate-pulse"
                        style={{ 
                          height: '12px',
                          animationDelay: \`\${i * 0.15}s\`
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm truncate">{currentTrack.title}</h4>
                {currentTrack.isLive && (
                  <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-[#ef4444]/20 text-[#ef4444] text-[10px] font-bold uppercase tracking-wider">
                    LIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-[#71717a] truncate">
                {currentTrack.artist || (isLiveStream ? 'Прямой эфир' : 'Cosmos FM')}
              </p>
            </div>
          </div>

          {/* Controls - Desktop */}
          <div className="hidden sm:flex items-center gap-4">
            {/* Audio Wave */}
            {isPlaying && (
              <div className="audio-wave">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="audio-wave-bar" />
                ))}
              </div>
            )}
            
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" />
              )}
            </button>

            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#71717a]" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-20 h-1 bg-[#27273a] rounded-full appearance-none cursor-pointer"
                style={{
                  background: \`linear-gradient(to right, #6366f1 \${volume}%, #27273a \${volume}%)\`,
                }}
              />
            </div>

            <button
              onClick={toggleExpanded}
              className="p-2 rounded-xl hover:bg-[#13131f] transition-colors"
            >
              <ChevronUp className="w-5 h-5 text-[#71717a]" />
            </button>
          </div>

          {/* Controls - Mobile */}
          <div className="flex sm:hidden items-center gap-3">
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white" />
              ) : (
                <Play className="w-4 h-4 text-white ml-0.5" />
              )}
            </button>
            
            <button
              onClick={toggleExpanded}
              className="p-2 rounded-xl hover:bg-[#13131f] transition-colors"
            >
              <ChevronUp className="w-5 h-5 text-[#71717a]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
`);

// ==========================================
// 3. HOME SECTION - LIVE НА ГЛАВНОЙ
// ==========================================
console.log('🏠 Обновление HomeSection...');

writeFile('src/sections/HomeSection.tsx', `
import { useEffect, useState } from 'react';
import { Radio, ChevronDown, Sparkles, Play } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAudio } from '@/context/AudioContext';

export function HomeSection() {
  const { shows, settings } = useData();
  const { playLiveStream, playTrack, currentTrack, isPlaying } = useAudio();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Находим live шоу
  const liveShow = shows.find(show => show.is_live);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePlayLive = () => {
    if (liveShow) {
      if (liveShow.audio_url) {
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
        playLiveStream(settings.stream_url, liveShow.title);
      }
    } else if (settings.stream_url) {
      playLiveStream(settings.stream_url, 'Прямой эфир');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/hero-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/60 via-[#0a0a0f]/40 to-[#0a0a0f]" />
      </div>

      {/* Floating Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20 floating"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
            animationDelay: '0s',
          }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full opacity-15 floating"
          style={{
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, transparent 70%)',
            animationDelay: '2s',
          }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 w-32 h-32 rounded-full opacity-10 floating"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
            animationDelay: '4s',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 section-padding w-full max-w-6xl mx-auto pt-24">
        <div className="text-center">
          {/* Badge */}
          <div
            className={\`inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 transition-all duration-700 \${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }\`}
          >
            <Sparkles className="w-4 h-4 text-[#6366f1]" />
            <span className="text-sm text-[#a1a1aa]">Первый в России</span>
          </div>

          {/* Logo Icon */}
          <div
            className={\`flex justify-center mb-8 transition-all duration-700 delay-100 \${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }\`}
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center animate-pulse-glow">
                <Radio className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-[#6366f1]/30 to-[#8b5cf6]/30 blur-xl" />
            </div>
          </div>

          {/* Main Title */}
          <h1
            className={\`text-5xl sm:text-6xl lg:text-7xl font-black mb-4 transition-all duration-700 delay-200 \${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }\`}
          >
            <span className="gradient-text">{settings.hero_title || 'Голос вашего отеля'}</span>
          </h1>

          {/* Subtitle */}
          <p
            className={\`text-2xl sm:text-3xl lg:text-4xl font-light text-[#a1a1aa] mb-6 transition-all duration-700 delay-300 \${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }\`}
          >
            {settings.hero_subtitle || 'Звуки вашего космоса'}
          </p>

          {/* Description */}
          <p
            className={\`text-lg sm:text-xl text-[#71717a] max-w-2xl mx-auto mb-12 transition-all duration-700 delay-400 \${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }\`}
          >
            {settings.hero_description || 'Первый в России корпоративный медиа-канал в индустрии гостеприимства'}
          </p>

          {/* LIVE Show Card */}
          {liveShow && (
            <div
              className={\`max-w-2xl mx-auto mb-8 transition-all duration-700 delay-500 \${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }\`}
            >
              <div className="glass-card rounded-2xl p-6 border-[#22c55e]/50 now-playing-glow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    {liveShow.cover_url ? (
                      <img src={liveShow.cover_url} alt={liveShow.title} className="w-20 h-20 rounded-xl object-cover" />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
                        <Radio className="w-10 h-10 text-white" />
                      </div>
                    )}
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#ef4444] flex items-center justify-center animate-pulse">
                      <span className="text-[10px] font-bold text-white">LIVE</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-[#22c55e] font-semibold uppercase tracking-wider">Сейчас в эфире</span>
                    </div>
                    <h3 className="text-xl font-bold mb-1">{liveShow.title}</h3>
                    <p className="text-sm text-[#71717a]">{liveShow.host_name || 'Cosmos FM'}</p>
                  </div>
                </div>

                <button
                  onClick={handlePlayLive}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  {isPlaying && currentTrack?.id === liveShow.id ? 'Слушаем' : 'Слушать эфир'}
                </button>
              </div>
            </div>
          )}

          {/* CTA Buttons */}
          <div
            className={\`flex flex-col sm:flex-row gap-4 justify-center mb-16 transition-all duration-700 delay-500 \${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }\`}
          >
            <button
              onClick={() => scrollToSection('#schedule')}
              className="btn-primary text-lg"
            >
              Расписание
            </button>
            <button
              onClick={() => scrollToSection('#about')}
              className="btn-secondary text-lg"
            >
              О нас
            </button>
          </div>

          {/* Stats Preview */}
          <div
            className={\`grid grid-cols-3 gap-8 max-w-lg mx-auto transition-all duration-700 delay-600 \${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }\`}
          >
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold gradient-text">4000+</div>
              <div className="text-sm text-[#71717a] mt-1">сотрудников</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold gradient-text">2.5M</div>
              <div className="text-sm text-[#71717a] mt-1">гостей</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold gradient-text">24/7</div>
              <div className="text-sm text-[#71717a] mt-1">вещание</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <button
          onClick={() => scrollToSection('#schedule')}
          className="flex flex-col items-center gap-2 text-[#71717a] hover:text-white transition-colors"
        >
          <span className="text-sm">Листайте вниз</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </button>
      </div>
    </section>
  );
}
`);

// ==========================================
// 4. SCHEDULE SECTION - ЗАПУСК ПЕРЕДАЧ
// ==========================================
console.log('📅 Обновление ScheduleSection...');

writeFile('src/sections/ScheduleSection.tsx', `
import { Radio, Clock, User, Play, Pause } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAudio } from '@/context/AudioContext';

export function ScheduleSection() {
  const { shows } = useData();
  const { playTrack, currentTrack, isPlaying } = useAudio();

  const handlePlayShow = (show: any) => {
    if (show.audio_url) {
      playTrack({
        id: show.id,
        title: show.title,
        artist: show.host_name,
        audio_url: show.audio_url,
        cover_url: show.cover_url,
        isLive: show.is_live,
        type: 'show',
      });
    }
  };

  const isCurrentTrack = (showId: string) => currentTrack?.id === showId;

  return (
    <section id="schedule" className="py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="gradient-text">Расписание эфиров</span>
          </h2>
          <p className="text-lg text-[#71717a]">Наши передачи и шоу</p>
        </div>

        <div className="space-y-4">
          {shows.length === 0 ? (
            <div className="text-center py-12 text-[#71717a]">
              <Radio className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Пока нет передач в расписании</p>
            </div>
          ) : (
            shows.map(show => {
              const isPlaying = isCurrentTrack(show.id);
              
              return (
                <div
                  key={show.id}
                  className={\`show-card \${show.is_live ? 'live' : ''}\`}
                >
                  <div className="flex items-center gap-4">
                    {show.cover_url ? (
                      <img src={show.cover_url} alt={show.title} className="w-16 h-16 rounded-xl object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center flex-shrink-0">
                        <Radio className="w-8 h-8 text-white" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold truncate">{show.title}</h3>
                        {show.is_live && (
                          <span className="px-2 py-0.5 rounded-full bg-[#ef4444]/20 text-[#ef4444] text-xs font-bold uppercase">
                            LIVE
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-[#71717a]">
                        {show.host_name && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{show.host_name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{show.day_of_week} {show.time}</span>
                        </div>
                        {show.duration && <span>{show.duration}</span>}
                        {show.category && (
                          <span className="category-badge bg-[#6366f1]/20 text-[#6366f1]">
                            {show.category}
                          </span>
                        )}
                      </div>

                      {show.description && (
                        <p className="text-sm text-[#a1a1aa] mt-2 line-clamp-2">{show.description}</p>
                      )}
                    </div>

                    {show.audio_url && (
                      <button
                        onClick={() => handlePlayShow(show)}
                        className={\`w-12 h-12 rounded-full flex items-center justify-center transition-all flex-shrink-0 \${
                          isPlaying
                            ? 'bg-[#22c55e] text-white'
                            : 'bg-[#6366f1] text-white hover:scale-105'
                        }\`}
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
`);

// ==========================================
// 5. PODCASTS SECTION - ЗАПУСК ПОДКАСТОВ
// ==========================================
console.log('🎙️ Обновление PodcastsSection...');

writeFile('src/sections/PodcastsSection.tsx', `
import { Play, Pause, Heart, Clock, Headphones } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAudio } from '@/context/AudioContext';

export function PodcastsSection() {
  const { podcasts } = useData();
  const { playTrack, currentTrack, isPlaying } = useAudio();

  const handlePlayPodcast = (podcast: any) => {
    if (podcast.audio_url) {
      playTrack({
        id: podcast.id,
        title: podcast.title,
        artist: podcast.host_name,
        audio_url: podcast.audio_url,
        cover_url: podcast.cover_url,
        isLive: false,
        type: 'podcast',
      });
    }
  };

  const isCurrentTrack = (podcastId: string) => currentTrack?.id === podcastId;

  return (
    <section id="podcasts" className="py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="gradient-text">Подкасты</span>
          </h2>
          <p className="text-lg text-[#71717a]">Слушайте наши лучшие выпуски</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {podcasts.length === 0 ? (
            <div className="col-span-full text-center py-12 text-[#71717a]">
              <Headphones className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Пока нет подкастов</p>
            </div>
          ) : (
            podcasts.map(podcast => {
              const isPlaying = isCurrentTrack(podcast.id);
              
              return (
                <div key={podcast.id} className="show-card group">
                  <div className="relative mb-4">
                    {podcast.cover_url ? (
                      <img src={podcast.cover_url} alt={podcast.title} className="w-full h-48 rounded-xl object-cover" />
                    ) : (
                      <div className={\`w-full h-48 rounded-xl bg-gradient-to-br \${podcast.color || 'from-[#6366f1] to-[#8b5cf6]'} flex items-center justify-center\`}>
                        <Headphones className="w-16 h-16 text-white/50" />
                      </div>
                    )}
                    
                    {podcast.audio_url && (
                      <button
                        onClick={() => handlePlayPodcast(podcast)}
                        className={\`absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl \${
                          isPlaying ? 'opacity-100' : ''
                        }\`}
                      >
                        <div className={\`w-16 h-16 rounded-full flex items-center justify-center \${
                          isPlaying ? 'bg-[#22c55e]' : 'bg-[#6366f1]'
                        }\`}>
                          {isPlaying ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white ml-1" />}
                        </div>
                      </button>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg truncate flex-1">{podcast.title}</h3>
                      <button className="p-2 text-[#71717a] hover:text-[#ef4444] transition">
                        <Heart className="w-5 h-5" />
                      </button>
                    </div>

                    <p className="text-sm text-[#71717a] mb-3 line-clamp-2">{podcast.description}</p>

                    <div className="flex items-center gap-4 text-xs text-[#a1a1aa]">
                      {podcast.host_name && (
                        <span>{podcast.host_name}</span>
                      )}
                      {podcast.episodes && (
                        <span>{podcast.episodes} эпизодов</span>
                      )}
                      {podcast.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{podcast.duration}</span>
                        </div>
                      )}
                    </div>

                    {podcast.likes && (
                      <div className="flex items-center gap-1 mt-3 text-xs text-[#71717a]">
                        <Heart className="w-3 h-3 fill-[#ef4444] text-[#ef4444]" />
                        <span>{podcast.likes}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
`);

// ==========================================
// ИТОГОВЫЙ ОТЧЁТ
// ==========================================
console.log('\n' + '='.repeat(60));
console.log('✅ ЛОГИКА ПЛЕЕРА ИСПРАВЛЕНА!');
console.log('='.repeat(60));
console.log('\n🎯 ЧТО СДЕЛАНО:');
console.log('  ✅ Единый AudioContext - все компоненты управляют одним плеером');
console.log('  ✅ MiniPlayer показывает текущий трек/подкаст/эфир');
console.log('  ✅ Live шоу отображается на главной странице');
console.log('  ✅ Клик на передачу → играет в основном плеере');
console.log('  ✅ Клик на подкаст → играет в основном плеере');
console.log('  ✅ Прогресс-бар для обычных треков');
console.log('  ✅ Индикатор LIVE для стримов');
console.log('  ✅ Визуализация аудио (wave animation)');

console.log('\n СЛЕДУЮЩИЕ ШАГИ:');
console.log('  1. Перезапустите: npm run dev');
console.log('  2. Откройте главную - увидите LIVE шоу (если есть)');
console.log('  3. Нажмите "Слушать эфир" - заиграет в MiniPlayer');
console.log('  4. Перейдите в Расписание - клик на передачу → играет внизу');
console.log('  5. Перейдите в Подкасты - клик на подкаст → играет внизу');

console.log('\n🎵 ЛОГИКА РАБОТЫ:');
console.log('  • Если передача имеет is_live=true → показывается на главной');
console.log('  • Если у передачи/подкаста есть audio_url → можно играть');
console.log('  • Всё играет через единый MiniPlayer внизу страницы');
console.log('  • Статус "в эфире" можно менять в админке');

console.log('\n🚀 ГОТОВО! Запускайте проект!');