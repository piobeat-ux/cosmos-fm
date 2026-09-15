import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const adminId = '00000000-0000-4000-8000-000000000001';
const listenerId = '00000000-0000-4000-8000-000000000002';

test('incremental security migration preserves content and enforces access', async t => {
  const db = new PGlite();
  t.after(() => db.close());
  await db.exec(await readFile(new URL('./fixtures/legacy-schema.sql', import.meta.url), 'utf8'));
  await db.exec(await readFile(new URL('../supabase/migrations/20260914100720_secure_admin_and_storage.sql', import.meta.url), 'utf8'));
  await db.query('insert into private.admin_users(user_id) values ($1)', [adminId]);

  const asRole = async (role: 'anon' | 'authenticated', userId: string, sql: string) => {
    await db.exec('begin');
    try {
      await db.query("select set_config('request.jwt.claim.sub', $1, true)", [userId]);
      await db.exec(`set local role ${role}`);
      return await db.query(sql);
    } finally { await db.exec('rollback'); }
  };

  await t.test('content and storage objects survive migration', async () => {
    assert.equal((await db.query('select * from public.shows')).rows.length, 1);
    assert.equal((await db.query('select * from public.podcasts')).rows.length, 1);
    assert.equal((await db.query('select * from public.site_settings')).rows.length, 1);
    assert.equal((await db.query('select * from storage.objects')).rows.length, 2);
  });

  await t.test('anonymous clients can read public content but cannot write or truncate', async () => {
    assert.equal((await asRole('anon', '', 'select * from public.shows')).rows.length, 1);
    await assert.rejects(asRole('anon', '', "insert into public.shows(title) values ('attack')"));
    await assert.rejects(asRole('anon', '', 'truncate public.shows'));
    await assert.rejects(asRole('anon', '', "insert into storage.objects(bucket_id,name) values ('media','attack.svg')"));
    await assert.rejects(asRole('anon', '', 'select * from private.admin_users'));
  });

  await t.test('legacy profile role does not confer administrator access', async () => {
    const result = await asRole('authenticated', listenerId, 'select public.is_admin() as allowed');
    assert.equal(result.rows[0].allowed, false);
    await assert.rejects(asRole('authenticated', listenerId, "insert into public.shows(title) values ('attack')"));
    assert.equal((await asRole('authenticated', listenerId, 'select * from public.profiles')).rows.length, 1);
    assert.equal((await asRole('authenticated', listenerId, "update public.profiles set role='admin' returning id")).rows.length, 0);
  });

  await t.test('verified administrator can manage content without recursive policies', async () => {
    assert.equal((await asRole('authenticated', adminId, 'select public.is_admin() as allowed')).rows[0].allowed, true);
    assert.equal((await asRole('authenticated', adminId, 'select * from public.profiles')).rows.length, 2);
    assert.equal((await asRole('authenticated', adminId, "insert into public.shows(title) values ('New show') returning id")).rows.length, 1);
    assert.equal((await asRole('authenticated', adminId, "insert into storage.objects(bucket_id,name) values ('broadcasts','draft.mp3') returning id")).rows.length, 1);
    await assert.rejects(asRole('authenticated', adminId, 'truncate public.shows'));
  });

  await t.test('anonymous clients cannot discover private audio uploads or profiles', async () => {
    await db.exec("insert into storage.objects(bucket_id,name) values ('broadcasts','draft.mp3')");
    assert.equal((await asRole('anon', '', 'select * from storage.objects')).rows.length, 2);
    assert.equal((await asRole('anon', '', 'select * from public.profiles')).rows.length, 0);
  });

  await t.test('new signups are never automatically promoted', async () => {
    await db.exec('create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user()');
    await db.exec("insert into auth.users values ('00000000-0000-4000-8000-000000000003','new@example.invalid')");
    assert.equal((await db.query("select role from public.profiles where email='new@example.invalid'")).rows[0].role, 'user');
  });
});
