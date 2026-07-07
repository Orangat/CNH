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
export const MINISTRY_PHOTOS_BUCKET = 'ministry-photos';

/**
 * Build a public URL for a photo stored in the given Storage bucket.
 * Falls back to the original path (useful when seeded paths still point at /images/*)
 * or a placeholder when nothing is set.
 */
export function storagePublicUrl(bucket: string, photoPath: string | null | undefined): string {
  if (!photoPath) return '/images/placeholder.png';
  // Already a full URL or a /public/ asset path → use as-is.
  if (photoPath.startsWith('http') || photoPath.startsWith('/')) return photoPath;
  if (!supabase) return '/images/placeholder.png';
  return supabase.storage.from(bucket).getPublicUrl(photoPath).data.publicUrl;
}

/** Public URL for a photo in the leader-photos bucket. */
export function leaderPhotoUrl(photoPath: string | null | undefined): string {
  return storagePublicUrl(LEADER_PHOTOS_BUCKET, photoPath);
}

/** Public URL for a photo in the ministry-photos bucket. */
export function ministryPhotoUrl(photoPath: string | null | undefined): string {
  return storagePublicUrl(MINISTRY_PHOTOS_BUCKET, photoPath);
}
