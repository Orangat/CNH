-- RBAC: expand roles from 2 to 4, add helper functions, rewrite RLS policies
-- Run AFTER 0001_init.sql and 0002_redesign_features.sql

-- =============================================================================
-- 1. Expand admin_users.role to 4 roles
-- =============================================================================

alter table admin_users drop constraint if exists admin_users_role_check;
alter table admin_users add constraint admin_users_role_check
  check (role in ('admin','pastor','editor','prayer_team'));

-- =============================================================================
-- 2. Helper functions (all SECURITY DEFINER to avoid RLS recursion)
-- =============================================================================

create or replace function current_role() returns text
  language sql stable security definer
  as $$ select role from admin_users where id = auth.uid() $$;

create or replace function has_role(required text) returns bool
  language sql stable security definer
  as $$ select current_role() = required $$;

create or replace function can_edit_content() returns bool
  language sql stable security definer
  as $$ select current_role() in ('admin','pastor','editor') $$;

create or replace function can_read_all_prayers() returns bool
  language sql stable security definer
  as $$ select current_role() in ('admin','pastor') $$;

-- =============================================================================
-- 3. admin_users SELECT — allow self-read (critical for useMe() hook)
-- =============================================================================

drop policy if exists "admin read admin_users" on admin_users;
create policy "self or admin read admin_users" on admin_users for select
  using (id = auth.uid() or has_role('admin'));

drop policy if exists "admin write admin_users" on admin_users;
create policy "admin write admin_users" on admin_users for all
  using (has_role('admin')) with check (has_role('admin'));

-- =============================================================================
-- 4. Content tables — use can_edit_content() instead of is_admin()
-- =============================================================================

-- leaders
drop policy if exists "admin write leaders" on leaders;
create policy "editors write leaders" on leaders for all
  using (can_edit_content()) with check (can_edit_content());

-- site_texts
drop policy if exists "admin write site_texts" on site_texts;
create policy "editors write site_texts" on site_texts for all
  using (can_edit_content()) with check (can_edit_content());

-- contact_info
drop policy if exists "admin write contact_info" on contact_info;
create policy "editors write contact_info" on contact_info for all
  using (can_edit_content()) with check (can_edit_content());

-- sermons
drop policy if exists "admin write sermons" on sermons;
create policy "editors write sermons" on sermons for all
  using (can_edit_content()) with check (can_edit_content());

-- ministries
drop policy if exists "admin write ministries" on ministries;
create policy "editors write ministries" on ministries for all
  using (can_edit_content()) with check (can_edit_content());

-- =============================================================================
-- 5. Prayer requests — role-based read
-- =============================================================================

drop policy if exists "admin read prayer_requests" on prayer_requests;
create policy "role-based read prayer_requests" on prayer_requests for select using (
  can_read_all_prayers()
  or (has_role('prayer_team') and share_with_team = true)
);

drop policy if exists "admin update prayer_requests" on prayer_requests;
create policy "pastor update prayer_requests" on prayer_requests for update
  using (can_read_all_prayers()) with check (can_read_all_prayers());

drop policy if exists "admin delete prayer_requests" on prayer_requests;
create policy "pastor delete prayer_requests" on prayer_requests for delete
  using (can_read_all_prayers());

-- =============================================================================
-- 6. Storage — update leader-photos to use can_edit_content()
-- =============================================================================

drop policy if exists "admin upload leader photos" on storage.objects;
create policy "editors upload leader photos" on storage.objects
  for insert with check (bucket_id = 'leader-photos' and can_edit_content());

drop policy if exists "admin update leader photos" on storage.objects;
create policy "editors update leader photos" on storage.objects
  for update using (bucket_id = 'leader-photos' and can_edit_content());

drop policy if exists "admin delete leader photos" on storage.objects;
create policy "editors delete leader photos" on storage.objects
  for delete using (bucket_id = 'leader-photos' and can_edit_content());
