# Migration to V2 Design

When the new design is ready and approved, follow these steps to make it the default and remove the old one.

## Steps

### 1. Update App.tsx routing
- Remove `LegacySite` component entirely
- Rename `V2Site` to `PublicSite` (or inline it)
- Remove the `/v2` prefix from all V2 routes (`/v2/:lang` -> `/:lang`)
- Remove the `isV2` / `isAdmin` branching logic
- Change admin route from `/v2/admin/*` to `/admin/*`

### 2. Remove `/v2` prefix from navigation links
- `src/components/Header.tsx` — change `localized()` from `` `/v2/${lang}${path}` `` back to `` `/${lang}${path}` ``
- `src/components/Footer.tsx` — same change in `localized()`

### 3. Update admin panel paths
- `src/admin/AdminGuard.tsx` — `/v2/admin/login` -> `/admin/login`
- `src/admin/AdminLayout.tsx` — all `/v2/admin/...` -> `/admin/...`
- `src/admin/AdminLogin.tsx` — `/v2/admin/leaders` -> `/admin/leaders`

### 4. Clean up LanguageContext
- `src/contexts/LanguageContext.tsx` — remove `isV2` / `v2` prefix handling, revert to simple `pathParts[0]` language detection

### 5. Delete legacy files
- `src/pages/legacy/` — entire folder
- `src/components/legacy/` — entire folder

### 6. Verify
- Run `npm run build` to confirm no broken imports
- Test all routes: home, we-believe, leadership, visit, sermons, ministries, prayer, give, events
- Test language switching (EN/UK) on each page
- Test admin panel login and all admin pages
- Check Netlify deploy preview before merging
