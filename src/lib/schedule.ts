export interface BroadcastSchedule {
  id: string;
  show_id: string | null;
  podcast_id: string | null;
  starts_at: string;
  duration_seconds: number;
  weekly: boolean;
  repeat_until: string | null;
  published: boolean;
}
export interface Airing {
  schedule_id: string;
  media_id: string;
  kind: 'show' | 'podcast';
  title: string;
  starts_at: string;
  ends_at: string;
  asset_id?: string;
}
const WEEK_MS = 604_800_000;

export function expandSchedule(entry: BroadcastSchedule, start: Date, end: Date) {
  const first = Date.parse(entry.starts_at);
  const until = entry.repeat_until ? Date.parse(entry.repeat_until) : Infinity;
  const duration = entry.duration_seconds * 1000;
  const events: { id: string; scheduleId: string; start: Date; end: Date; offset: number }[] = [];
  if (!Number.isFinite(first) || !Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end.getTime() - start.getTime() > 42 * 86400000) return events;
  const firstIndex = entry.weekly ? Math.max(0, Math.floor((start.getTime() - first) / WEEK_MS) - 1) : 0;
  for (let n = firstIndex; ; n++) {
    const occurrenceStart = first + n * WEEK_MS;
    if (occurrenceStart >= end.getTime() || occurrenceStart > until || (!entry.weekly && n > 0)) break;
    if (occurrenceStart + duration > start.getTime()) events.push({ id: `${entry.id}:${n}`, scheduleId: entry.id, start: new Date(occurrenceStart), end: new Date(occurrenceStart + duration), offset: n * WEEK_MS });
  }
  return events;
}

/** datetime-local fields represent station time, independent of the editor's timezone. */
export function stationInput(iso: string): string {
  return new Date(Date.parse(iso) + 3 * 3600000).toISOString().slice(0, 16);
}
export function stationIso(input: string): string {
  const parsed = new Date(`${input}:00+03:00`);
  if (!Number.isFinite(parsed.getTime())) throw new Error('Укажите корректную дату и время.');
  return parsed.toISOString();
}
