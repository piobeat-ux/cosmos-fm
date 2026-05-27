import { useRef, useState } from 'react';

interface Props {
  src: string;
  title: string;
  subtitle?: string;
  cover?: string;
  live?: boolean;
}

export function Player({ src, title, subtitle, cover, live }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
  };

  return (
    <div className="player-card">
      <div className="player-cover">
        {cover ? <img src={cover} alt="" /> : <div className="cover-placeholder">🎙</div>}
        {live && playing && <span className="live-badge">● LIVE</span>}
      </div>
      <div className="player-info">
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        preload="none"
      />
      <button className="play-btn" onClick={toggle}>
        {playing ? '⏸' : '▶️'}
      </button>
    </div>
  );
}
