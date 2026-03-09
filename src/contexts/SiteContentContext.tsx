import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type SiteLanguage = 'en' | 'uk';

export interface SiteContent {
  serviceTimes: {
    english: string;
    ukrainian: string;
  };
  homeAnnouncement: {
    enabled: boolean;
    en: string;
    uk: string;
  };
  footer: {
    churchName: string;
    address: string;
    mapUrl: string;
    phoneDisplay: string;
    phoneTel: string;
    extraLine?: string;
  };
  giving: {
    zellePhoneDisplay: string;
    zellePhoneRaw: string;
  };
  gameTime: {
    enabled: boolean;
    labelEn?: string;
    labelUk?: string;
    timeEn?: string;
    timeUk?: string;
  };
}

export interface Leader {
  id: string;
  name: string;
  title: string;
  emails?: string[];
  photo?: string;
}

export interface LeadersContent {
  leaders: Leader[];
}

export type WeBelieveIcon = 'wind' | 'book' | 'user' | 'cross' | 'shield' | 'hands' | 'church' | 'wine' | 'cloud-cross';

export interface WeBelieveItem {
  id: string;
  icon: WeBelieveIcon;
  titleEn: string;
  textEn: string;
  titleUk: string;
  textUk: string;
}

export interface WeBelieveContent {
  titleEn: string;
  titleUk: string;
  items: WeBelieveItem[];
}

interface SiteContentContextValue {
  site: SiteContent;
  leaders: LeadersContent;
  weBelieve: WeBelieveContent;
  isLoading: boolean;
  error?: string;
}

const defaultSite: SiteContent = {
  serviceTimes: { english: '10:00 AM', ukrainian: '12:00 PM' },
  homeAnnouncement: { enabled: false, en: '', uk: '' },
  footer: {
    churchName: 'Church of New Hope',
    address: '13601 Idlewild Rd, Matthews, NC 28105',
    mapUrl:
      'https://www.google.com/maps/place/Church+of+New+Hope/@35.1386539,-80.6753961,17z/data=!4m15!1m8!3m7!1s0x8854237512253b49:0xd6feb6ee5600c036!2s13601+Idlewild+Rd,+Matthews,+NC+28105!3b1!8m2!3d35.1386539!4d-80.6753961!16s%2Fg%2F11c2bgk14q!3m5!1s0x8854233f1c141bad:0x52bdf54b20d5ecbd!8m2!3d35.1386659!4d-80.6753908!16s%2Fg%2F11r6_nkvqv?entry=ttu',
    phoneDisplay: '+1 (704) 609-7110',
    phoneTel: '+17046097110',
    extraLine: '',
  },
  giving: {
    zellePhoneDisplay: '(704) 453-9365',
    zellePhoneRaw: '7044539365',
  },
  gameTime: {
    enabled: false,
    labelEn: 'Game',
    labelUk: 'Гра',
    timeEn: '',
    timeUk: '',
  },
};

const defaultLeaders: LeadersContent = { leaders: [] };
const defaultWeBelieve: WeBelieveContent = { titleEn: 'STATEMENT OF FAITH', titleUk: 'ДЕКЛАРАЦІЯ ВІРИ', items: [] };

const SiteContentContext = createContext<SiteContentContextValue | undefined>(undefined);

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return (await res.json()) as T;
}

export const SiteContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [site, setSite] = useState<SiteContent>(defaultSite);
  const [leaders, setLeaders] = useState<LeadersContent>(defaultLeaders);
  const [weBelieve, setWeBelieve] = useState<WeBelieveContent>(defaultWeBelieve);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setIsLoading(true);
        setError(undefined);

        const [siteJson, leadersJson, weBelieveJson] = await Promise.all([
          fetchJson<SiteContent>('/content/site.json'),
          fetchJson<LeadersContent>('/content/leaders.json'),
          fetchJson<WeBelieveContent>('/content/we-believe.json'),
        ]);

        if (cancelled) return;
        setSite(siteJson);
        setLeaders(leadersJson);
        setWeBelieve(weBelieveJson);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Failed to load site content.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<SiteContentContextValue>(
    () => ({ site, leaders, weBelieve, isLoading, error }),
    [site, leaders, weBelieve, isLoading, error]
  );

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
};

export function useSiteContent(): SiteContentContextValue {
  const ctx = useContext(SiteContentContext);
  if (!ctx) throw new Error('useSiteContent must be used within a SiteContentProvider');
  return ctx;
}

