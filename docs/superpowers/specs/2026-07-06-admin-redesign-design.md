# Admin panel redesign + usability — design spec

- **Date:** 2026-07-06
- **Status:** Direction approved via mockup (pending final spec review)
- **Visual reference:** brand-aligned mockup — https://claude.ai/code/artifact/cd1dba09-70ff-4ccc-816a-715b6042a3b4
- **Relates to:** [[cnh-architecture-decisions]], the Ministries feature spec (built on this system)

## 1. Problem / current state

The admin (`src/admin`, 6 pages: Leaders, Sermons, Ministries, Prayer requests, Texts, Contact) works but has two problems the user called out:

1. **Off-brand.** The public v2 site is navy / tan / cream with the Creo display face and wide-tracked caps. The admin is a generic dark-navy-sidebar + sky-blue (`#0ea5e9`) dashboard in the system font (`admin.css`). It reads like a different, borrowed tool.
2. **Not self-explanatory.** Across the whole admin there are ~12 `placeholder`/`title` attributes, **no tooltip component, and no explanatory text under any field**. A non-technical volunteer cannot tell what `slug`, `icon (Font Awesome)`, `sort order`, or `meeting info` mean — and the Ministries feature adds more unfamiliar fields (`flagship`, `language`, `CTA link`).

**Decision (user):** full brand-aligned redesign of the whole admin **plus** a usability layer (a one-line hint under every field + a `?` tooltip for the tricky ones). Admin interface language stays **English**. Approved via the mockup above.

## 2. Goals / non-goals

**Goals**
- One brand-aligned visual system across all 6 admin pages + login, using the existing brand tokens (navy/tan/cream + Creo).
- A **reusable usability layer**: a `Tooltip` and a `Field` wrapper so every field can carry a label, required/optional marker, one-line help, and an optional tooltip — consistently.
- **Explanatory copy on every page**: a page intro (what this screen controls) + per-field help text, in plain English.
- Accessible: visible focus, keyboard-reachable tooltips, contrast on both light ground and navy sidebar, reduced-motion respected.
- Ministries feature is built **on top of** this system (no rework).

**Non-goals (YAGNI)**
- No change to admin **behaviour**, data, auth, or routing — this is presentation + copy only.
- No translation of the admin UI (English stays; content fields remain bilingual as today).
- **No dark mode in v1.** The token system is theme-ready (the mockup demonstrates both), but shipping/QAing dark mode is deferred. Light (brand) only for now.
- No new admin pages or features beyond Ministries (its own spec).

## 3. Design system

### 3.1 Tokens (add to `admin.css` as CSS custom properties)
From the brand book (`tailwind.config.js`):
- **Ground:** cream `#FAF7F2`; surfaces white; subtle navy tint `#EAF1F7`.
- **Ink:** navy-900 `#0A2A46` (headings), navy-700 `#1D5273` (body/links), warm grey `#8C8375` (muted), `#B4AC9E` (faint).
- **Accent:** tan-500 `#B59E81` (primary buttons, active nav, highlights), tan-600 `#9C8769` (hover). Accent-ink `#5C4A34` for tan-on-cream text.
- **Sidebar:** navy-900 ground, tan active indicator.
- **Borders:** warm `#EAE3D8` / `#DCD3C4` (not cool grey).
- **Semantic (separate from accent):** ok `#3F7D5F`, warn `#9C7A2E`, danger `#B4442F`, each with a tinted background for pills.

### 3.2 Typography
- Creo (already `@font-face`-loaded) for headings, nav, section labels, buttons — **bold**; eyebrows/section labels **uppercase, letter-spacing .14–.18em**.
- Creo Light for body + help text. (Creo ships only Light 300 + Bold 700 — treat those as the only two weights; do not assume a medium.)
- A type scale; help text ~12px; labels ~12.5px bold; page title ~24px.

### 3.3 Components to restyle / add
Buttons (primary tan / ghost / danger / `sm`); shell + sidebar (brand lockup, tan active rail); page header (eyebrow + title + one-line subtitle); tables (thin uppercase headers, row hover, `StatusPill`, language `Badge`, `thumb` + icon fallback); forms (section groups, `Field` wrapper, focus ring in tan, bilingual 2-col grid); modal; `Switch` toggle (title + description); upload (single dropzone + **multi-file gallery grid** with order/remove — shared with Ministries); toasts (keep logic, restyle); empty states; login.

## 4. Usability layer (the core deliverable)

### 4.1 `Tooltip` component — `src/admin/components/Tooltip.tsx`
A small `?` trigger revealing a bubble. Accessible: focusable (`tabindex=0`), opens on hover **and** focus, dismiss on Escape/blur, `role="tooltip"`. **Mobile:** opens on tap (no hover on touch) and closes on outside tap. Navy bubble, tan-highlighted key terms.

### 4.2 `Field` wrapper — `src/admin/components/Field.tsx`
Standardizes one form row: `label`, `required`/`optional` marker, one-line `help` text, optional `tooltip`, and the control as children. Every admin input moves to this wrapper so help text is consistent and never forgotten.

### 4.3 Page intros
Each page gets an eyebrow + title + one sentence saying what it controls, e.g. Ministries → "Each ministry is a card on the site. Turn one off to hide it without deleting; star it to give it a full page."

### 4.4 Microcopy rules
Plain language; name things by what people recognize; say what happens ("Save ministry" → toast "Saved"); errors state the fix. Keep help to one line; push detail into the tooltip.

### 4.5 Per-page help/tooltip inventory
Concrete copy is written during implementation; these are the fields that **must** get help + (T)ooltip:

- **Ministries** (see feature spec): slug (T), language (T), flagship toggle (T), CTA link (T), gallery (T), audience, meeting, active toggle.
- **Leaders:** photo ("Square headshot; a monogram shows if empty"), emails ("Enter to add each; shown on the leadership page"), sort order (T: "Controls order on the page; drag rows instead if you prefer"), published.
- **Sermons:** the YouTube fields (T: what a video ID/URL is, how sync works), date, published.
- **Prayer requests:** status meanings (new/praying/answered/archived), "share with team" (T: who can see it).
- **Texts:** what a text key controls + that both languages should be filled.
- **Contact info:** service times / address / social URLs formats.

## 5. Architecture / file plan

- **`src/admin/admin.css`** — rewrite around the token layer; keep existing class names where possible to limit churn, add new component classes.
- **New shared components** in `src/admin/components/`: `Tooltip.tsx`, `Field.tsx`, `PageHeader.tsx`, `StatusPill.tsx`, `Badge.tsx`, `Switch.tsx`. Reuse existing `Toast`. The **multi-file gallery uploader** is built here (shared component) since Ministries needs it and it may be reused.
- **Each page** migrates its inputs to `Field`, adds a `PageHeader`, and swaps ad-hoc buttons/badges for the shared components. Behaviour unchanged.
- Reuse `PhotoLightbox` (from `components/Leadership.tsx`) and the leader upload logic.

## 6. Rollout / sequencing

1. **Foundation:** token layer + `admin.css` restyle + shared components (`Tooltip`, `Field`, `PageHeader`, `StatusPill`, `Badge`, `Switch`, buttons, table, gallery uploader).
2. **Apply per page** + write help/tooltip copy: Ministries, Leaders, Sermons, Prayer, Texts, Contact.
3. **Ministries feature** is implemented on this foundation (its spec depends on `Field`, `Tooltip`, and the gallery uploader).

Foundation lands **before** the Ministries UI so nothing is built twice.

## 7. Weak spots (self-review)

- **Dark mode deferred** — tokens are ready, but v1 ships light only to avoid doubling QA.
- **Creo has only two weights** — designs must read well with just Light/Bold; no medium.
- **Tooltips on touch** — must handle tap-to-open / outside-tap-close, not hover-only.
- **Migration churn** — keep class names stable and migrate page-by-page so the admin never half-breaks mid-change.
- **Long forms** — rely on section grouping; revisit collapsible sections only if a form gets unwieldy (Ministries is the longest).
