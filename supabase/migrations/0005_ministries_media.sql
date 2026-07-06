-- Ministries feature (Tier B): photos, gallery, flagship detail pages, CTA.
-- Run AFTER 0001–0004. Idempotent: safe to re-run.

-- =============================================================================
-- 1. New columns on ministries
-- =============================================================================
alter table ministries add column if not exists photo_path text;
alter table ministries add column if not exists gallery text[] not null default '{}';
alter table ministries add column if not exists audience_en text not null default '';
alter table ministries add column if not exists audience_uk text not null default '';
alter table ministries add column if not exists language text not null default 'bilingual';
alter table ministries drop constraint if exists ministries_language_check;
alter table ministries add constraint ministries_language_check check (language in ('en', 'uk', 'bilingual'));
alter table ministries add column if not exists long_description_en text not null default '';
alter table ministries add column if not exists long_description_uk text not null default '';
alter table ministries add column if not exists leader_name text not null default '';
alter table ministries add column if not exists leader_role_en text not null default '';
alter table ministries add column if not exists leader_role_uk text not null default '';
alter table ministries add column if not exists location_en text not null default '';
alter table ministries add column if not exists location_uk text not null default '';
alter table ministries add column if not exists cta_url text not null default '';
alter table ministries add column if not exists cta_label_en text not null default '';
alter table ministries add column if not exists cta_label_uk text not null default '';
alter table ministries add column if not exists is_featured boolean not null default false;

-- =============================================================================
-- 2. Storage bucket for ministry photos (mirrors leader-photos, editors write)
--    If your project blocks storage statements in the SQL editor, create the
--    bucket in Dashboard → Storage → New bucket → "ministry-photos", public,
--    then run just the policies below.
-- =============================================================================
insert into storage.buckets (id, name, public)
values ('ministry-photos', 'ministry-photos', true)
on conflict (id) do nothing;

drop policy if exists "public read ministry photos" on storage.objects;
create policy "public read ministry photos" on storage.objects
  for select using (bucket_id = 'ministry-photos');

drop policy if exists "editors upload ministry photos" on storage.objects;
create policy "editors upload ministry photos" on storage.objects
  for insert with check (bucket_id = 'ministry-photos' and can_edit_content());

drop policy if exists "editors update ministry photos" on storage.objects;
create policy "editors update ministry photos" on storage.objects
  for update using (bucket_id = 'ministry-photos' and can_edit_content());

drop policy if exists "editors delete ministry photos" on storage.objects;
create policy "editors delete ministry photos" on storage.objects
  for delete using (bucket_id = 'ministry-photos' and can_edit_content());

-- =============================================================================
-- 3. Show what changed
-- =============================================================================
select column_name, data_type, column_default
from information_schema.columns
where table_name = 'ministries'
order by ordinal_position;
