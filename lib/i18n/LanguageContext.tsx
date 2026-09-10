'use client';

/**
 * Dil Bağlamı ve Sağlayıcısı (Language Context & Provider).
 *
 * Türkçe ve İngilizce dil seçimini yönetir, localStorage üzerinde kalıcı saklar
 * ve `t(key)` fonksiyonu ile anında çeviri sunar.
 *
 * @module lib/i18n/LanguageContext
 */

import React, { createContext, useContext, useState, useEffect, useTransition } from 'react';
import { Language, translations, TranslationKey } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'mylol_selected_language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('tr');
  const [, startTransition] = useTransition();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (saved === 'tr' || saved === 'en') {
        setLanguageState(saved);
      } else {
        // Tarayıcı/Sistem dilini kontrol et
        const browserLang = navigator.language?.toLowerCase() || '';
        if (browserLang.startsWith('en')) {
          setLanguageState('en');
        }
      }
    } catch {
      // localStorage erişim hatası durumunda varsayılan 'tr' devam eder
    }
  }, []);

  const setLanguage = (lang: Language) => {
    startTransition(() => {
      setLanguageState(lang);
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // Ignore
      }
    });
  };

  const toggleLanguage = () => {
    setLanguage(language === 'tr' ? 'en' : 'tr');
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations['tr'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
