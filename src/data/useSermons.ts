import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { SermonRow } from './types';

let cache: SermonRow[] | null = null;
const subs = new Set<(s: SermonRow[]) => void>();

async function load(): Promise<SermonRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('sermons')
    .select('*')
    .eq('is_published', true)
    .order('preached_at', { ascending: false, nullsFirst: false })
    .order('sort_order', { ascending: true });
  if (error || !data) return [];
  return data as SermonRow[];
}

export function invalidateSermons() {
  cache = null;
  load().then((s) => {
    cache = s;
    subs.forEach((cb) => cb(s));
  });
}

export function useSermons() {
  const [data, setData] = useState<SermonRow[]>(cache ?? []);
  const [loading, setLoading] = useState(cache === null);
  const update = useCallback((s: SermonRow[]) => {
    setData(s);
    setLoading(false);
  }, []);
  useEffect(() => {
    subs.add(update);
    if (cache === null) {
      load()
        .then((s) => {
          cache = s;
          subs.forEach((cb) => cb(s));
        })
        .finally(() => setLoading(false));
    }
    return () => {
      subs.delete(update);
    };
  }, [update]);
  return { data, loading };
}
