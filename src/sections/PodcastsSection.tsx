import { useState } from 'react';
import { Play, Pause, Heart, Clock, Headphones } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAudio } from '@/context/AudioContext';
import { SearchBar } from '@/components/SearchBar';
import { FilterChips } from '@/components/FilterChips';

export function PodcastsSection() {
  const { podcasts, editPodcast } = useData();
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Все');
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const categories = ['Все', ...new Set(podcasts.map(p => p.category).filter(Boolean))];

  const filteredPodcasts = podcasts.filter(podcast => {
    const matchesSearch = podcast.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         podcast.host_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'Все' || podcast.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

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

  const handleLike = async (podcast: any) => {
    if (likedIds.has(podcast.id)) return;
    
    const newLikes = (podcast.likes || 0) + 1;
    setLikedIds(prev => new Set(prev).add(podcast.id));
    
    try {
      await editPodcast(podcast.id, { likes: newLikes });
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const isCurrentTrack = (id: string) => currentTrack?.id === id && isPlaying;

  return (
    <section id="podcasts" className="py-20 fade-in">
      <div className="max-w-6xl mx-auto section-padding">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="gradient-text">Подкасты</span>
          </h2>
          <p className="text-lg text-[#71717a]">Слушайте наши лучшие выпуски</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Поиск подкастов..."
          />
        </div>

        {/* Filters */}
        <div className="mb-8">
          <FilterChips
            filters={categories}
            activeFilter={activeCategory}
            onChange={setActiveCategory}
          />
        </div>

        {/* Podcasts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPodcasts.length === 0 ? (
            <div className="col-span-full text-center py-12 text-[#71717a]">
              <Headphones className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Подкасты не найдены</p>
            </div>
          ) : (
            filteredPodcasts.map((podcast, index) => {
              const playing = isCurrentTrack(podcast.id);
              const liked = likedIds.has(podcast.id);
              return (
                <div 
                  key={podcast.id} 
                  className="glass-card rounded-2xl p-6 hover:border-[#6366f1]/50 transition-all duration-300 slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="relative mb-4">
                    {podcast.cover_url ? (
                      <img src={podcast.cover_url} alt={podcast.title} className="w-full h-48 rounded-xl object-cover" />
                    ) : (
                      <div className={`w-full h-48 rounded-xl bg-gradient-to-br ${podcast.color || 'from-[#6366f1] to-[#8b5cf6]'} flex items-center justify-center`}>
                        <Headphones className="w-16 h-16 text-white/50" />
                      </div>
                    )}
                    {podcast.audio_url && (
                      <button
                        onClick={() => handlePlayPodcast(podcast)}
                        className={`absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl transition-opacity ${playing ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}
                      >
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${playing ? 'bg-[#22c55e]' : 'bg-[#6366f1]'} scale-in`}>
                          {playing ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white ml-1" />}
                        </div>
                      </button>
                    )}
                  </div>

                  <h3 className="font-bold text-lg mb-2">{podcast.title}</h3>
                  <p className="text-sm text-[#71717a] mb-3 line-clamp-2">{podcast.description}</p>

                  <div className="flex items-center gap-4 text-xs text-[#a1a1aa] mb-3">
                    {podcast.host_name && <span>{podcast.host_name}</span>}
                    {podcast.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{podcast.duration}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#27273a]">
                    <div className="flex items-center gap-1 text-sm text-[#71717a]">
                      <Heart className={`w-4 h-4 ${liked ? 'fill-[#ef4444] text-[#ef4444]' : ''}`} />
                      <span>{podcast.likes || 0}</span>
                    </div>
                    <button 
                      onClick={() => handleLike(podcast)}
                      disabled={liked}
                      className={`p-2 transition-colors ${liked ? 'text-[#ef4444]' : 'text-[#71717a] hover:text-[#ef4444]'}`}
                    >
                      <Heart className={`w-5 h-5 ${liked ? 'fill-[#ef4444]' : ''}`} />
                    </button>
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