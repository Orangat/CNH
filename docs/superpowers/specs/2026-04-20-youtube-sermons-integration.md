# YouTube Sermons Integration — Design Spec

**Date:** 2026-04-20
**Status:** Draft — pending user review
**Scope:** Auto-import completed YouTube livestreams into the sermons table, with admin control (edit, hide, custom thumbnails) and a weekly cron sync via GitHub Actions.

---

## 1. Context and goals

Church of New Hope livestreams Sunday services on YouTube (`@ChurchOfNewHopeUA`). Videos live exclusively on YouTube — the church does not host video files. The current site has a `sermons` table and admin page, but no connection to YouTube. Staff must manually add each sermon, which doesn't happen consistently.

### Goals

1. Completed livestreams automatically appear on the site without manual intervention.
2. Admin can edit bilingual metadata (speaker, series, scripture, UK translation), upload custom thumbnails, and hide/delete irrelevant videos.
3. Zero video hosting — YouTube remains the source of truth for video content.
4. Minimal infrastructure: one cron job, one optional Edge Function, no new npm packages.

### Non-goals

- Inline YouTube player on the site (heavy, privacy concerns — link to YouTube instead)
- Syncing back to YouTube (changing titles/thumbnails on YT from our admin)
- Downloading/hosting video or audio files
- Transcript search, AI sermon notes, comments, reactions
- Importing non-livestream uploads (only `eventType=completed`)

---

## 2. Architecture

```
YouTube Channel (@ChurchOfNewHopeUA)
          │
          │  YouTube Data API v3 (search.list, eventType=completed)
          ▼
┌─────────────────────────────────────┐
│  GitHub Actions (cron: Mon 8:00 UTC)│
│  scripts/sync-sermons.ts           │
│  - Fetch last 50 completed streams │
│  - Upsert new rows, smart-update   │
│    existing (respects title_edited) │
└─────────────────────────────────────┘
          │
          │  Supabase REST API (service_role key from GitHub Secrets)
          ▼
┌─────────────────────────────────────┐
│  Supabase (sermons table)           │
│  youtube_id (unique)                │
│  title_en/uk, speaker, series, etc. │
│  thumbnail_url (auto from YT)       │
│  custom_thumbnail_path (admin)      │
│  title_edited, auto_imported flags  │
│  is_published (default true)        │
└─────────────────────────────────────┘
          │
     ┌────┴────┐
     ▼         ▼
  Public    Admin
  /sermons  /admin/sermons
            + "Sync Now" button
            → Supabase Edge Function
              (same logic as cron script)
```

### Key principles

1. **YouTube = source of truth for video.** We store only metadata + thumbnail URL.
2. **Supabase = source of truth for church metadata.** Speaker, series, scripture, UK translation, custom thumbnail — things YouTube doesn't know.
3. **Idempotent sync.** `youtube_id` unique index prevents duplicates. Re-running sync is always safe.
4. **Smart update.** Sync only overwrites `title_en` and `thumbnail_url` if `title_edited = false`. Once admin edits title, sync leaves it alone.
5. **Edge Function exception.** The Phase 1 system design says "no serverless functions." The YouTube "Sync Now" button is a documented exception — one function with a specific purpose, not a general backend.

---

## 3. Data model changes

### Migration `0004_sermons_youtube.sql`

```sql
-- New columns on existing sermons table
alter table sermons
  add column if not exists thumbnail_url text not null default '',
  add column if not exists custom_thumbnail_path text,
  add column if not exists title_edited boolean not null default false,
  add column if not exists auto_imported boolean not null default false;

-- Unique index for idempotent sync (youtube_id already exists as text not null)
create unique index if not exists sermons_youtube_id_idx on sermons (youtube_id);

-- Storage bucket for custom sermon thumbnails
insert into storage.buckets (id, name, public)
values ('sermon-thumbs', 'sermon-thumbs', true)
on conflict (id) do nothing;

-- Storage RLS (public read, editor+ write)
create policy "public read sermon-thumbs" on storage.objects
  for select using (bucket_id = 'sermon-thumbs');
create policy "editors write sermon-thumbs" on storage.objects
  for insert with check (bucket_id = 'sermon-thumbs' and can_edit_content());
create policy "editors update sermon-thumbs" on storage.objects
  for update using (bucket_id = 'sermon-thumbs' and can_edit_content());
create policy "editors delete sermon-thumbs" on storage.objects
  for delete using (bucket_id = 'sermon-thumbs' and can_edit_content());
```

### Thumbnail resolution on frontend

Priority: custom upload → sync thumbnail_url → YouTube URL by ID.

```ts
function sermonThumbnail(sermon: SermonRow): string {
  if (sermon.custom_thumbnail_path) {
    return supabaseStorageUrl('sermon-thumbs', sermon.custom_thumbnail_path);
  }
  if (sermon.thumbnail_url) {
    return sermon.thumbnail_url;
  }
  return `https://img.youtube.com/vi/${sermon.youtube_id}/hqdefault.jpg`;
}
```

---

## 4. Sync script

### `scripts/sync-sermons.ts`

Shared logic used by both GitHub Actions and Edge Function.

```ts
// Pseudocode — actual implementation in plan

async function syncSermons(youtubeApiKey, channelId, supabaseClient) {
  // 1. Fetch completed livestreams from YouTube (last 50)
  const videos = await fetchCompletedLivestreams(youtubeApiKey, channelId, 50);

  // 2. Get existing sermons by youtube_id
  const { data: existing } = await supabaseClient
    .from('sermons')
    .select('id, youtube_id, title_edited');
  const existingMap = new Map(existing.map(r => [r.youtube_id, r]));

  let imported = 0, updated = 0, skipped = 0;

  for (const video of videos) {
    const match = existingMap.get(video.id);

    if (!match) {
      // New — insert
      await supabaseClient.from('sermons').insert({
        youtube_id: video.id,
        title_en: video.title,
        title_uk: video.title,
        thumbnail_url: video.thumbnailUrl,
        preached_at: video.publishedAt.split('T')[0],
        is_published: true,
        auto_imported: true,
        title_edited: false,
        sort_order: 0,
        speaker: '',
        series: '',
        scripture: '',
        description_en: '',
        description_uk: '',
      });
      imported++;
    } else if (!match.title_edited) {
      // Existing, not manually edited — update title + thumbnail
      await supabaseClient.from('sermons').update({
        title_en: video.title,
        thumbnail_url: video.thumbnailUrl,
      }).eq('id', match.id);
      updated++;
    } else {
      skipped++;
    }
  }

  return { imported, updated, skipped };
}
```

### YouTube API call

Raw `fetch` — no `googleapis` npm package needed.

```ts
async function fetchCompletedLivestreams(apiKey, channelId, maxResults = 50) {
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('key', apiKey);
  url.searchParams.set('channelId', channelId);
  url.searchParams.set('type', 'video');
  url.searchParams.set('eventType', 'completed');
  url.searchParams.set('order', 'date');
  url.searchParams.set('maxResults', String(maxResults));
  url.searchParams.set('part', 'snippet');

  const res = await fetch(url.toString());
  const data = await res.json();

  return data.items.map(item => ({
    id: item.id.videoId,
    title: item.snippet.title,
    thumbnailUrl: item.snippet.thumbnails?.high?.url || '',
    publishedAt: item.snippet.publishedAt,
  }));
}
```

### YouTube API quota

| Operation | Units | Frequency | Units/week |
|---|---|---|---|
| GitHub Actions cron (Monday) | 100 | 1/week | 100 |
| "Sync Now" from admin | 100 | ~3/week est. | 300 |
| **Total** | | | **~400 / 70,000** |

Headroom: ×175. Not a concern.

---

## 5. GitHub Actions workflow

### `.github/workflows/sync-sermons.yml`

```yaml
name: Sync sermons from YouTube

on:
  schedule:
    - cron: '0 8 * * 1'   # Monday 8:00 UTC = 4:00 AM Charlotte
  workflow_dispatch: {}     # Manual trigger from GitHub UI

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx ts-node scripts/sync-sermons.ts
        env:
          YOUTUBE_API_KEY: ${{ secrets.YOUTUBE_API_KEY }}
          YOUTUBE_CHANNEL_ID: ${{ secrets.YOUTUBE_CHANNEL_ID }}
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

### GitHub Secrets required (4)

| Secret | Source |
|---|---|
| `YOUTUBE_API_KEY` | Google Cloud Console → Credentials → API Key |
| `YOUTUBE_CHANNEL_ID` | YouTube Studio → Settings → Channel → Channel ID |
| `SUPABASE_URL` | `https://cemidbcaltcrvntimcpu.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → API Keys → secret key |

---

## 6. Supabase Edge Function

### `supabase/functions/sync-sermons/index.ts`

Called from admin UI via `supabase.functions.invoke('sync-sermons')`.

- Reads `YOUTUBE_API_KEY` and `YOUTUBE_CHANNEL_ID` from Supabase function env vars (set via CLI or Dashboard)
- Creates Supabase client with service_role from runtime
- Runs same `syncSermons()` logic as the cron script
- Returns `{ imported, updated, skipped }`
- **Auth guard:** verifies JWT and checks `can_edit_content()` — anon requests return 401

### Edge Function env vars (set in Supabase Dashboard → Edge Functions → Secrets)

| Var | Value |
|---|---|
| `YOUTUBE_API_KEY` | Same key as GitHub Secrets |
| `YOUTUBE_CHANNEL_ID` | Same channel ID |

---

## 7. YouTube API Key setup (one-time)

1. Open https://console.cloud.google.com
2. Create project → `cnh-youtube`
3. APIs & Services → Enable APIs → **YouTube Data API v3** → Enable
4. APIs & Services → Credentials → **Create credentials → API key**
5. Restrict key → API restrictions → YouTube Data API v3 only
6. Copy key → add as GitHub Secret + Supabase Edge Function env var

Free: 10,000 units/day. Our usage: ~100 units/sync.

---

## 8. UI changes

### 8.1 Public page `/sermons`

Sermon card layout:

- 16:9 thumbnail (custom → YouTube auto → YouTube fallback)
- Play overlay (▶) centered on thumbnail — visual hint this is video
- Speaker · Series (if filled, dimmed if empty)
- Title (bold)
- Date (relative or formatted)
- "Watch on YouTube →" link → `target="_blank"`

Features:
- Text search across title/speaker/series
- Series filter dropdown (shown only if ≥3 unique series exist)
- Load 12 initially, "Load more" button appends next 12

### 8.2 Admin page `/admin/sermons`

Top area:
- **"Sync from YouTube"** button → calls Edge Function → toast result
- **"+ Add sermon"** button → existing manual form
- Last sync timestamp + result in small text (stored in localStorage)
- Filter tabs: Published / Unpublished / All (with count badges, same pattern as prayer requests)

List:
- Drag-and-drop reorder via ⠿ handle (same framer-motion Reorder as leaders)
- Columns: Thumbnail (click → lightbox), Title, Speaker (dimmed "—" if empty), Date, Status badges, Actions
- **"Auto" badge** (blue) for `auto_imported = true`
- Published toggle (instant click)

Edit form (modal, extending existing):
- All current fields remain
- **New: Custom thumbnail** upload area (same pattern as leader photo — upload, replace, remove)
- **New: "Open on YouTube ↗"** link next to youtube_id field
- **New: Auto-sync notice** — if `auto_imported = true`: "Imported from YouTube on {date}. Title will auto-update unless you edit it."
- Editing `title_en` automatically sets `title_edited = true` (no separate UI for this flag)

### 8.3 Sermon detail behavior

No dedicated detail page. Click sermon card → opens YouTube in new tab. Keeps implementation simple, YouTube handles the viewing experience.

---

## 9. First run

1. Set up YouTube API key (§7)
2. Add GitHub Secrets (§5)
3. Run migration 0004 in Supabase SQL Editor
4. Manually trigger GitHub Action (`workflow_dispatch`) or press "Sync Now" in admin
5. Last 50 completed livestreams appear in `/admin/sermons`
6. Admin reviews: hides irrelevant videos, adds speaker/series/UK translations for key sermons

Older videos (>50) are not auto-imported. Add manually via "Add sermon" if needed.

---

## 10. Known limitations

1. **All completed livestreams imported** — not just Sunday services. Admin must hide worship concerts, youth streams, etc.
2. **YouTube thumbnail quality varies** — some streams have auto-generated thumbnails. Custom upload in admin solves this per-video.
3. **No real-time sync** — max 24h delay (cron) or manual "Sync Now". Acceptable for weekly sermons.
4. **Edge Function = documented exception** to Phase 1 "no serverless" rule. One function, specific purpose.
5. **First sync = 50 videos max.** Full channel archive requires manual addition or one-time script adjustment.

---

## 11. Dependencies

- **New npm packages:** none (raw `fetch` for YouTube API)
- **New Supabase features:** Edge Function (free tier, ≤500k invocations/month)
- **New external service:** Google Cloud project with YouTube Data API v3 key (free)
- **New GitHub feature:** Actions workflow with scheduled cron (free, 2000 min/month)

---

## 12. Implementation order

1. Migration `0004_sermons_youtube.sql` (schema + storage bucket)
2. `scripts/sync-sermons.ts` (shared sync logic)
3. `.github/workflows/sync-sermons.yml` (cron workflow)
4. `supabase/functions/sync-sermons/index.ts` (Edge Function for "Sync Now")
5. Admin UI updates (Sync Now button, custom thumbnail, auto badge, lightbox)
6. Public UI updates (thumbnail priority, play overlay, search/filter, load more)
7. YouTube API key setup + GitHub Secrets + first sync
