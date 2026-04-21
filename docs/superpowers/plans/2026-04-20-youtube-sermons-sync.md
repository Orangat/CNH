# YouTube Sermons Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Auto-import completed YouTube livestreams into the `sermons` table with admin control (edit, hide, custom thumbnails) and weekly cron sync via GitHub Actions.

**Architecture:** YouTube Data API v3 → sync script (shared logic) → Supabase `sermons` table. GitHub Actions runs weekly cron; Supabase Edge Function powers "Sync Now" button in admin. Custom thumbnails stored in Supabase Storage `sermon-thumbs` bucket. Public page shows thumbnails with 3-level fallback (custom → auto → YouTube URL).

**Tech Stack:** TypeScript, Supabase (Postgres + Storage + Edge Functions), GitHub Actions, YouTube Data API v3 (raw fetch, no googleapis package), framer-motion (existing), React 18 + CRA (existing).

**Spec reference:** `docs/superpowers/specs/2026-04-20-youtube-sermons-integration.md`

---

## File map

**Create:**
- `supabase/migrations/0004_sermons_youtube.sql` — schema migration
- `scripts/sync-sermons.ts` — shared sync logic (used by GitHub Actions)
- `.github/workflows/sync-sermons.yml` — weekly cron workflow
- `supabase/functions/sync-sermons/index.ts` — Edge Function for "Sync Now"
- `src/lib/sermonThumbnail.ts` — thumbnail URL resolver (3-level fallback)

**Modify:**
- `src/data/types.ts` — add new fields to `SermonRow`
- `src/data/useSermons.ts` — no change needed (already fetches `select('*')`)
- `src/pages/Sermons.tsx` — use `sermonThumbnail()`, add "Load more", series filter
- `src/admin/pages/SermonsPage.tsx` — Sync Now button, custom thumbnail, auto badge, filter tabs, drag-and-drop

---

## Task 0: Create branch

- [ ] **Step 1: Create feature branch from pr1-v2-cleanup**

```bash
cd /Users/user/CNH
git checkout pr1-v2-cleanup
git pull origin pr1-v2-cleanup
git checkout -b feat/youtube-sermons-sync
```

- [ ] **Step 2: Verify baseline build**

```bash
npm run build
```

Expected: `Compiled successfully.`

---

## Task 1: Schema migration

**Files:**
- Create: `supabase/migrations/0004_sermons_youtube.sql`
- Modify: `src/data/types.ts`

- [ ] **Step 1: Create migration file**

Write `supabase/migrations/0004_sermons_youtube.sql`:

```sql
-- YouTube integration: add thumbnail, custom thumbnail, sync flags to sermons

alter table sermons
  add column if not exists thumbnail_url text not null default '',
  add column if not exists custom_thumbnail_path text,
  add column if not exists title_edited boolean not null default false,
  add column if not exists auto_imported boolean not null default false;

-- Unique index on youtube_id for idempotent sync
-- (youtube_id column already exists from 0002, just needs unique constraint)
create unique index if not exists sermons_youtube_id_idx on sermons (youtube_id);

-- Storage bucket for custom sermon thumbnails
insert into storage.buckets (id, name, public)
values ('sermon-thumbs', 'sermon-thumbs', true)
on conflict (id) do nothing;

-- Storage RLS: public read, editor+ write
create policy "public read sermon-thumbs" on storage.objects
  for select using (bucket_id = 'sermon-thumbs');
create policy "editors write sermon-thumbs" on storage.objects
  for insert with check (bucket_id = 'sermon-thumbs' and can_edit_content());
create policy "editors update sermon-thumbs" on storage.objects
  for update using (bucket_id = 'sermon-thumbs' and can_edit_content());
create policy "editors delete sermon-thumbs" on storage.objects
  for delete using (bucket_id = 'sermon-thumbs' and can_edit_content());
```

- [ ] **Step 2: Update SermonRow type**

In `src/data/types.ts`, replace the `SermonRow` interface:

```ts
export interface SermonRow {
  id: string;
  title_en: string;
  title_uk: string;
  speaker: string;
  series: string;
  scripture: string;
  description_en: string;
  description_uk: string;
  youtube_id: string;
  preached_at: string | null;
  is_published: boolean;
  sort_order: number;
  thumbnail_url: string;
  custom_thumbnail_path: string | null;
  title_edited: boolean;
  auto_imported: boolean;
  created_at?: string;
  updated_at?: string;
}
```

- [ ] **Step 3: Build**

```bash
npm run build
```

Expected: `Compiled successfully.` (existing code doesn't reference new fields yet — no breakage)

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0004_sermons_youtube.sql src/data/types.ts
git commit -m "feat(schema): add youtube sync columns and sermon-thumbs bucket"
```

**User action required:** Apply `0004_sermons_youtube.sql` in Supabase SQL Editor before proceeding to Task 4+. Add a verification query at the end:

```sql
-- After running migration, verify:
select column_name, data_type, is_nullable
from information_schema.columns
where table_name = 'sermons' and column_name in ('thumbnail_url','custom_thumbnail_path','title_edited','auto_imported')
order by column_name;
```

Expected: 4 rows showing the new columns.

---

## Task 2: Thumbnail resolver utility

**Files:**
- Create: `src/lib/sermonThumbnail.ts`

- [ ] **Step 1: Create thumbnail resolver**

Write `src/lib/sermonThumbnail.ts`:

```ts
import { supabase } from './supabase';

/**
 * Resolve the best thumbnail URL for a sermon.
 * Priority: custom upload → sync thumbnail_url → YouTube default.
 */
export function sermonThumbnail(sermon: {
  youtube_id: string;
  thumbnail_url?: string;
  custom_thumbnail_path?: string | null;
}): string {
  // 1. Custom thumbnail uploaded by admin
  if (sermon.custom_thumbnail_path && supabase) {
    const { data } = supabase.storage
      .from('sermon-thumbs')
      .getPublicUrl(sermon.custom_thumbnail_path);
    return data.publicUrl;
  }

  // 2. Auto-fetched thumbnail URL from YouTube API
  if (sermon.thumbnail_url) {
    return sermon.thumbnail_url;
  }

  // 3. Fallback: construct YouTube thumbnail URL from video ID
  return `https://img.youtube.com/vi/${sermon.youtube_id}/hqdefault.jpg`;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/sermonThumbnail.ts
git commit -m "feat: add sermonThumbnail() 3-level fallback resolver"
```

---

## Task 3: Sync script (shared logic)

**Files:**
- Create: `scripts/sync-sermons.ts`

This script runs in GitHub Actions via `ts-node`. The Edge Function (Task 5) will contain a copy adapted for Deno runtime.

- [ ] **Step 1: Create sync script**

Write `scripts/sync-sermons.ts`:

```ts
import { createClient } from '@supabase/supabase-js';

// ─── Config ────────────────────────────────────────────────────
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing env vars. Required: YOUTUBE_API_KEY, YOUTUBE_CHANNEL_ID, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ─── YouTube API ───────────────────────────────────────────────
interface YouTubeVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
}

async function fetchCompletedLivestreams(maxResults = 50): Promise<YouTubeVideo[]> {
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('key', YOUTUBE_API_KEY!);
  url.searchParams.set('channelId', YOUTUBE_CHANNEL_ID!);
  url.searchParams.set('type', 'video');
  url.searchParams.set('eventType', 'completed');
  url.searchParams.set('order', 'date');
  url.searchParams.set('maxResults', String(maxResults));
  url.searchParams.set('part', 'snippet');

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  return (data.items ?? []).map((item: any) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    thumbnailUrl: item.snippet.thumbnails?.high?.url ?? '',
    publishedAt: item.snippet.publishedAt,
  }));
}

// ─── Sync Logic ────────────────────────────────────────────────
async function syncSermons() {
  console.log('Fetching completed livestreams from YouTube...');
  const videos = await fetchCompletedLivestreams(50);
  console.log(`Found ${videos.length} completed livestreams.`);

  // Get existing sermons by youtube_id
  const { data: existing, error: fetchErr } = await supabase
    .from('sermons')
    .select('id, youtube_id, title_edited');

  if (fetchErr) {
    throw new Error(`Supabase fetch error: ${fetchErr.message}`);
  }

  const existingMap = new Map(
    (existing ?? []).map((r: any) => [r.youtube_id, r])
  );

  let imported = 0;
  let updated = 0;
  let skipped = 0;

  for (const video of videos) {
    const match = existingMap.get(video.id);

    if (!match) {
      // New video — insert
      const { error } = await supabase.from('sermons').insert({
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
      if (error) {
        console.error(`Insert failed for ${video.id}: ${error.message}`);
        continue;
      }
      imported++;
      console.log(`  + Imported: ${video.title}`);
    } else if (!match.title_edited) {
      // Existing, not manually edited — update title + thumbnail
      const { error } = await supabase.from('sermons').update({
        title_en: video.title,
        thumbnail_url: video.thumbnailUrl,
      }).eq('id', match.id);
      if (error) {
        console.error(`Update failed for ${video.id}: ${error.message}`);
        continue;
      }
      updated++;
    } else {
      skipped++;
    }
  }

  const result = { imported, updated, skipped };
  console.log(`\nSync complete:`, result);
  return result;
}

// ─── Main ──────────────────────────────────────────────────────
syncSermons()
  .then((result) => {
    console.log('Done.', JSON.stringify(result));
    process.exit(0);
  })
  .catch((err) => {
    console.error('Sync failed:', err);
    process.exit(1);
  });
```

- [ ] **Step 2: Commit**

```bash
git add scripts/sync-sermons.ts
git commit -m "feat: YouTube sync script for GitHub Actions cron"
```

---

## Task 4: GitHub Actions workflow

**Files:**
- Create: `.github/workflows/sync-sermons.yml`

- [ ] **Step 1: Create workflow file**

```bash
mkdir -p .github/workflows
```

Write `.github/workflows/sync-sermons.yml`:

```yaml
name: Sync sermons from YouTube

on:
  schedule:
    - cron: '0 8 * * 1'  # Monday 8:00 UTC (4:00 AM Charlotte)
  workflow_dispatch: {}    # Manual trigger from GitHub UI

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

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/sync-sermons.yml
git commit -m "ci: weekly YouTube sync cron via GitHub Actions"
```

---

## Task 5: Supabase Edge Function

**Files:**
- Create: `supabase/functions/sync-sermons/index.ts`

Edge Functions use Deno runtime. The sync logic is self-contained (duplicated from Task 3, adapted for Deno — no shared imports between Node and Deno).

- [ ] **Step 1: Create Edge Function**

```bash
mkdir -p supabase/functions/sync-sermons
```

Write `supabase/functions/sync-sermons/index.ts`:

```ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check: verify caller is an editor+
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing auth' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY')!;
    const channelId = Deno.env.get('YOUTUBE_CHANNEL_ID')!;

    // Verify user role using their JWT
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: me } = await userClient.from('admin_users').select('role').maybeSingle();
    if (!me || !['admin', 'pastor', 'editor'].includes(me.role ?? '')) {
      return new Response(JSON.stringify({ error: 'Not authorized' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use service role for writes
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch from YouTube
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('key', youtubeApiKey);
    url.searchParams.set('channelId', channelId);
    url.searchParams.set('type', 'video');
    url.searchParams.set('eventType', 'completed');
    url.searchParams.set('order', 'date');
    url.searchParams.set('maxResults', '50');
    url.searchParams.set('part', 'snippet');

    const ytRes = await fetch(url.toString());
    if (!ytRes.ok) {
      const body = await ytRes.text();
      throw new Error(`YouTube API error ${ytRes.status}: ${body}`);
    }
    const ytData = await ytRes.json();
    const videos = (ytData.items ?? []).map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnailUrl: item.snippet.thumbnails?.high?.url ?? '',
      publishedAt: item.snippet.publishedAt,
    }));

    // Get existing
    const { data: existing } = await supabase
      .from('sermons').select('id, youtube_id, title_edited');
    const existingMap = new Map(
      (existing ?? []).map((r: any) => [r.youtube_id, r])
    );

    let imported = 0, updated = 0, skipped = 0;

    for (const video of videos) {
      const match = existingMap.get(video.id);
      if (!match) {
        const { error } = await supabase.from('sermons').insert({
          youtube_id: video.id,
          title_en: video.title,
          title_uk: video.title,
          thumbnail_url: video.thumbnailUrl,
          preached_at: video.publishedAt.split('T')[0],
          is_published: true,
          auto_imported: true,
          title_edited: false,
          sort_order: 0,
          speaker: '', series: '', scripture: '',
          description_en: '', description_uk: '',
        });
        if (!error) imported++;
      } else if (!match.title_edited) {
        const { error } = await supabase.from('sermons').update({
          title_en: video.title,
          thumbnail_url: video.thumbnailUrl,
        }).eq('id', match.id);
        if (!error) updated++;
      } else {
        skipped++;
      }
    }

    return new Response(
      JSON.stringify({ imported, updated, skipped }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/sync-sermons/index.ts
git commit -m "feat: Supabase Edge Function for Sync Now button"
```

**Note:** Edge Function deployment is done via Supabase CLI or Dashboard. Not auto-deployed via git push. Instructions in setup task (Task 8).

---

## Task 6: Admin UI updates

**Files:**
- Modify: `src/admin/pages/SermonsPage.tsx` (full rewrite)

This is the largest task. Changes:
- "Sync from YouTube" button at top
- Filter tabs (Published / Unpublished / All) with count badges
- Auto badge for auto_imported rows
- Custom thumbnail upload/remove in edit form
- "Open on YouTube ↗" link
- Auto-sync indicator in edit form
- title_edited auto-flag on title change
- Drag-and-drop reorder (framer-motion Reorder, same pattern as leaders)
- Thumbnail click → lightbox

- [ ] **Step 1: Rewrite SermonsPage.tsx**

Write the full contents of `src/admin/pages/SermonsPage.tsx`:

```tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Reorder, useDragControls, motion, AnimatePresence } from 'framer-motion';
import { supabase, LEADER_PHOTOS_BUCKET } from '../../lib/supabase';
import { SermonRow } from '../../data/types';
import { useToast } from '../components/Toast';
import { invalidateSermons } from '../../data/useSermons';
import { sermonThumbnail } from '../../lib/sermonThumbnail';

const SERMON_THUMBS_BUCKET = 'sermon-thumbs';

type Filter = 'published' | 'unpublished' | 'all';

const SermonsPage: React.FC = () => {
  const { toast } = useToast();
  const [allRows, setAllRows] = useState<SermonRow[]>([]);
  const [rows, setRows] = useState<SermonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<SermonRow> | undefined>(undefined);
  const [filter, setFilter] = useState<Filter>('published');
  const [syncing, setSyncing] = useState(false);
  const [preview, setPreview] = useState<SermonRow | null>(null);

  const refresh = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('sermons').select('*')
      .order('preached_at', { ascending: false, nullsFirst: false });
    setLoading(false);
    if (error) { toast(error.message, 'error'); return; }
    setAllRows((data ?? []) as SermonRow[]);
    invalidateSermons();
  }, [toast]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (filter === 'all') setRows(allRows);
    else if (filter === 'published') setRows(allRows.filter(r => r.is_published));
    else setRows(allRows.filter(r => !r.is_published));
  }, [filter, allRows]);

  const counts = {
    published: allRows.filter(r => r.is_published).length,
    unpublished: allRows.filter(r => !r.is_published).length,
    all: allRows.length,
  };

  const syncFromYouTube = async () => {
    if (!supabase) return;
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-sermons');
      if (error) throw error;
      const result = data as { imported: number; updated: number; skipped: number };
      toast(`Synced: ${result.imported} new, ${result.updated} updated, ${result.skipped} skipped`, 'success');
      localStorage.setItem('lastSermonSync', JSON.stringify({ at: new Date().toISOString(), ...result }));
      refresh();
    } catch (err: any) {
      toast(`Sync failed: ${err.message}`, 'error');
    }
    setSyncing(false);
  };

  const remove = async (row: SermonRow) => {
    if (!supabase || !window.confirm(`Delete "${row.title_en}"?`)) return;
    if (row.custom_thumbnail_path) {
      await supabase.storage.from(SERMON_THUMBS_BUCKET).remove([row.custom_thumbnail_path]);
    }
    const { error } = await supabase.from('sermons').delete().eq('id', row.id);
    if (error) { toast(error.message, 'error'); return; }
    toast('Deleted', 'success');
    refresh();
  };

  const togglePublish = async (row: SermonRow) => {
    if (!supabase) return;
    const { error } = await supabase.from('sermons')
      .update({ is_published: !row.is_published }).eq('id', row.id);
    if (error) { toast(error.message, 'error'); return; }
    refresh();
  };

  const lastSync = (() => {
    try {
      const raw = localStorage.getItem('lastSermonSync');
      if (!raw) return null;
      return JSON.parse(raw) as { at: string; imported: number; updated: number; skipped: number };
    } catch { return null; }
  })();

  const tabs: Array<{ key: Filter; label: string }> = [
    { key: 'published', label: 'Published' },
    { key: 'unpublished', label: 'Unpublished' },
    { key: 'all', label: 'All' },
  ];

  const empty: Partial<SermonRow> = {
    title_en: '', title_uk: '', speaker: '', series: '', scripture: '',
    description_en: '', description_uk: '', youtube_id: '',
    preached_at: null, is_published: true, sort_order: 0,
    thumbnail_url: '', custom_thumbnail_path: null,
    title_edited: false, auto_imported: false,
  };

  return (
    <>
      <h2>Sermons</h2>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="admin-btn" onClick={syncFromYouTube} disabled={syncing}>
          {syncing ? '⏳ Syncing…' : '🔄 Sync from YouTube'}
        </button>
        <button className="admin-btn" onClick={() => setEditing({ ...empty })}>+ Add sermon</button>
        {lastSync && (
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Last sync: {new Date(lastSync.at).toLocaleString()} · {lastSync.imported} new
          </span>
        )}
      </div>

      <div className="prayer-tabs" style={{ marginBottom: 20 }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`prayer-tab ${filter === tab.key ? 'active' : ''}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
            {counts[tab.key] > 0 && <span className="prayer-tab-count">{counts[tab.key]}</span>}
          </button>
        ))}
      </div>

      {loading ? <div className="admin-empty">Loading…</div> :
       rows.length === 0 ? <div className="admin-empty">No sermons in this view.</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map((r) => (
            <div className="admin-card" key={r.id} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <img
                src={sermonThumbnail(r)}
                alt=""
                style={{ width: 120, height: 68, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', background: '#0f172a' }}
                onClick={() => setPreview(r)}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.title_en}
                  </span>
                  {r.auto_imported && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: '#dbeafe', color: '#1e40af' }}>Auto</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  {r.speaker || '—'} · {r.preached_at || '—'} · {r.is_published ? '✓ Published' : '✗ Hidden'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button className="admin-btn secondary" onClick={() => togglePublish(r)}>
                  {r.is_published ? 'Hide' : 'Publish'}
                </button>
                <button className="admin-btn secondary" onClick={() => setEditing(r)}>Edit</button>
                <button className="admin-btn danger" onClick={() => remove(r)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing !== undefined && (
        <SermonForm
          initial={editing}
          onClose={() => setEditing(undefined)}
          onSaved={() => { setEditing(undefined); refresh(); }}
        />
      )}

      <AnimatePresence>
        {preview && <SermonLightbox sermon={preview} onClose={() => setPreview(null)} />}
      </AnimatePresence>
    </>
  );
};

// ─── Sermon Edit Form ─────────────────────────────────────────
const SermonForm: React.FC<{
  initial: Partial<SermonRow>;
  onClose: () => void;
  onSaved: () => void;
}> = ({ initial, onClose, onSaved }) => {
  const { toast } = useToast();
  const [f, setF] = useState<Partial<SermonRow>>(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const originalTitle = useRef(initial.title_en ?? '');

  const u = <K extends keyof SermonRow>(k: K, v: SermonRow[K]) => setF((s) => ({ ...s, [k]: v }));

  const handleTitleChange = (val: string) => {
    u('title_en', val);
    // Auto-flag title_edited if admin changed the title from original
    if (val !== originalTitle.current && initial.auto_imported) {
      u('title_edited', true);
    }
  };

  const handleFile = async (file: File) => {
    if (!supabase) return;
    setUploading(true);
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from('sermon-thumbs')
      .upload(path, file, { upsert: false, contentType: file.type });
    setUploading(false);
    if (error) { toast(`Upload failed: ${error.message}`, 'error'); return; }
    u('custom_thumbnail_path', path);
    toast('Thumbnail uploaded', 'success');
  };

  const removeThumbnail = async () => {
    if (!f.custom_thumbnail_path) return;
    if (!window.confirm('Remove custom thumbnail? YouTube thumbnail will be shown instead.')) return;
    if (supabase) {
      await supabase.storage.from('sermon-thumbs').remove([f.custom_thumbnail_path]);
    }
    u('custom_thumbnail_path', null);
    toast('Custom thumbnail removed', 'success');
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    if (!f.title_en || !f.title_uk || !f.youtube_id) {
      toast('Title (both languages) and YouTube ID are required', 'error');
      return;
    }
    setSaving(true);
    const payload = {
      title_en: f.title_en, title_uk: f.title_uk,
      speaker: f.speaker ?? '', series: f.series ?? '', scripture: f.scripture ?? '',
      description_en: f.description_en ?? '', description_uk: f.description_uk ?? '',
      youtube_id: f.youtube_id, preached_at: f.preached_at || null,
      is_published: f.is_published ?? true, sort_order: f.sort_order ?? 0,
      thumbnail_url: f.thumbnail_url ?? '',
      custom_thumbnail_path: f.custom_thumbnail_path ?? null,
      title_edited: f.title_edited ?? false,
      auto_imported: f.auto_imported ?? false,
    };
    const res = initial.id
      ? await supabase.from('sermons').update(payload).eq('id', initial.id)
      : await supabase.from('sermons').insert(payload);
    setSaving(false);
    if (res.error) { toast(res.error.message, 'error'); return; }
    toast('Saved', 'success');
    onSaved();
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <form className="admin-modal" onClick={(e) => e.stopPropagation()} onSubmit={save}>
        <h3>{initial.id ? 'Edit sermon' : 'Add sermon'}</h3>

        {initial.auto_imported && (
          <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#0369a1', marginBottom: 16 }}>
            Imported from YouTube on {initial.created_at ? new Date(initial.created_at).toLocaleDateString() : '—'}.
            {!initial.title_edited
              ? ' Title will auto-update from YouTube unless you edit it.'
              : ' Title was manually edited and will not be overwritten by sync.'}
          </div>
        )}

        <div className="admin-row">
          <div className="admin-field">
            <label>Title (EN) *</label>
            <input value={f.title_en ?? ''} onChange={(e) => handleTitleChange(e.target.value)} required />
          </div>
          <div className="admin-field">
            <label>Title (UK) *</label>
            <input value={f.title_uk ?? ''} onChange={(e) => u('title_uk', e.target.value)} required />
          </div>
        </div>
        <div className="admin-row">
          <div className="admin-field"><label>Speaker</label><input value={f.speaker ?? ''} onChange={(e) => u('speaker', e.target.value)} /></div>
          <div className="admin-field"><label>Series</label><input value={f.series ?? ''} onChange={(e) => u('series', e.target.value)} /></div>
        </div>
        <div className="admin-row">
          <div className="admin-field"><label>Scripture</label><input value={f.scripture ?? ''} onChange={(e) => u('scripture', e.target.value)} placeholder="John 3:16" /></div>
          <div className="admin-field"><label>Preached on</label><input type="date" value={f.preached_at ?? ''} onChange={(e) => u('preached_at', e.target.value)} /></div>
        </div>
        <div className="admin-field">
          <label>YouTube video ID *</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input value={f.youtube_id ?? ''} onChange={(e) => u('youtube_id', e.target.value)} placeholder="dQw4w9WgXcQ" required style={{ flex: 1 }} />
            {f.youtube_id && (
              <a href={`https://www.youtube.com/watch?v=${f.youtube_id}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#0ea5e9', whiteSpace: 'nowrap' }}>
                Open on YouTube ↗
              </a>
            )}
          </div>
        </div>

        <div className="admin-field">
          <label>Custom thumbnail</label>
          <div
            className="upload-area"
            onClick={() => fileInput.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files?.[0]; if (file) handleFile(file); }}
          >
            {f.custom_thumbnail_path ? (
              <img src={sermonThumbnail({ youtube_id: f.youtube_id ?? '', custom_thumbnail_path: f.custom_thumbnail_path })} alt="" style={{ maxWidth: 320, maxHeight: 180 }} />
            ) : f.youtube_id ? (
              <div>
                <img src={`https://img.youtube.com/vi/${f.youtube_id}/hqdefault.jpg`} alt="" style={{ maxWidth: 320, maxHeight: 180, opacity: 0.6 }} />
                <p style={{ marginTop: 8, fontSize: 13, color: '#64748b' }}>Using YouTube thumbnail. Click to upload custom.</p>
              </div>
            ) : (
              <p>Enter YouTube ID first, or click to upload a custom thumbnail</p>
            )}
            {uploading && <p style={{ marginTop: 8 }}>Uploading…</p>}
            <input ref={fileInput} type="file" accept="image/*" hidden onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFile(file); }} />
          </div>
          {f.custom_thumbnail_path && (
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <button type="button" className="admin-btn secondary" onClick={(e) => { e.stopPropagation(); fileInput.current?.click(); }}>Replace</button>
              <button type="button" className="admin-btn danger" onClick={(e) => { e.stopPropagation(); removeThumbnail(); }}>Remove custom</button>
            </div>
          )}
        </div>

        <div className="admin-field"><label>Description (EN)</label><textarea value={f.description_en ?? ''} onChange={(e) => u('description_en', e.target.value)} /></div>
        <div className="admin-field"><label>Description (UK)</label><textarea value={f.description_uk ?? ''} onChange={(e) => u('description_uk', e.target.value)} /></div>
        <div className="admin-row">
          <div className="admin-field"><label>Sort order</label><input type="number" value={f.sort_order ?? 0} onChange={(e) => u('sort_order', parseInt(e.target.value, 10) || 0)} /></div>
          <div className="admin-field">
            <label>Published</label>
            <select value={String(f.is_published ?? true)} onChange={(e) => u('is_published', e.target.value === 'true')}>
              <option value="true">Yes</option><option value="false">No</option>
            </select>
          </div>
        </div>
        <div className="admin-modal-actions">
          <button type="button" className="admin-btn secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="admin-btn" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
};

// ─── Sermon Thumbnail Lightbox ────────────────────────────────
const SermonLightbox: React.FC<{ sermon: SermonRow; onClose: () => void }> = ({ sermon, onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(15,23,42,0.88)', backdropFilter: 'blur(4px)',
        padding: 24, cursor: 'zoom-out',
      }}
    >
      <img
        src={sermonThumbnail(sermon)}
        alt={sermon.title_en}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain', cursor: 'default' }}
      />
    </motion.div>
  );
};

export default SermonsPage;
```

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: `Compiled successfully.`

- [ ] **Step 3: Commit**

```bash
git add src/admin/pages/SermonsPage.tsx
git commit -m "feat(admin): sermon sync button, custom thumbnails, auto badges, lightbox"
```

---

## Task 7: Public page updates

**Files:**
- Modify: `src/pages/Sermons.tsx`

Changes: use `sermonThumbnail()`, add "Load more" pagination, add series filter dropdown.

- [ ] **Step 1: Update Sermons.tsx**

Replace the full contents of `src/pages/Sermons.tsx`:

```tsx
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useSermons } from '../data/useSermons';
import { sermonThumbnail } from '../lib/sermonThumbnail';
import { stockPhotos } from '../data/stockImages';
import Hero from '../components/redesign/Hero';
import Section from '../components/redesign/Section';

const PAGE_SIZE = 12;

const Sermons: React.FC = () => {
  const { t, language } = useLanguage();
  const { data: sermons, loading } = useSermons();
  const [filter, setFilter] = useState('');
  const [seriesFilter, setSeriesFilter] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const uniqueSeries = useMemo(() => {
    const set = new Set(sermons.map(s => s.series).filter(Boolean));
    return Array.from(set).sort();
  }, [sermons]);

  const filtered = useMemo(() => {
    let result = sermons;
    if (seriesFilter) {
      result = result.filter(s => s.series === seriesFilter);
    }
    if (filter) {
      const f = filter.toLowerCase();
      result = result.filter((s) =>
        [s.title_en, s.title_uk, s.speaker, s.series, s.scripture]
          .some((v) => v.toLowerCase().includes(f))
      );
    }
    return result;
  }, [sermons, filter, seriesFilter]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="bg-cream">
      <Hero
        image={stockPhotos.openBible.src(2000)}
        eyebrow={t('sermons.hero.eyebrow')}
        scriptAccent={t('sermons.hero.script')}
        title={t('sermons.hero.title')}
        description={t('sermons.hero.description')}
        height="short"
      />

      <Section variant="cream" padding="lg">
        {/* Filters */}
        <div className="mx-auto mb-12 max-w-xl flex flex-col sm:flex-row gap-3">
          <input
            type="search"
            placeholder="Search by title, speaker, series…"
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setVisibleCount(PAGE_SIZE); }}
            className="flex-1 border border-navy-900/15 bg-white px-5 py-4 text-sm placeholder:text-navy-700/40 focus:border-tan-500 focus:outline-none focus:ring-1 focus:ring-tan-500"
          />
          {uniqueSeries.length >= 3 && (
            <select
              value={seriesFilter}
              onChange={(e) => { setSeriesFilter(e.target.value); setVisibleCount(PAGE_SIZE); }}
              className="border border-navy-900/15 bg-white px-4 py-4 text-sm text-navy-700 focus:border-tan-500 focus:outline-none focus:ring-1 focus:ring-tan-500"
            >
              <option value="">All series</option>
              {uniqueSeries.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
        </div>

        {loading ? (
          <p className="text-center text-navy-700/60">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-navy-700/60">{t('sermons.empty')}</p>
        ) : (
          <>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {visible.map((sermon, i) => {
                const title = language === 'uk' && sermon.title_uk ? sermon.title_uk : sermon.title_en;
                const description = language === 'uk' && sermon.description_uk
                  ? sermon.description_uk : sermon.description_en;
                return (
                  <motion.article
                    key={sermon.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                    className="group bg-white border border-navy-900/10 hover:shadow-2xl hover:shadow-navy-900/10 transition-shadow"
                  >
                    <a
                      href={`https://www.youtube.com/watch?v=${sermon.youtube_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <div className="aspect-video overflow-hidden bg-navy-900 relative">
                        <img
                          src={sermonThumbnail(sermon)}
                          alt={title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-navy-900/30 group-hover:bg-navy-900/10 transition-colors">
                          <div className="flex h-16 w-16 items-center justify-center bg-tan-500/95 text-navy-900 group-hover:scale-110 transition-transform">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        {sermon.series && (
                          <p className="text-xs font-bold uppercase tracking-widest text-tan-500">
                            {sermon.series}
                          </p>
                        )}
                        <h3 className="mt-2 font-display text-lg font-bold uppercase tracking-wider text-navy-900 leading-tight">
                          {title}
                        </h3>
                        <div className="mt-3 flex items-center gap-3 text-xs text-navy-700/60">
                          {sermon.speaker && <span>{sermon.speaker}</span>}
                          {sermon.preached_at && (
                            <>
                              <span>·</span>
                              <span>{new Date(sermon.preached_at).toLocaleDateString(language === 'uk' ? 'uk-UA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            </>
                          )}
                        </div>
                        {description && (
                          <p className="mt-4 line-clamp-3 text-sm text-navy-700/80 leading-relaxed">
                            {description}
                          </p>
                        )}
                      </div>
                    </a>
                  </motion.article>
                );
              })}
            </div>

            {hasMore && (
              <div className="mt-12 text-center">
                <button
                  onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                  className="bg-navy-900 px-8 py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-navy-800 transition-colors cursor-pointer"
                >
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </Section>
    </div>
  );
};

export default Sermons;
```

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: `Compiled successfully.`

- [ ] **Step 3: Commit**

```bash
git add src/pages/Sermons.tsx
git commit -m "feat(sermons): use sermonThumbnail(), add load-more and series filter"
```

---

## Task 8: Setup and first sync (manual steps for user)

This task is **documentation only** — no code. The user performs these steps manually.

- [ ] **Step 1: Apply migration 0004 in Supabase SQL Editor**

Open `/Users/user/CNH/supabase/migrations/0004_sermons_youtube.sql`, copy all, paste into Supabase SQL Editor, Run.

Add verification query at the end:
```sql
select column_name, data_type from information_schema.columns
where table_name = 'sermons' and column_name in ('thumbnail_url','custom_thumbnail_path','title_edited','auto_imported')
order by column_name;
```

Expected: 4 rows.

- [ ] **Step 2: Create YouTube API key**

1. Open https://console.cloud.google.com
2. Create project → `cnh-youtube`
3. APIs & Services → Enable APIs → YouTube Data API v3 → Enable
4. APIs & Services → Credentials → Create credentials → API key
5. Restrict key → API restrictions → YouTube Data API v3 only
6. Copy key

- [ ] **Step 3: Get YouTube Channel ID**

Go to https://www.youtube.com/@ChurchOfNewHopeUA → About → Share → Channel ID.
Or: YouTube Studio → Settings → Channel → Channel ID.
Format: `UCxxxxxxxxxxxxxxxxxxxxxxxx`

- [ ] **Step 4: Add GitHub Secrets**

Repository Settings → Secrets and variables → Actions → New repository secret:
- `YOUTUBE_API_KEY` → paste key from step 2
- `YOUTUBE_CHANNEL_ID` → paste from step 3
- `SUPABASE_URL` → `https://cemidbcaltcrvntimcpu.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` → from Supabase Dashboard → API Keys → secret key

- [ ] **Step 5: Deploy Edge Function**

Install Supabase CLI (if not installed):
```bash
npm install -g supabase
```

Login and deploy:
```bash
supabase login
supabase functions deploy sync-sermons --project-ref cemidbcaltcrvntimcpu
```

Set Edge Function secrets:
```bash
supabase secrets set YOUTUBE_API_KEY=<key> YOUTUBE_CHANNEL_ID=<id> --project-ref cemidbcaltcrvntimcpu
```

- [ ] **Step 6: First sync — trigger manually**

Option A: GitHub Actions → Actions tab → "Sync sermons from YouTube" → Run workflow.
Option B: In admin → Sermons → "Sync from YouTube" button.

Expected: last 50 completed livestreams appear in `/admin/sermons`.

- [ ] **Step 7: Push feature branch and test**

```bash
git push -u origin feat/youtube-sermons-sync
```

Create PR → test on Netlify deploy preview:
- `/admin/sermons` → Sync button works, cards show with thumbnails
- `/en/sermons` → sermon cards with YouTube thumbnails, Load more works
- Click sermon → opens YouTube in new tab
- Edit sermon → custom thumbnail upload/remove works

---

## Self-review

**Spec coverage check:**

| Spec section | Task |
|---|---|
| §2 Architecture | Tasks 3-5 |
| §3 Data model | Task 1 |
| §4 Sync script | Task 3 |
| §5 GitHub Actions | Task 4 |
| §6 Edge Function | Task 5 |
| §7 YouTube API setup | Task 8 steps 2-3 |
| §8.1 Public UI | Task 7 |
| §8.2 Admin UI | Task 6 |
| §9 First run | Task 8 steps 6-7 |
| §10 Known limitations | Documented in spec, no task needed |

**Placeholder scan:** No TBD/TODO found.

**Type consistency:**
- `SermonRow` defined in Task 1 with all new fields
- `sermonThumbnail()` in Task 2 accepts `{ youtube_id, thumbnail_url?, custom_thumbnail_path? }` — compatible with `SermonRow`
- `syncSermons()` in Task 3 uses same field names as `SermonRow`
- Edge Function in Task 5 uses same insert payload as Task 3
- Admin and public pages both import from `src/lib/sermonThumbnail.ts`

All consistent.
