import { useAudio } from '@/context/AudioContext';

export function AudioWave() {
  const { isPlaying } = useAudio();

  return (
    <div className="audio-wave">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="audio-wave-bar"
          style={{
            animationPlayState: isPlaying ? 'running' : 'paused',
          }}
        />
      ))}
    </div>
  );
}
