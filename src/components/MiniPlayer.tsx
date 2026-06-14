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
            style={{ width: `${progress}%` }}
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
                          animationDelay: `${i * 0.15}s`
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
                  background: `linear-gradient(to right, #6366f1 ${volume}%, #27273a ${volume}%)`,
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