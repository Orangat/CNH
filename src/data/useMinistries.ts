import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { MinistryRow } from './types';

let cache: MinistryRow[] | null = null;
const subs = new Set<(m: MinistryRow[]) => void>();

async function load(): Promise<MinistryRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('ministries')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });
  if (error || !data) return [];
  return data as MinistryRow[];
}

export function invalidateMinistries() {
  cache = null;
  load().then((m) => {
    cache = m;
    subs.forEach((cb) => cb(m));
  });
}

export function useMinistries() {
  const [data, setData] = useState<MinistryRow[]>(cache ?? []);
  const [loading, setLoading] = useState(cache === null);
  const update = useCallback((m: MinistryRow[]) => {
    setData(m);
    setLoading(false);
  }, []);
  useEffect(() => {
    subs.add(update);
    if (cache === null) {
      load()
        .then((m) => {
          cache = m;
          subs.forEach((cb) => cb(m));
        })
        .finally(() => setLoading(false));
    }
    return () => {
      subs.delete(update);
    };
  }, [update]);
  return { data, loading };
}
