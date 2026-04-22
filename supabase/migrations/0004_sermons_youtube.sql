-- YouTube integration: add thumbnail, custom thumbnail, sync flags to sermons

alter table sermons
  add column if not exists thumbnail_url text not null default '',
  add column if not exists custom_thumbnail_path text,
  add column if not exists title_edited boolean not null default false,
  add column if not exists auto_imported boolean not null default false;

-- Unique index on youtube_id for idempotent sync
create unique index if not exists sermons_youtube_id_idx on sermons (youtube_id);

-- Storage bucket for custom sermon thumbnails
insert into storage.buckets (id, name, public)
values ('sermon-thumbs', 'sermon-thumbs', true)
on conflict (id) do nothing;

-- Storage RLS: public read, editor+ write
create policy "public read sermon-thumbs" on storage.objects
  for select using (bucket_id = 'sermon-thumbs');
create policy "editors write sermon-thumbs" on storage.objects
  for insert with check (bucket_id = 'sermon-thumbs' and is_admin());
create policy "editors update sermon-thumbs" on storage.objects
  for update using (bucket_id = 'sermon-thumbs' and is_admin());
create policy "editors delete sermon-thumbs" on storage.objects
  for delete using (bucket_id = 'sermon-thumbs' and is_admin());
