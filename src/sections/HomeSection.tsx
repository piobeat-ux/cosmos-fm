import { useEffect, useState } from 'react';
import { Radio, ChevronDown, Sparkles, Play, Pause, Music, AlertCircle, Info } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAudio } from '@/context/AudioContext';

export function HomeSection() {
  const { shows, hosts, podcasts, settings } = useData();
  const { playLiveStream, playTrack, currentTrack, isPlaying, error, clearError } = useAudio();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => { setIsLoaded(true); }, []);

  const liveShow = shows.find(show => show.is_live);

  const handlePlayLive = () => {
    clearError();
    if (liveShow?.audio_url) {
      playTrack({
        id: liveShow.id, title: liveShow.title, artist: liveShow.host_name,
        audio_url: liveShow.audio_url, cover_url: liveShow.cover_url,
        isLive: true, type: 'show',
      });
    } else if (settings.stream_url) {
      playLiveStream(settings.stream_url, liveShow?.title || 'Cosmos FM Эфир');
    } else {
      // Fallback на рабочий HTTPS поток
      playLiveStream('https://stream.radioparadise.com/aac-128', 'Radio Paradise (тест)');
    }
  };

  const handlePlayShow = (show) => {
    clearError();
    if (show.audio_url) {
      playTrack({
        id: show.id, title: show.title, artist: show.host_name,
        audio_url: show.audio_url, cover_url: show.cover_url,
        isLive: show.is_live, type: 'show',
      });
    } else {
      alert('Аудио URL не указан для этой передачи');
    }
  };

  const handlePlayPodcast = (podcast) => {
    clearError();
    if (podcast.audio_url) {
      playTrack({
        id: podcast.id, title: podcast.title, artist: podcast.host_name,
        audio_url: podcast.audio_url, cover_url: podcast.cover_url,
        isLive: false, type: 'podcast',
      });
    } else {
      alert('Аудио URL не указан для этого подкаста');
    }
  };

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden w-full">
        <div className="absolute inset-0 z-0" style={{ backgroundImage: 'url(/hero-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/60 via-[#0a0a0f]/40 to-[#0a0a0f]" />
        </div>

        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <div className="max-w-5xl mx-auto text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              <Sparkles className="w-4 h-4 text-[#6366f1]" />
              <span className="text-sm text-[#a1a1aa]">Первый в России</span>
            </div>

            <div className={`flex justify-center mb-8 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center animate-pulse-glow">
                <Radio className="w-12 h-12 text-white" />
              </div>
            </div>

            <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              <span className="gradient-text">{settings.hero_title || 'Голос вашего отеля'}</span>
            </h1>

            <p className={`text-xl sm:text-2xl md:text-3xl font-light text-[#a1a1aa] mb-6 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              {settings.hero_subtitle || 'Звуки вашего космоса'}
            </p>

            <p className={`text-base sm:text-lg text-[#71717a] max-w-2xl mx-auto mb-12 px-4 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              {settings.hero_description || 'Первый в России корпоративный медиа-канал в индустрии гостеприимства'}
            </p>

            {liveShow && (
              <div className="max-w-2xl mx-auto mb-8 px-4">
                <div className="glass-card rounded-2xl p-6 border-[#22c55e]/50">
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
                    <div className="flex-1 text-left min-w-0">
                      <span className="text-xs text-[#22c55e] font-semibold uppercase">Сейчас в эфире</span>
                      <h3 className="text-xl font-bold truncate">{liveShow.title}</h3>
                      <p className="text-sm text-[#71717a] truncate">{liveShow.host_name || 'Cosmos FM'}</p>
                    </div>
                  </div>
                  <button onClick={handlePlayLive} className="w-full btn-primary flex items-center justify-center gap-2">
                    {isPlaying && currentTrack?.id === liveShow.id ? <><Pause className="w-5 h-5" /> Пауза</> : <><Play className="w-5 h-5" /> Слушать эфир</>}
                  </button>
                </div>
              </div>
            )}

            {!liveShow && settings.stream_url && (
              <div className="max-w-2xl mx-auto mb-8 px-4">
                <button onClick={handlePlayLive} className="btn-primary text-lg px-8 py-4 w-full sm:w-auto">
                  <Play className="w-5 h-5 inline mr-2" /> Слушать прямой эфир
                </button>
              </div>
            )}

            {!liveShow && !settings.stream_url && (
              <div className="max-w-2xl mx-auto mb-8 px-4">
                <button onClick={handlePlayLive} className="btn-primary text-lg px-8 py-4 w-full sm:w-auto">
                  <Play className="w-5 h-5 inline mr-2" /> Слушать тестовый эфир
                </button>
                <p className="text-xs text-[#71717a] mt-2">Настройте stream_url в админке</p>
              </div>
            )}

            {error && (
              <div className="max-w-2xl mx-auto mb-6 px-4">
                <div className="p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20">
                  <div className="flex items-start gap-2 text-[#ef4444] text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold mb-1">{error}</p>
                      <p className="text-xs text-[#fca5a5]">
                        Проверьте URL в настройках. Используйте HTTPS ссылки на MP3/AAC файлы.
                      </p>
                    </div>
                    <button onClick={clearError} className="text-xs underline flex-shrink-0">Закрыть</button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto mt-12 px-4">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text">4000+</div>
                <div className="text-xs sm:text-sm text-[#71717a] mt-1">сотрудников</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text">2.5M</div>
                <div className="text-xs sm:text-sm text-[#71717a] mt-1">гостей</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text">24/7</div>
                <div className="text-xs sm:text-sm text-[#71717a] mt-1">вещание</div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="flex flex-col items-center gap-2 text-[#71717a]">
            <span className="text-sm">Листайте вниз</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </div>
        </div>
      </section>

      {shows.length > 0 && (
        <section className="py-12 sm:py-20 w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"><span className="gradient-text">Последние передачи</span></h2>
              <p className="text-base sm:text-lg text-[#71717a]">Слушайте наши эфиры</p>
            </div>
            <div className="space-y-4">
              {shows.slice(0, 5).map((show, index) => (
                <div key={show.id} className={`glass-card rounded-2xl p-4 sm:p-6 transition-all hover:border-[#6366f1]/50 ${show.is_live ? 'border-[#22c55e]/50' : ''}`}>
                  <div className="flex items-center gap-3 sm:gap-4">
                    {show.cover_url ? <img src={show.cover_url} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover flex-shrink-0" /> : <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center flex-shrink-0"><Radio className="w-8 h-8 sm:w-10 sm:h-10 text-white" /></div>}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg sm:text-xl font-bold truncate">{show.title}</h3>
                        {show.is_live && <span className="px-2 py-0.5 rounded-full bg-[#ef4444]/20 text-[#ef4444] text-xs font-bold flex-shrink-0">LIVE</span>}
                      </div>
                      <div className="flex items-center gap-3 text-xs sm:text-sm text-[#71717a] flex-wrap">
                        {show.host_name && <span className="truncate">{show.host_name}</span>}
                        {show.time && <span>{show.day_of_week} {show.time}</span>}
                      </div>
                    </div>
                    <button onClick={() => handlePlayShow(show)} disabled={!show.audio_url}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#6366f1] text-white flex items-center justify-center hover:scale-105 transition flex-shrink-0 disabled:opacity-50">
                      {isPlaying && currentTrack?.id === show.id ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {hosts.length > 0 && (
        <section className="py-12 sm:py-20 w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"><span className="gradient-text">Наши ведущие</span></h2>
              <p className="text-base sm:text-lg text-[#71717a]">Профессионалы своего дела</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {hosts.map(host => (
                <div key={host.id} className="glass-card rounded-2xl p-4 sm:p-6 hover:border-[#6366f1]/50 transition-all">
                  <div className="flex flex-col items-center text-center">
                    {host.photo_url ? <img src={host.photo_url} className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-[#27273a] mb-4" /> : <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br ${host.color || 'from-[#6366f1] to-[#8b5cf6]'} flex items-center justify-center text-white text-xl sm:text-2xl font-bold mb-4`}>{host.initials || host.name.split(' ').map(n => n[0]).join('').substring(0, 2)}</div>}
                    <h3 className="text-lg sm:text-xl font-bold mb-1">{host.name}</h3>
                    <p className="text-xs sm:text-sm text-[#6366f1] mb-2">{host.role || 'Ведущий'}</p>
                    {host.hotel && <p className="text-xs text-[#71717a] mb-3">{host.hotel}</p>}
                    {host.bio && <p className="text-xs sm:text-sm text-[#a1a1aa] line-clamp-3">{host.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {podcasts.length > 0 && (
        <section className="py-12 sm:py-20 w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"><span className="gradient-text">Подкасты</span></h2>
              <p className="text-base sm:text-lg text-[#71717a]">Слушайте наши лучшие выпуски</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {podcasts.map(podcast => (
                <div key={podcast.id} className="glass-card rounded-2xl p-4 sm:p-6 hover:border-[#6366f1]/50 transition-all">
                  <div className="mb-4">
                    {podcast.cover_url ? <img src={podcast.cover_url} className="w-full h-40 sm:h-48 rounded-xl object-cover" /> : <div className={`w-full h-40 sm:h-48 rounded-xl bg-gradient-to-br ${podcast.color || 'from-[#6366f1] to-[#8b5cf6]'} flex items-center justify-center`}><Music className="w-12 h-12 sm:w-16 sm:h-16 text-white/50" /></div>}
                  </div>
                  <h3 className="font-bold text-base sm:text-lg mb-2">{podcast.title}</h3>
                  <p className="text-xs sm:text-sm text-[#71717a] mb-3 line-clamp-2">{podcast.description}</p>
                  <button onClick={() => handlePlayPodcast(podcast)} disabled={!podcast.audio_url}
                    className="w-full py-2 rounded-lg bg-[#6366f1]/10 text-[#6366f1] hover:bg-[#6366f1]/20 transition text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                    <Play className="w-4 h-4" /> {podcast.audio_url ? 'Слушать' : 'Нет аудио'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
