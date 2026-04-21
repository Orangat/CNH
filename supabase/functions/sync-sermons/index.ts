import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing auth' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY')!;
    const channelId = Deno.env.get('YOUTUBE_CHANNEL_ID')!;

    // Verify user role using their JWT
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: me } = await userClient.from('admin_users').select('role').maybeSingle();
    if (!me || !['admin', 'pastor', 'editor'].includes(me.role ?? '')) {
      return new Response(JSON.stringify({ error: 'Not authorized' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch from YouTube
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('key', youtubeApiKey);
    url.searchParams.set('channelId', channelId);
    url.searchParams.set('type', 'video');
    url.searchParams.set('eventType', 'completed');
    url.searchParams.set('order', 'date');
    url.searchParams.set('maxResults', '50');
    url.searchParams.set('part', 'snippet');

    const ytRes = await fetch(url.toString());
    if (!ytRes.ok) {
      const body = await ytRes.text();
      throw new Error(`YouTube API error ${ytRes.status}: ${body}`);
    }
    const ytData = await ytRes.json();
    const videos = (ytData.items ?? []).map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnailUrl: item.snippet.thumbnails?.high?.url ?? '',
      publishedAt: item.snippet.publishedAt,
    }));

    // Get existing
    const { data: existing } = await supabase
      .from('sermons').select('id, youtube_id, title_edited');
    const existingMap = new Map(
      (existing ?? []).map((r: any) => [r.youtube_id, r])
    );

    let imported = 0, updated = 0, skipped = 0;

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
          speaker: '', series: '', scripture: '',
          description_en: '', description_uk: '',
        });
        if (!error) imported++;
      } else if (!match.title_edited) {
        const { error } = await supabase.from('sermons').update({
          title_en: video.title,
          thumbnail_url: video.thumbnailUrl,
        }).eq('id', match.id);
        if (!error) updated++;
      } else {
        skipped++;
      }
    }

    return new Response(
      JSON.stringify({ imported, updated, skipped }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
