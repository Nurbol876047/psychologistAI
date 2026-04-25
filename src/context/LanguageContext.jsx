import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { translations } from '../data/translations.js';

const LanguageContext = createContext(null);

function getInitialLanguage() {
  if (typeof window === 'undefined') return 'kk';
  return window.localStorage.getItem('teacher-support-language') || 'kk';
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage);

  const setLanguage = useCallback((nextLanguage) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem('teacher-support-language', nextLanguage);
  }, []);

  const t = useCallback(
    (path) => {
      const value = path.split('.').reduce((acc, key) => acc?.[key], translations[language]);
      return value ?? path;
    },
    [language],
  );

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }
  return context;
}
