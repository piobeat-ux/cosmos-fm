export interface AudioTrack {
  id: string;
  title: string;
  audio_url: string;
  artist?: string;
  cover_url?: string;
  isLive?: boolean;
  type?: string;
}

export interface StationSelection {
  track: AudioTrack;
  /** Stable identity of an airing, not just the recording. */
  occurrenceId?: string;
  offsetSeconds?: number;
}

export interface PlayerState {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  progress: number;
  duration: number;
  mode: 'station' | 'manual';
}

export const initialPlayerState: PlayerState = {
  currentTrack: null, isPlaying: false, isLoading: false,
  error: null, progress: 0, duration: 0, mode: 'station',
};

export function isSecureAudioUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch { return false; }
}

/** Playback side effects are isolated here so races can be tested without React. */
export class AudioController {
  private state: PlayerState = { ...initialPlayerState };
  private audio: HTMLAudioElement | null = null;
  private generation = 0;
  private playAttempt = 0;
  private requested = false;
  private occurrenceId: string | undefined;
  private failedOccurrences = new Set<string>();
  private finishedOccurrences = new Set<string>();
  private timeout: ReturnType<typeof setTimeout> | undefined;
  private cleanup: (() => void) | undefined;
  private resolveStation: () => StationSelection | null = () => null;
  private refreshStation: (() => Promise<void>) | null = null;
  private pendingRecording: { track: AudioTrack; resolve: () => Promise<string> } | null = null;
  private radio: AudioTrack | null = null;
  private listeners = new Set<() => void>();

  private createAudio: () => HTMLAudioElement;
  constructor(createAudio: () => HTMLAudioElement = () => new Audio()) { this.createAudio = createAudio; }

  getSnapshot = (): PlayerState => this.state;
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private update(patch: Partial<PlayerState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach(listener => listener());
  }

  setStationResolver(resolver: () => StationSelection | null) {
    this.resolveStation = resolver;
  }

  setStationRefresh(refresh: (() => Promise<void>) | null) { this.refreshStation = refresh; }

  setRadio(url: string, title = 'Cosmos FM') {
    this.radio = isSecureAudioUrl(url)
      ? { id: 'live', title, artist: 'Cosmos FM', audio_url: url, isLive: true, type: 'live' }
      : null;
  }

  private clearTimeout() {
    if (this.timeout !== undefined) clearTimeout(this.timeout);
    this.timeout = undefined;
  }

  private release() {
    this.generation++;
    this.playAttempt++;
    this.clearTimeout();
    this.cleanup?.();
    this.cleanup = undefined;
    if (this.audio) {
      this.audio.pause();
      this.audio.removeAttribute('src');
      this.audio.load();
    }
    this.audio = null;
  }

  private failure(message: string, blocked = false) {
    this.clearTimeout();
    if (!blocked && this.requested && !this.state.currentTrack?.isLive && this.radio) {
      if (this.occurrenceId) this.failedOccurrences.add(this.occurrenceId);
      this.update({ mode: 'station' });
      this.start({ track: this.radio });
      this.update({ error: `${message} Включён радиопоток.` });
      return;
    }
    this.requested = false;
    this.audio?.pause();
    this.update({ isLoading: false, isPlaying: false, error: message });
  }

  private armTimeout(generation: number) {
    this.clearTimeout();
    this.timeout = setTimeout(() => {
      if (generation === this.generation && this.requested) {
        this.failure('Источник не отвечает.');
      }
    }, 20_000);
  }

  private requestPlay(audio: HTMLAudioElement, generation: number) {
    const attempt = ++this.playAttempt;
    this.armTimeout(generation);
    try {
      void audio.play().then(() => {
        if (generation !== this.generation || attempt !== this.playAttempt || !this.requested) return;
        this.clearTimeout();
        this.update({ isPlaying: true, isLoading: false });
      }).catch((error: unknown) => {
        if (generation !== this.generation || attempt !== this.playAttempt || !this.requested) return;
        const blocked = error instanceof Error && error.name === 'NotAllowedError';
        this.failure(blocked ? 'Нажмите «Воспроизвести», чтобы продолжить.' : 'Не удалось воспроизвести запись.', blocked);
      });
    } catch {
      if (generation === this.generation) this.failure('Не удалось воспроизвести запись.');
    }
  }

  private start(selection: StationSelection) {
    const selectedAt = performance.now();
    if (!isSecureAudioUrl(selection.track.audio_url)) {
      this.failure('Укажите корректную HTTPS-ссылку на аудио.', true);
      return;
    }
    this.release();
    this.pendingRecording = null;
    const audio = this.createAudio();
    this.audio = audio;
    const generation = this.generation;
    this.requested = true;
    this.occurrenceId = selection.occurrenceId;
    this.update({ currentTrack: selection.track, progress: 0, duration: 0, isPlaying: false, isLoading: true, error: null });
    const handlers: [string, EventListener][] = [];
    const listen = (event: string, handler: () => void) => {
      const guarded = () => { if (generation === this.generation) handler(); };
      handlers.push([event, guarded]);
      audio.addEventListener(event, guarded);
    };
    listen('loadedmetadata', () => {
      const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
      const offset = (selection.offsetSeconds ?? 0) + (selection.occurrenceId ? (performance.now() - selectedAt) / 1000 : 0);
      if (offset > 0 && duration > 0) {
        try { audio.currentTime = Math.min(offset, Math.max(0, duration - 0.05)); }
        catch { this.failure('Не удалось присоединиться к передаче.'); return; }
      }
      this.update({ duration });
    });
    listen('timeupdate', () => this.update({ progress: audio.currentTime || 0, duration: Number.isFinite(audio.duration) ? audio.duration : 0 }));
    listen('waiting', () => {
      if (this.requested) { this.update({ isLoading: true }); this.armTimeout(generation); }
    });
    listen('playing', () => {
      if (!this.requested) { audio.pause(); return; }
      this.clearTimeout();
      this.update({ isPlaying: true, isLoading: false });
    });
    listen('pause', () => this.update({ isPlaying: false }));
    listen('error', () => { if (this.requested) this.failure('Ошибка аудиоисточника.'); });
    listen('ended', () => {
      if (!this.requested) return;
      if (this.occurrenceId) this.finishedOccurrences.add(this.occurrenceId);
      this.update({ mode: 'station' });
      if (!this.refreshStation) { this.startStation(); return; }
      this.update({ isPlaying: false, isLoading: true });
      this.armTimeout(generation);
      void this.refreshStation().catch(() => undefined).then(() => {
        if (generation === this.generation && this.requested) this.startStation();
      });
    });
    this.cleanup = () => handlers.forEach(([event, handler]) => audio.removeEventListener(event, handler));
    audio.preload = 'metadata';
    audio.src = selection.track.audio_url;
    audio.load();
    this.requestPlay(audio, generation);
  }

  private stationSelection(): StationSelection | null {
    const selected = this.resolveStation();
    if (selected && (!selected.occurrenceId || (!this.failedOccurrences.has(selected.occurrenceId) && !this.finishedOccurrences.has(selected.occurrenceId)))) return selected;
    return this.radio ? { track: this.radio } : null;
  }

  startStation = () => {
    const selection = this.stationSelection();
    if (!selection) {
      this.release();
      this.requested = false;
      this.update({ mode: 'station', isPlaying: false, isLoading: false, error: 'Радиопоток пока не настроен.' });
      return;
    }
    this.update({ mode: 'station' });
    this.start(selection);
  };

  /** Called when the server schedule changes or a local broadcast boundary is crossed. */
  reconcileStation = () => {
    if (!this.requested || this.state.mode !== 'station') return;
    // Programs finish naturally, including when a schedule edit removes them mid-air.
    if (this.state.currentTrack && !this.state.currentTrack.isLive) return;
    const next = this.stationSelection();
    if (next && (next.occurrenceId !== this.occurrenceId || next.track.audio_url !== this.state.currentTrack?.audio_url)) this.start(next);
  };

  playTrack = (track: AudioTrack) => {
    if (this.state.mode === 'manual' && this.state.currentTrack?.id === track.id && this.state.currentTrack.audio_url === track.audio_url) {
      this.togglePlay();
      return;
    }
    this.update({ mode: 'manual' });
    this.start({ track });
  };

  playRecording = (track: AudioTrack, resolve: () => Promise<string>) => {
    if (this.audio && this.state.mode === 'manual' && this.state.currentTrack?.id === track.id) { this.togglePlay(); return; }
    this.release();
    const generation = this.generation;
    this.pendingRecording = { track, resolve };
    this.requested = true;
    this.update({ mode: 'manual', currentTrack: track, isPlaying: false, isLoading: true, error: null, progress: 0, duration: 0 });
    this.armTimeout(generation);
    void resolve().then(url => {
      if (generation !== this.generation || !this.requested) return;
      this.start({ track: { ...track, audio_url: url } });
    }).catch(() => {
      if (generation === this.generation && this.requested) this.failure('Запись сейчас недоступна.');
    });
  };

  playLiveStream = (url: string, title = 'Cosmos FM') => {
    this.setRadio(url, title);
    if (this.state.mode === 'station' && this.requested) this.pauseTrack();
    else this.startStation();
  };

  pauseTrack = () => {
    this.playAttempt++;
    this.requested = false;
    this.clearTimeout();
    this.audio?.pause();
    this.update({ isPlaying: false, isLoading: false });
  };

  togglePlay = () => {
    if (this.requested) { this.pauseTrack(); return; }
    if (this.state.mode === 'station') { this.startStation(); return; }
    if (!this.audio) {
      if (this.pendingRecording) this.playRecording(this.pendingRecording.track, this.pendingRecording.resolve);
      return;
    }
    this.requested = true;
    this.update({ isLoading: true, error: null });
    this.requestPlay(this.audio, this.generation);
  };

  seekTo = (time: number) => {
    if (!this.audio || this.state.mode === 'station' || !Number.isFinite(time)) return;
    const duration = this.state.duration;
    if (duration > 0) {
      try {
        this.audio.currentTime = Math.max(0, Math.min(time, duration));
        this.update({ progress: this.audio.currentTime });
      } catch { this.update({ error: 'Этот источник не поддерживает перемотку.' }); }
    }
  };

  stopTrack = () => {
    this.requested = false;
    this.release();
    this.occurrenceId = undefined;
    this.pendingRecording = null;
    this.update({ ...initialPlayerState });
  };

  dispose = () => { this.stopTrack(); this.listeners.clear(); };
}
