import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const AudioContext = createContext(undefined);

export function AudioProvider({ children }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [volume, setVolumeState] = useState(80);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLiveStream, setIsLiveStream] = useState(false);
  const [error, setError] = useState(null);
  
  const audioRef = useRef(null);

  useEffect(() => {
    try {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = "anonymous";
      audioRef.current.volume = volume / 100;
      
      const audio = audioRef.current;

      const handleTimeUpdate = () => {
        if (audio.duration && isFinite(audio.duration)) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      };

      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
        setError(null);
      };

      const handleEnded = () => {
        if (!isLiveStream) {
          setIsPlaying(false);
          setProgress(0);
        }
      };

      const handleError = (e) => {
        console.error('Audio error:', e);
        setError('Ошибка воспроизведения: ' + (e.target?.error?.message || 'Неизвестная ошибка'));
        setIsPlaying(false);
      };

      const handleWaiting = () => {
        console.log('Buffering...');
      };

      const handlePlaying = () => {
        console.log('Playing started');
        setError(null);
      };

      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      audio.addEventListener('waiting', handleWaiting);
      audio.addEventListener('playing', handlePlaying);

      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('waiting', handleWaiting);
        audio.removeEventListener('playing', handlePlaying);
        audio.pause();
        audio.src = '';
      };
    } catch (err) {
      console.error('Failed to initialize audio:', err);
      setError('Не удалось инициализировать аудио');
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const playLiveStream = useCallback((url, title = 'Live Stream') => {
    if (!audioRef.current || !url) {
      console.error('Audio not initialized or URL missing');
      return;
    }
    
    const audio = audioRef.current;
    setIsLiveStream(true);
    setError(null);
    
    console.log('Playing stream:', url);
    audio.src = url;
    audio.load();
    
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.then(() => {
        console.log('Stream playing successfully');
        setIsPlaying(true);
        setCurrentTrack({ id: 'live-default', title, isLive: true, type: 'stream', audio_url: url });
      }).catch(err => {
        console.error('Stream play error:', err);
        setError('Не удалось воспроизвести поток: ' + err.message);
      });
    }
  }, []);

  const playTrack = useCallback((track) => {
    if (!audioRef.current || !track.audio_url) {
      console.error('Audio not initialized or track URL missing');
      return;
    }
    
    const audio = audioRef.current;
    setIsLiveStream(!!track.isLive);
    setError(null);
    
    console.log('Playing track:', track.audio_url);
    audio.src = track.audio_url;
    audio.load();
    
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.then(() => {
        console.log('Track playing successfully');
        setIsPlaying(true);
        setCurrentTrack(track);
      }).catch(err => {
        console.error('Track play error:', err);
        setError('Не удалось воспроизвести: ' + err.message);
      });
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentTrack) {
      console.log('Cannot toggle: no audio or track');
      return;
    }
    
    const audio = audioRef.current;
    if (isPlaying) {
      console.log('Pausing...');
      audio.pause();
      setIsPlaying(false);
    } else {
      console.log('Resuming...');
      const playPromise = audio.play();
      if (playPromise) {
        playPromise.then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.error('Resume error:', err);
          setError('Не удалось возобновить: ' + err.message);
        });
      }
    }
  }, [isPlaying, currentTrack]);

  const setVolume = useCallback((v) => {
    setVolumeState(v);
  }, []);

  return (
    <AudioContext.Provider value={{
      isPlaying, currentTrack, volume, progress, duration, isLiveStream, error,
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
