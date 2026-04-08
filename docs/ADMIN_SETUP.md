# Admin panel — setup guide

End-to-end steps to wire the new Supabase-backed admin panel. Follow once.

## 1. Create the Supabase project

1. Sign up / log in at https://supabase.com.
2. New project → free tier → pick a region close to your visitors.
3. Wait for the project to provision.
4. **Settings → API** → copy:
   - **Project URL** → goes into `REACT_APP_SUPABASE_URL`
   - **anon public** key → goes into `REACT_APP_SUPABASE_ANON_KEY`
   - **service_role** key → goes into `SUPABASE_SERVICE_ROLE_KEY` (used only by the seed script — **never commit**)

## 2. Run the SQL migration

In Supabase dashboard → **SQL editor** → New query → paste the contents of
`supabase/migrations/0001_init.sql` → **Run**.

This creates the `leaders`, `site_texts`, `contact_info`, `admin_users` tables,
the `leader-photos` storage bucket, and all RLS policies.

## 3. Create your admin user

1. **Authentication → Users → Add user** → email + password.
   Tick *Auto-confirm user* so you can log in right away.
2. Back in **SQL editor** run (replace the email):

```sql
insert into admin_users (id, email, role)
select id, email, 'admin' from auth.users where email = 'pastor@example.com';
```

## 4. Local environment

Create `.env.local` in the project root (gitignored):

```
REACT_APP_SUPABASE_URL=https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

## 5. Seed initial content

Populates `site_texts` from the bundled JSON, uploads existing leader photos to
the storage bucket, and inserts leader rows. Idempotent — safe to re-run.

```
npx ts-node --transpile-only scripts/seed-supabase.ts
```

(If `ts-node` is not installed: `npm i -D ts-node`.)

## 6. Run locally

```
npm start
```

- Public site: http://localhost:3000/en — should look identical to before.
- Admin: http://localhost:3000/admin → redirects to `/admin/login` → sign in
  with the credentials from step 3.

## 7. Deploy

GitHub Pages deploy is unchanged — `REACT_APP_*` env vars are baked into the
build:

```
npm run deploy
```

Make sure `.env.local` exists on the machine you deploy from, or set the env
vars in your shell before running `npm run deploy`.

## How it works

- **Public site** loads content from Supabase at runtime via three hooks:
  `useLeaders`, `useSiteTexts`, `useContactInfo`. If Supabase is unreachable
  (or env vars are missing) it falls back to the bundled JSON / hardcoded
  values, so the site never breaks.
- **Admin panel** lives at `/admin/*`, lazy-loaded so it isn't shipped to
  normal visitors. Sign-in via Supabase Auth + a check that the user exists in
  the `admin_users` table.
- **Security** is enforced by Postgres RLS — the `anon` key shipped in the
  build can read everything but cannot write. Only authenticated users present
  in `admin_users` can insert/update/delete. The `is_admin()` SQL helper
  function gates every write policy.
- **Photos** live in the public `leader-photos` storage bucket. Uploads go
  through the admin form using a per-leader UUID filename.

## Adding more admins later

Repeat step 3 for each new admin. (A self-service "invite user" page is in the
spec but not implemented yet — add it later if multiple editors are needed.)

## Adding new editable text keys

When a developer adds a new `t('some.new.key')` call:

1. Add the key + English/Ukrainian default values to
   `src/translations/en.json` and `uk.json`.
2. Re-run the seed script — it upserts new keys without touching existing ones.

The new key will then appear in the admin **Texts** page and staff can edit
either language.
