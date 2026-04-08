-- Church of New Hope — initial schema
-- Run this in Supabase SQL editor (or via the Supabase CLI) once after creating the project.

-- =============================================================================
-- Helpers
-- =============================================================================

create extension if not exists "pgcrypto";

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =============================================================================
-- admin_users (mirrors auth.users for role-based access)
-- =============================================================================

create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'admin' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

create or replace function is_admin()
returns boolean language sql stable as $$
  select exists (
    select 1 from admin_users where id = auth.uid()
  );
$$;

-- =============================================================================
-- leaders
-- =============================================================================

create table if not exists leaders (
  id uuid primary key default gen_random_uuid(),
  sort_order int not null default 0,
  name_en text not null,
  name_uk text not null,
  title_en text not null,
  title_uk text not null,
  emails text[] not null default '{}',
  photo_path text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leaders_sort_idx on leaders (sort_order, id);

drop trigger if exists leaders_set_updated_at on leaders;
create trigger leaders_set_updated_at
  before update on leaders
  for each row execute function set_updated_at();

-- =============================================================================
-- site_texts (key/value bilingual store; replaces translation JSON files)
-- =============================================================================

create table if not exists site_texts (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  "group" text not null,
  value_en text not null default '',
  value_uk text not null default '',
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site_texts_group_idx on site_texts ("group");

drop trigger if exists site_texts_set_updated_at on site_texts;
create trigger site_texts_set_updated_at
  before update on site_texts
  for each row execute function set_updated_at();

-- =============================================================================
-- contact_info (singleton)
-- =============================================================================

create table if not exists contact_info (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null default true unique,
  address text not null default '',
  phone text not null default '',
  email text not null default '',
  service_time_english text not null default '',
  service_time_ukrainian text not null default '',
  map_url text not null default '',
  facebook_url text not null default '',
  instagram_url text not null default '',
  youtube_url text not null default '',
  updated_at timestamptz not null default now()
);

drop trigger if exists contact_info_set_updated_at on contact_info;
create trigger contact_info_set_updated_at
  before update on contact_info
  for each row execute function set_updated_at();

-- Insert the singleton row if it doesn't exist
insert into contact_info (singleton)
select true
where not exists (select 1 from contact_info);

-- =============================================================================
-- Row Level Security
-- =============================================================================

alter table leaders enable row level security;
alter table site_texts enable row level security;
alter table contact_info enable row level security;
alter table admin_users enable row level security;

-- Public read for content tables
drop policy if exists "public read leaders" on leaders;
create policy "public read leaders" on leaders for select using (true);

drop policy if exists "public read site_texts" on site_texts;
create policy "public read site_texts" on site_texts for select using (true);

drop policy if exists "public read contact_info" on contact_info;
create policy "public read contact_info" on contact_info for select using (true);

-- Admin-only writes
drop policy if exists "admin write leaders" on leaders;
create policy "admin write leaders" on leaders for all
  using (is_admin()) with check (is_admin());

drop policy if exists "admin write site_texts" on site_texts;
create policy "admin write site_texts" on site_texts for all
  using (is_admin()) with check (is_admin());

drop policy if exists "admin write contact_info" on contact_info;
create policy "admin write contact_info" on contact_info for all
  using (is_admin()) with check (is_admin());

-- admin_users: only admins see / modify
drop policy if exists "admin read admin_users" on admin_users;
create policy "admin read admin_users" on admin_users for select using (is_admin());

drop policy if exists "admin write admin_users" on admin_users;
create policy "admin write admin_users" on admin_users for all
  using (is_admin()) with check (is_admin());

-- =============================================================================
-- Storage bucket for leader photos
-- =============================================================================
-- Run separately if your project doesn't allow storage statements in the SQL editor:
--   in Supabase Dashboard → Storage → New bucket → name "leader-photos", public
-- Then add policies:

insert into storage.buckets (id, name, public)
values ('leader-photos', 'leader-photos', true)
on conflict (id) do nothing;

drop policy if exists "public read leader photos" on storage.objects;
create policy "public read leader photos" on storage.objects
  for select using (bucket_id = 'leader-photos');

drop policy if exists "admin upload leader photos" on storage.objects;
create policy "admin upload leader photos" on storage.objects
  for insert with check (bucket_id = 'leader-photos' and is_admin());

drop policy if exists "admin update leader photos" on storage.objects;
create policy "admin update leader photos" on storage.objects
  for update using (bucket_id = 'leader-photos' and is_admin());

drop policy if exists "admin delete leader photos" on storage.objects;
create policy "admin delete leader photos" on storage.objects
  for delete using (bucket_id = 'leader-photos' and is_admin());
