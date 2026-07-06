# Admin Redesign + Ministries Feature — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebrand the whole admin panel to the church's visual identity with a reusable help-text/tooltip usability layer, then build the Tier B Ministries feature (photos, multi-photo gallery, flagship detail pages, Church Center hand-off) on top of it.

**Architecture:** React 18 CRA + TypeScript + Supabase. Part 1 builds a token-driven `admin.css` and a set of shared admin components (`Tooltip`, `Field`, `PageHeader`, `StatusPill`, `Badge`, `Switch`, `PhotoUploader`, `GalleryUploader`), then migrates the 6 existing admin pages onto them. Part 2 adds ministry media columns + storage bucket, extends the admin form, and rebuilds the public cards + a flagship detail page. Part 2 depends on Part 1's shared components.

**Tech Stack:** React 18, TypeScript 4.9, react-router-dom, framer-motion, Supabase JS, Tailwind (public site), plain CSS + CSS custom properties (admin), Jest + React Testing Library.

## Global Constraints

- **Brand tokens (verbatim from `tailwind.config.js`):** navy-900 `#0A2A46`, navy-800 `#173E5C`, navy-700 `#1D5273`, navy-600 `#2A6890`, navy-50 `#EAF1F7`; tan-500 `#B59E81`, tan-600 `#9C8769`, tan-400 `#C9B69C`, tan-50 `#F5F1EB`; cream `#FAF7F2`; ash `#E2E3E4`. Font: `Creo` (already `@font-face`-loaded in `src/index.css`; weights Light 300 + Bold 700 only — no medium).
- **Semantic colors (separate from the tan accent):** ok `#3F7D5F`, warn `#9C7A2E`, danger `#B4442F`.
- **Admin UI language: English.** Content fields stay bilingual (EN/UK). Do not translate the admin chrome.
- **No dark mode in v1.** Author `admin.css` with CSS custom properties so a theme can be added later, but ship light only.
- **Serve Team form default CTA:** `https://churchofnewhope.churchcenter.com/people/forms/922679`.
- **Visual target:** the approved mockup — https://claude.ai/code/artifact/cd1dba09-70ff-4ccc-816a-715b6042a3b4 . Match its look, spacing, and copy.
- **Repo has no test suite yet.** Add focused unit tests for logic only (helpers, tooltip behaviour, pure reorder/fallback functions). Do NOT write tests for pure-CSS/visual tasks — verify those by typecheck + running the app.
- **Verification commands:**
  - Typecheck: `npx tsc --noEmit`
  - Run one test file: `CI=true npx react-scripts test <path> --watchAll=false`
  - Production build: `CI=true npm run build`
  - Run app: `npm start` → visit `http://localhost:3000/v2/admin/...` (needs `.env.local`, already configured).
- **Commit style:** conventional commits, no `Co-Authored-By` trailer.
- **SQL rule:** every SQL script ends with a `SELECT` that shows what changed.

---

# PART 1 — Admin redesign foundation

## Task 1: Brand token layer + `admin.css` restyle

**Files:**
- Modify: `src/admin/admin.css` (rewrite around tokens; keep existing class names: `admin-root`, `admin-shell`, `admin-sidebar`, `admin-main`, `admin-field`, `admin-btn`, `admin-table`, `admin-modal`, `admin-toast*`, `upload-area`, `chip-input`, `prayer-*`, `leader-*` so existing pages keep working mid-migration).

**Interfaces:**
- Produces: CSS custom properties on `.admin-root` (`--bg`, `--surface`, `--field`, `--sidebar`, `--ink`, `--ink-2`, `--muted`, `--faint`, `--border`, `--border-strong`, `--accent`, `--accent-ink`, `--ok`, `--warn`, `--danger`, `--radius`, `--shadow`) and restyled component classes. Later tasks add classes: `.field-row`, `.field-lab`, `.field-help`, `.tip`, `.page-head`, `.status-pill`, `.badge`, `.switch`, `.gallery-*`.

- [ ] **Step 1: Rewrite the token + core layout section of `admin.css`**

Replace the top of `admin.css` with a `:root`/`.admin-root` token block using the Global Constraints hex values, then rewrite `.admin-sidebar`, `.admin-main`, `.admin-btn` (primary tan `--accent` with `--accent-ink` text; `.secondary`→ghost; `.danger`), `.admin-table` (uppercase thin headers, warm borders, row hover `color-mix(in srgb, var(--surface) 88%, var(--accent))`), `.admin-field` inputs (focus ring `0 0 0 3px color-mix(in srgb, var(--accent) 26%, transparent)`), `.admin-modal`, `.admin-toast*`, `.upload-area`, `.chip-input`. Use `font-family:'Creo',system-ui,sans-serif`. Keep every existing selector name.

- [ ] **Step 2: Typecheck (CSS-only, so just confirm nothing else broke)**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Run the app and visually verify against the mockup**

Run: `npm start`, open `http://localhost:3000/v2/admin/leaders`.
Confirm: cream page background, navy sidebar with tan active rail, tan primary buttons, Creo font, warm table styling. Existing pages still render (no missing styles).

- [ ] **Step 4: Commit**

```bash
git add src/admin/admin.css
git commit -m "style(admin): rebrand admin.css around church brand tokens"
```

## Task 2: `Tooltip` component

**Files:**
- Create: `src/admin/components/Tooltip.tsx`
- Test: `src/admin/components/Tooltip.test.tsx`
- Modify: `src/admin/admin.css` (add `.tip`, `.tip .q`, `.tip .bub` classes from the mockup)

**Interfaces:**
- Produces: `export const Tooltip: React.FC<{ text: React.ReactNode; label?: string }>` — renders a `?` button (`aria-label={label ?? 'More info'}`, `type="button"`) and a bubble containing `text`. Opens on hover, focus, and click; closes on Escape, blur, and outside click. Bubble has `role="tooltip"`.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Tooltip } from './Tooltip';

test('shows bubble on click and hides on Escape', () => {
  render(<Tooltip text="Helpful detail" />);
  const trigger = screen.getByRole('button', { name: /more info/i });
  expect(screen.queryByText('Helpful detail')).not.toBeVisible();
  fireEvent.click(trigger);
  expect(screen.getByText('Helpful detail')).toBeVisible();
  fireEvent.keyDown(trigger, { key: 'Escape' });
  expect(screen.queryByText('Helpful detail')).not.toBeVisible();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `CI=true npx react-scripts test src/admin/components/Tooltip.test.tsx --watchAll=false`
Expected: FAIL (cannot find module `./Tooltip`).

- [ ] **Step 3: Implement `Tooltip.tsx`**

```tsx
import React, { useEffect, useRef, useState } from 'react';

export const Tooltip: React.FC<{ text: React.ReactNode; label?: string }> = ({ text, label }) => {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);
  return (
    <span
      className="tip"
      ref={wrap}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="q"
        aria-label={label ?? 'More info'}
        onClick={() => setOpen((o) => !o)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
      >?</button>
      <span className="bub" role="tooltip" hidden={!open}>{text}</span>
    </span>
  );
};
```

Add `.tip`/`.q`/`.bub` styles to `admin.css` (copy from the mockup; `.bub[hidden]{display:none}` or drive visibility off `hidden`).

- [ ] **Step 4: Run test to verify it passes**

Run: `CI=true npx react-scripts test src/admin/components/Tooltip.test.tsx --watchAll=false`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/admin/components/Tooltip.tsx src/admin/components/Tooltip.test.tsx src/admin/admin.css
git commit -m "feat(admin): accessible Tooltip component"
```

## Task 3: `Field` wrapper component

**Files:**
- Create: `src/admin/components/Field.tsx`
- Test: `src/admin/components/Field.test.tsx`
- Modify: `src/admin/admin.css` (add `.field-row`, `.field-lab`, `.field-help`, `.req`, `.opt`)

**Interfaces:**
- Consumes: `Tooltip` (Task 2).
- Produces: `export const Field: React.FC<{ label: string; help?: React.ReactNode; tooltip?: React.ReactNode; required?: boolean; optional?: boolean; htmlFor?: string; children: React.ReactNode }>`. Renders label row (label + `*` if required / "Optional" chip if optional + `<Tooltip>` if tooltip), then `help` text, then children.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react';
import { Field } from './Field';

test('renders label, required marker and help text', () => {
  render(<Field label="Web address" help="Appears in the URL" required><input /></Field>);
  expect(screen.getByText('Web address')).toBeInTheDocument();
  expect(screen.getByText('*')).toBeInTheDocument();
  expect(screen.getByText('Appears in the URL')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `CI=true npx react-scripts test src/admin/components/Field.test.tsx --watchAll=false`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `Field.tsx`**

```tsx
import React from 'react';
import { Tooltip } from './Tooltip';

export const Field: React.FC<{
  label: string; help?: React.ReactNode; tooltip?: React.ReactNode;
  required?: boolean; optional?: boolean; htmlFor?: string; children: React.ReactNode;
}> = ({ label, help, tooltip, required, optional, htmlFor, children }) => (
  <div className="field-row">
    <div className="field-lab">
      <label htmlFor={htmlFor}>{label}</label>
      {required && <span className="req">*</span>}
      {optional && <span className="opt">Optional</span>}
      {tooltip && <Tooltip text={tooltip} />}
    </div>
    {help && <p className="field-help">{help}</p>}
    {children}
  </div>
);
```

Add `.field-row`/`.field-lab`/`.field-help`/`.req`/`.opt` styles to `admin.css` per the mockup.

- [ ] **Step 4: Run test to verify it passes**

Run: `CI=true npx react-scripts test src/admin/components/Field.test.tsx --watchAll=false`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/admin/components/Field.tsx src/admin/components/Field.test.tsx src/admin/admin.css
git commit -m "feat(admin): Field wrapper with label, help and tooltip"
```

## Task 4: Presentational components — `PageHeader`, `StatusPill`, `Badge`, `Switch`

**Files:**
- Create: `src/admin/components/PageHeader.tsx`, `src/admin/components/StatusPill.tsx`, `src/admin/components/Badge.tsx`, `src/admin/components/Switch.tsx`
- Test: `src/admin/components/Switch.test.tsx`
- Modify: `src/admin/admin.css` (add `.page-head`, `.status-pill`, `.badge`, `.switch`, `.sw`)

**Interfaces:**
- Produces:
  - `export const PageHeader: React.FC<{ eyebrow: string; title: string; subtitle?: string; action?: React.ReactNode }>`
  - `export const StatusPill: React.FC<{ kind: 'on' | 'off' | 'warn'; children: React.ReactNode }>`
  - `export const Badge: React.FC<{ children: React.ReactNode; tone?: 'lang' | 'neutral' }>`
  - `export const Switch: React.FC<{ checked: boolean; onChange: (v: boolean) => void; title: string; description?: React.ReactNode }>`

- [ ] **Step 1: Write the failing test (Switch carries the only logic)**

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Switch } from './Switch';

test('Switch toggles and reflects checked state', () => {
  const onChange = jest.fn();
  const { rerender } = render(<Switch checked={false} onChange={onChange} title="Active" />);
  const btn = screen.getByRole('switch');
  expect(btn).toHaveAttribute('aria-checked', 'false');
  fireEvent.click(btn);
  expect(onChange).toHaveBeenCalledWith(true);
  rerender(<Switch checked onChange={onChange} title="Active" />);
  expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `CI=true npx react-scripts test src/admin/components/Switch.test.tsx --watchAll=false`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement the four components**

`Switch.tsx`:
```tsx
import React from 'react';
export const Switch: React.FC<{ checked: boolean; onChange: (v: boolean) => void; title: string; description?: React.ReactNode }> =
  ({ checked, onChange, title, description }) => (
  <div className="switch">
    <button type="button" role="switch" aria-checked={checked}
      className={`sw${checked ? '' : ' off'}`} onClick={() => onChange(!checked)} />
    <div className="tx"><div className="t">{title}</div>{description && <div className="d">{description}</div>}</div>
  </div>
);
```
`PageHeader.tsx`:
```tsx
import React from 'react';
export const PageHeader: React.FC<{ eyebrow: string; title: string; subtitle?: string; action?: React.ReactNode }> =
  ({ eyebrow, title, subtitle, action }) => (
  <div className="page-head">
    <div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{subtitle && <p className="page-sub">{subtitle}</p>}</div>
    {action}
  </div>
);
```
`StatusPill.tsx`:
```tsx
import React from 'react';
export const StatusPill: React.FC<{ kind: 'on' | 'off' | 'warn'; children: React.ReactNode }> =
  ({ kind, children }) => <span className={`status-pill ${kind}`}><span className="dot" />{children}</span>;
```
`Badge.tsx`:
```tsx
import React from 'react';
export const Badge: React.FC<{ children: React.ReactNode; tone?: 'lang' | 'neutral' }> =
  ({ children, tone = 'neutral' }) => <span className={`badge ${tone}`}>{children}</span>;
```
Add matching styles to `admin.css` from the mockup (`.page-head`, `.eyebrow`, `.page-sub`, `.status-pill.on/.off/.warn`, `.badge.lang`, `.switch`, `.sw`).

- [ ] **Step 4: Run test to verify it passes**

Run: `CI=true npx react-scripts test src/admin/components/Switch.test.tsx --watchAll=false`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/admin/components/PageHeader.tsx src/admin/components/StatusPill.tsx src/admin/components/Badge.tsx src/admin/components/Switch.tsx src/admin/components/Switch.test.tsx src/admin/admin.css
git commit -m "feat(admin): PageHeader, StatusPill, Badge, Switch components"
```

## Task 5: `PhotoUploader` (extract shared single-photo upload) + refactor LeaderForm

**Files:**
- Create: `src/admin/components/PhotoUploader.tsx`
- Modify: `src/admin/pages/LeaderForm.tsx:39-207` (replace inline upload/preview/remove with `<PhotoUploader>`)
- Modify: `src/lib/supabase.ts` (generalize URL helper — see Interfaces)

**Interfaces:**
- Consumes: `supabase`, storage helpers.
- Produces: `export const PhotoUploader: React.FC<{ value: string | null; bucket: string; onChange: (path: string | null) => void; label?: string; help?: React.ReactNode; shape?: 'square' | 'wide' }>`. Uploads a single file to `bucket` (random-uuid filename, like current LeaderForm), calls `onChange(path)`; supports Replace/Remove (deletes from storage only when the path is a bucket key, not a `/` or `http` path). Renders preview via `storagePublicUrl(bucket, value)`.
- Produces in `supabase.ts`: `export function storagePublicUrl(bucket: string, path: string | null | undefined): string` (generalization of `leaderPhotoUrl`); keep `leaderPhotoUrl` as a thin wrapper calling it with `LEADER_PHOTOS_BUCKET`.

- [ ] **Step 1: Add `storagePublicUrl` to `supabase.ts`, keep `leaderPhotoUrl` wrapper**

```ts
export function storagePublicUrl(bucket: string, photoPath: string | null | undefined): string {
  if (!photoPath) return '/images/placeholder.png';
  if (photoPath.startsWith('http') || photoPath.startsWith('/')) return photoPath;
  if (!supabase) return '/images/placeholder.png';
  return supabase.storage.from(bucket).getPublicUrl(photoPath).data.publicUrl;
}
export function leaderPhotoUrl(photoPath: string | null | undefined): string {
  return storagePublicUrl(LEADER_PHOTOS_BUCKET, photoPath);
}
```

- [ ] **Step 2: Implement `PhotoUploader.tsx`** (lift the `handleFile`/`removePhoto`/upload-area JSX out of `LeaderForm.tsx:39-207`, parameterized by `bucket`; use `storagePublicUrl(bucket, value)` for the preview).

- [ ] **Step 3: Refactor `LeaderForm` to use `<PhotoUploader value={form.photo_path ?? null} bucket={LEADER_PHOTOS_BUCKET} onChange={(p) => update('photo_path', p)} />`** and delete the now-dead inline upload code/state.

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Verify leaders still work in the app**

Run: `npm start`, open `/v2/admin/leaders`, edit a leader, upload/replace/remove a photo. Confirm the photo saves and displays.

- [ ] **Step 6: Commit**

```bash
git add src/admin/components/PhotoUploader.tsx src/admin/pages/LeaderForm.tsx src/lib/supabase.ts
git commit -m "refactor(admin): shared PhotoUploader + storagePublicUrl helper"
```

## Task 6: `GalleryUploader` (multi-file, reorder, remove)

**Files:**
- Create: `src/admin/components/GalleryUploader.tsx`
- Create: `src/admin/components/moveItem.ts` (pure reorder helper)
- Test: `src/admin/components/moveItem.test.ts`
- Modify: `src/admin/admin.css` (add `.gallery-grid`, `.g-item`, `.g-ord`, `.g-rm`, `.g-mv`, `.g-add`)

**Interfaces:**
- Consumes: `supabase`, `storagePublicUrl` (Task 5).
- Produces:
  - `export function moveItem<T>(arr: T[], from: number, to: number): T[]` — returns a new array with the item moved; clamps out-of-range `to`.
  - `export const GalleryUploader: React.FC<{ value: string[]; bucket: string; onChange: (paths: string[]) => void }>` — `<input type="file" multiple>` + drop zone; uploads each selected file to `bucket` and appends its path; thumbnail grid with order number, remove (×), and ↑/↓ buttons (using `moveItem`); first item is the lead image.

- [ ] **Step 1: Write the failing test for `moveItem`**

```ts
import { moveItem } from './moveItem';

test('moveItem moves an element and returns a new array', () => {
  const a = ['x', 'y', 'z'];
  expect(moveItem(a, 0, 1)).toEqual(['y', 'x', 'z']);
  expect(moveItem(a, 2, 0)).toEqual(['z', 'x', 'y']);
  expect(moveItem(a, 0, 5)).toEqual(['y', 'z', 'x']); // clamps
  expect(a).toEqual(['x', 'y', 'z']); // original untouched
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `CI=true npx react-scripts test src/admin/components/moveItem.test.ts --watchAll=false`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `moveItem.ts`**

```ts
export function moveItem<T>(arr: T[], from: number, to: number): T[] {
  const next = arr.slice();
  const clamped = Math.max(0, Math.min(to, next.length - 1));
  const [item] = next.splice(from, 1);
  next.splice(clamped, 0, item);
  return next;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `CI=true npx react-scripts test src/admin/components/moveItem.test.ts --watchAll=false`
Expected: PASS.

- [ ] **Step 5: Implement `GalleryUploader.tsx`** using `moveItem` for reorder, per-file upload loop (reuse the random-uuid upload pattern), remove via `onChange(value.filter(...))`, thumbnails via `storagePublicUrl(bucket, path)`. Match the mockup's `.gallery-grid`/`.g-item` markup. Add the CSS.

- [ ] **Step 6: Typecheck + visual check**

Run: `npx tsc --noEmit` (expect clean). Defer live upload verification to Task 12 (used there first).

- [ ] **Step 7: Commit**

```bash
git add src/admin/components/GalleryUploader.tsx src/admin/components/moveItem.ts src/admin/components/moveItem.test.ts src/admin/admin.css
git commit -m "feat(admin): GalleryUploader with multi-file upload and reorder"
```

## Task 7: Restyle `AdminLayout` + `AdminLogin`

**Files:**
- Modify: `src/admin/AdminLayout.tsx` (brand lockup, nav icons, active tan rail, user + sign-out footer)
- Modify: `src/admin/AdminLogin.tsx` (brand-styled card)
- Modify: `src/admin/admin.css` (`.brand`, `.nav`, `.side-foot`, `.admin-login*` per mockup)

**Interfaces:**
- Consumes: nothing new. Keep the existing `NavLink` routes and `signOut` logic unchanged.

- [ ] **Step 1: Update `AdminLayout.tsx`** — add the brand lockup ("Church of New Hope / Admin"), inline SVG icons per nav item (Leaders/Sermons/Ministries/Prayer/Texts/Contact), and a footer with the signed-in email + sign-out. Keep `NavLink to` targets and `active` class logic.

- [ ] **Step 2: Update `AdminLogin.tsx`** — apply brand card styling (keep the `signInWithPassword` logic and error handling exactly).

- [ ] **Step 3: Add `.brand`/`.nav`/`.side-foot`/login styles to `admin.css`** from the mockup.

- [ ] **Step 4: Typecheck + visual check**

Run: `npx tsc --noEmit` (clean). `npm start` → `/v2/admin/login` then the shell; confirm they match the mockup and login still works.

- [ ] **Step 5: Commit**

```bash
git add src/admin/AdminLayout.tsx src/admin/AdminLogin.tsx src/admin/admin.css
git commit -m "style(admin): rebrand shell, sidebar and login"
```

## Task 8: Migrate the 5 non-ministry pages onto the shared components + help copy

One task per page (independently reviewable). For each: add `<PageHeader>`, move inputs into `<Field>` with the help/tooltip copy from the admin spec §4.5, swap ad-hoc buttons/badges/toggles for `Badge`/`StatusPill`/`Switch`, keep all data logic unchanged. Verify each with `npx tsc --noEmit` + a run-through in the app, then commit `style(admin): migrate <page> onto shared components`.

- [ ] **Task 8a — Leaders** (`LeadersPage.tsx`, `LeaderForm.tsx`): PageHeader ("Leadership" / "The people shown on the Leadership page. Drag to reorder."); Field help for photo, emails, sort order (tooltip), published→`Switch`.
- [ ] **Task 8b — Sermons** (`SermonsPage.tsx`): PageHeader; Field help + tooltip for the YouTube ID/URL fields and sync; date; published→`Switch`.
- [ ] **Task 8c — Prayer requests** (`PrayerRequestsPage.tsx`): PageHeader; explain the status tabs; tooltip on "share with team" (who can see it). Keep the existing prayer-card styling but reconcile it with the new tokens.
- [ ] **Task 8d — Texts** (`TextsPage.tsx`): PageHeader; a one-line explanation that each key controls a piece of site copy and both languages should be filled.
- [ ] **Task 8e — Contact info** (`ContactPage.tsx`): PageHeader; Field help for service times, address, and the social URL formats.

---

# PART 2 — Ministries feature (built on Part 1)

## Task 9: Migration `0005_ministries_media.sql`

**Files:**
- Create: `supabase/migrations/0005_ministries_media.sql`

**Interfaces:**
- Produces DB columns on `ministries`: `photo_path text`, `gallery text[] not null default '{}'`, `audience_en/_uk text not null default ''`, `language text not null default 'bilingual' check (language in ('en','uk','bilingual'))`, `long_description_en/_uk text not null default ''`, `leader_name text not null default ''`, `leader_role_en/_uk text not null default ''`, `location_en/_uk text not null default ''`, `cta_url text not null default ''`, `cta_label_en/_uk text not null default ''`, `is_featured boolean not null default false`. Plus storage bucket `ministry-photos` with public-read + `can_edit_content()` write RLS (mirror the `leader-photos` policies in `0003`/`0001`).

- [ ] **Step 1: Write the migration** — `alter table ministries add column if not exists ...` for every column above; `insert into storage.buckets (id, name, public) values ('ministry-photos','ministry-photos', true) on conflict do nothing;`; four `storage.objects` policies mirroring the leader-photos ones but gated by `bucket_id = 'ministry-photos'` and `can_edit_content()`; end with `select column_name, data_type, column_default from information_schema.columns where table_name = 'ministries' order by ordinal_position;`.

- [ ] **Step 2: Apply it in Supabase** (dashboard → SQL editor → paste → Run) and confirm the final `SELECT` lists the new columns. (This is a manual step — the repo has no migration runner.)

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0005_ministries_media.sql
git commit -m "feat(db): ministries media columns + ministry-photos bucket"
```

## Task 10: Extend `MinistryRow` type + `ministryPhotoUrl` helper

**Files:**
- Modify: `src/data/types.ts:64-77` (add the new fields to `MinistryRow`)
- Modify: `src/lib/supabase.ts` (add bucket const + helper)
- Test: `src/lib/ministryPhotoUrl.test.ts`

**Interfaces:**
- Consumes: `storagePublicUrl` (Task 5).
- Produces: extended `MinistryRow` (all Task 9 columns, with `language: 'en' | 'uk' | 'bilingual'`, `gallery: string[]`, `is_featured: boolean`, `photo_path: string | null`); `export const MINISTRY_PHOTOS_BUCKET = 'ministry-photos'`; `export function ministryPhotoUrl(path: string | null | undefined): string` → `storagePublicUrl(MINISTRY_PHOTOS_BUCKET, path)`.

- [ ] **Step 1: Write the failing test**

```ts
import { ministryPhotoUrl } from './supabase';

test('ministryPhotoUrl passes through absolute paths and urls', () => {
  expect(ministryPhotoUrl('/images/x.png')).toBe('/images/x.png');
  expect(ministryPhotoUrl('https://cdn/x.png')).toBe('https://cdn/x.png');
  expect(ministryPhotoUrl(null)).toBe('/images/placeholder.png');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `CI=true npx react-scripts test src/lib/ministryPhotoUrl.test.ts --watchAll=false`
Expected: FAIL (no `ministryPhotoUrl` export).

- [ ] **Step 3: Add the type fields + `MINISTRY_PHOTOS_BUCKET` + `ministryPhotoUrl`.**

- [ ] **Step 4: Run test to verify it passes**

Run: `CI=true npx react-scripts test src/lib/ministryPhotoUrl.test.ts --watchAll=false`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/types.ts src/lib/supabase.ts src/lib/ministryPhotoUrl.test.ts
git commit -m "feat(ministries): extend MinistryRow type + ministryPhotoUrl helper"
```

## Task 11: `pickLang` bilingual-fallback helper

**Files:**
- Create: `src/utils/pickLang.ts`
- Test: `src/utils/pickLang.test.ts`

**Interfaces:**
- Produces: `export function pickLang(lang: 'en' | 'uk', en: string, uk: string): string` — returns the active-language string, falling back to the other when the active one is empty/whitespace; returns `''` only if both are empty.

- [ ] **Step 1: Write the failing test**

```ts
import { pickLang } from './pickLang';

test('pickLang prefers active language, falls back when empty', () => {
  expect(pickLang('uk', 'Hello', 'Привіт')).toBe('Привіт');
  expect(pickLang('uk', 'Hello', '')).toBe('Hello');      // fallback
  expect(pickLang('en', '', 'Привіт')).toBe('Привіт');    // fallback
  expect(pickLang('en', '', '')).toBe('');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `CI=true npx react-scripts test src/utils/pickLang.test.ts --watchAll=false`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `pickLang.ts`**

```ts
export function pickLang(lang: 'en' | 'uk', en: string, uk: string): string {
  const active = lang === 'uk' ? uk : en;
  const other = lang === 'uk' ? en : uk;
  return active.trim() ? active : other;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `CI=true npx react-scripts test src/utils/pickLang.test.ts --watchAll=false`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/pickLang.ts src/utils/pickLang.test.ts
git commit -m "feat(ministries): pickLang bilingual fallback helper"
```

## Task 12: Rebuild the Ministries admin form

**Files:**
- Modify: `src/admin/pages/MinistriesPage.tsx` (rewrite `MinistryForm`, extend list)

**Interfaces:**
- Consumes: `Field`, `PageHeader`, `StatusPill`, `Badge`, `Switch`, `PhotoUploader`, `GalleryUploader`, `MINISTRY_PHOTOS_BUCKET`, extended `MinistryRow`, `moveItem` (via GalleryUploader).
- Produces: an admin form whose saved payload includes all Task 9 columns.

- [ ] **Step 1: Rewrite `MinistryForm`** into the mockup's sections using `<Field>` for every input with the help/tooltip copy from the ministries spec §6 table: Basics (slug, name EN/UK), On the card (audience EN/UK, language `<select>`, meeting, short description EN/UK), Photos (`<PhotoUploader bucket={MINISTRY_PHOTOS_BUCKET}>` for `photo_path` + `<GalleryUploader bucket={MINISTRY_PHOTOS_BUCKET}>` for `gallery`), Flagship page (`<Switch>` for `is_featured` + leader name, leader role EN/UK, long description EN/UK), Call to action (`cta_url` defaulting to the Serve Team constant + `cta_label_en/_uk`), Visibility (`<Switch>` for `is_published`, labelled "Active"). Extend the save `payload` to persist all new columns.

- [ ] **Step 2: Update the list** — add `PageHeader` ("Church life" / "Ministries" / subtitle), a photo/icon thumb column, a language `Badge`, a `StatusPill` for active/hidden, and a `★` for featured (mirror the mockup table).

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Verify end-to-end in the app**

Run: `npm start` → `/v2/admin/ministries`. Add a ministry: fill fields, upload a card photo, upload **several** gallery photos, reorder them, toggle flagship + active, save. Re-open it and confirm everything persisted (including gallery order).

- [ ] **Step 5: Commit**

```bash
git add src/admin/pages/MinistriesPage.tsx
git commit -m "feat(ministries): admin form with photos, gallery, flagship and CTA"
```

## Task 13: Extend the public ministry cards

**Files:**
- Modify: `src/pages/Ministries.tsx` (map new fields; extend `MinistryCard`)

**Interfaces:**
- Consumes: `ministryPhotoUrl`, `pickLang`, extended `MinistryRow`, `useMinistries`, `useLanguage`.
- Produces: `dbItems` mapping that includes `photo` (`ministryPhotoUrl(m.photo_path)` when set), `audience`, `language`, `isFeatured`, `slug`, `ctaUrl` (falling back to the Serve Team constant), `ctaLabel`.

- [ ] **Step 1: Extend the `MinistryItem` interface + `dbItems` mapping** to carry `photo`, `audience`, `language`, `isFeatured`, `slug`, `ctaUrl`, `ctaLabel`, using `pickLang` for bilingual fields.

- [ ] **Step 2: Update `MinistryCard`** — show the photo (uniform 4:3 + overlay) or the icon fallback, the audience line, a language `Badge`, and one action: featured → `Link` to `/v2/${lang}/ministries/${slug}` ("Learn more →"); non-featured → external `<a>` to `ctaUrl` (`target="_blank" rel="noopener noreferrer"`, label = `ctaLabel` or the `ministries.contact` text). Keep the existing framer-motion + Tailwind card style.

- [ ] **Step 3: Typecheck + visual check**

Run: `npx tsc --noEmit` (clean). `npm start` → `/v2/en/ministries`; confirm real DB ministries now show photos/badges and the correct action per card. Keep the `getSampleMinistries` fallback for the empty-DB case.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Ministries.tsx
git commit -m "feat(ministries): photo, audience, language badge and CTA on cards"
```

## Task 14: Flagship detail page + route

**Files:**
- Create: `src/pages/MinistryDetail.tsx`
- Modify: `src/App.tsx:58` (add `<Route path="/v2/:lang/ministries/:slug" element={<MinistryDetail />} />` after the ministries route)
- Modify: `src/data/useMinistries.ts` (add a `useMinistry(slug)` selector that returns the row from the loaded list, or null)

**Interfaces:**
- Consumes: `useMinistries`/`useMinistry`, `ministryPhotoUrl`, `pickLang`, `PhotoLightbox` (from `src/components/Leadership.tsx` — export it if not already exported), `useLanguage`, `useParams`, `Navigate`.
- Produces: `export function useMinistry(slug: string): { data: MinistryRow | null; loading: boolean }`.

- [ ] **Step 1: Export `PhotoLightbox`** from `src/components/Leadership.tsx` if it is not already exported (add `export` to the component). Confirm its props (image list + index) so the detail page can reuse it; if its current props are leader-specific, add a minimal generic prop path or wrap it.

- [ ] **Step 2: Add `useMinistry(slug)`** to `useMinistries.ts` (filters the cached/loaded list by slug).

- [ ] **Step 3: Implement `MinistryDetail.tsx`** — hero (`ministryPhotoUrl(photo_path)`), name/audience/meeting/location, long description (`pickLang`), leader name + role, a gallery of `gallery` paths via `PhotoLightbox`, and the CTA button (`cta_url` or Serve Team default). If the ministry is missing or `!is_featured`, `return <Navigate to={`/v2/${lang}/ministries`} replace />`.

- [ ] **Step 4: Add the route** to `App.tsx` (lazy or direct import consistent with siblings).

- [ ] **Step 5: Typecheck + visual check**

Run: `npx tsc --noEmit` (clean). `npm start` → click a featured ministry's "Learn more"; confirm the detail page renders, the gallery lightbox opens with arrow navigation, and the CTA links to Church Center. Visit a non-featured slug directly and confirm the redirect.

- [ ] **Step 6: Commit**

```bash
git add src/pages/MinistryDetail.tsx src/App.tsx src/data/useMinistries.ts src/components/Leadership.tsx
git commit -m "feat(ministries): flagship detail page with gallery lightbox"
```

## Task 15: Translation keys for new public strings

**Files:**
- Modify: `src/translations/*` (the EN + UK translation sources)

**Interfaces:**
- Produces: keys used by Tasks 13–14, e.g. `ministries.learnMore` ("Learn more" / "Дізнатися більше"), `ministries.detail.leader` ("Ministry lead" / "Керівник служіння"), `ministries.detail.meets`, `ministries.detail.gallery`. Reuse the existing `ministries.contact` for the default CTA label.

- [ ] **Step 1: Locate the translation files** (`grep -rn "ministries.contact" src/translations`) and add the new keys in both languages, matching the existing structure.

- [ ] **Step 2: Swap any hardcoded English strings** added in Tasks 13–14 for `t('...')` calls.

- [ ] **Step 3: Typecheck + visual check** both languages (`/v2/en/...` and `/v2/uk/...`).

Run: `npx tsc --noEmit` (clean).

- [ ] **Step 4: Final build**

Run: `CI=true npm run build`
Expected: build succeeds with no type errors.

- [ ] **Step 5: Commit**

```bash
git add src/translations
git commit -m "feat(ministries): EN/UK strings for cards and detail page"
```

---

## Self-review notes

- **Spec coverage:** admin tokens/typography/components (Tasks 1–7) ↔ admin spec §3–5; usability layer Tooltip/Field/page-intros (Tasks 2–4, 8) ↔ admin spec §4; per-page migration (Task 8) ↔ admin spec §4.5/§6; ministries columns/bucket/RLS (Task 9) ↔ ministries spec §7; helpers (Tasks 10–11) ↔ §8; admin form + gallery (Tasks 6, 12) ↔ §6; public cards (Task 13) ↔ §5.1; detail page (Task 14) ↔ §5.2; bilingual fallback (Task 11, used in 13–14) ↔ §5.3; i18n (Task 15).
- **Deferred/again-not-in-scope:** dark mode (admin spec non-goal); drag-reorder for the gallery (↑/↓ only — spec says drag is optional).
- **Manual step:** Task 9 migration is applied via the Supabase dashboard (no migration runner in the repo).
- **Interface consistency:** `storagePublicUrl(bucket, path)` (Task 5) is the one URL helper; `leaderPhotoUrl`/`ministryPhotoUrl` wrap it. `moveItem` (Task 6) is the single reorder function. `pickLang` (Task 11) is the single bilingual-fallback function.
