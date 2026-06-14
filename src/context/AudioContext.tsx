import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const AudioContext = createContext(undefined);

export function AudioProvider({ children }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [volume, setVolumeState] = useState(80);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLiveStream, setIsLiveStream] = useState(false);
  
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume / 100;
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      if (!isLiveStream) {
        setIsPlaying(false);
        setProgress(0);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', (e) => console.error('Audio error:', e));

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  const playLiveStream = useCallback((url, title = 'Live Stream') => {
    if (!audioRef.current || !url) return;
    const audio = audioRef.current;
    setIsLiveStream(true);
    audio.src = url;
    audio.play().then(() => {
      setIsPlaying(true);
      setCurrentTrack({ id: 'live-default', title, isLive: true, type: 'stream' });
    }).catch(err => console.error('Stream play error:', err));
  }, []);

  const playTrack = useCallback((track) => {
    if (!audioRef.current || !track.audio_url) return;
    const audio = audioRef.current;
    setIsLiveStream(!!track.isLive);
    audio.src = track.audio_url;
    audio.play().then(() => {
      setIsPlaying(true);
      setCurrentTrack(track);
    }).catch(err => console.error('Track play error:', err));
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true));
    }
  }, [isPlaying, currentTrack]);

  const setVolume = useCallback((v) => setVolumeState(v), []);

  return (
    <AudioContext.Provider value={{
      isPlaying, currentTrack, volume, progress, duration, isLiveStream,
      playLiveStream, playTrack, togglePlay, setVolume
    }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
}