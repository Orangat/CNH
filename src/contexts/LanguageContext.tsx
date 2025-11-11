import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import enTranslations from '../translations/en.json';
import ukTranslations from '../translations/uk.json';

type Language = 'en' | 'uk';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, any> = {
  en: enTranslations,
  uk: ukTranslations,
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [language, setLanguageState] = useState<Language>('en');

  // Extract language from URL path
  useEffect(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const langFromPath = pathParts[0];
    
    if (langFromPath === 'en' || langFromPath === 'uk') {
      setLanguageState(langFromPath);
    } else {
      // Default to English if no language in path
      setLanguageState('en');
    }
  }, [location.pathname]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    const pathParts = location.pathname.split('/').filter(Boolean);
    
    // Remove existing language prefix if present
    if (pathParts[0] === 'en' || pathParts[0] === 'uk') {
      pathParts.shift();
    }
    
    // Build new path with language prefix
    const newPath = pathParts.length > 0 ? `/${lang}/${pathParts.join('/')}` : `/${lang}`;
    navigate(newPath, { replace: true });
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    return typeof value === 'string' ? value : key;
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

