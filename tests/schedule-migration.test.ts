import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('broadcast schedule, publication and protected audio', async t => {
  const db = new PGlite();
  t.after(() => db.close());
  for (const path of ['./fixtures/legacy-schema.sql', '../supabase/migrations/20260914100720_secure_admin_and_storage.sql', '../supabase/migrations/20260914101059_broadcast_schedule.sql']) {
    await db.exec(await readFile(new URL(path, import.meta.url), 'utf8'));
  }
  const asset = (await db.query<{ id: string }>("insert into public.media_assets(storage_path,duration_seconds,size_bytes) values ('00000000-0000-4000-8000-000000000010.mp3',600,2000000) returning id")).rows[0].id;
  const show = (await db.query<{ id: string }>("insert into public.shows(title,asset_id,catalog_mode) values ('Scheduled show',$1,'after_airing') returning id", [asset])).rows[0].id;
  await db.query("insert into storage.objects(bucket_id,name) values ('broadcasts','00000000-0000-4000-8000-000000000010.mp3')");
  const asAnon = async (sql: string, params: unknown[] = []) => {
    await db.exec('begin; set local role anon');
    try { return await db.query(sql, params); }
    finally { await db.exec('rollback'); }
  };

  await t.test('unscheduled after-airing record and asset stay private', async () => {
    assert.equal((await asAnon('select * from public.shows where id=$1', [show])).rows.length, 0);
    assert.equal((await asAnon('select public.resolve_audio($1) as audio', [asset])).rows[0].audio, null);
  });

  const entry = (await db.query<{ id: string }>("insert into public.broadcast_schedule(show_id,starts_at,duration_seconds,weekly,published) values ($1,now()+interval '1 day',1,true,false) returning id", [show])).rows[0].id;
  await t.test('server derives schedule length from the validated asset', async () => {
    assert.equal((await db.query('select duration_seconds from public.broadcast_schedule where id=$1', [entry])).rows[0].duration_seconds, 600);
  });
  await t.test('draft schedules do not appear on the public calendar', async () => {
    assert.deepEqual((await asAnon("select public.get_schedule(now(),now()+interval '14 days') as schedule")).rows[0].schedule, []);
  });
  await db.query('update public.broadcast_schedule set published=true where id=$1', [entry]);
  await t.test('published schedules prevent unpublishing or replacing their recording', async () => {
    await assert.rejects(db.query('update public.shows set published=false where id=$1', [show]), /эфир/i);
    await assert.rejects(db.query('update public.shows set asset_id=null where id=$1', [show]), /эфир/i);
  });
  await t.test('a draft recording cannot be published in the schedule', async () => {
    const draft = (await db.query<{ id: string }>("insert into public.podcasts(title,asset_id,published) values ('Draft',$1,false) returning id", [asset])).rows[0].id;
    await assert.rejects(db.query("insert into public.broadcast_schedule(podcast_id,starts_at,duration_seconds,published) values ($1,now()+interval '3 days',600,true)", [draft]), /опублик/i);
  });
  const adminId = '00000000-0000-4000-8000-000000000001';
  await db.query('insert into private.admin_users(user_id) values ($1)', [adminId]);
  const asAdmin = async (sql: string, params: unknown[]) => {
    await db.exec('begin');
    try {
      await db.query("select set_config('request.jwt.claim.sub',$1,true)", [adminId]);
      await db.exec('set local role authenticated');
      return await db.query(sql, params);
    } finally { await db.exec('rollback'); }
  };
  await t.test('atomic media save creates both recording and initial airing', async () => {
    const start = new Date(Date.now() + 3 * 86400000).toISOString();
    const result = await asAdmin(`with saved as (
      select public.save_media_record('podcast',null,$1::jsonb,$2::jsonb) as id
    ) select id from saved`, [JSON.stringify({ title: 'Atomic podcast', asset_id: asset, published: true, catalog_mode: 'after_airing' }), JSON.stringify({ starts_at: start, published: true, weekly: false })]);
    assert.equal(result.rows.length, 1);
    assert.match(String(result.rows[0].id), /^[a-f0-9-]{36}$/);
  });
  await t.test('a conflicting initial airing rolls back the newly saved recording', async () => {
    const start = (await db.query<{ starts_at: string }>('select starts_at from public.broadcast_schedule where id=$1', [entry])).rows[0].starts_at;
    await assert.rejects(asAdmin("select public.save_media_record('podcast',null,$1::jsonb,$2::jsonb)", [JSON.stringify({ title: 'Must be rolled back', asset_id: asset, published: true, catalog_mode: 'after_airing' }), JSON.stringify({ starts_at: start, published: true })]), /пересекается/);
    assert.equal((await db.query("select id from public.podcasts where title='Must be rolled back'")).rows.length, 0);
  });
  await t.test('anonymous clients cannot invoke the media-write RPC', async () => {
    await assert.rejects(asAnon("select public.save_media_record('show',null,'{}'::jsonb,null)"), /permission denied/);
  });
  await t.test('published weekly calendar has occurrences but no audio URL or asset ID', async () => {
    const result = (await asAnon("select public.get_schedule(now(),now()+interval '14 days') as schedule")).rows[0].schedule as Record<string, unknown>[];
    assert.equal(result.length, 2);
    assert.equal(result[0].title, 'Scheduled show');
    assert.equal('asset_id' in result[0], false);
    assert.equal('audio_url' in result[0], false);
    assert.equal((await asAnon('select * from public.shows where id=$1', [show])).rows.length, 0);
    assert.equal((await asAnon('select public.resolve_audio($1) as audio', [asset])).rows[0].audio, null);
  });

  await t.test('weekly overlaps in a later month are rejected', async () => {
    await assert.rejects(db.query("insert into public.broadcast_schedule(show_id,starts_at,duration_seconds,published) select $1,starts_at+interval '35 days 5 minutes',600,true from public.broadcast_schedule where id=$2", [show, entry]), /пересекается/);
  });
  await t.test('adjacent programs do not conflict', async () => {
    await db.exec('begin');
    try {
      await db.query("insert into public.broadcast_schedule(show_id,starts_at,duration_seconds,published) select $1,starts_at+interval '10 minutes',600,true from public.broadcast_schedule where id=$2", [show, entry]);
    } finally { await db.exec('rollback'); }
  });
  await t.test('repeat end prevents phantom future conflicts', async () => {
    await db.exec('begin');
    try {
      await db.query('update public.broadcast_schedule set repeat_until=starts_at where id=$1', [entry]);
      await db.query("insert into public.broadcast_schedule(show_id,starts_at,duration_seconds,published) select $1,starts_at+interval '35 days 5 minutes',600,true from public.broadcast_schedule where id=$2", [show, entry]);
    } finally { await db.exec('rollback'); }
  });

  await t.test('airing audio becomes accessible while catalog remains hidden', async () => {
    await db.query("update public.broadcast_schedule set starts_at=now()-interval '5 minutes' where id=$1", [entry]);
    const station = (await asAnon('select public.get_station() as station')).rows[0].station as { airing: { media_id: string } };
    assert.equal(station.airing.media_id, show);
    assert.notEqual((await asAnon('select public.resolve_audio($1) as audio', [asset])).rows[0].audio, null);
    assert.equal((await asAnon("select * from storage.objects where bucket_id='broadcasts'")).rows.length, 1);
    assert.equal((await asAnon('select * from public.shows where id=$1', [show])).rows.length, 0);
  });
  await t.test('after the first completed airing the catalog is released', async () => {
    await db.query("update public.broadcast_schedule set starts_at=now()-interval '20 minutes' where id=$1", [entry]);
    assert.equal((await asAnon('select * from public.shows where id=$1', [show])).rows.length, 1);
    await db.query('delete from public.broadcast_schedule where id=$1', [entry]);
    assert.equal((await asAnon('select * from public.shows where id=$1', [show])).rows.length, 1);
  });
  await t.test('anonymous requests cannot expand an unbounded calendar', async () => {
    await assert.rejects(asAnon("select public.get_schedule(now(),now()+interval '100 years')"), /42/);
  });
});
