# Supabase setup

## 1. Create the project

1. Go to https://supabase.com → New project. Pick the free tier.
2. Save the project URL and **anon key** (Settings → API). These go into `.env.local` as
   `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`.
3. Save the **service role key** to your local environment as `SUPABASE_SERVICE_ROLE_KEY`.
   This is only used by the local seed script and must never be committed.

## 2. Run the migration

In the Supabase dashboard → SQL editor → paste the contents of
`migrations/0001_init.sql` and click Run.

This creates all tables, RLS policies, the `leader-photos` storage bucket, and a
singleton `contact_info` row.

## 3. Create the first admin

1. Authentication → Users → Add user → email + password (turn off "auto-confirm" off
   if you want, but easier to leave it on).
2. Go back to SQL editor and run, replacing the email:

```sql
insert into admin_users (id, email, role)
select id, email, 'admin' from auth.users where email = 'pastor@example.com';
```

You can now log in at `/admin/login`.

## 4. Seed initial content

From the project root:

```
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx ts-node scripts/seed-supabase.ts
```

This populates `site_texts` from the local JSON files, uploads existing leader
photos to the storage bucket, and inserts leader rows.
