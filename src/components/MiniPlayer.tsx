import { Play, Pause, Volume2, VolumeX, AlertCircle, Loader2, X } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';

export function MiniPlayer() {
  const { 
    isPlaying, currentTrack, volume, progress,
    isLiveStream, error, isLoading,
    togglePlay, setVolume, stop
  } = useAudio();

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass-player border-t border-[#27273a]">
      {error && (
        <div className="bg-[#ef4444]/10 border-b border-[#ef4444]/20 px-4 py-2">
          <div className="flex items-center justify-between gap-2 text-[#ef4444] text-sm max-w-6xl mx-auto">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{error}</span>
            </div>
            <button onClick={() => {}} className="text-xs underline flex-shrink-0">OK</button>
          </div>
        </div>
      )}
      
      <div className="section-padding py-3">
        <div className="flex items-center justify-between gap-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#13131f]">
              {currentTrack.cover_url ? (
                <img src={currentTrack.cover_url} alt={currentTrack.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">📻</div>
              )}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
              {isPlaying && !isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="flex gap-0.5">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1 bg-white rounded-full animate-pulse" style={{ height: '12px', animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm truncate">{currentTrack.title}</h4>
                {currentTrack.isLive && (
                  <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-[#ef4444]/20 text-[#ef4444] text-[10px] font-bold uppercase">LIVE</span>
                )}
              </div>
              <p className="text-xs text-[#71717a] truncate">
                {currentTrack.artist || (isLiveStream ? 'Прямой эфир' : 'Cosmos FM')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={togglePlay} disabled={isLoading}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center hover:scale-105 transition-transform flex-shrink-0 disabled:opacity-50">
              {isLoading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> :
               isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
            </button>

            <div className="hidden sm:flex items-center gap-2">
              {volume === 0 ? <VolumeX className="w-4 h-4 text-[#71717a]" /> : <Volume2 className="w-4 h-4 text-[#71717a]" />}
              <input type="range" min="0" max="100" value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-20 h-1 bg-[#27273a] rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, #6366f1 ${volume}%, #27273a ${volume}%)` }} />
            </div>

            <button onClick={stop} className="p-2 text-[#71717a] hover:text-[#ef4444] transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
