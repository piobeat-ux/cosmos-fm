import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const db = new PGlite();
const ready = (async () => {
  for (const file of ['tests/fixtures/legacy-schema.sql', 'supabase/migrations/20260914100720_secure_admin_and_storage.sql', 'supabase/migrations/20260914101059_broadcast_schedule.sql']) await db.exec(await readFile(resolve(root, file), 'utf8'));
  await db.exec(`insert into private.admin_users values ('00000000-0000-4000-8000-000000000001');
    insert into public.media_assets(id,storage_path,duration_seconds,size_bytes) values ('00000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000010.mp3',600,2000000);
    update public.shows set title='Тестовая передача',asset_id='00000000-0000-4000-8000-000000000010';
    update public.podcasts set title='Тестовый подкаст',asset_id='00000000-0000-4000-8000-000000000010';
    select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',false);
    set role authenticated;`);
})();

const identifier = (value: string) => { if (!/^[a-z_]+$/.test(value)) throw new Error('Invalid fixture identifier'); return `"${value}"`; };
const tables = new Set(['shows', 'podcasts', 'categories', 'broadcast_schedule', 'media_assets']);

export default defineConfig({
  root,
  plugins: [react(), {
    name: 'isolated-fixture', enforce: 'pre',
    resolveId(source, importer) {
      if (source === '@/lib/supabase' || source === './supabase' && importer?.endsWith('/src/lib/media.ts')) return resolve(root, 'tests/ui/client.ts');
      if (source === '@/context/DataContext') return resolve(root, 'tests/ui/data.tsx');
    },
    configureServer(server) {
      server.httpServer?.once('close', () => { void db.close(); });
      server.middlewares.use('/__fixture', async (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        if (req.method !== 'POST' || req.headers['content-type'] !== 'application/json') { res.statusCode = 405; res.end('{}'); return; }
        try {
          await ready;
          let body = '';
          for await (const chunk of req) { body += chunk; if (body.length > 50_000) throw new Error('Fixture request too large'); }
          const payload = JSON.parse(body);
          let result;
          if (payload.rpc) {
            if (payload.rpc !== 'save_media_record') throw new Error('Unsupported fixture RPC');
            const p = payload.args;
            result = await db.query('select public.save_media_record($1,$2,$3::jsonb,$4::jsonb) as id', [p.record_kind, p.record_id, JSON.stringify(p.record_data), p.first_airing ? JSON.stringify(p.first_airing) : null]);
            res.end(JSON.stringify({ data: result.rows[0].id, error: null })); return;
          }
          if (!tables.has(payload.table)) throw new Error('Unsupported fixture table');
          const table = `public.${identifier(payload.table)}`;
          const columns = payload.columns === '*' ? '*' : payload.columns.split(',').map(identifier).join(',');
          const params: unknown[] = [];
          const param = (value: unknown) => { params.push(value); return `$${params.length}`; };
          const where = () => payload.filter ? ` where ${identifier(payload.filter.column)}=${param(payload.filter.value)}` : '';
          let sql;
          if (payload.action === 'select') {
            sql = `select ${columns} from ${table}${where()}`;
            if (payload.order) sql += ` order by ${identifier(payload.order)}`;
            if (payload.range) sql += ` limit ${param(payload.range[1] - payload.range[0] + 1)} offset ${param(payload.range[0])}`;
          } else if (payload.action === 'insert') {
            const keys = Object.keys(payload.value);
            sql = `insert into ${table} (${keys.map(identifier).join(',')}) values (${keys.map(key => param(payload.value[key])).join(',')}) returning ${columns}`;
          } else if (payload.action === 'update') {
            sql = `update ${table} set ${Object.keys(payload.value).map(key => `${identifier(key)}=${param(payload.value[key])}`).join(',')}${where()} returning ${columns}`;
          } else if (payload.action === 'delete') sql = `delete from ${table}${where()} returning ${columns}`;
          else throw new Error('Unsupported fixture action');
          result = await db.query(sql, params);
          res.end(JSON.stringify({ data: payload.single ? result.rows[0] : result.rows, error: null }));
        } catch (error) { res.end(JSON.stringify({ data: null, error: { message: error instanceof Error ? error.message : String(error) } })); }
      });
    },
  }],
  resolve: { alias: [
    { find: '@/context/DataContext', replacement: resolve(root, 'tests/ui/data.tsx') },
    { find: '@/lib/supabase', replacement: resolve(root, 'tests/ui/client.ts') },
    { find: '@', replacement: resolve(root, 'src') },
  ] },
  cacheDir: 'node_modules/.vite-fixture',
  server: { host: '127.0.0.1', port: 5174, strictPort: true },
});
