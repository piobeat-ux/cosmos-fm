import { test, type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { AudioController, isSecureAudioUrl } from '../src/lib/audio-controller.ts';
import type { AudioTrack, StationSelection } from '../src/lib/audio-controller.ts';

class FakeAudio extends EventTarget {
  src = '';
  preload = '';
  currentTime = 0;
  duration = 600;
  paused = true;
  loadCount = 0;
  playResult: () => Promise<void> = () => Promise.resolve();
  play() { this.paused = false; return this.playResult(); }
  pause() { this.paused = true; this.dispatchEvent(new Event('pause')); }
  load() { this.loadCount++; this.currentTime = 0; }
  removeAttribute(name: string) { if (name === 'src') this.src = ''; }
  emit(name: string) { this.dispatchEvent(new Event(name)); }
}

const recording: AudioTrack = { id: 'episode', title: 'Episode', audio_url: 'https://example.com/episode.mp3' };
const radio = 'https://example.com/live';
const flush = () => new Promise<void>(resolve => setImmediate(resolve));

function setup(t: TestContext) {
  const elements: FakeAudio[] = [];
  const controller = new AudioController(() => {
    const audio = new FakeAudio();
    elements.push(audio);
    return audio as unknown as HTMLAudioElement;
  });
  controller.setRadio(radio);
  t.after(() => controller.dispose());
  return { controller, elements };
}

test('initialization and schedule reconciliation never autoplay', t => {
  const { controller, elements } = setup(t);
  controller.setStationResolver(() => ({ track: recording, occurrenceId: 'airing' }));
  controller.reconcileStation();
  assert.equal(elements.length, 0);
});

test('manual pause/resume preserves position without reloading', async t => {
  const { controller, elements } = setup(t);
  controller.playTrack(recording);
  await flush();
  elements[0].currentTime = 90;
  controller.pauseTrack();
  controller.togglePlay();
  await flush();
  assert.equal(elements.length, 1);
  assert.equal(elements[0].currentTime, 90);
  assert.equal(elements[0].loadCount, 1);
  assert.equal(controller.getSnapshot().isPlaying, true);
});

test('rejection from a previous source cannot alter the current source', async t => {
  const { controller, elements } = setup(t);
  controller.playTrack(recording);
  let reject!: (error: Error) => void;
  controller.pauseTrack();
  elements[0].playResult = () => new Promise((_, rejectPromise) => { reject = rejectPromise; });
  controller.togglePlay();
  controller.playTrack({ ...recording, id: 'other', audio_url: 'https://example.com/other.mp3' });
  reject(new Error('late rejection'));
  await flush();
  assert.equal(controller.getSnapshot().currentTrack?.id, 'other');
  assert.equal(controller.getSnapshot().isPlaying, true);
  assert.equal(controller.getSnapshot().error, null);
});

test('rejection from a paused attempt cannot poison a resumed attempt', async t => {
  const { controller, elements } = setup(t);
  controller.playTrack(recording);
  controller.pauseTrack();
  let reject!: (error: Error) => void;
  elements[0].playResult = () => new Promise((_, rejectPromise) => { reject = rejectPromise; });
  controller.togglePlay();
  controller.pauseTrack();
  elements[0].playResult = () => Promise.resolve();
  controller.togglePlay();
  reject(new Error('old attempt'));
  await flush();
  assert.equal(controller.getSnapshot().error, null);
  assert.equal(elements.length, 1);
});

test('station joins at an offset and lets programs finish despite schedule edits', async t => {
  const { controller, elements } = setup(t);
  let current: StationSelection | null = { track: recording, occurrenceId: 'first', offsetSeconds: 123 };
  controller.setStationResolver(() => current);
  controller.startStation();
  elements[0].emit('loadedmetadata');
  assert.ok(Math.abs(elements[0].currentTime - 123) < 0.1);
  current = null;
  controller.reconcileStation();
  assert.equal(elements.length, 1);
  elements[0].emit('ended');
  await flush();
  assert.equal(controller.getSnapshot().currentTrack?.audio_url, radio);
});

test('back-to-back airings switch directly without a radio gap', t => {
  const { controller, elements } = setup(t);
  let current: StationSelection = { track: recording, occurrenceId: 'first' };
  controller.setStationResolver(() => current);
  controller.startStation();
  current = { track: { ...recording, id: 'second' }, occurrenceId: 'second' };
  elements[0].emit('ended');
  assert.equal(elements.length, 2);
  assert.equal(controller.getSnapshot().currentTrack?.id, 'second');
});

test('manual playback is uninterrupted and returns to the current station', t => {
  const { controller, elements } = setup(t);
  controller.playTrack(recording);
  controller.setStationResolver(() => ({ track: { ...recording, id: 'scheduled' }, occurrenceId: 'now', offsetSeconds: 20 }));
  controller.reconcileStation();
  assert.equal(elements.length, 1);
  elements[0].emit('ended');
  assert.equal(controller.getSnapshot().currentTrack?.id, 'scheduled');
  assert.equal(controller.getSnapshot().mode, 'station');
});

test('failed program falls back once without retries on every tick', t => {
  const { controller, elements } = setup(t);
  controller.setStationResolver(() => ({ track: recording, occurrenceId: 'bad' }));
  controller.startStation();
  elements[0].emit('error');
  controller.reconcileStation();
  controller.reconcileStation();
  assert.equal(elements.length, 2);
  assert.equal(controller.getSnapshot().currentTrack?.audio_url, radio);
  elements[1].emit('error');
  assert.equal(elements.length, 2);
  assert.equal(controller.getSnapshot().isLoading, false);
});

test('stop releases media and ignores late events', async t => {
  const { controller, elements } = setup(t);
  controller.playTrack(recording);
  controller.stopTrack();
  elements[0].emit('playing');
  await flush();
  assert.equal(elements[0].src, '');
  assert.equal(elements[0].paused, true);
  assert.equal(controller.getSnapshot().currentTrack, null);
  assert.equal(controller.getSnapshot().isPlaying, false);
});

test('rejects executable schemes, cleartext and embedded credentials', () => {
  for (const value of ['javascript:alert(1)', 'http://example.com/a.mp3', 'https://user:password@example.com/a.mp3', '/audio.mp3', '']) {
    assert.equal(isSecureAudioUrl(value), false);
  }
  assert.equal(isSecureAudioUrl(radio), true);
});

test('stop cancels delayed signed URL resolution', async t => {
  const { controller, elements } = setup(t);
  let resolve!: (url: string) => void;
  controller.playRecording(recording, () => new Promise(done => { resolve = done; }));
  controller.stopTrack();
  resolve(recording.audio_url);
  await flush();
  assert.equal(elements.length, 0);
  assert.equal(controller.getSnapshot().currentTrack, null);
});

test('a newer recording wins over a slower earlier URL resolution', async t => {
  const { controller, elements } = setup(t);
  let resolve!: (url: string) => void;
  controller.playRecording(recording, () => new Promise(done => { resolve = done; }));
  controller.playRecording({ ...recording, id: 'new' }, () => Promise.resolve('https://example.com/new.mp3'));
  await flush();
  resolve(recording.audio_url);
  await flush();
  assert.equal(elements.length, 1);
  assert.equal(controller.getSnapshot().currentTrack?.id, 'new');
});

test('completion refreshes station before choosing the next source', async t => {
  const { controller, elements } = setup(t);
  let current: StationSelection | null = null;
  let finishRefresh!: () => void;
  controller.setStationResolver(() => current);
  controller.setStationRefresh(() => new Promise(done => { finishRefresh = done; }));
  controller.playTrack(recording);
  elements[0].emit('ended');
  assert.equal(elements.length, 1);
  current = { track: { ...recording, id: 'next' }, occurrenceId: 'next-airing' };
  finishRefresh();
  await flush();
  assert.equal(elements.length, 2);
  assert.equal(controller.getSnapshot().currentTrack?.id, 'next');
});

test('stop during station refresh cannot restart playback', async t => {
  const { controller, elements } = setup(t);
  let finishRefresh!: () => void;
  controller.setStationRefresh(() => new Promise(done => { finishRefresh = done; }));
  controller.playTrack(recording);
  elements[0].emit('ended');
  controller.stopTrack();
  finishRefresh();
  await flush();
  assert.equal(elements.length, 1);
  assert.equal(controller.getSnapshot().isPlaying, false);
});

test('a stalled signed URL request falls back to radio after the deadline', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const { controller, elements } = setup(t);
  controller.playRecording(recording, () => new Promise(() => undefined));
  t.mock.timers.tick(20_001);
  await flush();
  assert.equal(elements.length, 1);
  assert.equal(controller.getSnapshot().currentTrack?.audio_url, radio);
  assert.equal(controller.getSnapshot().isPlaying, true);
});

test('a stalled station refresh after completion cannot leave the player stuck', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const { controller, elements } = setup(t);
  controller.setStationRefresh(() => new Promise(() => undefined));
  controller.playTrack(recording);
  await flush();
  elements[0].emit('ended');
  t.mock.timers.tick(20_001);
  await flush();
  assert.equal(elements.length, 2);
  assert.equal(controller.getSnapshot().currentTrack?.audio_url, radio);
  assert.equal(controller.getSnapshot().isPlaying, true);
});
