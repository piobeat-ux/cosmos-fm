import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { AudioController, type PlayerState } from '@/lib/audio-controller';

type AudioContextValue = PlayerState & Pick<AudioController,
  'playTrack' | 'playRecording' | 'pauseTrack' | 'togglePlay' | 'playLiveStream' | 'stopTrack' | 'seekTo' | 'startStation'
> & { controller: AudioController };

const AudioContext = createContext<AudioContextValue | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [controller] = useState(() => new AudioController());
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot);

  useEffect(() => () => controller.stopTrack(), [controller]);

  return (
    <AudioContext.Provider value={{
      ...state, controller,
      playTrack: controller.playTrack,
      playRecording: controller.playRecording,
      pauseTrack: controller.pauseTrack,
      togglePlay: controller.togglePlay,
      playLiveStream: controller.playLiveStream,
      stopTrack: controller.stopTrack,
      seekTo: controller.seekTo,
      startStation: controller.startStation,
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
