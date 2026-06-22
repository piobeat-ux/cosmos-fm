import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const AudioContext = createContext(undefined);

export function AudioProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Инициализация audio элемента
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
    }
    
    const audio = audioRef.current;
    
    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
      setDuration(audio.duration || 0);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
      setIsLoading(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setIsLoading(false);
      setProgress(0);
    };

    const handleError = (e) => {
      setIsLoading(false);
      setIsPlaying(false);
      setError('Ошибка воспроизведения');
    };

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime || 0);
      setDuration(audio.duration || 0);
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  const playTrack = useCallback((track) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    const audio = audioRef.current;
    
    setIsLoading(true);
    setError(null);
    
    if (!track?.audio_url) {
      setIsLoading(false);
      setError('Нет аудио потока');
      return;
    }

    // Если тот же трек и играет - ставим на паузу
    if (currentTrack?.id === track.id && isPlaying) {
      audio.pause();
      return;
    }

    // Новый трек или другой - загружаем и играем
    try {
      audio.pause();
      audio.src = track.audio_url;
      audio.load();
      setCurrentTrack(track);
      
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        setIsLoading(false);
        setError('Не удалось воспроизвести');
      });
    } catch (err) {
      setIsLoading(false);
      setError('Ошибка воспроизведения');
    }
  }, [currentTrack, isPlaying]);

  const pauseTrack = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsLoading(false);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pauseTrack();
    } else if (currentTrack) {
      playTrack(currentTrack);
    }
  }, [isPlaying, currentTrack, playTrack, pauseTrack]);

  const playLiveStream = useCallback((streamUrl, title = 'Live Stream') => {
    playTrack({
      id: 'live',
      title,
      artist: 'Cosmos FM',
      audio_url: streamUrl,
      isLive: true,
      type: 'live'
    });
  }, [playTrack]);

  const stopTrack = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      setCurrentTrack(null);
      setIsPlaying(false);
      setIsLoading(false);
      setError(null);
      setProgress(0);
      setDuration(0);
    }
  }, []);

  const seekTo = useCallback((time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  }, []);

  return (
    <AudioContext.Provider value={{
      currentTrack,
      isPlaying,
      isLoading,
      error,
      progress,
      duration,
      playTrack,
      pauseTrack,
      togglePlay,
      playLiveStream,
      stopTrack,
      seekTo,
    }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within AudioProvider');
  return context;
}
