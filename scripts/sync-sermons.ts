import { createClient } from '@supabase/supabase-js';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing env vars. Required: YOUTUBE_API_KEY, YOUTUBE_CHANNEL_ID, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
}

async function fetchCompletedLivestreams(maxResults = 50): Promise<YouTubeVideo[]> {
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('key', YOUTUBE_API_KEY!);
  url.searchParams.set('channelId', YOUTUBE_CHANNEL_ID!);
  url.searchParams.set('type', 'video');
  url.searchParams.set('eventType', 'completed');
  url.searchParams.set('order', 'date');
  url.searchParams.set('maxResults', String(maxResults));
  url.searchParams.set('part', 'snippet');

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  return (data.items ?? []).map((item: any) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    thumbnailUrl: item.snippet.thumbnails?.high?.url ?? '',
    publishedAt: item.snippet.publishedAt,
  }));
}

async function syncSermons() {
  console.log('Fetching completed livestreams from YouTube...');
  const videos = await fetchCompletedLivestreams(50);
  console.log(`Found ${videos.length} completed livestreams.`);

  const { data: existing, error: fetchErr } = await supabase
    .from('sermons')
    .select('id, youtube_id, title_edited');

  if (fetchErr) {
    throw new Error(`Supabase fetch error: ${fetchErr.message}`);
  }

  const existingMap = new Map(
    (existing ?? []).map((r: any) => [r.youtube_id, r])
  );

  let imported = 0;
  let updated = 0;
  let skipped = 0;

  for (const video of videos) {
    const match = existingMap.get(video.id);

    if (!match) {
      const { error } = await supabase.from('sermons').insert({
        youtube_id: video.id,
        title_en: video.title,
        title_uk: video.title,
        thumbnail_url: video.thumbnailUrl,
        preached_at: video.publishedAt.split('T')[0],
        is_published: true,
        auto_imported: true,
        title_edited: false,
        sort_order: 0,
        speaker: '',
        series: '',
        scripture: '',
        description_en: '',
        description_uk: '',
      });
      if (error) {
        console.error(`Insert failed for ${video.id}: ${error.message}`);
        continue;
      }
      imported++;
      console.log(`  + Imported: ${video.title}`);
    } else if (!match.title_edited) {
      const { error } = await supabase.from('sermons').update({
        title_en: video.title,
        thumbnail_url: video.thumbnailUrl,
      }).eq('id', match.id);
      if (error) {
        console.error(`Update failed for ${video.id}: ${error.message}`);
        continue;
      }
      updated++;
    } else {
      skipped++;
    }
  }

  const result = { imported, updated, skipped };
  console.log(`\nSync complete:`, result);
  return result;
}

syncSermons()
  .then((result) => {
    console.log('Done.', JSON.stringify(result));
    process.exit(0);
  })
  .catch((err) => {
    console.error('Sync failed:', err);
    process.exit(1);
  });
