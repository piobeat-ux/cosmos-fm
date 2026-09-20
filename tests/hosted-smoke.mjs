// Explicit opt-in integration check for the separately authorized test project.
// Never part of CI: it creates test accounts' media and schedule entries remotely.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { Upload } from 'tus-js-client';
import { parseBuffer } from 'music-metadata';

const config = JSON.parse(await readFile(new URL('../.release-local/hosted-test.json', import.meta.url), 'utf8'));
assert.equal(config.url, 'https://tbgcugeufzlepmixoyoi.supabase.co', 'This script must never target production');
const makeClient = () => createClient(config.url, config.key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(20000) }) } });
const admin = makeClient(), listener = makeClient(), anon = makeClient();
const tag = `hosted-check-${randomUUID().slice(0, 8)}`;
const check = (label) => console.log(`PASS ${label}`);
const ok = (response) => { assert.equal(response.error, null, response.error?.message); return response.data; };
const denied = (response) => assert.ok(response.error, 'Expected authorization rejection');
const ids = { tag, assets: [], shows: [], schedules: [], paths: [] };

for (const [client, email] of [[admin, config.adminEmail], [listener, config.listenerEmail]]) {
  ok(await client.auth.signInWithPassword({ email, password: config.password }));
}
assert.equal(ok(await admin.rpc('is_admin')), true);
assert.equal(ok(await listener.rpc('is_admin')), false);
assert.equal(ok(await anon.rpc('is_admin')), false);
check('real Auth sessions distinguish administrator, listener and visitor');

ok(await listener.auth.updateUser({ data: { role: 'admin', is_admin: true } }));
assert.equal(ok(await listener.rpc('is_admin')), false);
assert.equal(ok(await listener.from('profiles').update({ role: 'admin' }).eq('email', config.listenerEmail).select()).length, 0);
assert.equal(ok(await listener.from('profiles').select('role').single()).role, 'user');
assert.equal(ok(await listener.from('profiles').select('email')).length, 1);
assert.equal(ok(await anon.from('profiles').select('id')).length, 0);
denied(await anon.rpc('save_media_record', { record_kind: 'show', record_id: null, record_data: { title: tag } }));
check('metadata/profile edits cannot promote a listener; private profiles are filtered');

// Valid silent MPEG-1 Layer III frames exercise metadata and actual TUS transport.
// This is not a listening-quality or mobile audio decoding test.
function mp3(frames) {
  const bytes = Buffer.alloc(frames * 104);
  for (let i = 0; i < frames; i++) bytes.set([0xff, 0xfb, 0x10, 0xc0], i * 104);
  return bytes;
}
async function upload(bytes) {
  const path = `${randomUUID()}.mp3`;
  const { session } = ok(await admin.auth.getSession());
  await new Promise((resolve, reject) => {
    const task = new Upload(bytes, {
      endpoint: `${config.url}/storage/v1/upload/resumable`, chunkSize: 6 * 1024 * 1024,
      uploadDataDuringCreation: true, storeFingerprintForResuming: false, retryDelays: null,
      metadata: { bucketName: 'broadcasts', objectName: path, contentType: 'audio/mpeg', cacheControl: '3600' },
      headers: { authorization: `Bearer ${session.access_token}`, 'x-upsert': 'false' },
      onSuccess: resolve, onError: reject,
    });
    task.start();
  });
  ids.paths.push(path);
  return path;
}
const shortAudio = mp3(120);
const metadata = await parseBuffer(shortAudio, { mimeType: 'audio/mpeg' }, { duration: true });
assert.equal(metadata.format.codec, 'MPEG 1 Layer 3');
const duration = Math.ceil(metadata.format.duration);
const path = await upload(shortAudio);
await upload(mp3(Math.ceil(7 * 1024 * 1024 / 104)));
check('real private Storage TUS upload succeeds, including a file larger than one 6 MiB chunk');
denied(await listener.storage.from('broadcasts').upload(`${randomUUID()}.mp3`, shortAudio, { contentType: 'audio/mpeg' }));
denied(await anon.storage.from('broadcasts').upload(`${randomUUID()}.mp3`, shortAudio, { contentType: 'audio/mpeg' }));
denied(await admin.storage.from('broadcasts').upload(`${randomUUID()}.txt`, 'not audio', { contentType: 'text/plain' }));
check('non-admin uploads and wrong MIME types are rejected by hosted Storage');

const asset = ok(await admin.from('media_assets').insert({ storage_path: path, duration_seconds: duration, size_bytes: shortAudio.length }).select().single());
ids.assets.push(asset.id);
denied(await anon.from('media_assets').select());
assert.equal(ok(await listener.from('media_assets').select()).length, 0);
assert.equal(ok(await anon.rpc('resolve_audio', { target_id: asset.id })), null);
denied(await anon.storage.from('broadcasts').createSignedUrl(path, 60));
check('unpublished asset metadata and signed audio are inaccessible to visitors');

const now = new Date(ok(await anon.rpc('get_station')).server_now).getTime();
const recordData = { title: tag, asset_id: asset.id, published: true, catalog_mode: 'after_airing', duration: `${duration} сек` };
const showId = ok(await admin.rpc('save_media_record', { record_kind: 'show', record_id: null, record_data: recordData, first_airing: { starts_at: new Date(now + 60000).toISOString(), published: true, weekly: true } }));
ids.shows.push(showId);
let scheduled = ok(await admin.from('broadcast_schedule').select().eq('show_id', showId).single());
ids.schedules.push(scheduled.id);
assert.equal(scheduled.duration_seconds, duration);
assert.equal(ok(await anon.from('shows').select().eq('id', showId)).length, 0);
const window = { window_start: new Date(now).toISOString(), window_end: new Date(now + 8 * 86400000).toISOString() };
assert.equal(ok(await anon.rpc('get_schedule', window)).filter(x => x.media_id === showId).length, 2);
assert.equal(ok(await anon.rpc('resolve_audio', { target_id: asset.id })), null);
check('scheduled recording is hidden before airing; the public calendar expands weekly repeats');

const beforeConflict = ok(await admin.from('shows').select('id').eq('title', `${tag}-conflict`));
denied(await admin.rpc('save_media_record', { record_kind: 'show', record_id: null, record_data: { ...recordData, title: `${tag}-conflict` }, first_airing: { starts_at: scheduled.starts_at, published: true } }));
assert.equal(ok(await admin.from('shows').select('id').eq('title', `${tag}-conflict`)).length, beforeConflict.length);
check('conflicting first airing rolls back the entire recording save');

const currentTime = new Date(ok(await anon.rpc('get_station')).server_now).getTime();
// A longer duration allows separate real HTTP calls to observe the current airing.
// Create a second fixture asset pointing at the independently uploaded large MP3.
const longPath = ids.paths[1];
const longBytes = mp3(Math.ceil(7 * 1024 * 1024 / 104));
const longMeta = await parseBuffer(longBytes, { mimeType: 'audio/mpeg' }, { duration: true });
const longDuration = Math.ceil(longMeta.format.duration);
const longAsset = ok(await admin.from('media_assets').insert({ storage_path: longPath, duration_seconds: longDuration, size_bytes: longBytes.length }).select().single());
ids.assets.push(longAsset.id);
const liveShow = ok(await admin.rpc('save_media_record', { record_kind: 'show', record_id: null, record_data: { ...recordData, title: `${tag}-live`, asset_id: longAsset.id } }));
ids.shows.push(liveShow);
// Move the original fixture out of this airing's interval.
ok(await admin.from('broadcast_schedule').update({ starts_at: new Date(currentTime + 2 * 86400000).toISOString() }).eq('id', scheduled.id));
const liveSchedule = ok(await admin.from('broadcast_schedule').insert({ show_id: liveShow, starts_at: new Date(currentTime - 30000).toISOString(), duration_seconds: 1, published: true }).select().single());
ids.schedules.push(liveSchedule.id);
assert.equal(ok(await anon.rpc('get_station')).airing.asset_id, longAsset.id);
assert.equal(ok(await anon.from('shows').select().eq('id', liveShow)).length, 0);
assert.equal(ok(await anon.rpc('resolve_audio', { target_id: longAsset.id })).storage_path, longPath);
const signed = ok(await anon.storage.from('broadcasts').createSignedUrl(longPath, 60));
const download = await fetch(signed.signedUrl, { headers: { Range: 'bytes=0-103' }, signal: AbortSignal.timeout(20000) });
assert.ok(download.ok); await download.body.cancel();
check('current airing exposes playable signed audio but stays hidden from the catalog');

ok(await admin.from('broadcast_schedule').update({ starts_at: new Date(currentTime - (longDuration + 60) * 1000).toISOString() }).eq('id', liveSchedule.id));
assert.equal(ok(await anon.from('shows').select().eq('id', liveShow)).length, 1);
assert.equal(ok(await anon.rpc('get_station')).airing, null);
assert.ok(ok(await anon.rpc('resolve_audio', { target_id: longAsset.id })));
check('recording enters the catalog after airing and station returns to radio mode');

const concurrentStart = new Date(currentTime + 4 * 86400000).toISOString();
const concurrent = await Promise.all([1, 2].map(() => admin.from('broadcast_schedule').insert({ show_id: showId, starts_at: concurrentStart, duration_seconds: 1, published: true }).select()));
assert.equal(concurrent.filter(x => !x.error).length, 1);
assert.equal(concurrent.filter(x => x.error).length, 1);
ids.schedules.push(...concurrent.filter(x => !x.error).flatMap(x => x.data.map(row => row.id)));
check('two concurrent hosted writes cannot publish overlapping broadcasts');
console.log(JSON.stringify({ result: 'passed', ...ids }));
await Promise.all([admin.auth.signOut(), listener.auth.signOut()]);
