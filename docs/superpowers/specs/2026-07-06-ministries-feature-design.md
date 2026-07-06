# Ministries feature — design spec

- **Date:** 2026-07-06
- **Status:** Approved (pending final spec review)
- **Scope:** Tier B — card grid + flagship detail pages + Church Center hand-off
- **Relates to:** [[cnh-architecture-decisions]], PR 1 pre-merge blockers, the Admin redesign spec (this feature's admin UI is built on it)

## 1. Problem / current state

Ministries are already managed in the admin (`/v2/admin` → Ministries: bilingual name/description, meeting info, contact email, Font-Awesome icon, sort order, published toggle). Confirmed gaps:

1. **No photo support.** The `ministries` table has no image column and the admin form has no upload — only an `icon` text field. The attractive ministry photos currently visible on the site are **not real data**: they are 8 hardcoded sample cards (Unsplash stock) in `getSampleMinistries()` shown only while the DB is empty. Real ministries render with a bare icon.
2. **Dead end on click.** A ministry is a purely informational card (name, description, meeting time, optional `mailto:`). There is no detail page — `slug` is stored but unused for routing. Clicking a ministry does nothing.
3. **No real next step.** The only action is a `mailto:` to `contact_email`, which exposes personal email to spam and captures nothing.

This fails the core job of a ministries page: a visitor should finish it knowing **not just what exists, but what to do next**.

## 2. Goals / non-goals

**Goals**
- Let a visitor picture themselves belonging, then take **one clear next step**.
- Give admins real photo support: one card photo per ministry + a **multi-photo gallery** for flagships.
- Add lightweight **detail pages for 3–5 flagship ministries only**.
- Hand the "join" action off to the church's existing **Church Center** forms/groups — no custom form.
- Keep the page **maintainable by a non-technical volunteer** (data-driven records, active/inactive toggle, icon fallback, short bilingual copy).

**Non-goals (YAGNI)**
- No custom "I'm interested" form writing to Supabase, no email-sending backend. (Church Center already does this and is already monitored.)
- No detail page for every ministry (that is how small churches accumulate stale, empty pages).
- No sync/integration with Church Center Groups API — we only **link out**.
- No per-ministry analytics.

## 3. Role of Ministries vs. existing Church Center stack

Division of labor — **our site is the discovery/showcase layer; the action happens in Church Center**, which the church already maintains. Evidence Church Center is the system of record for "get involved":

- Forms page links to Serve Team (`922679`), Connect Card (`922690`), Membership (`1092931`).
- Groups (`churchcenter.com/groups`) is linked from header, footer, home.
- Events embeds the Church Center calendar; Give uses the Church Center giving modal.

So a ministry's call-to-action is a **link** to the appropriate Church Center destination (default: the Serve Team form), exactly like `Forms.tsx` already does. A ministry that is really a small group links to that group instead. We never duplicate Church Center; we route to it.

## 4. User scenarios

- **Newcomer:** "Is there something here for me / my kids / my language?" → scans the card grid, filtered visually by audience + language badge → opens a flagship detail page → clicks the CTA into Church Center.
- **Existing attender:** "How do I go from sitting to serving?" → finds the ministry → CTA → Serve Team form.

## 5. Public UX

### 5.1 `/v2/:lang/ministries` — card grid (existing style, extended)
Each card shows: **photo or icon fallback**, name, an **audience line** ("Kids · Youth · Everyone"), meeting day/time, a **language badge** (EN / UK / Bilingual), and **one primary action**:

- **Featured ministry:** the card links to its detail page — `Learn more →`. (The Church Center CTA lives on the detail page.)
- **Non-featured ministry:** the card shows the CTA button directly (`cta_label` → `cta_url`, defaulting to the Serve Team form).

One action per card (no competing buttons). Photo treatment is uniform: 4:3 aspect, subtle brand-color overlay; missing photo → clean branded icon (never stock mixed with real photos).

### 5.2 `/v2/:lang/ministries/:slug` — flagship detail page (only when `is_featured`)
Hero photo (`photo_path`), long bilingual description, leader first name + role, schedule + location, a **photo gallery** rendered with the existing `PhotoLightbox` (keyboard arrows / prev-next already built for leaders), and the prominent **CTA button** → Church Center. Unknown/non-featured slug → redirect to `/v2/:lang/ministries`.

### 5.3 Bilingual rendering
Every must-have field (name, audience, short description) stored in EN + UK. **Fallback:** if the active-language value is empty, render the other language rather than a blank. Long description / leader role may stay single-language.

## 6. Admin UX (extend existing `MinistriesPage` form)

Built on the **Admin redesign** system: the interface stays **English**, every field uses the shared `Field` wrapper (label + one-line help + optional `?` tooltip), and the multi-file gallery uploader is the shared component from that spec. Grouped into sections: Basics · On the card · Photos · Flagship page · Call to action · Visibility.

- **Card photo:** drag-and-drop single upload — reuse the exact `LeaderForm` pattern (upload to Storage, store path, `Replace` / `Remove`).
- **Gallery (flagships):** **multi-file** upload — `<input multiple>` + drop several files at once; each file uploaded in a loop via the same helper; **thumbnail grid**; per-thumbnail **remove (×)** and **reorder via ↑/↓ buttons** (drag-reorder is an optional nice-to-have, not required); order persisted as an ordered `text[]`.
- **New fields:** audience (EN/UK), language (select: EN / UK / Bilingual), long description (EN/UK), leader name, leader role (EN/UK), location (EN/UK).
- **CTA:** `cta_url` (pre-filled with the Serve Team form as the default) + optional button label (EN/UK; empty → "I'm interested" / "Мені цікаво").
- **Toggles:** `is_featured` (enables the detail page + gallery) and existing `is_published` re-labeled **Active/Inactive** (pause = disappears from the site without deletion).

**Help text & tooltips (English copy, per the mockup):**

| Field | One-line help | Tooltip (?) |
|---|---|---|
| Slug | Appears in the page address: `churchofnewhope.org/ministries/childrens-ministry` | Short, lowercase, words joined by dashes. Change it and old links stop working. |
| Language | What language this ministry runs in. | Shown as a badge so families can tell if a group is in English, Ukrainian, or both. |
| Gallery | Add several photos at once; drag the number to reorder, the first is the lead image. | Gallery photos show on the ministry's own page. Only flagship ministries show a gallery. |
| Flagship | When on, the leader/long-description/gallery show on a dedicated page. | Flagships get a full page with gallery, leader, schedule, longer story. Keep to a handful so pages don't go stale. |
| CTA link | Where the button sends people. Defaults to your Serve Team form. | Paste a Church Center link — a form, a group, or the Serve Team form. Blank = Serve Team form. |
| Active | Turn off to hide from the site without deleting it. | — |

## 7. Data model & migration

New migration `supabase/migrations/0005_ministries_media.sql`. Add to `ministries`:

| Column | Type | Notes |
|---|---|---|
| `photo_path` | `text` null | card / hero photo (Storage path, or `/images/…`, or full URL) |
| `gallery` | `text[]` not null default `'{}'` | ordered Storage paths for flagship gallery |
| `audience_en` / `audience_uk` | `text` not null default `''` | "who it's for" |
| `language` | `text` not null default `'bilingual'` | check in (`'en'`,`'uk'`,`'bilingual'`) |
| `long_description_en` / `_uk` | `text` not null default `''` | detail page body |
| `leader_name` | `text` not null default `''` | first name only (privacy) |
| `leader_role_en` / `_uk` | `text` not null default `''` | |
| `location_en` / `_uk` | `text` not null default `''` | optional |
| `cta_url` | `text` not null default `''` | Church Center link; empty → Serve Team default constant |
| `cta_label_en` / `_uk` | `text` not null default `''` | empty → default label |
| `is_featured` | `boolean` not null default `false` | flagship → detail page |

`contact_email` is kept for backward-compat but no longer the primary action. Existing `icon` stays as the photo fallback. Migration ends with a `SELECT` showing the altered columns (project rule: SQL scripts must show what changed).

**Storage:** new bucket `ministry-photos`, RLS mirroring `leader-photos` (public read; insert/update/delete gated by `can_edit_content()`). Add a `MINISTRY_PHOTOS_BUCKET` constant + `ministryPhotoUrl()` helper alongside the leader equivalents in `lib/supabase.ts`.

**Table RLS** is unchanged (public read; editors write via `can_edit_content()`).

## 8. Reuse map (keep the build cheap)

- **Photo upload** → copy `LeaderForm` `handleFile` / upload-area / remove logic.
- **Gallery lightbox** → reuse `PhotoLightbox` from `components/Leadership.tsx`.
- **Card + grid + motion** → existing `Ministries.tsx` `MinistryCard`.
- **CTA link pattern** → existing `Forms.tsx` external-link card (`target="_blank" rel="noopener noreferrer"`).
- **Data hook** → extend `useMinistries` (already loads all published rows; detail page filters by slug client-side — no new query).
- **Public URL helper** → mirror `leaderPhotoUrl`.

## 9. Edge cases / weak spots

- **Uneven photo quality** → enforced uniform aspect + overlay; icon fallback for missing photos.
- **Church Center links rot** if a form is deleted/recreated in PCO → links live in admin, editable in seconds; never hardcoded per-ministry in code.
- **Empty `cta_url`** → falls back to the Serve Team form constant so no ministry is a dead end.
- **Ministry vs. group confusion** → admin points a group-like ministry's `cta_url` at the specific Church Center group, not the generic Serve Team form.
- **Language fallback** → never render a blank; show the other language.
- **Sample data** → keep `getSampleMinistries()` fallback for empty-DB previews, but real rows always win.

## 10. Open questions (non-blocking)

- Which ministries are flagships — decided at content-fill time via the `is_featured` toggle; not needed to build.
- Whether "main" gallery photo is a separate field or just `gallery[0]` — default: `photo_path` is the card/hero image; `gallery` is the extra detail-page images shown after it.

## 11. Rollout

Incremental within Tier B:
1. Migration + Storage bucket + types/helpers.
2. Admin: card photo + new text fields + toggles.
3. Admin: multi-photo gallery upload.
4. Public: extended cards (photo, audience, language badge, CTA).
5. Public: flagship detail page + gallery lightbox.
