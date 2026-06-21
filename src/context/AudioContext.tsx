import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const AudioContext = createContext(undefined);

export function AudioProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  // Инициализация audio элемента
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'none';
    }
    
    const audio = audioRef.current;
    
    const handleCanPlay = () => {
      console.log('✅ Audio can play');
      setIsLoading(false);
      setError(null);
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
      console.log('️ Audio ended');
      setIsPlaying(false);
      setIsLoading(false);
    };

    const handleError = (e) => {
      console.error('❌ Audio error:', e);
      setIsLoading(false);
      setIsPlaying(false);
      setError('Ошибка воспроизведения');
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
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

    // Если тот же трек - просто возобновляем
    if (currentTrack?.id === track.id && audio.src) {
      console.log('🔄 Resuming same track');
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error('❌ Resume failed:', err);
        setIsLoading(false);
      });
      return;
    }

    // Новый трек - загружаем
    try {
      audio.pause();
      audio.src = track.audio_url;
      audio.load();
      setCurrentTrack(track);
      
      audio.play().then(() => {
        console.log('✅ Play started');
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
  }, [currentTrack]);

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
    }
  }, []);

  return (
    <AudioContext.Provider value={{
      currentTrack,
      isPlaying,
      isLoading,
      error,
      playTrack,
      pauseTrack,
      togglePlay,
      playLiveStream,
      stopTrack,
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
