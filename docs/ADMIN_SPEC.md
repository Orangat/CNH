# Church of New Hope — Admin Panel Functional Specification

## 1. Goal

Allow non-technical church staff (pastor, communications team) to edit the public website without touching code or asking a developer. Edits include:

- Leadership cards (add / edit / delete / reorder, with photos)
- Bilingual texts on every page (English + Ukrainian)
- Contact information (address, phone, service times, social links)
- Homepage and "We Believe" copy

The admin panel must be a real, full-stack solution: backend with a database, authentication, image storage. No git-based CMS.

## 2. Constraints

| Constraint | Decision |
|---|---|
| Hosting cost | Free tier only |
| Public site hosting | Stay on GitHub Pages |
| Tech of public site | Existing React + TS SPA, do not rewrite |
| Languages | English + Ukrainian (must edit both) |
| Audience | 1–5 named admin users, no public sign-up |
| Scale | <10k page views/month, <100 content rows |

## 3. Stack

| Layer | Choice |
|---|---|
| Database | Supabase Postgres (free tier: 500 MB, plenty for text + a few photos) |
| Auth | Supabase Auth (email + password). Sign-up disabled — accounts created manually. |
| File storage | Supabase Storage bucket `leader-photos` (1 GB free) |
| API | Supabase auto-generated REST + JS client (`@supabase/supabase-js`) |
| Authorization | Postgres Row Level Security (RLS) policies |
| Public site | React SPA (existing), fetches from Supabase at runtime, JSON file fallback for first paint |
| Admin UI | Same React app, lazy-loaded `/admin/*` route, gated by Supabase session + `admin_users` row |
| Deployment | `npm run deploy` → GitHub Pages (unchanged) |

Why Supabase: open source, Postgres (real SQL, joins, types), built-in auth + storage + RLS, generous free tier, no server to maintain.

## 4. Data model

All tables: `id uuid pk default gen_random_uuid()`, `created_at timestamptz default now()`, `updated_at timestamptz default now()` (with trigger), RLS enabled.

### 4.1 `leaders`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | pk |
| `sort_order` | int | display order, lower first |
| `name_en` | text | required |
| `name_uk` | text | required |
| `title_en` | text | required |
| `title_uk` | text | required |
| `emails` | text[] | 0..N emails |
| `photo_path` | text | key inside `leader-photos` bucket; null = placeholder |
| `is_published` | bool | default true; unpublished hidden from public site |

Index: `(sort_order, id)` for stable ordering.

### 4.2 `site_texts`

Replaces the JSON translation files. Key/value store mirroring the dot-path keys already used by `t()`.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | pk |
| `key` | text | unique, e.g. `home.sundays`, `weBelieve.god.text` |
| `value_en` | text | |
| `value_uk` | text | |
| `group` | text | derived from key prefix (`home`, `weBelieve`, `give`, …); used to group rows in the admin UI |
| `description` | text | optional human hint shown to editor |

Unique index on `key`.

### 4.3 `contact_info`

Singleton (one row). Enforced by a check constraint or a fixed id.

| Column | Type |
|---|---|
| `address` | text |
| `phone` | text |
| `email` | text |
| `service_time_english` | text |
| `service_time_ukrainian` | text |
| `map_url` | text |
| `facebook_url` | text |
| `instagram_url` | text |
| `youtube_url` | text |

### 4.4 `admin_users`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | pk = `auth.users.id` (FK) |
| `email` | text | mirror of auth email for UI |
| `role` | text | `admin` \| `editor`; only `admin` for now, `editor` reserved |
| `created_at` | timestamptz | |

Helper SQL function `is_admin()` returning `bool` — checks `auth.uid()` exists in `admin_users`. Used by RLS policies.

## 5. RLS policies

For all four content tables and Storage bucket:

- **SELECT**: open to `anon` + `authenticated` (public site needs to read).
- **INSERT / UPDATE / DELETE**: only when `is_admin()` returns true.

`admin_users`:
- **SELECT**: only `is_admin()` (don't expose admin list to anonymous).
- **INSERT / UPDATE / DELETE**: only `is_admin()`.

Storage bucket `leader-photos`:
- Public read.
- Authenticated write only when `is_admin()`.

This is the security boundary. The anon key can ship in the public bundle safely — RLS prevents writes.

## 6. Public site behavior

### 6.1 Data fetching

Three module-level fetchers (no React Query needed at this scale):

- `useLeaders()` — fetches once, caches in module memory, returns `{ data, loading, error }`.
- `useContactInfo()` — same pattern.
- `useSiteTexts()` — fetches once, populates a map, exposed via `LanguageContext`.

All fetches happen on first mount of the relevant component. Failures fall back to:
- Local JSON (`en.json` / `uk.json`) for texts
- The previously-bundled hardcoded array for leaders (kept as a const fallback)
- Hardcoded enum values for contact info

So **the site never breaks** if Supabase is unreachable.

### 6.2 LanguageContext changes

- On provider mount, `fetch site_texts` from Supabase.
- Build a map: `{ [key]: { en, uk } }`.
- `t(key)` first looks in the Supabase map; if missing, falls back to the local JSON.
- This means: every key the editor edits in the admin appears live; new keys can be added in JSON without breaking anything.

### 6.3 Component changes

| File | Change |
|---|---|
| `src/components/Leadership.tsx` | Replace hardcoded `leaders` array with `useLeaders()`. Map `name_xx` / `title_xx` based on current language. Photo URL via `supabase.storage.from('leader-photos').getPublicUrl(photo_path)`. Show skeleton while loading. |
| `src/components/Footer.tsx` | Read address / phone / service times / social URLs from `useContactInfo()`. Fallback to current `ChurchInformation` enum if missing. |
| `src/contexts/LanguageContext.tsx` | Merge Supabase texts over JSON fallback inside `t()`. |
| `src/App.tsx` | Add `/admin/*` route, lazy-loaded so admin code is not in the public bundle. |

## 7. Admin panel

### 7.1 Routes

```
/admin              → redirect to /admin/leaders (if logged in) or /admin/login
/admin/login        → email + password form
/admin/leaders      → CRUD leaders
/admin/texts        → CRUD site texts
/admin/contact      → singleton contact form
/admin/users        → list admins (phase 2, optional)
```

All admin routes are inside a `<AdminGuard>` that:
1. Reads current Supabase session.
2. If no session → redirect to `/admin/login`.
3. If session present but `auth.uid()` not in `admin_users` → show "Not authorized" + sign-out button.
4. Otherwise render the page.

Admin code lives in `src/admin/` and is dynamically imported (`React.lazy`) so it never ships in the public bundle for normal visitors.

### 7.2 Admin layout

- Left sidebar: links to Leaders, Texts, Contact, (Users), and a Sign Out button.
- Top bar: "Church of New Hope — Admin", current user email.
- Main content area: routed page.
- Tailwind for layout, simple form components, toast on save (success/error).
- Mobile: collapsible sidebar.

### 7.3 Leaders page

- Table view: thumbnail, name (en), title (en), email count, published toggle, action buttons.
- Sorted by `sort_order`. Drag handle on each row → updates `sort_order` for affected rows in a single transaction (or batch update).
- "Add leader" button → modal form.
- Edit button on each row → same modal form, prefilled.
- Delete button → confirm dialog → soft check that no other place references the row → delete + remove photo from storage.

**Leader form fields**:
- Name (English) — required
- Name (Ukrainian) — required
- Title (English) — required
- Title (Ukrainian) — required
- Emails — chip input, validated
- Photo — drag-drop area + preview; on upload writes to `leader-photos/{uuid}.{ext}`; old photo is deleted on replace
- Published — toggle, default on
- Sort order — read-only here; reordered via drag handles in the table

### 7.4 Texts page

- Texts grouped by `group` column (e.g. "home", "weBelieve", "give", "footer", "nav").
- Group accordion: clicking expands the group's rows.
- Each row: key (read-only, mono font), `value_en` textarea, `value_uk` textarea, Save button.
- Save updates one row, optimistic UI, toast.
- Search box at the top — filters rows by key or value substring.
- "Reset to default" link per row — restores from the bundled JSON (handy if editor breaks something).

No add/delete from the UI — keys are added by developers when they add new components. This prevents non-developers from polluting the key space.

### 7.5 Contact page

- Single form with all `contact_info` fields.
- Save button writes the singleton row.
- Live preview of the footer block (optional polish).

### 7.6 Users page (phase 2, optional)

- Table of `admin_users` rows.
- "Invite user" button → asks for email → calls a Supabase Edge Function (with service role key on the server side) that creates the auth user, sets a temporary password, emails it, and inserts an `admin_users` row.
- Remove button → deletes the `admin_users` row (does NOT delete `auth.users` to keep audit trail).
- Self-protection: cannot remove yourself.

For phase 1, accounts are created manually in the Supabase dashboard. The first admin runs the `add_first_admin.sql` snippet:

```sql
insert into admin_users (id, email, role)
select id, email, 'admin' from auth.users where email = 'pastor@example.com';
```

## 8. Migration / seeding

One-off TypeScript script `scripts/seed-supabase.ts`, run locally with the **service role key** (gitignored env var, never shipped):

1. Read `src/translations/en.json` + `uk.json`, recursively flatten to dot-path keys, upsert into `site_texts` (group = first key segment).
2. Read the existing hardcoded `leaders` array (copied into the script as a constant), upload each `/public/images/*.jpg` to `leader-photos/`, insert a row per leader. `name_uk` and `title_uk` are seeded equal to the English values — staff edits Ukrainian later in the admin.
3. Insert one `contact_info` row from current `ChurchInformation` enum and Footer hardcoded URLs.

The script is idempotent (uses upsert by `key` for texts, by `name_en` for leaders).

Run once: `ts-node scripts/seed-supabase.ts`. After verifying, the hardcoded leaders array can be deleted from `Leadership.tsx`.

## 9. Environment / config

`.env.local` (gitignored):

```
REACT_APP_SUPABASE_URL=https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # only for seed script, never shipped
```

`.env.example` (committed) with placeholder values.

`.gitignore` adds `.env.local` and `.env`.

The `REACT_APP_*` vars are inlined by Create React App at build time, so they're baked into the GitHub Pages build. The anon key being public is fine — RLS is the security boundary.

## 10. File layout

```
docs/
  ADMIN_SPEC.md                         (this file)

supabase/
  migrations/
    0001_init.sql                       schema, policies, triggers, helper fn
  README.md                             how to run migrations / create first admin

scripts/
  seed-supabase.ts                      one-off seeding script

src/
  lib/
    supabase.ts                         singleton client
  data/
    useLeaders.ts
    useSiteTexts.ts
    useContactInfo.ts
  contexts/
    LanguageContext.tsx                 (modified)
  components/
    Leadership.tsx                      (modified)
    Footer.tsx                          (modified)
  admin/
    AdminApp.tsx                        admin router
    AdminLayout.tsx                     sidebar + topbar
    AdminLogin.tsx
    AdminGuard.tsx
    pages/
      LeadersPage.tsx
      LeaderForm.tsx
      TextsPage.tsx
      ContactPage.tsx
    components/
      Toast.tsx
      Field.tsx
  App.tsx                               (modified — add /admin route)

.env.example
.gitignore                              (modified)
package.json                            (modified — add @supabase/supabase-js)
```

## 11. Implementation phases

1. **Spec** ← this document
2. **Schema**: write `supabase/migrations/0001_init.sql`, `.env.example`, update `.gitignore`, add `supabase/README.md`
3. **Dependency**: `npm install @supabase/supabase-js`
4. **Client + hooks**: `src/lib/supabase.ts`, `src/data/*.ts`
5. **Public migration**: update `LanguageContext`, `Leadership`, `Footer` to read from Supabase with JSON fallback (must work even when Supabase isn't configured yet — graceful)
6. **Admin shell**: `/admin` route, lazy load, login, guard, layout
7. **Leaders editor**: full CRUD + photo upload + reorder
8. **Texts editor**: grouped editor
9. **Contact editor**: singleton form
10. **Seed script**: `scripts/seed-supabase.ts`
11. **Setup README**: step-by-step for the user to create the Supabase project, run the migration, seed, create the first admin

## 12. Verification plan

- Site builds and runs locally without `.env.local` (graceful fallback to JSON).
- After Supabase setup + seeding:
  - `npm start` → public Leadership / Footer / WeBelieve render content from Supabase identical to before.
  - Login at `/admin` → reach Leaders page.
  - Edit a leader's English title, upload a new photo, drag to a new position → public page reflects after refresh.
  - Edit a `site_texts` row in both languages → switching language toggle on public site shows new values.
  - Sign out → `/admin` redirects to login.
  - Try a write from anon JS console → fails (RLS proven).
  - `npm run build && npm run deploy` → GitHub Pages build still loads from Supabase.
