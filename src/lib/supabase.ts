import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL;
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

/**
 * Single Supabase client for the app.
 *
 * If env vars are missing (e.g. local dev without Supabase configured) we
 * intentionally export `null` and every data hook is responsible for falling
 * back to bundled JSON / hardcoded values. This keeps the public site working
 * even before the backend is set up.
 */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }) : null;

export const isSupabaseConfigured = (): boolean => supabase !== null;

export const LEADER_PHOTOS_BUCKET = 'leader-photos';

/**
 * Build a public URL for a photo stored in the leader-photos bucket.
 * Falls back to the original path (useful when seeded paths still point at /images/*).
 */
export function leaderPhotoUrl(photoPath: string | null | undefined): string {
  if (!photoPath) return '/images/placeholder.png';
  // Already a full URL or a /public/ asset path → use as-is.
  if (photoPath.startsWith('http') || photoPath.startsWith('/')) return photoPath;
  if (!supabase) return '/images/placeholder.png';
  const { data } = supabase.storage.from(LEADER_PHOTOS_BUCKET).getPublicUrl(photoPath);
  return data.publicUrl;
}
