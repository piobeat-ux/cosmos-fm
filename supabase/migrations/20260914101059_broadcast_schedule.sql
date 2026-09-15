create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_path text unique,
  external_url text,
  duration_seconds integer not null check (duration_seconds between 1 and 3600),
  size_bytes bigint not null check (size_bytes between 1 and 50000000),
  created_at timestamptz not null default now(),
  check ((storage_path is null) <> (external_url is null)),
  check (storage_path is null or storage_path ~ '^[a-f0-9-]{36}\.mp3$'),
  check (external_url is null or (external_url ~ '^https://[^/@[:space:]]+([/?#]|$)' and length(external_url) <= 4096))
);
alter table public.media_assets enable row level security;
revoke all on public.media_assets from public, anon, authenticated;
grant select, insert, delete on public.media_assets to authenticated;
create policy admin_manage on public.media_assets for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));

alter table public.shows
  add column asset_id uuid references public.media_assets(id),
  add column published boolean not null default true,
  add column catalog_mode text not null default 'immediate' check (catalog_mode in ('immediate','after_airing')),
  add column catalog_visible_at timestamptz default now();
alter table public.podcasts
  add column asset_id uuid references public.media_assets(id),
  add column published boolean not null default true,
  add column catalog_mode text not null default 'immediate' check (catalog_mode in ('immediate','after_airing')),
  add column catalog_visible_at timestamptz default now();
create index shows_asset_id_idx on public.shows(asset_id);
create index podcasts_asset_id_idx on public.podcasts(asset_id);

create table public.broadcast_schedule (
  id uuid primary key default gen_random_uuid(),
  show_id uuid references public.shows(id) on delete cascade,
  podcast_id uuid references public.podcasts(id) on delete cascade,
  starts_at timestamptz not null,
  duration_seconds integer not null check (duration_seconds between 1 and 3600),
  weekly boolean not null default false,
  repeat_until timestamptz,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  check ((show_id is null) <> (podcast_id is null)),
  check (repeat_until is null or (weekly and repeat_until >= starts_at))
);
create index broadcast_show_id_idx on public.broadcast_schedule(show_id);
create index broadcast_podcast_id_idx on public.broadcast_schedule(podcast_id);
create index broadcast_published_start_idx on public.broadcast_schedule(starts_at) where published;
alter table public.broadcast_schedule enable row level security;
revoke all on public.broadcast_schedule from public, anon, authenticated;
grant select, insert, update, delete on public.broadcast_schedule to authenticated;
create policy admin_manage on public.broadcast_schedule for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));

-- All weekly times are fixed to the station's Europe/Moscow clock (UTC+03:00).
-- Integer week offsets avoid DST/session-timezone dependence and unbounded generation.
create function private.airings(
  first_start timestamptz, seconds integer, repeats boolean, last_start timestamptz,
  window_start timestamptz, window_end timestamptz
) returns table (starts_at timestamptz, ends_at timestamptz)
language sql immutable security invoker set search_path = '' as $$
  select first_start + n * interval '604800 seconds',
    first_start + n * interval '604800 seconds' + seconds * interval '1 second'
  from generate_series(
    case when repeats then greatest(0, floor(extract(epoch from (window_start - first_start)) / 604800)::integer - 1) else 0 end,
    case when repeats then greatest(-1, floor(extract(epoch from (least(window_end, coalesce(last_start, window_end)) - first_start)) / 604800)::integer) else 0 end
  ) n
  where first_start + n * interval '604800 seconds' < window_end
    and first_start + n * interval '604800 seconds' + seconds * interval '1 second' > window_start
    and (last_start is null or first_start + n * interval '604800 seconds' <= last_start);
$$;
revoke all on function private.airings(timestamptz,integer,boolean,timestamptz,timestamptz,timestamptz) from public;

create function private.validate_broadcast()
returns trigger language plpgsql security definer set search_path = '' as $$
declare actual_duration integer; other public.broadcast_schedule; anchor timestamptz; horizon timestamptz;
begin
  perform pg_catalog.pg_advisory_xact_lock(1741230091);
  select a.duration_seconds into actual_duration from public.media_assets a
  where a.id = coalesce(
    (select asset_id from public.shows where id = new.show_id),
    (select asset_id from public.podcasts where id = new.podcast_id)
  );
  if actual_duration is null then raise exception 'Перед назначением эфира проверьте MP3 в карточке записи.'; end if;
  new.duration_seconds := actual_duration;
  if new.published then
    if not coalesce((select published from public.shows where id=new.show_id),(select published from public.podcasts where id=new.podcast_id),false) then
      raise exception 'Сначала опубликуйте саму запись, затем эфир.';
    end if;
    for other in select * from public.broadcast_schedule where published and id <> new.id loop
      anchor := greatest(new.starts_at, other.starts_at);
      -- An overlapping pair either intersects at the later initial start or within one week.
      horizon := anchor + interval '608400 seconds';
      if exists (
        select 1 from private.airings(new.starts_at,new.duration_seconds,new.weekly,new.repeat_until,anchor - interval '3600 seconds',horizon) a
        cross join private.airings(other.starts_at,other.duration_seconds,other.weekly,other.repeat_until,anchor - interval '3600 seconds',horizon) b
        where a.starts_at < b.ends_at and b.starts_at < a.ends_at
      ) then raise exception 'Эфир пересекается с другой опубликованной передачей.'; end if;
    end loop;
  end if;
  return new;
end;
$$;
revoke all on function private.validate_broadcast() from public, anon, authenticated;
create trigger validate_broadcast before insert or update on public.broadcast_schedule
for each row execute function private.validate_broadcast();

create function private.prepare_catalog_record()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and (new.asset_id is distinct from old.asset_id or (old.published and not new.published)) and exists (
    select 1 from public.broadcast_schedule where published and (show_id = new.id or podcast_id = new.id)
  ) then raise exception 'Сначала снимите эфиры этой записи с публикации, затем измените MP3 или статус записи.'; end if;
  if new.catalog_mode = 'immediate' then
    new.catalog_visible_at := coalesce(new.catalog_visible_at, now());
  elsif tg_op = 'INSERT' then
    new.catalog_visible_at := null;
  elsif old.catalog_mode <> 'after_airing' then
    new.catalog_visible_at := null;
  end if;
  return new;
end;
$$;
revoke all on function private.prepare_catalog_record() from public, anon, authenticated;
create trigger prepare_catalog_record before insert or update on public.shows
for each row execute function private.prepare_catalog_record();
create trigger prepare_catalog_record before insert or update on public.podcasts
for each row execute function private.prepare_catalog_record();

create function private.refresh_catalog_release()
returns trigger language plpgsql security definer set search_path = '' as $$
declare target_id uuid; target_kind text; earliest_end timestamptz;
begin
  -- Recalculate both sides if the schedule entry changes its recording.
  for target_kind, target_id in
    select distinct kind, id from (values
      ('shows',case when tg_op <> 'DELETE' then new.show_id end),
      ('podcasts',case when tg_op <> 'DELETE' then new.podcast_id end),
      ('shows',case when tg_op <> 'INSERT' then old.show_id end),
      ('podcasts',case when tg_op <> 'INSERT' then old.podcast_id end)
    ) targets(kind,id) where id is not null
  loop
    select min(starts_at + duration_seconds * interval '1 second') into earliest_end
      from public.broadcast_schedule where published and
      ((target_kind = 'shows' and show_id = target_id) or (target_kind = 'podcasts' and podcast_id = target_id));
    execute format('update public.%I set catalog_visible_at = $1 where id = $2 and catalog_mode = ''after_airing'' and (catalog_visible_at is null or catalog_visible_at > now())', target_kind)
      using earliest_end, target_id;
  end loop;
  return null;
end;
$$;
revoke all on function private.refresh_catalog_release() from public, anon, authenticated;
create trigger refresh_catalog_release after insert or update or delete on public.broadcast_schedule
for each row execute function private.refresh_catalog_release();

drop policy public_read on public.shows;
drop policy public_read on public.podcasts;
create policy public_read on public.shows for select to anon, authenticated
using (published and (catalog_mode = 'immediate' or catalog_visible_at <= now()));
create policy public_read on public.podcasts for select to anon, authenticated
using (published and (catalog_mode = 'immediate' or catalog_visible_at <= now()));

create function private.schedule_window(window_start timestamptz, window_end timestamptz)
returns table (schedule_id uuid, media_id uuid, kind text, title text, starts_at timestamptz, ends_at timestamptz, asset_id uuid)
language plpgsql stable security definer set search_path = '' as $$
begin
  if window_start is null or window_end is null or window_end <= window_start or window_end - window_start > interval '42 days' then
    raise exception 'Запросите период не более 42 дней.';
  end if;
  return query
  select s.id, coalesce(s.show_id,s.podcast_id), case when s.show_id is not null then 'show' else 'podcast' end,
    coalesce(sh.title,p.title), a.starts_at, a.ends_at, coalesce(sh.asset_id,p.asset_id)
  from public.broadcast_schedule s
  left join public.shows sh on sh.id = s.show_id
  left join public.podcasts p on p.id = s.podcast_id
  cross join lateral private.airings(s.starts_at,s.duration_seconds,s.weekly,s.repeat_until,window_start,window_end) a
  where s.published and coalesce(sh.published,p.published,false)
  order by a.starts_at;
end;
$$;
revoke all on function private.schedule_window(timestamptz,timestamptz) from public;
-- The internal window function is not directly callable by browser roles.

create function public.get_schedule(window_start timestamptz, window_end timestamptz)
returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'schedule_id',schedule_id,'media_id',media_id,'kind',kind,'title',title,'starts_at',starts_at,'ends_at',ends_at
  )), '[]'::jsonb) from private.schedule_window(window_start,window_end);
$$;
revoke all on function public.get_schedule(timestamptz,timestamptz) from public;
grant execute on function public.get_schedule(timestamptz,timestamptz) to anon, authenticated;

create function private.asset_is_available(target_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.is_admin()
    or exists(select 1 from public.shows where asset_id = target_id and published and (catalog_mode = 'immediate' or catalog_visible_at <= now()))
    or exists(select 1 from public.podcasts where asset_id = target_id and published and (catalog_mode = 'immediate' or catalog_visible_at <= now()))
    or exists(select 1 from private.schedule_window(now() - interval '1 second',now() + interval '1 second') a
      where a.asset_id = target_id and a.starts_at <= now() and a.ends_at > now());
$$;
revoke all on function private.asset_is_available(uuid) from public;
grant execute on function private.asset_is_available(uuid) to anon, authenticated;

create function private.storage_audio_available(object_name text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.media_assets a where a.storage_path = object_name and private.asset_is_available(a.id));
$$;
revoke all on function private.storage_audio_available(text) from public;
grant execute on function private.storage_audio_available(text) to anon, authenticated;
create policy available_broadcast_audio on storage.objects for select to anon, authenticated
using (bucket_id = 'broadcasts' and private.storage_audio_available(name));

create function public.resolve_audio(target_id uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare result jsonb;
begin
  if not private.asset_is_available(target_id) then return null; end if;
  select jsonb_build_object('id',id,'storage_path',storage_path,'external_url',external_url,'duration_seconds',duration_seconds)
    into result from public.media_assets where id = target_id;
  return result;
end;
$$;
revoke all on function public.resolve_audio(uuid) from public;
grant execute on function public.resolve_audio(uuid) to anon, authenticated;

create function public.get_station()
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('server_now',now(),'next_start',(
    select min(starts_at) from private.schedule_window(now(),now()+interval '7 days') where starts_at > now()
  ),'airing',(
    select jsonb_build_object('schedule_id',schedule_id,'media_id',media_id,'kind',kind,'title',title,
      'starts_at',starts_at,'ends_at',ends_at,'asset_id',asset_id)
    from private.schedule_window(now() - interval '1 second',now() + interval '1 second')
    where starts_at <= now() and ends_at > now() order by starts_at limit 1
  ));
$$;
revoke all on function public.get_station() from public;
grant execute on function public.get_station() to anon, authenticated;

-- Save the recording and its optional first airing in one transaction.
create function public.save_media_record(record_kind text, record_id uuid, record_data jsonb, first_airing jsonb default null)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare target_table text; saved_id uuid;
begin
  if not private.is_admin() then raise exception 'Доступ запрещён.'; end if;
  if record_kind not in ('show','podcast') then raise exception 'Неизвестный тип записи.'; end if;
  if record_data->>'title' is null or length(trim(record_data->>'title')) not between 1 and 300 then raise exception 'Укажите название до 300 символов.'; end if;
  target_table := case record_kind when 'show' then 'shows' else 'podcasts' end;
  if record_id is null then
    execute format('insert into public.%I (title,description,host_name,category,cover_url,audio_url,duration,asset_id,published,catalog_mode)
      values ($1->>''title'',$1->>''description'',$1->>''host_name'',$1->>''category'',$1->>''cover_url'',$1->>''audio_url'',$1->>''duration'',nullif($1->>''asset_id'','''')::uuid,coalesce(($1->>''published'')::boolean,false),coalesce($1->>''catalog_mode'',''immediate'')) returning id', target_table)
      into saved_id using record_data;
  else
    execute format('update public.%I set title=$1->>''title'',description=$1->>''description'',host_name=$1->>''host_name'',category=$1->>''category'',cover_url=$1->>''cover_url'',audio_url=$1->>''audio_url'',duration=$1->>''duration'',asset_id=nullif($1->>''asset_id'','''')::uuid,published=coalesce(($1->>''published'')::boolean,false),catalog_mode=coalesce($1->>''catalog_mode'',''immediate'') where id=$2 returning id', target_table)
      into saved_id using record_data,record_id;
  end if;
  if saved_id is null then raise exception 'Запись уже удалена или недоступна.'; end if;
  if first_airing is not null then
    insert into public.broadcast_schedule(show_id,podcast_id,starts_at,duration_seconds,weekly,repeat_until,published)
    values (case when record_kind='show' then saved_id end,case when record_kind='podcast' then saved_id end,
      (first_airing->>'starts_at')::timestamptz,1,coalesce((first_airing->>'weekly')::boolean,false),
      nullif(first_airing->>'repeat_until','')::timestamptz,coalesce((first_airing->>'published')::boolean,false));
  end if;
  return saved_id;
end;
$$;
revoke all on function public.save_media_record(text,uuid,jsonb,jsonb) from public, anon;
grant execute on function public.save_media_record(text,uuid,jsonb,jsonb) to authenticated;
