import { supabase } from './supabase';

/**
 * Resolve the best thumbnail URL for a sermon.
 * Priority: custom upload → sync thumbnail_url → YouTube default.
 */
export function sermonThumbnail(sermon: {
  youtube_id: string;
  thumbnail_url?: string;
  custom_thumbnail_path?: string | null;
}): string {
  if (sermon.custom_thumbnail_path && supabase) {
    const { data } = supabase.storage
      .from('sermon-thumbs')
      .getPublicUrl(sermon.custom_thumbnail_path);
    return data.publicUrl;
  }
  if (sermon.thumbnail_url) {
    return sermon.thumbnail_url;
  }
  return `https://img.youtube.com/vi/${sermon.youtube_id}/hqdefault.jpg`;
}
