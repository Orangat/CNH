import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { LeaderRow } from './types';
import { fallbackLeaders } from './fallbackLeaders';

let cache: LeaderRow[] | null = null;
const subscribers = new Set<(rows: LeaderRow[]) => void>();

async function load(): Promise<LeaderRow[]> {
  if (!supabase) return fallbackLeaders;
  const { data, error } = await supabase
    .from('leaders')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });
  if (error || !data || data.length === 0) {
    return fallbackLeaders;
  }
  return data as LeaderRow[];
}

export function invalidateLeaders() {
  cache = null;
  load().then((rows) => {
    cache = rows;
    subscribers.forEach((s) => s(rows));
  });
}

export function useLeaders() {
  const [data, setData] = useState<LeaderRow[] | null>(cache);
  const [loading, setLoading] = useState(cache === null);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback((rows: LeaderRow[]) => {
    setData(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    subscribers.add(update);
    if (cache === null) {
      load()
        .then((rows) => {
          cache = rows;
          subscribers.forEach((s) => s(rows));
        })
        .catch((e) => setError(String(e)))
        .finally(() => setLoading(false));
    }
    return () => {
      subscribers.delete(update);
    };
  }, [update]);

  return { data: data ?? fallbackLeaders, loading, error };
}
