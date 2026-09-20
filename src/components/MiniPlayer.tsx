import { Play, Pause, X, Loader2 } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';

const playbackTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

export function MiniPlayer() {
  const { currentTrack, isPlaying, isLoading, error, mode, progress, duration, seekTo, startStation, togglePlay, stopTrack } = useAudio();

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50" style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRadius: '1rem',
      border: '1px solid rgba(40, 185, 208, 0.3)',
      boxShadow: '0 8px 32px rgba(104, 80, 150, 0.25)'
    }}>
      <div className="flex items-center gap-3 p-3">
        {/* Cover */}
        <div className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center" style={{
          background: 'linear-gradient(135deg, #28B9D0, #685096)'
        }}>
          <span className="text-2xl">🎵</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm truncate" style={{ color: '#1A2B3C' }}>
            {currentTrack.title}
          </h4>
          <p className="text-xs truncate" style={{ color: '#4A6578' }}>
            {currentTrack.artist || 'Cosmos FM'}
            {currentTrack.isLive && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold" style={{
                background: '#EF4444',
                color: '#FFFFFF'
              }}>
                LIVE
              </span>
            )}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            aria-label={isPlaying || isLoading ? 'Пауза' : 'Воспроизвести'}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: 'linear-gradient(135deg, #28B9D0, #685096)',
              color: '#FFFFFF'
            }}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>

          <button
            onClick={stopTrack}
            aria-label="Остановить воспроизведение"
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:opacity-70"
            style={{ color: '#4A6578' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && <p role="status" className="px-3 pb-2 text-xs text-red-700">{error}</p>}
      {!currentTrack.isLive && duration > 0 && <div className="px-3 pb-2">
        <p aria-label="Время записи" className="text-xs text-[#4A6578]">{playbackTime(progress)} / {playbackTime(duration)}</p>
        {mode === 'station' && <progress aria-label="Прогресс передачи" value={Math.min(progress, duration)} max={duration} className="h-1 w-full accent-[#685096]" />}
      </div>}
      {mode === 'manual' && (
        <div className="px-3 pb-3">
          {duration > 0 && <input aria-label="Позиция воспроизведения" type="range" min={0} max={duration} step={1} value={Math.min(progress, duration)} onChange={event => seekTo(Number(event.target.value))} className="w-full" />}
          <button onClick={startStation} className="text-xs text-[#685096] underline">Вернуться в эфир</button>
        </div>
      )}

      {/* Progress bar for live stream */}
      {currentTrack.isLive && isPlaying && (
        <div className="h-1 w-full overflow-hidden rounded-b-lg" style={{ background: 'rgba(40, 185, 208, 0.2)' }}>
          <div className="h-full animate-pulse" style={{ 
            background: 'linear-gradient(90deg, #28B9D0, #685096)',
            width: '100%'
          }} />
        </div>
      )}
    </div>
  );
}
