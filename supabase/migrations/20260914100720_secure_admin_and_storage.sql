-- Incremental migration. Existing content and storage objects are preserved.
-- Provision the verified administrator separately using a trusted deployment session.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create table private.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table private.admin_users enable row level security;
revoke all on private.admin_users from public, anon, authenticated;

create function private.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select auth.uid() is not null and exists (
    select 1 from private.admin_users where user_id = (select auth.uid())
  );
$$;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated;

create function public.is_admin()
returns boolean language sql stable security invoker set search_path = ''
as $$ select private.is_admin(); $$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Legacy profile roles are informational, not authorization. No first-user promotion.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user') on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;

create or replace function public.update_updated_at_column()
returns trigger language plpgsql security invoker set search_path = ''
as $$ begin new.updated_at = pg_catalog.now(); return new; end; $$;
revoke all on function public.update_updated_at_column() from public, anon, authenticated;

-- Replace policies on only the application's known tables, removing permissive ORs.
do $$
declare entry record; table_name text;
begin
  for entry in select schemaname, tablename, policyname from pg_policies
    where schemaname = 'public' and tablename = any(array[
      'shows','hosts','podcasts','categories','hotels','navigation_links','site_settings','profiles','tracks','likes'
    ])
  loop
    execute format('drop policy %I on %I.%I', entry.policyname, entry.schemaname, entry.tablename);
  end loop;
  foreach table_name in array array[
    'shows','hosts','podcasts','categories','hotels','navigation_links','site_settings','profiles','tracks','likes'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on public.%I from public, anon, authenticated', table_name);
    execute format('grant select on public.%I to anon, authenticated', table_name);
    execute format('grant insert, update, delete on public.%I to authenticated', table_name);
    execute format('create policy admin_manage on public.%I for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()))', table_name);
  end loop;
  foreach table_name in array array['shows','hosts','podcasts','categories','hotels','site_settings','tracks'] loop
    execute format('create policy public_read on public.%I for select to anon, authenticated using (true)', table_name);
  end loop;
end;
$$;

create policy public_read_active on public.navigation_links for select to anon, authenticated
using (is_active is true);
create policy own_profile on public.profiles for select to authenticated
using (id = (select auth.uid()));
create policy own_likes on public.likes for select to authenticated
using (user_id = (select auth.uid()));
create policy add_own_like on public.likes for insert to authenticated
with check (user_id = (select auth.uid()) and exists (select 1 from public.podcasts p where p.id = podcast_id));
create policy remove_own_like on public.likes for delete to authenticated
using (user_id = (select auth.uid()));
create index if not exists likes_user_id_idx on public.likes(user_id);

-- Remove exactly the policies observed in the production audit.
do $$
declare policy_name text;
begin
  foreach policy_name in array array[
    'Admin can delete media', 'Allow all operations',
    'Public Access 1jgvrq_0','Public Access 1jgvrq_1','Public Access 1jgvrq_2','Public Access 1jgvrq_3',
    'Public Access 1ps738_0','Public Access 1ps738_1','Public Access 1ps738_2','Public Access 1ps738_3',
    'Public Access Audio','Public Access Media','Public Read Audio','Public Read Media','Users can update own media'
  ] loop
    execute format('drop policy if exists %I on storage.objects', policy_name);
  end loop;
end;
$$;

create policy cosmos_public_legacy_media on storage.objects for select to anon, authenticated
using (bucket_id in ('audio', 'media'));
create policy cosmos_admin_media on storage.objects for all to authenticated
using (bucket_id in ('audio', 'media', 'broadcasts') and (select private.is_admin()))
with check (bucket_id in ('audio', 'media', 'broadcasts') and (select private.is_admin()));

update storage.buckets set file_size_limit = 50000000, allowed_mime_types = array['audio/mpeg'] where id = 'audio';
update storage.buckets set file_size_limit = 10000000,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif'] where id = 'media';
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('broadcasts', 'broadcasts', false, 50000000, array['audio/mpeg']);

-- API roles must never truncate or bypass row-level checks through table grants.
revoke truncate, references, trigger on storage.objects from anon, authenticated;
