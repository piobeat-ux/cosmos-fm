import { useEffect } from 'react';
import { useAudio } from './AudioContext';
import { useData } from './DataContext';
import { supabase } from '@/lib/supabase';
import { resolveAudio } from '@/lib/media';
import type { Airing } from '@/lib/schedule';
import type { StationSelection } from '@/lib/audio-controller';

/** Keeps the station clock fresh without starting playback on page load. */
export function StationBridge() {
  const { controller } = useAudio();
  const { settings, refresh } = useData();
  useEffect(() => {
    controller.setRadio(settings.stream_url || '', settings.site_title || 'Cosmos FM');
    controller.reconcileStation();
  }, [controller, settings.stream_url, settings.site_title]);

  useEffect(() => {
    let disposed = false;
    let flight: Promise<void> | null = null;
    let timer: ReturnType<typeof setTimeout>;
    let current: (StationSelection & { starts: number; ends: number }) | null = null;
    let serverAtSample = Date.now();
    let monotonicAtSample = performance.now();
    let lastAiring: string | null = null;
    const serverNow = () => serverAtSample + performance.now() - monotonicAtSample;
    controller.setStationResolver(() => {
      const now = serverNow();
      return current && now >= current.starts && now < current.ends
        ? { track: current.track, occurrenceId: current.occurrenceId, offsetSeconds: (now - current.starts) / 1000 }
        : null;
    });

    const request = async () => {
      clearTimeout(timer);
      let nextDelay = 10_000;
      try {
        const sent = performance.now();
        const { data, error } = await supabase.rpc('get_station');
        const received = performance.now();
        if (disposed) return;
        if (error || !data) throw new Error('station unavailable');
        const result = data as { server_now: string; next_start: string | null; airing: Airing | null };
        const clock = Date.parse(result.server_now);
        if (!Number.isFinite(clock)) throw new Error('invalid station clock');
        serverAtSample = clock + (received - sent) / 2;
        monotonicAtSample = received;
        const airing = result.airing;
        const identity = airing ? `${airing.schedule_id}:${airing.starts_at}` : null;
        if (airing?.asset_id) {
          if (current?.occurrenceId !== identity) {
            const url = await resolveAudio(airing.asset_id);
            if (disposed) return;
            current = { occurrenceId: identity!, starts: Date.parse(airing.starts_at), ends: Date.parse(airing.ends_at), track: { id: airing.media_id, title: airing.title, audio_url: url, type: airing.kind, isLive: false } };
          }
          nextDelay = Math.min(nextDelay, Math.max(100, Date.parse(airing.ends_at) - serverNow() + 50));
        } else current = null;
        if (result.next_start) nextDelay = Math.min(nextDelay, Math.max(100, Date.parse(result.next_start) - serverNow() + 50));
        controller.reconcileStation();
        if (identity !== lastAiring) { lastAiring = identity; void refresh(); }
      } catch {
        // A playing recording finishes; stale cached airings expire against server time.
        controller.reconcileStation();
      } finally {
        if (!disposed) timer = setTimeout(() => void poll(), nextDelay);
      }
    };
    const poll = (): Promise<void> => {
      if (disposed) return Promise.resolve();
      if (flight) return flight;
      flight = request().finally(() => { flight = null; });
      return flight;
    };
    controller.setStationRefresh(poll);
    const wake = () => { if (document.visibilityState === 'visible') void poll(); };
    document.addEventListener('visibilitychange', wake);
    window.addEventListener('online', wake);
    void poll();
    return () => {
      disposed = true; clearTimeout(timer);
      document.removeEventListener('visibilitychange', wake);
      window.removeEventListener('online', wake);
      controller.setStationResolver(() => null);
      controller.setStationRefresh(null);
    };
  }, [controller, refresh]);
  return null;
}
