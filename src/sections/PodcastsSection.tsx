import { Play, Pause, Headphones } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAudio } from '@/context/AudioContext';
import { resolveAudio } from '@/lib/media';
import type { Podcast } from '@/types/database';

export function PodcastsSection() {
  const { podcasts: allPodcasts } = useData();
  const podcasts = allPodcasts.filter(row => row.published !== false && (row.catalog_mode !== 'after_airing' || (row.catalog_visible_at && Date.parse(row.catalog_visible_at) <= Date.now())));
  const { playRecording, currentTrack, isPlaying } = useAudio();

  const handlePlay = (podcast: Podcast) => {
    playRecording({ id: podcast.id, title: podcast.title, artist: podcast.host_name, audio_url: podcast.audio_url || '', cover_url: podcast.cover_url, isLive: false, type: 'podcast' }, () => podcast.asset_id ? resolveAudio(podcast.asset_id) : Promise.resolve(podcast.audio_url || ''));
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
                {podcast.cover_url ? <img src={podcast.cover_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Headphones className="w-16 h-16 text-white/30" /></div>}
                <button aria-label={`Слушать: ${podcast.title}`} onClick={() => handlePlay(podcast)} className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 focus-visible:bg-black/40 transition-colors">
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
