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

  // Mobile audio unlock
  useEffect(() => {
    const unlockAudio = () => {
      if (audioRef.current) {
        audioRef.current.play().then(() => {
          audioRef.current.pause();
        }).catch(() => {
          // Ignore errors
        });
      }
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('click', unlockAudio);
    };
    
    document.addEventListener('touchstart', unlockAudio);
    document.addEventListener('click', unlockAudio);
    
    return () => {
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('click', unlockAudio);
    };
  }, []);


  // Инициализация audio элемента
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
    }
    
    const audio = audioRef.current;
    
    const handleCanPlay = () => {
      console.log('✅ Audio can play');
      setIsLoading(false);
      setError(null);
      setDuration(audio.duration || 0);
    };

    const handleWaiting = () => {
      console.log('⏳ Audio waiting');
      setIsLoading(true);
    };

    const handlePlaying = () => {
      console.log('▶️ Audio playing');
      setIsLoading(false);
      setIsPlaying(true);
    };

    const handlePause = () => {
      console.log('⏸️ Audio paused');
      setIsPlaying(false);
    };

    const handleEnded = () => {
      console.log('⏹️ Audio ended');
      setIsPlaying(false);
      setIsLoading(false);
      setProgress(0);
    };

    const handleError = (e) => {
      console.error('❌ Audio error:', e);
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
    console.log('🎵 Playing track:', track);
    
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    const audio = audioRef.current;
    
    setIsLoading(true);
    setError(null);
    
    if (!track?.audio_url) {
      console.error('❌ No audio URL');
      setIsLoading(false);
      setError('Нет аудио потока');
      return;
    }

    // Если тот же трек и играет - ставим на паузу
    if (currentTrack?.id === track.id && isPlaying) {
      console.log('🔄 Same track, toggling pause');
      audio.pause();
      setIsPlaying(false);
      return;
    }

    // Новый трек или другой - загружаем и играем
    try {
      audio.pause();
      audio.src = track.audio_url;
      audio.load();
      setCurrentTrack(track);
      
      audio.play().then(() => {
        console.log('✅ Play started');
        setIsPlaying(true);
      }).catch(err => {
        console.error('❌ Play failed:', err);
        setIsLoading(false);
        setError('Не удалось воспроизвести');
      });
    } catch (err) {
      console.error('❌ Play error:', err);
      setIsLoading(false);
      setError('Ошибка воспроизведения');
    }
  }, [currentTrack, isPlaying]);

  const pauseTrack = useCallback(() => {
    console.log('⏸️ Pausing track');
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const togglePlay = useCallback(() => {
    console.log('🔄 Toggle play, current:', isPlaying);
    if (isPlaying) {
      pauseTrack();
    } else if (currentTrack) {
      playTrack(currentTrack);
    }
  }, [isPlaying, currentTrack, playTrack, pauseTrack]);

  const playLiveStream = useCallback((streamUrl, title = 'Live Stream') => {
    console.log('📡 Playing live stream:', streamUrl);
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
    console.log('⏹️ Stopping track');
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
