-- Minimal disposable model of the audited schema. Contains no production content.
create role anon;
create role authenticated;
-- Match production's direct default grants, not just inherited PUBLIC execute.
alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant execute on functions to anon, authenticated;
create schema auth;
create schema storage;
grant usage on schema public, auth, storage to anon, authenticated;
create table auth.users(id uuid primary key, email text);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
create table public.profiles(id uuid primary key references auth.users(id), email text, role text default 'user');
create table public.shows(id uuid primary key default gen_random_uuid(), title text not null, audio_url text, duration text);
create table public.podcasts(id uuid primary key default gen_random_uuid(), title text not null, audio_url text, duration text);
alter table public.shows add column description text, add column host_name text, add column category text, add column cover_url text;
alter table public.podcasts add column description text, add column host_name text, add column category text, add column cover_url text;
create table public.hosts(id uuid primary key default gen_random_uuid(), name text);
create table public.categories(id uuid primary key default gen_random_uuid(), name text);
create table public.hotels(id uuid primary key default gen_random_uuid(), name text);
create table public.navigation_links(id uuid primary key default gen_random_uuid(), label text, url text, is_active boolean default true);
create table public.site_settings(key text primary key, value text, updated_at timestamptz default now());
create table public.tracks(id uuid primary key default gen_random_uuid(), title text, audio_url text);
create table public.likes(id uuid primary key default gen_random_uuid(), podcast_id uuid, user_id uuid references auth.users(id), unique(podcast_id,user_id));
create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(), bucket_id text references storage.buckets(id), name text);
alter table storage.objects enable row level security;
grant all on all tables in schema public, storage to anon, authenticated;
create policy "Allow all operations" on storage.objects for all using (bucket_id = 'media') with check (bucket_id = 'media');
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (id = auth.uid());
create policy "Admin can view all profiles" on public.profiles for select using (exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'));
insert into auth.users values
  ('00000000-0000-4000-8000-000000000001', 'admin@example.invalid'),
  ('00000000-0000-4000-8000-000000000002', 'listener@example.invalid');
insert into public.profiles select id,email,'admin' from auth.users;
insert into public.shows (title) values ('Existing show');
insert into public.podcasts (title) values ('Existing podcast');
insert into public.site_settings values ('site_title','Existing station',now());
insert into storage.buckets values ('audio','audio',true,null,null),('media','media',true,null,null);
insert into storage.objects (bucket_id,name) values ('audio','existing.mp3'),('media','existing.png');
