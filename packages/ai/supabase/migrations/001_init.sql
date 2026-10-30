-- StackSense: run in the Supabase SQL editor as the project administrator.
begin;

create table if not exists public.cases (
  id text primary key,
  building_id text not null,
  state jsonb not null,
  created_at timestamptz not null default now()
);
create table if not exists public.observations (
  case_id text not null references public.cases(id) on delete cascade,
  id text not null,
  event_key text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  primary key (case_id, id)
);
create table if not exists public.photos (
  photo_id uuid primary key default gen_random_uuid(),
  case_id text not null references public.cases(id) on delete cascade,
  flat_id text not null,
  check_id text not null,
  zone text not null,
  path text not null unique,
  created_at timestamptz not null default now()
);
create index if not exists photos_same_spot on public.photos(case_id, flat_id, zone, created_at desc);
create table if not exists public.ai_cache (
  cache_key text primary key check (length(cache_key) = 64),
  result jsonb not null,
  updated_at timestamptz not null default now()
);
create table if not exists public.memory (
  building_id text primary key,
  counts jsonb not null default '{"upper_wet_area":0,"upper_supply":0,"shared_shaft":0,"facade_window":0,"roof_terrace":0,"condensation":0,"other":0}'::jsonb,
  event_keys text[] not null default '{}',
  updated_at timestamptz not null default now()
);
create table if not exists public.links (
  token_hash text primary key check (length(token_hash) = 64),
  case_id text not null references public.cases(id) on delete cascade,
  check_id text not null,
  flat_id text not null,
  lang text not null check (lang in ('en','hi','mr')),
  check_type text not null check (check_type in ('duct_photo','trap_grout_photo','meter_check','ceiling_photo','dye_test','flood_test','rain_recheck','moisture_reading','inspect')),
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists links_expiry on public.links(expires_at);

alter table public.cases enable row level security;
alter table public.observations enable row level security;
alter table public.photos enable row level security;
alter table public.ai_cache enable row level security;
alter table public.memory enable row level security;
alter table public.links enable row level security;
-- No anon/authenticated policies: access goes through server routes using service_role.
revoke all on public.cases, public.observations, public.photos, public.ai_cache, public.memory, public.links from public, anon, authenticated;
grant all on public.cases, public.observations, public.photos, public.ai_cache, public.memory, public.links to service_role;

create or replace function public.record_memory(p_building_id text, p_family text, p_event_key text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare row_data public.memory%rowtype;
begin
  if p_building_id is null or length(p_building_id) not between 1 and 100
     or p_event_key is null or length(p_event_key) not between 1 and 200
     or p_family is null or p_family not in ('upper_wet_area','upper_supply','shared_shaft','facade_window','roof_terrace','condensation','other') then
    raise exception 'Invalid memory event';
  end if;
  insert into public.memory(building_id) values (p_building_id) on conflict do nothing;
  select * into row_data from public.memory where building_id = p_building_id for update;
  if not (p_event_key = any(row_data.event_keys)) then
    if cardinality(row_data.event_keys) >= 10000 then raise exception 'Memory event capacity reached'; end if;
    update public.memory set
      counts = counts || jsonb_build_object(p_family, coalesce((counts->>p_family)::integer,0) + 1),
      event_keys = array_append(event_keys,p_event_key), updated_at = now()
      where building_id = p_building_id returning * into row_data;
  end if;
  return row_data.counts;
end;
$$;
revoke all on function public.record_memory(text,text,text) from public, anon, authenticated;
grant execute on function public.record_memory(text,text,text) to service_role;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('photos','photos',false,4194304,array['image/jpeg'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
-- This restrictive rule also blocks broad pre-existing browser policies for this bucket.
drop policy if exists stacksense_photos_server_only on storage.objects;
create policy stacksense_photos_server_only on storage.objects as restrictive
  for all to anon, authenticated using (bucket_id <> 'photos') with check (bucket_id <> 'photos');

commit;
