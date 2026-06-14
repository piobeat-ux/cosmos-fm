import { useEffect, useState } from 'react';
import { Radio, ChevronDown, Sparkles, Play, User, Music, Calendar } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAudio } from '@/context/AudioContext';

export function HomeSection() {
  const { shows, hosts, podcasts, settings } = useData();
  const { playLiveStream, playTrack, currentTrack, isPlaying } = useAudio();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => { setIsLoaded(true); }, []);

  const liveShow = shows.find(show => show.is_live);

  const handlePlayLive = () => {
    if (liveShow?.audio_url) {
      playTrack({ id: liveShow.id, title: liveShow.title, artist: liveShow.host_name, audio_url: liveShow.audio_url, cover_url: liveShow.cover_url, isLive: true, type: 'show' });
    } else if (settings.stream_url) {
      playLiveStream(settings.stream_url, liveShow?.title || 'Прямой эфир');
    }
  };

  const handlePlayShow = (show) => {
    if (show.audio_url) {
      playTrack({ id: show.id, title: show.title, artist: show.host_name, audio_url: show.audio_url, cover_url: show.cover_url, isLive: show.is_live, type: 'show' });
    }
  };

  const handlePlayPodcast = (podcast) => {
    if (podcast.audio_url) {
      playTrack({ id: podcast.id, title: podcast.title, artist: podcast.host_name, audio_url: podcast.audio_url, cover_url: podcast.cover_url, isLive: false, type: 'podcast' });
    }
  };

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0" style={{ backgroundImage: 'url(/hero-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/60 via-[#0a0a0f]/40 to-[#0a0a0f]" />
        </div>

        <div className="relative z-10 section-padding w-full max-w-6xl mx-auto pt-24 text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Sparkles className="w-4 h-4 text-[#6366f1]" />
            <span className="text-sm text-[#a1a1aa]">Первый в России</span>
          </div>

          <div className={`flex justify-center mb-8 transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center animate-pulse-glow">
              <Radio className="w-12 h-12 text-white" />
            </div>
          </div>

          <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-black mb-4 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <span className="gradient-text">{settings.hero_title || 'Голос вашего отеля'}</span>
          </h1>

          <p className={`text-2xl sm:text-3xl lg:text-4xl font-light text-[#a1a1aa] mb-6 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
            {settings.hero_subtitle || 'Звуки вашего космоса'}
          </p>

          <p className={`text-lg sm:text-xl text-[#71717a] max-w-2xl mx-auto mb-12 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
            {settings.hero_description || 'Первый в России корпоративный медиа-канал в индустрии гостеприимства'}
          </p>

          {/* LIVE Show */}
          {liveShow && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="glass-card rounded-2xl p-6 border-[#22c55e]/50 now-playing-glow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    {liveShow.cover_url ? <img src={liveShow.cover_url} className="w-20 h-20 rounded-xl object-cover" /> : <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center"><Radio className="w-10 h-10 text-white" /></div>}
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#ef4444] flex items-center justify-center animate-pulse"><span className="text-[10px] font-bold text-white">LIVE</span></div>
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-xs text-[#22c55e] font-semibold uppercase">Сейчас в эфире</span>
                    <h3 className="text-xl font-bold">{liveShow.title}</h3>
                    <p className="text-sm text-[#71717a]">{liveShow.host_name || 'Cosmos FM'}</p>
                  </div>
                </div>
                <button onClick={handlePlayLive} className="w-full btn-primary flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" /> {isPlaying && currentTrack?.id === liveShow.id ? 'Слушаем' : 'Слушать эфир'}
                </button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-12">
            <div className="text-center"><div className="text-3xl sm:text-4xl font-bold gradient-text">4000+</div><div className="text-sm text-[#71717a] mt-1">сотрудников</div></div>
            <div className="text-center"><div className="text-3xl sm:text-4xl font-bold gradient-text">2.5M</div><div className="text-sm text-[#71717a] mt-1">гостей</div></div>
            <div className="text-center"><div className="text-3xl sm:text-4xl font-bold gradient-text">24/7</div><div className="text-sm text-[#71717a] mt-1">вещание</div></div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="flex flex-col items-center gap-2 text-[#71717a]">
            <span className="text-sm">Листайте вниз</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ПОСЛЕДНИЕ ПЕРЕДАЧИ */}
      {shows.length > 0 && (
        <section className="py-20 max-w-6xl mx-auto section-padding">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4"><span className="gradient-text">Последние передачи</span></h2>
            <p className="text-lg text-[#71717a]">Слушайте наши эфиры</p>
          </div>
          <div className="space-y-4">
            {shows.slice(0, 5).map(show => (
              <div key={show.id} className={`glass-card rounded-2xl p-6 transition-all duration-300 hover:border-[#6366f1]/50 ${show.is_live ? 'border-[#22c55e]/50 now-playing-glow' : ''}`}>
                <div className="flex items-center gap-4">
                  {show.cover_url ? <img src={show.cover_url} className="w-20 h-20 rounded-xl object-cover" /> : <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center flex-shrink-0"><Radio className="w-10 h-10 text-white" /></div>}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold truncate">{show.title}</h3>
                      {show.is_live && <span className="px-2 py-0.5 rounded-full bg-[#ef4444]/20 text-[#ef4444] text-xs font-bold">LIVE</span>}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[#71717a] flex-wrap">
                      {show.host_name && <span>{show.host_name}</span>}
                      {show.time && <span>{show.day_of_week} {show.time}</span>}
                      {show.duration && <span>{show.duration}</span>}
                    </div>
                    {show.description && <p className="text-sm text-[#a1a1aa] mt-2 line-clamp-2">{show.description}</p>}
                  </div>
                  {show.audio_url && (
                    <button onClick={() => handlePlayShow(show)} className="w-12 h-12 rounded-full bg-[#6366f1] text-white flex items-center justify-center hover:scale-105 transition">
                      <Play className="w-5 h-5 ml-0.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ВЕДУЩИЕ */}
      {hosts.length > 0 && (
        <section className="py-20 max-w-6xl mx-auto section-padding">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4"><span className="gradient-text">Наши ведущие</span></h2>
            <p className="text-lg text-[#71717a]">Профессионалы своего дела</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hosts.map(host => (
              <div key={host.id} className="glass-card rounded-2xl p-6 hover:border-[#6366f1]/50 transition-all duration-300">
                <div className="flex flex-col items-center text-center">
                  {host.photo_url ? <img src={host.photo_url} className="w-24 h-24 rounded-full object-cover border-2 border-[#27273a] mb-4" /> : <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${host.color || 'from-[#6366f1] to-[#8b5cf6]'} flex items-center justify-center text-white text-2xl font-bold mb-4`}>{host.initials || host.name.split(' ').map(n => n[0]).join('').substring(0, 2)}</div>}
                  <h3 className="text-xl font-bold mb-1">{host.name}</h3>
                  <p className="text-sm text-[#6366f1] mb-2">{host.role || 'Ведущий'}</p>
                  {host.hotel && <p className="text-xs text-[#71717a] mb-3">{host.hotel}</p>}
                  {host.bio && <p className="text-sm text-[#a1a1aa] line-clamp-3">{host.bio}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ПОДКАСТЫ */}
      {podcasts.length > 0 && (
        <section className="py-20 max-w-6xl mx-auto section-padding">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4"><span className="gradient-text">Подкасты</span></h2>
            <p className="text-lg text-[#71717a]">Слушайте наши лучшие выпуски</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {podcasts.map(podcast => (
              <div key={podcast.id} className="glass-card rounded-2xl p-6 hover:border-[#6366f1]/50 transition-all duration-300">
                <div className="mb-4">
                  {podcast.cover_url ? <img src={podcast.cover_url} className="w-full h-48 rounded-xl object-cover" /> : <div className={`w-full h-48 rounded-xl bg-gradient-to-br ${podcast.color || 'from-[#6366f1] to-[#8b5cf6]'} flex items-center justify-center`}><Music className="w-16 h-16 text-white/50" /></div>}
                </div>
                <h3 className="font-bold text-lg mb-2">{podcast.title}</h3>
                <p className="text-sm text-[#71717a] mb-3 line-clamp-2">{podcast.description}</p>
                <div className="flex items-center gap-4 text-xs text-[#a1a1aa] mb-3">
                  {podcast.host_name && <span>{podcast.host_name}</span>}
                  {podcast.duration && <span>{podcast.duration}</span>}
                </div>
                {podcast.audio_url && (
                  <button onClick={() => handlePlayPodcast(podcast)} className="w-full py-2 rounded-lg bg-[#6366f1]/10 text-[#6366f1] hover:bg-[#6366f1]/20 transition text-sm flex items-center justify-center gap-2">
                    <Play className="w-4 h-4" /> Слушать
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}