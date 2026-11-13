-- Apply in Supabase SQL Editor before using authenticated profile APIs.
create extension if not exists pgcrypto;

create table birth_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  preferred_name text not null,
  birth_date date not null,
  birth_time time,
  time_known boolean not null,
  timezone_id text not null,
  fold smallint check (fold in (0, 1)),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  place_label text not null,
  western_houses text not null default 'placidus',
  ayanamsa text not null default 'lahiri',
  node_mode text not null default 'true',
  created_at timestamptz not null default now(),
  check ((time_known and birth_time is not null) or (not time_known and birth_time is null))
);

create table chart_snapshots (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references birth_profiles(id) on delete cascade,
  system text not null check (system in ('western', 'vedic')),
  calculation_version text not null,
  calculated_at timestamptz not null default now(),
  calculation_config jsonb not null,
  calculation_metadata jsonb not null,
  chart_facts jsonb not null
);

create index chart_snapshots_profile_idx on chart_snapshots(profile_id, calculated_at desc);
alter table birth_profiles enable row level security;
alter table chart_snapshots enable row level security;
create policy own_birth_profiles on birth_profiles for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_chart_snapshots on chart_snapshots for all to authenticated using (exists (select 1 from birth_profiles p where p.id = profile_id and p.user_id = auth.uid())) with check (exists (select 1 from birth_profiles p where p.id = profile_id and p.user_id = auth.uid()));
grant select, insert, update, delete on birth_profiles to authenticated;
grant select, insert, update, delete on chart_snapshots to authenticated;
