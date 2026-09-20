import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inspectMp3, inspectMp3File, validateAudioSize, MAX_AUDIO_BYTES } from '../src/lib/audio-validation.ts';

// Synthetic MPEG-1 Layer III frames, 32 kbit/s, 44.1 kHz, mono, no padding.
// The metadata parser reads real frame headers; no decoder or storage is mocked.
function mp3(seconds: number) {
  const count = Math.ceil(seconds * 44100 / 1152);
  const bytes = new Uint8Array(count * 104);
  for (let offset = 0; offset < bytes.length; offset += 104) bytes.set([0xff, 0xfb, 0x10, 0xc0], offset);
  return bytes;
}

test('audio byte limit is decimal 50 MB with an inclusive boundary', () => {
  assert.doesNotThrow(() => validateAudioSize(MAX_AUDIO_BYTES));
  assert.doesNotThrow(() => validateAudioSize(1));
  for (const size of [0, -1, MAX_AUDIO_BYTES + 1, NaN, Infinity, 1.5]) assert.throws(() => validateAudioSize(size), /50 МБ/);
});

test('valid MP3 contents produce a measured duration and byte size', async () => {
  const bytes = mp3(5);
  const result = await inspectMp3(new Blob([bytes], { type: 'audio/mpeg' }));
  assert.ok(result.duration_seconds >= 5 && result.duration_seconds <= 6);
  assert.equal(result.size_bytes, bytes.length);
});

test('an MP3 longer than one hour is rejected even when smaller than 50 MB', async () => {
  const bytes = mp3(3605);
  assert.ok(bytes.length < MAX_AUDIO_BYTES);
  await assert.rejects(inspectMp3(new Blob([bytes], { type: 'audio/mpeg' })), /60 минут/);
});

test('an MP3 just under one hour remains valid', async () => {
  const result = await inspectMp3(new Blob([mp3(3599)], { type: 'audio/mpeg' }));
  assert.ok(result.duration_seconds >= 3599 && result.duration_seconds <= 3600);
});

test('a WAV recording with an MP3 extension is rejected', async () => {
  const bytes = new Uint8Array(8044);
  const view = new DataView(bytes.buffer);
  const write = (offset: number, value: string) => bytes.set(new TextEncoder().encode(value), offset);
  write(0, 'RIFF'); view.setUint32(4, bytes.length - 8, true); write(8, 'WAVE'); write(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, 8000, true); view.setUint32(28, 8000, true); view.setUint16(32, 1, true); view.setUint16(34, 8, true);
  write(36, 'data'); view.setUint32(40, 8000, true);
  await assert.rejects(inspectMp3File(new File([bytes], 'disguised.mp3', { type: 'audio/wav' })), /формат файла/);
});

test('renaming text to MP3 does not pass content validation', async () => {
  await assert.rejects(inspectMp3File(new File(['not an audio file'], 'renamed.mp3', { type: 'audio/mpeg' })), /формат файла/);
});

test('empty audio is rejected before parsing', async () => {
  await assert.rejects(inspectMp3(new Blob([])), /50 МБ/);
});

test('file extension validation accepts uppercase MP3 and rejects other names', async () => {
  const bytes = mp3(1);
  await assert.doesNotReject(inspectMp3File(new File([bytes], 'EPISODE.MP3', { type: 'application/octet-stream' })));
  await assert.rejects(inspectMp3File(new File([bytes], 'episode.wav')), /формате MP3/);
});
