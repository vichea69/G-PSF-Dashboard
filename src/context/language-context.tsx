'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

type Language = 'en' | 'kh';

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

const STORAGE_KEY = 'dashboard_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedLanguage = window.localStorage.getItem(
      STORAGE_KEY
    ) as Language | null;
    if (storedLanguage === 'en' || storedLanguage === 'kh') {
      setLanguage(storedLanguage);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.dataset.language = language;
    document.documentElement.lang = language === 'kh' ? 'km' : 'en';
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === 'en' ? 'kh' : 'en'));
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage
    }),
    [language, toggleLanguage]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export type { Language };
