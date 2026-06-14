import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const AudioContext = createContext(undefined);

// Тестовые HTTPS потоки (для демонстрации)
const TEST_STREAMS = [
  { url: 'https://stream.radioparadise.com/aac-128', title: 'Radio Paradise' },
  { url: 'https://icecast.walmradio.com:8443/live', title: 'Walm Radio' },
  { url: 'https://npr-ice.streamguys1.com/live.mp3', title: 'NPR News' },
];

export function AudioProvider({ children }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [volume, setVolumeState] = useState(80);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLiveStream, setIsLiveStream] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const audioRef = useRef(null);
  const currentUrlRef = useRef(null);

  useEffect(() => {
    try {
      audioRef.current = new Audio();
      audioRef.current.preload = 'none';
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
        setIsLoading(false);
      };

      const handleEnded = () => {
        if (!isLiveStream) {
          setIsPlaying(false);
          setProgress(0);
        }
      };

      const handleError = (e) => {
        console.error('Audio error event:', e);
        setIsLoading(false);
        setIsPlaying(false);
        
        const mediaError = e.target?.error;
        let errorMsg = 'Ошибка воспроизведения';
        
        if (mediaError) {
          switch (mediaError.code) {
            case 1: errorMsg = 'Воспроизведение прервано пользователем'; break;
            case 2: errorMsg = 'Сетевая ошибка (проверьте URL)'; break;
            case 3: errorMsg = 'Ошибка декодирования аудио'; break;
            case 4: errorMsg = 'Формат не поддерживается браузером'; break;
          }
        }
        setError(errorMsg);
      };

      const handleWaiting = () => setIsLoading(true);
      const handlePlaying = () => {
        setIsLoading(false);
        setError(null);
        setIsPlaying(true);
      };
      const handleCanPlay = () => {
        setIsLoading(false);
      };

      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      audio.addEventListener('waiting', handleWaiting);
      audio.addEventListener('playing', handlePlaying);
      audio.addEventListener('canplay', handleCanPlay);

      return () => {
        audio.pause();
        audio.src = '';
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('waiting', handleWaiting);
        audio.removeEventListener('playing', handlePlaying);
        audio.removeEventListener('canplay', handleCanPlay);
      };
    } catch (err) {
      console.error('Failed to init audio:', err);
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  // Проверка HTTPS
  const checkUrl = useCallback((url) => {
    if (!url) return { valid: false, reason: 'URL не указан' };
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && url.startsWith('http:')) {
      return { valid: false, reason: 'HTTP поток заблокирован на HTTPS сайте. Используйте HTTPS URL.' };
    }
    return { valid: true };
  }, []);

  const playLiveStream = useCallback((url, title = 'Live Stream') => {
    if (!audioRef.current) {
      setError('Аудио не инициализировано');
      return;
    }
    
    const check = checkUrl(url);
    if (!check.valid) {
      setError(check.reason);
      console.error('Stream blocked:', check.reason);
      return;
    }
    
    const audio = audioRef.current;
    setIsLiveStream(true);
    setError(null);
    setIsLoading(true);
    
    // Прерываем предыдущее воспроизведение
    if (currentUrlRef.current === url && isPlaying) {
      console.log('Already playing this stream');
      return;
    }
    
    audio.pause();
    audio.src = '';
    currentUrlRef.current = url;
    audio.src = url;
    audio.load();
    
    const playPromise = audio.play();
    if (playPromise) {
      playPromise
        .then(() => {
          console.log('Stream playing:', title);
          setIsPlaying(true);
          setCurrentTrack({ 
            id: 'live-' + Date.now(), 
            title, 
            isLive: true, 
            type: 'stream', 
            audio_url: url 
          });
        })
        .catch(err => {
          console.error('Play failed:', err.name, err.message);
          setIsLoading(false);
          if (err.name === 'NotAllowedError') {
            setError('Нажмите кнопку Play для запуска');
          } else {
            setError('Ошибка: ' + err.message);
          }
        });
    }
  }, [checkUrl, isPlaying]);

  const playTrack = useCallback((track) => {
    if (!audioRef.current || !track.audio_url) {
      setError('URL трека не указан');
      return;
    }
    
    const check = checkUrl(track.audio_url);
    if (!check.valid) {
      setError(check.reason);
      return;
    }
    
    const audio = audioRef.current;
    setIsLiveStream(!!track.isLive);
    setError(null);
    setIsLoading(true);
    
    // Прерываем если тот же трек уже играет
    if (currentUrlRef.current === track.audio_url && isPlaying) {
      console.log('Already playing this track');
      return;
    }
    
    audio.pause();
    audio.src = '';
    currentUrlRef.current = track.audio_url;
    audio.src = track.audio_url;
    audio.load();
    
    const playPromise = audio.play();
    if (playPromise) {
      playPromise
        .then(() => {
          console.log('Track playing:', track.title);
          setIsPlaying(true);
          setCurrentTrack(track);
        })
        .catch(err => {
          console.error('Play failed:', err.name, err.message);
          setIsLoading(false);
          if (err.name === 'NotAllowedError') {
            setError('Нажмите Play для запуска');
          } else {
            setError('Ошибка: ' + err.message);
          }
        });
    }
  }, [checkUrl, isPlaying]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;
    const audio = audioRef.current;
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      const playPromise = audio.play();
      if (playPromise) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(err => {
            setIsLoading(false);
            setError('Ошибка воспроизведения: ' + err.message);
          });
      }
    }
  }, [isPlaying, currentTrack]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      currentUrlRef.current = null;
      setIsPlaying(false);
      setCurrentTrack(null);
      setIsLiveStream(false);
      setError(null);
    }
  }, []);

  const setVolume = useCallback((v) => setVolumeState(v), []);

  return (
    <AudioContext.Provider value={{
      isPlaying, currentTrack, volume, progress, duration, 
      isLiveStream, error, isLoading,
      playLiveStream, playTrack, togglePlay, stop, setVolume,
      testStreams: TEST_STREAMS,
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
