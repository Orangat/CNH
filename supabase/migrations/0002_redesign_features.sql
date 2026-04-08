-- Adds tables for the redesign: sermons, ministries, prayer_requests.
-- Run after 0001_init.sql.

-- =============================================================================
-- sermons
-- =============================================================================
create table if not exists sermons (
  id uuid primary key default gen_random_uuid(),
  title_en text not null,
  title_uk text not null,
  speaker text not null default '',
  series text not null default '',
  scripture text not null default '',
  description_en text not null default '',
  description_uk text not null default '',
  youtube_id text not null,           -- e.g. "dQw4w9WgXcQ"
  preached_at date,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sermons_preached_idx on sermons (preached_at desc);

drop trigger if exists sermons_set_updated_at on sermons;
create trigger sermons_set_updated_at before update on sermons
  for each row execute function set_updated_at();

alter table sermons enable row level security;

drop policy if exists "public read sermons" on sermons;
create policy "public read sermons" on sermons for select using (true);

drop policy if exists "admin write sermons" on sermons;
create policy "admin write sermons" on sermons for all
  using (is_admin()) with check (is_admin());

-- =============================================================================
-- ministries
-- =============================================================================
create table if not exists ministries (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_en text not null,
  name_uk text not null,
  description_en text not null default '',
  description_uk text not null default '',
  contact_email text not null default '',
  meeting_info_en text not null default '',
  meeting_info_uk text not null default '',
  icon text not null default 'users',  -- icon name from our inline set
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ministries_sort_idx on ministries (sort_order, id);

drop trigger if exists ministries_set_updated_at on ministries;
create trigger ministries_set_updated_at before update on ministries
  for each row execute function set_updated_at();

alter table ministries enable row level security;

drop policy if exists "public read ministries" on ministries;
create policy "public read ministries" on ministries for select using (true);

drop policy if exists "admin write ministries" on ministries;
create policy "admin write ministries" on ministries for all
  using (is_admin()) with check (is_admin());

-- =============================================================================
-- prayer_requests
-- =============================================================================
create table if not exists prayer_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  email text not null default '',
  request text not null,
  share_with_team boolean not null default true,
  status text not null default 'new' check (status in ('new', 'praying', 'answered', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists prayer_requests_status_idx on prayer_requests (status, created_at desc);

drop trigger if exists prayer_requests_set_updated_at on prayer_requests;
create trigger prayer_requests_set_updated_at before update on prayer_requests
  for each row execute function set_updated_at();

alter table prayer_requests enable row level security;

-- Public can ONLY insert; reading/editing is admin-only.
-- This is the only table where RLS allows anon writes.
drop policy if exists "public insert prayer_requests" on prayer_requests;
create policy "public insert prayer_requests" on prayer_requests for insert
  with check (true);

drop policy if exists "admin read prayer_requests" on prayer_requests;
create policy "admin read prayer_requests" on prayer_requests for select
  using (is_admin());

drop policy if exists "admin update prayer_requests" on prayer_requests;
create policy "admin update prayer_requests" on prayer_requests for update
  using (is_admin()) with check (is_admin());

drop policy if exists "admin delete prayer_requests" on prayer_requests;
create policy "admin delete prayer_requests" on prayer_requests for delete
  using (is_admin());
