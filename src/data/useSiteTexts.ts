import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { SiteTextRow } from './types';

export type TextMap = Record<string, { en: string; uk: string }>;

let cache: TextMap | null = null;
const subscribers = new Set<(map: TextMap) => void>();

async function load(): Promise<TextMap> {
  if (!supabase) return {};
  const { data, error } = await supabase.from('site_texts').select('*');
  if (error || !data) return {};
  const map: TextMap = {};
  for (const row of data as SiteTextRow[]) {
    map[row.key] = { en: row.value_en, uk: row.value_uk };
  }
  return map;
}

export function invalidateSiteTexts() {
  cache = null;
  load().then((m) => {
    cache = m;
    subscribers.forEach((s) => s(m));
  });
}

export function useSiteTexts() {
  const [data, setData] = useState<TextMap>(cache ?? {});
  const [loading, setLoading] = useState(cache === null);

  const update = useCallback((m: TextMap) => {
    setData(m);
    setLoading(false);
  }, []);

  useEffect(() => {
    subscribers.add(update);
    if (cache === null) {
      load()
        .then((m) => {
          cache = m;
          subscribers.forEach((s) => s(m));
        })
        .finally(() => setLoading(false));
    }
    return () => {
      subscribers.delete(update);
    };
  }, [update]);

  return { data, loading };
}
