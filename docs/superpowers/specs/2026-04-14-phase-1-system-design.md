# CNH Phase 1 System Design — Admin RBAC, Media, Content

**Date:** 2026-04-14
**Status:** Draft — pending user review
**Scope:** Close v2 migration, add RBAC to admin panel, add media/homepage/blog/gallery/SEO content management on existing stack.
**Phase 2 (separate spec later):** migration to Next.js on Vercel for SEO.

---

## 1. Context and goals

Church of New Hope (churchofnewhope.org) is a bilingual (EN/UK) church website. The v2 redesign is in progress on the current stack (CRA + Supabase + Netlify). Half of the admin panel exists (Leaders, Ministries, Sermons, Texts, Contact, Prayer Requests) with no meaningful role separation — every authenticated user in `admin_users` can do everything.

### Goals

1. Pastor, editor, and prayer team can do their work through the admin panel without a developer.
2. Access control enforced at the database level (RLS), not only in UI.
3. Page background images and hero media are editable through the admin, not code.
4. The public site never breaks when Supabase is unreachable (JSON fallback preserved).
5. Architecture is ready for Phase 2 migration to Next.js: data and admin do not need to be rewritten at migration time.

### Non-goals (YAGNI — explicitly rejected)

- Public sign-up, member profiles, member directory.
- Online giving inside the application (use Stripe Customer Portal link).
- Comments, likes, social features.
- Push notifications, email blasts, SMS.
- Event CRUD (external service: Planning Center / Eventbrite / Facebook Events — embed or link).
- Migration to Next.js, Vite, or any framework change (Phase 2, separate spec).
- MFA in initial release (separate follow-up PR, see §9).

---

## 2. Stack decisions (Phase 1)

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | React 18 + TypeScript + CRA (existing) | Do not introduce framework churn. CRA works; replace in Phase 2. |
| Styling | Tailwind + styled-components (existing) | Leave untouched in Phase 1. |
| Routing | `react-router-dom` v7 (existing) | No change. |
| Backend | Supabase **Free tier** | Evaluated Firebase (NoSQL wrong for relational content), Payload CMS (would require admin rewrite), custom backend (10× work, no benefit at this scale). Supabase is the right choice. |
| Auth | Supabase Auth (email+password), staff-only | No public sign-up. 4-8 accounts, manual creation. |
| Database | Postgres (Supabase) | Relational content (leaders↔ministries, sermons, blog) fits Postgres well. |
| Authorization | Postgres RLS + helper functions | DB-level security; anon key safe to ship in bundle. |
| File storage | Supabase Storage buckets | Per-bucket RLS. |
| Hosting | Netlify Free | SPA redirect already configured. 100GB bandwidth is plenty. |
| Domain | churchofnewhope.org | Unchanged. |

### Supabase Free tier — documented risks

- **Auto-pause after 7 days of inactivity** → first request after pause is 5–30s slow. Real problem for a site people visit weekly.
- **No automatic backups** → one accidental delete is unrecoverable.
- **500MB database, 1GB Storage** — sufficient now, blog + gallery will pressure this.
- **No Storage image transforms** → cannot resize on the fly; raw uploaded images are served.

### Upgrade triggers → Supabase Pro ($25/mo)

Move to Pro when **any one** of these occurs:

1. Someone accidentally deletes data (staff will need restore).
2. Pastor or admin reports a noticeable slowdown (auto-pause observed in practice).
3. We need Storage image transforms (blog cover images, OG images getting heavy).
4. Database approaches 400MB or Storage approaches 800MB.

**UptimeRobot ping as auto-pause workaround is explicitly rejected** — fragile, violates Supabase fair use. UptimeRobot may be used **only for alerting**, not as a pause workaround.

### Phase 2 trigger (future, separate spec)

When SEO feedback loop proves Phase 1 is insufficient (social media previews stay generic, Google indexing lags), plan migration to Next.js 15 App Router on Vercel. Admin panel and Supabase data do not migrate — only the public-side rendering layer changes. All redirects in `public/_redirects` are disposable at that point — do not over-invest in them.

---

## 3. High-level architecture

```
┌────────────────────────────────────────────────────────────────┐
│              churchofnewhope.org (Netlify)                     │
│                                                                │
│  React SPA (CRA) — one bundle, two modes via routes:           │
│                                                                │
│    /en, /uk, /en/sermons, ...    →  Public site                │
│    /admin/*                       →  Admin (React.lazy loaded) │
│                                                                │
│  Static: HTML+JS+CSS on Netlify CDN                            │
└────────────────────────────────────────────────────────────────┘
                         │
                         │ HTTPS (anon key in bundle — OK, RLS is security)
                         ▼
┌────────────────────────────────────────────────────────────────┐
│                        Supabase (Free)                          │
│                                                                │
│  Auth (GoTrue)       — email+password, staff-only              │
│  Postgres            — tables + RLS                            │
│  Storage             — leader-photos, page-media, blog-media,  │
│                        gallery, sermon-thumbs                  │
│  PostgREST           — auto REST API                           │
│                                                                │
│  Security boundaries:                                          │
│    1. Supabase Auth JWT                                        │
│    2. RLS policies on every table                              │
│    3. has_role() function for RBAC                             │
└────────────────────────────────────────────────────────────────┘
                         │
                         │ (public asset links)
                         ▼
┌────────────────────────────────────────────────────────────────┐
│                     External services                           │
│                                                                │
│  Events     → Planning Center / Eventbrite / Facebook Events   │
│  Giving     → Stripe Customer Portal (recurring + receipts)    │
│  Zelle      → QR code (existing)                               │
└────────────────────────────────────────────────────────────────┘
```

### Architectural principles

1. **One repo, one bundle.** Admin is a lazy-loaded route, not a separate app. Fewer ops, one deploy, shared types.
2. **DB is single source of truth.** JSON translation files remain only as first-paint fallback.
3. **RLS is the security boundary, not UI.** Anon key leak is fine, UI compromise is fine — DB refuses writes.
4. **Graceful degradation.** Public site must render even if Supabase returns 500: fallback → JSON → hardcoded constants.
5. **Lazy-loaded admin.** Public visitors never download the admin bundle.
6. **Externalise heavy stuff.** Giving → Stripe. Events → external service. Do not build a church ERP.
7. **No serverless functions in Phase 1.** PostgREST + RLS is sufficient. Add Supabase Edge Functions only when user invitation or Stripe webhook appears (Phase 2).

---

## 4. RBAC model

### 4.1 Permission matrix

| Action | admin | pastor | editor | prayer_team |
|---|---|---|---|---|
| Leaders / Ministries / Sermons / Texts / Contact — read | ✓ | ✓ | ✓ | ✓ |
| Leaders / Ministries / Sermons / Texts / Contact — write | ✓ | ✓ | ✓ | — |
| Page media / Homepage / Blog / Gallery — write | ✓ | ✓ | ✓ | — |
| Prayer requests where `share_with_team = true` — read | ✓ | ✓ | — | ✓ |
| Prayer requests where `share_with_team = false` — read | ✓ | ✓ | — | — |
| Prayer requests — change status / delete | ✓ | ✓ | — | — |
| Manage `admin_users` — invite / remove / change role | ✓ | — | — | — |
| SEO meta per-page — write | ✓ | ✓ | ✓ | — |

### 4.2 Database implementation

Migration `0003_roles_and_rbac.sql`:

```sql
-- 1. Tighten check constraint on role
alter table admin_users drop constraint if exists admin_users_role_check;
alter table admin_users add constraint admin_users_role_check
  check (role in ('admin','pastor','editor','prayer_team'));

-- 2. Helper functions
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

-- 3. admin_users SELECT — CRITICAL: self-read for useMe() hook
drop policy if exists "admin read admin_users" on admin_users;
create policy "self or admin read admin_users" on admin_users for select
  using (id = auth.uid() or has_role('admin'));

drop policy if exists "admin write admin_users" on admin_users;
create policy "admin write admin_users" on admin_users for all
  using (has_role('admin')) with check (has_role('admin'));

-- 4. Content tables — use can_edit_content()
-- (repeat for leaders, ministries, sermons, site_texts, contact_info)
drop policy if exists "admin write leaders" on leaders;
create policy "editors write leaders" on leaders for all
  using (can_edit_content()) with check (can_edit_content());

-- 5. Prayer requests — role-based read
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
```

**Pre-migration audit (mandatory):**

```sql
select distinct role from admin_users;
-- If any value is outside {admin,pastor,editor,prayer_team}, migrate
-- it manually before running 0003_roles_and_rbac.sql, or the check
-- constraint will fail mid-migration.
```

### 4.3 Account creation process

**Phase 1 — manual through Supabase Dashboard:**

1. Admin opens Supabase Dashboard → Authentication → Users → **Invite user** by email.
2. User receives invite email → sets password.
3. Admin executes in SQL Editor:
   ```sql
   insert into admin_users (id, email, role)
   select id, email, 'pastor' from auth.users where email = 'pastor@...';
   ```
4. User logs in at `/admin/login` and sees only what their role permits.

**Why manual, not a UI invite form in Phase 1:**
- 4–8 accounts total; UX of a ritual is acceptable.
- Invitation via Service Role Key requires an Edge Function — added in Phase 2 when scale justifies.
- No public registration ever.

**Phase 2 — `/admin/users` UI + `invite-user` Edge Function:**
- Only admins can invite.
- Edge Function uses Service Role Key to create `auth.users` row + `admin_users` row atomically.
- UI sends email with role dropdown; admin picks role at invite time.

### 4.4 Password policy and MFA

- Minimum 12 characters (Supabase Auth setting).
- **MFA (TOTP)** added in follow-up PR 3.5 (see §9). Required for admins, recommended for pastor/editor.
- Session: 7 days, auto-expire after 30 days of inactivity.

---

## 5. Data model

Conventions for all tables:
- `id uuid primary key default gen_random_uuid()`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()` with trigger
- RLS enabled

### 5.1 `page_media` — page backgrounds and hero media

```sql
create table page_media (
  id uuid primary key default gen_random_uuid(),
  page_key text not null,            -- 'home', 'visit', 'ministry:<slug>', ...
  slot_key text not null,            -- 'hero', 'section_about_bg', 'cta_bg', ...
  media_type text not null default 'image'
    check (media_type in ('image','video')),
  image_path text,                   -- bucket 'page-media'; for image OR video poster fallback
  video_path text,                   -- bucket 'page-media'; video mp4/webm
  poster_path text,                  -- video poster (static preview)
  alt_en text not null default '',
  alt_uk text not null default '',
  focal_x numeric not null default 0.5 check (focal_x between 0 and 1),
  focal_y numeric not null default 0.5 check (focal_y between 0 and 1),
  sort_order int not null default 0, -- for slider slots with multiple images
  is_published bool not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (media_type = 'image' and image_path is not null)
    or (media_type = 'video' and video_path is not null)
  )
);
create index page_media_lookup_idx on page_media (page_key, slot_key, sort_order);
```

**Conventions:**
- `page_key` for ministries uses format `'ministry:<slug>'` (denormalized string, no FK).
- Slider slots: multiple rows with same `page_key + slot_key`, ordered by `sort_order`.
- `focal_x/y` drive `object-position` CSS so mobile crops don't chop faces.
- **No unique constraint** on `(page_key, slot_key, sort_order)` — breaks drag-reorder.

### 5.2 `homepage_blocks` — homepage structured content

```sql
create table homepage_blocks (
  id uuid primary key default gen_random_uuid(),
  block_key text not null unique,    -- 'hero', 'what_to_expect', 'mission'
  title_en text not null default '',
  title_uk text not null default '',
  subtitle_en text not null default '',
  subtitle_uk text not null default '',
  body_en text not null default '',
  body_uk text not null default '',
  cta_label_en text not null default '',
  cta_label_uk text not null default '',
  cta_href text not null default '',  -- relative ('/en/visit') or absolute
  media_slot_key text,                -- references page_media(page_key='home', slot_key=...)
  sort_order int not null default 0,
  is_published bool not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

**Do not duplicate elsewhere-canonical data:** service times live in `contact_info.service_time_english/ukrainian` — do not create a `services` block here.

### 5.3 `blog_posts`

```sql
create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_en text not null,
  title_uk text not null,
  excerpt_en text not null default '',
  excerpt_uk text not null default '',
  body_en text not null default '',   -- Markdown
  body_uk text not null default '',   -- Markdown
  cover_image_path text,              -- bucket 'blog-media'
  cover_alt_en text not null default '',
  cover_alt_uk text not null default '',
  author_id uuid references admin_users(id) on delete set null,
  author_display_name text not null default '',  -- snapshot at publish
  tags text[] not null default '{}',
  published_at timestamptz,            -- null = draft
  is_published bool not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index blog_posts_pub_idx on blog_posts (published_at desc) where is_published;
```

Markdown chosen over WYSIWYG: simpler, easier to version, zero parser surprises. Upgrade to TipTap/ProseMirror in Phase 2 if editors demand rich-text.

### 5.4 `gallery_albums` and `gallery_photos`

```sql
create table gallery_albums (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_en text not null,
  title_uk text not null,
  description_en text not null default '',
  description_uk text not null default '',
  cover_photo_id uuid,                -- FK added after gallery_photos
  event_date date,
  sort_order int not null default 0,
  is_published bool not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table gallery_photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references gallery_albums(id) on delete cascade,
  image_path text not null,           -- bucket 'gallery'
  caption_en text not null default '',
  caption_uk text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table gallery_albums add constraint gallery_albums_cover_fk
  foreign key (cover_photo_id) references gallery_photos(id) on delete set null;
```

### 5.5 `page_seo`

```sql
create table page_seo (
  id uuid primary key default gen_random_uuid(),
  page_key text not null unique,      -- 'home', 'sermons', 'blog:why-we-pray'
  title_en text not null default '',
  title_uk text not null default '',
  description_en text not null default '',
  description_uk text not null default '',
  og_image_path text,                 -- bucket 'page-media' or separate
  noindex bool not null default false,
  updated_at timestamptz not null default now()
);
```

**Phase 1 limitation:** React Helmet applies meta tags on the client. Google Bot renders JS and sees them. Social crawlers (Facebook, iMessage, Twitter, Slack) do **not** render JS — they see only default `<title>` from `public/index.html`. `page_seo` data is stored in Phase 1 so that migration to Phase 2 (Next.js SSR) flips social previews on without manual data migration. Admin UI must warn editors of this limitation.

### 5.6 Storage buckets and RLS

Created via SQL (not Dashboard clicks) so they're reproducible in git:

```sql
insert into storage.buckets (id, name, public) values
  ('leader-photos', 'leader-photos', true),  -- existing
  ('page-media',    'page-media',    true),
  ('blog-media',    'blog-media',    true),
  ('gallery',       'gallery',       true),
  ('sermon-thumbs', 'sermon-thumbs', true)
on conflict (id) do nothing;

-- Public read, editor+ write for each
create policy "public read page-media" on storage.objects for select
  using (bucket_id = 'page-media');
create policy "editors write page-media" on storage.objects for insert
  with check (bucket_id = 'page-media' and can_edit_content());
create policy "editors update page-media" on storage.objects for update
  using (bucket_id = 'page-media' and can_edit_content());
create policy "editors delete page-media" on storage.objects for delete
  using (bucket_id = 'page-media' and can_edit_content());
-- Repeat for page-media / blog-media / gallery / sermon-thumbs buckets.
```

**Known limitation:** Free tier does not support image transforms. All uploaded images are served at original size. Mitigations:
- Mandatory client-side compression on upload (`browser-image-compression`).
- Hard upload limit: max 2000×2000px, JPEG quality 82, <2MB per file. Enforced in admin UI AND on bucket via `file_size_limit`.
- Upgrade to Pro unlocks `getPublicUrl(path, { transform: { width, quality } })`.

### 5.7 Tables NOT created

- `events` (external service)
- `event_registrations` (no RSVP in Phase 1)
- `user_profiles` (no member directory)
- `donations` (Stripe holds donor data)
- `audit_log` (deferred to Phase 2 when user count justifies)

### 5.8 Orphan files — known limitation Phase 1

Deleting a row in `page_media`, `blog_posts`, `gallery_photos` does not delete the corresponding file in Storage. Accepted as a known limitation given 4 admins and ~50 files total. Mitigation deferred:
- Phase 2: periodic cleanup via Supabase Edge Function on cron.

---

## 6. Admin UI

### 6.1 Routes

```
/admin                 → redirect to first route allowed by role, or /admin/login
/admin/login           → email + password (+ MFA challenge once added)

Content (admin / pastor / editor):
/admin/leaders
/admin/leaders/new
/admin/leaders/:id
/admin/ministries
/admin/ministries/new
/admin/ministries/:id
/admin/sermons
/admin/sermons/new
/admin/sermons/:id
/admin/texts
/admin/contact
/admin/media            (NEW)
/admin/homepage         (NEW)
/admin/blog             (NEW)
/admin/blog/new
/admin/blog/:id          — admin routes use :id, not :slug (slug editable)
/admin/gallery          (NEW)
/admin/gallery/:albumId
/admin/seo              (NEW)

Prayer (admin / pastor / prayer_team with RLS filter):
/admin/prayer-requests

Users (admin only):
/admin/users            — list with inline role dropdown and remove (NEW)

Self:
/admin/me               — email, change password, MFA setup (NEW)
```

Public blog URL format: `/:lang/blog/:slug`. Admin edit URL: `/admin/blog/:id` — decoupled so renaming slug in the admin form does not 404 the editor.

### 6.2 Layout

- **Top bar:** "CNH Admin", role badge, user email dropdown.
- **Sidebar:** items filtered by role via centralized `src/admin/navigation.ts` config. Mobile: hamburger, collapses <768px.
- **Content area:** routed page.
- Tailwind, simple forms, toast on save.
- **Accessibility baseline (WCAG AA):** aria-labels on icon buttons, keyboard navigation throughout, visible focus outlines, text contrast ≥4.5:1.

### 6.3 AdminGuard

```tsx
<AdminGuard requiredRoles={['admin']}>
  <UsersPage />
</AdminGuard>
```

1. No session → redirect to `/admin/login`.
2. Session but no `admin_users` row → "Not authorized" + sign out.
3. `requiredRoles` set and role not in list → "Not authorized for this page" + link to safe default.
4. Otherwise render.

### 6.4 New page UX

**`/admin/media`** — grouped accordion by `page_key`. Each slot: thumbnail, upload replace, focal point selector (click image to set), alt EN/UK, publish toggle. Slider slots have drag-reorder. Bulk upload supported. Client-side compression on upload via `browser-image-compression` — mandatory, not optional.

**`/admin/homepage`** — list of blocks with drag handle, expandable cards. `Add block` available to admin/pastor/editor. `Delete block` only admin/pastor (editor can edit but not delete hero accidentally).

**`/admin/blog`** — filter tabs (Published / Draft / All). Create/edit uses Markdown editor with split preview (`@uiw/react-md-editor` — MIT, lightweight). Slug auto-generated from title_en, hand-editable. Cover image upload + alt EN/UK. Tags as chip input. `published_at` datepicker; null = draft.

**`/admin/gallery`** — grid of albums. Inside album: masonry grid, drag-reorder, click to edit caption, bulk upload multiple files.

**`/admin/seo`** — table per `page_key`: title, description (EN shown), noindex badge, og_image thumbnail. Click to edit. **Banner at top:** "⚠️ Social media previews are not active until Phase 2 Next.js migration. Test Google Bot rendering: [Google Rich Results Test link]. Meta is stored but not seen by Facebook/iMessage scrapers."

**`/admin/users`** (admin only) — table with email, role, created_at, last_sign_in_at, MFA status, actions. Role edited via inline dropdown. Remove with confirm dialog. Self-protection: cannot remove yourself or demote yourself (UI disabled + DB check). Invite flow Phase 1: modal with instructions (Dashboard → Invite → SQL snippet) rather than a form. Phase 2: proper invite via Edge Function.

**`/admin/me`** — email (read-only), change password (requires current), MFA enroll (QR for TOTP + recovery codes), sign out from all devices.

### 6.5 UX principles

1. Optimistic updates with toast rollback on error.
2. Blog autosave to localStorage every 5 seconds.
3. Confirm dialog on destructive actions (delete leader, delete album) — requires typing name for irreversibles.
4. Toast on save success/error/warning.
5. Cmd/Ctrl+S save shortcut, Esc cancel.
6. Bilingual fields always side-by-side (EN and UK), never tabs — pastor must see both when translating.
7. Leave-guard on forms with unsaved changes.

### 6.6 Not in Phase 1 UI

- Versioning / undo / revert (Phase 2).
- Workflow approval (editor → admin sign-off) — team too small.
- Multi-tab conflict resolution — optimistic `updated_at` check is sufficient.
- Global search — per-page search is enough at current scale.

---

## 7. Public site integration

### 7.1 Data access hooks

All public components read via hooks in `src/data/`. Existing: `useLeaders`, `useContactInfo`, `useSiteTexts`. Adding: `usePageMedia`, `useHomepageBlocks`, `useBlogPosts`, `useBlogPost`, `useGalleryAlbums`, `useGalleryAlbum`, `usePageSeo`.

Unified pattern via `createResourceHook(fetcher, fallback)`:

```ts
// src/data/createResourceHook.ts — key behavior:
//  - Module-level cache shared across components
//  - Single in-flight promise deduped across concurrent calls
//  - On error: clears in-flight so next mount can retry
//  - Returns { data, loading, error, refetch } — refetch() bypasses cache
```

**No React Query in Phase 1** — <10 hooks, no mutations on public side, no realtime. Migrate to React Query in Phase 2 if needed; hook signatures are compatible.

### 7.2 Fallback strategy

Every hook takes a `fallback`. Used when:
1. `supabase === null` (dev without `.env`).
2. Network/RLS/500 error.
3. DB has no data yet.

Sources:
- Leaders, Contact, HomepageBlocks: existing hardcoded consts in code.
- Site texts: `en.json`, `uk.json` (existing), merged under Supabase values.
- Page media: `/public/images/{pageKey}-{slotKey}.jpg` by convention.
- Blog, Gallery: empty arrays → friendly empty state.
- Page SEO: defaults in `public/index.html`.

**Fallback consts are tagged with delete-by dates** — comment `// FALLBACK: delete after 2026-07-15 if Supabase stable` — so they don't become stale permanent duplicates.

### 7.3 Components that change

| File | Change |
|---|---|
| `src/pages/Home.tsx` | Read from `useHomepageBlocks()` + `usePageMedia('home', …)`. |
| `src/pages/Visit.tsx`, `Ministries.tsx`, `Prayer.tsx`, `WeBelieve.tsx`, `Sermons.tsx`, `Give.tsx`, `Leadership.tsx` | Hero bg via `usePageMedia(pageKey, 'hero')`. |
| `src/components/redesign/Hero.tsx` | Accepts `mediaType`, `videoUrl`, `posterUrl`, `focalX/Y`. Video fallback to poster on iOS. |
| NEW `src/pages/Blog.tsx`, `BlogPost.tsx` | Markdown render via `react-markdown` + `remark-gfm`. |
| NEW `src/pages/Gallery.tsx`, `GalleryAlbum.tsx` | Masonry grid + lightbox (`yet-another-react-lightbox`). |
| NEW `src/components/SeoHead.tsx` | React Helmet with title, description, og:image, robots. |
| `src/App.tsx` | V2-cleanup (see §9), new routes for blog/gallery. |

### 7.4 SEO integration — Phase 1 constraints

- ✅ Google Bot renders JS, sees Helmet-injected meta.
- ❌ Facebook / iMessage / Twitter / Slack crawlers do **not** render JS — see only default `<title>`.
- ❌ LCP suffers from client-rendered large backgrounds on 3G.

Full fix comes with Phase 2 Next.js SSR. Optional mid-Phase fix if pain is acute before Phase 2: `react-snap` for build-time prerender of key pages (`/en`, `/uk`, `/en/sermons`, `/en/blog`). Not default scope.

### 7.5 Stale UI in already-open public tabs

When an admin saves a change, public tabs already open show stale content until reload. **Accepted as Phase 1 behavior** — visitors rarely hold pages open long. Not worth Realtime subscriptions.

### 7.6 `/public/images/` retained

Brand assets (logo, favicon, `placeholder.png`) and fallback copies stay in `/public/images/`. Not deleted during migration to `page_media`.

---

## 8. Migration plan (PR sequence)

Each PR is self-contained, deploys independently, does not break production. Between PRs, 1–3 days of staging/production observation.

### PR 1 — v2-cleanup **(unblocks everything else)**

Follow `docs/MIGRATION_TO_V2.md`:
- Remove `LegacySite`, all `src/pages/legacy/`, `src/components/legacy/`.
- Rename `V2Site` to `PublicSite`, inline in `App`.
- Strip `/v2/` prefix from all routes.
- Update `localized()` in Header and Footer: `` `/${lang}${path}` ``.
- Strip `/v2/admin` → `/admin` in AdminGuard, AdminLayout, AdminLogin.
- Simplify `LanguageContext` — drop `isV2` branching.
- `public/_redirects` — splat redirects (do not over-invest; disposable at Phase 2):
  ```
  /v2/admin/*   /admin/:splat   301!
  /v2/*         /:splat         301!
  /             /en             302
  /*            /index.html     200
  ```
- Verify: every page renders, admin login works, old `/v2/...` links 301 redirect.

### PR 2 — RBAC schema migration

`supabase/migrations/0003_roles_and_rbac.sql`:

1. **Pre-migration audit** (mandatory):
   ```sql
   select distinct role from admin_users;
   ```
   Any value outside `{admin,pastor,editor,prayer_team}` must be manually fixed before running the migration.

2. **Pre-migration backup** (Free tier has no auto-backup):
   ```bash
   pg_dump "postgresql://postgres:[pw]@db.xxx.supabase.co:5432/postgres" \
     > cnh-backup-$(date +%F).sql
   ```

3. Run migration: tightens role constraint, adds helpers, rewrites RLS on all tables (including `admin_users` SELECT self-read fix).

4. Verify manually: create test account per role, confirm matrix holds.

### PR 3 — RBAC in admin UI

- `src/data/useMe.ts` — returns `{ user, role, loading }`.
- `src/admin/navigation.ts` — central role→items config.
- `AdminLayout` renders sidebar from `useMe().role`.
- `AdminGuard` accepts optional `requiredRoles`.
- Wrap existing pages with appropriate `requiredRoles`.
- `/admin/me` minimal page (email, role, sign out).

### PR 3.5 — MFA setup

- Supabase `.mfa.enroll()` / `.mfa.challenge()` / `.mfa.verify()`.
- `/admin/me` MFA section: QR code for TOTP, recovery codes.
- **Required for admin role**: on next login after PR 3.5 ships, admin without MFA is blocked at `/admin/me/mfa-setup` until enrolled. No dismissible prompt.
- **Recommended (not enforced) for pastor, editor, prayer_team**: shown once-per-session reminder with "Remind me later" dismiss.

### PR 4 — Page media

- Migration `0004_page_media.sql` — table + indexes + Storage bucket + RLS.
- `browser-image-compression` added as dep; mandatory compression utility.
- Bucket `file_size_limit` enforced server-side.
- `src/data/usePageMedia.ts` with fallback.
- `src/components/redesign/Hero.tsx` accepts new props (image/video, focal point).
- Refactor Home, Visit, Ministries, Prayer, WeBelieve, Sermons, Give, Leadership to consume `usePageMedia`.
- `src/admin/pages/MediaPage.tsx` — grouped accordion, upload, focal point selector.
- Seed script `scripts/seed-page-media.ts` — initial rows from current `stockImages.ts` + `/public/images/`.

### PR 5 — Homepage editor

- Migration `0005_homepage_blocks.sql` + seed from current `Home.tsx` content.
- `src/data/useHomepageBlocks.ts`.
- Refactor `Home.tsx` to render from blocks; hardcoded JSX becomes fallback const.
- `src/admin/pages/HomepagePage.tsx` — drag-reorder, expandable cards.

### PR 6 — SEO meta

- Migration `0006_page_seo.sql` + seed from current hardcoded titles/descriptions.
- `src/data/usePageSeo.ts`.
- `src/components/SeoHead.tsx`.
- Add `<SeoHead pageKey="..." />` to each public page.
- `src/admin/pages/SeoPage.tsx` with Phase 1 limitation banner + Google Rich Results Test link.
- Add `react-helmet-async` dependency (not currently installed).

### PR 7 — Blog (optional, **only when content is ready**)

Do not ship empty infrastructure — wait until pastor commits to writing first posts.

- Migration `0007_blog.sql` + Storage bucket.
- `usePostTools` + public pages (`Blog.tsx`, `BlogPost.tsx`) with Markdown rendering.
- Admin: list + editor with `@uiw/react-md-editor`.

### PR 8 — Gallery (optional, **only when photos are ready**)

- Migration `0008_gallery.sql` + bucket.
- Public pages with masonry + lightbox.
- Admin: albums and photos with bulk upload.

### Rollback strategy

- Each migration file is standalone. Rollback = reverse script (`drop policy`, `drop function`, `drop table`).
- Do NOT drop tables with data — mark `is_published=false` instead, keep data for recovery.
- No feature flags — fallback paths in hooks handle missing tables gracefully.

### Timeline (conservative, part-time work)

- PR 1: 0.5–1 day
- PR 2: 0.5 day
- PR 3: 1–1.5 days
- PR 3.5: 1–1.5 days
- PR 4: 2–3 days
- PR 5: 1.5–2 days
- PR 6: 1 day
- **Total PR 1–6 MVP: 7–10 working days ≈ 2–3 calendar weeks part-time.**
- PR 7, 8: 2–3 days each when triggered.

---

## 9. Environment and config

`.env.local` (gitignored, existing):
```
REACT_APP_SUPABASE_URL=https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # only for seed scripts, never in client bundle
```

`.env.example` committed with placeholders.

Netlify build environment variables mirror these (no service role key in Netlify — only anon).

---

## 10. Testing and verification

Per PR:
1. `npm run build` succeeds.
2. Manual smoke: all public pages render EN + UK.
3. Manual admin: login, each allowed page works, restricted pages blocked.
4. For migrations: test with each role account.
5. Netlify deploy preview reviewed before merge.

No new E2E framework added in Phase 1 (YAGNI). Existing unit tests remain. Data hooks get basic unit tests (fallback behavior, error path).

---

## 11. Monitoring and operations

- **UptimeRobot Free** — ping `/` every 5 minutes. Alert on admin email if down 10+ minutes. **Not used** to keep Supabase DB awake.
- **Netlify deploy notifications** → admin email.
- **Supabase Dashboard** → manual check weekly for errors and DB size.

---

## 12. Open questions / decisions to revisit

1. Exact rollout order of PR 7 (Blog) — depends on pastor's content readiness.
2. Whether to add `react-snap` build-time prerender in Phase 1 if social previews become blocking before Phase 2.
3. Stripe Customer Portal integration — which Stripe account holds church donations today? Needs follow-up before adding link.

---

## Appendix A — Rejected alternatives (for future reference)

- **Firebase** — NoSQL wrong for relational content.
- **Payload CMS** — would deliver better blog UX, but discarding existing half-built admin wastes 2–3 weeks.
- **Custom Node/NestJS backend** — 10× work for 4 users, hand-rolled auth risks.
- **Sanity, Contentful** — auth for custom frontend still separate; paid tiers expensive.
- **Self-hosted Supabase** — more ops, unjustified until lock-in becomes a real concern.
- **UptimeRobot as Supabase pause workaround** — fragile, against fair use.
- **GitHub Pages hosting** — Netlify's `_redirects` and deploy previews are strictly better.

## Appendix B — Phase 2 preview (not this spec)

Migration to Next.js 15 App Router on Vercel + Supabase Pro. Admin panel and Supabase data unchanged — only the public-render layer migrates. SSR fixes social previews and LCP. Redirects move from `_redirects` to `middleware.ts`.

Triggers for starting Phase 2: social media previews are blocking OR Google indexing insufficient OR LCP complaints from users.
