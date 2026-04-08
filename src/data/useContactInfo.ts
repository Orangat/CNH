import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { ContactInfoRow } from './types';
import { ChurchInformation } from '../utils/enums';

export const fallbackContact: ContactInfoRow = {
  id: 'fallback',
  address: ChurchInformation.CHURCH_ADDRESS,
  phone: ChurchInformation.CHURCH_PHONE,
  email: 'info@churchofnewhope.org',
  service_time_english: ChurchInformation.ENGLISH_SERVICE_TIME,
  service_time_ukrainian: ChurchInformation.UKRAINIAN_SERVICE_TIME,
  map_url: 'https://www.google.com/maps/place/Church+of+New+Hope/@35.1386539,-80.6753961,17z/data=!4m15!1m8!3m7!1s0x8854237512253b49:0xd6feb6ee5600c036!2s13601+Idlewild+Rd,+Matthews,+NC+28105!3b1!8m2!3d35.1386539!4d-80.6753961!16s%2Fg%2F11c2bgk14q!3m5!1s0x8854233f1c141bad:0x52bdf54b20d5ecbd!8m2!3d35.1386659!4d-80.6753908!16s%2Fg%2F11r6_nkvqv',
  facebook_url: 'https://www.facebook.com/CNHCharlotte',
  instagram_url: 'https://www.instagram.com/cnhcharlotte',
  youtube_url: 'https://www.youtube.com/@ChurchOfNewHopeUA/streams',
};

let cache: ContactInfoRow | null = null;
const subscribers = new Set<(c: ContactInfoRow) => void>();

async function load(): Promise<ContactInfoRow> {
  if (!supabase) return fallbackContact;
  const { data, error } = await supabase
    .from('contact_info')
    .select('*')
    .limit(1)
    .maybeSingle();
  if (error || !data) return fallbackContact;
  return data as ContactInfoRow;
}

export function invalidateContactInfo() {
  cache = null;
  load().then((c) => {
    cache = c;
    subscribers.forEach((s) => s(c));
  });
}

export function useContactInfo() {
  const [data, setData] = useState<ContactInfoRow>(cache ?? fallbackContact);
  const [loading, setLoading] = useState(cache === null);

  const update = useCallback((c: ContactInfoRow) => {
    setData(c);
    setLoading(false);
  }, []);

  useEffect(() => {
    subscribers.add(update);
    if (cache === null) {
      load()
        .then((c) => {
          cache = c;
          subscribers.forEach((s) => s(c));
        })
        .finally(() => setLoading(false));
    }
    return () => {
      subscribers.delete(update);
    };
  }, [update]);

  return { data, loading };
}
