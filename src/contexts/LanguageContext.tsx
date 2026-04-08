import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import enTranslations from '../translations/en.json';
import ukTranslations from '../translations/uk.json';
import { useSiteTexts, TextMap } from '../data/useSiteTexts';

type Language = 'en' | 'uk';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const jsonTranslations: Record<Language, any> = {
  en: enTranslations,
  uk: ukTranslations,
};

function lookupJson(lang: Language, key: string): string | null {
  const parts = key.split('.');
  let value: any = jsonTranslations[lang];
  for (const k of parts) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return null;
    }
  }
  return typeof value === 'string' ? value : null;
}

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [language, setLanguageState] = useState<Language>('en');
  const { data: remoteTexts } = useSiteTexts();

  useEffect(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const langFromPath = pathParts[0];
    if (langFromPath === 'en' || langFromPath === 'uk') {
      setLanguageState(langFromPath);
    } else {
      setLanguageState('en');
    }
  }, [location.pathname]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    const pathParts = location.pathname.split('/').filter(Boolean);
    if (pathParts[0] === 'en' || pathParts[0] === 'uk') {
      pathParts.shift();
    }
    const newPath = pathParts.length > 0 ? `/${lang}/${pathParts.join('/')}` : `/${lang}`;
    navigate(newPath, { replace: true });
  };

  const t = (key: string): string => {
    // 1. Supabase override (if present and non-empty)
    const remote = (remoteTexts as TextMap)[key];
    if (remote) {
      const v = language === 'uk' ? remote.uk : remote.en;
      if (v && v.trim().length > 0) return v;
    }
    // 2. Bundled JSON fallback
    const json = lookupJson(language, key);
    if (json !== null) return json;
    // 3. Last resort: return the key
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
