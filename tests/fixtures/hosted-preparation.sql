-- Test project only. Bring the restored seven-table legacy installation to the
-- audited production schema before testing the application migrations.
-- No production data, credentials or Auth/Storage implementation tables are copied.
create table public.tracks (id uuid primary key default gen_random_uuid(), title text not null, artist text, audio_url text not null, cover_url text, genre text, created_at timestamptz default now());
create table public.likes (id uuid primary key default gen_random_uuid(), podcast_id uuid, user_id uuid references auth.users(id) on delete cascade, created_at timestamptz default now(), unique(podcast_id,user_id));
create table public.profiles (id uuid primary key references auth.users(id) on delete cascade, email text, role text default 'user', created_at timestamptz default now());
alter table public.site_settings add column updated_at timestamptz default now();
alter table public.tracks enable row level security;
alter table public.likes enable row level security;
alter table public.profiles enable row level security;
grant select, insert, update, delete on public.tracks,public.likes,public.profiles to authenticated;
grant select on public.tracks,public.likes,public.profiles to anon;

-- The restored project's legacy Storage policy names differ from production.
drop policy if exists "Public read" on storage.objects;
drop policy if exists "Public upload" on storage.objects;
drop policy if exists "Public update" on storage.objects;
drop policy if exists "Public delete" on storage.objects;
insert into storage.buckets(id,name,public) values ('audio','audio',true);

-- Match the production Auth trigger, already using the safe non-admin default.
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id,email,role) values (new.id,new.email,'user');
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
