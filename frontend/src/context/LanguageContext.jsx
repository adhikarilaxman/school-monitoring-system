import { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');

  useEffect(() => {
    setCurrentLanguage(i18n.language);
    document.body.setAttribute('data-lang', i18n.language);
    document.documentElement.setAttribute('lang', i18n.language);
    
    // Add a slight delay to allow Google Translate script to load
    const timer = setTimeout(() => {
      triggerGoogleTranslate(i18n.language);
    }, 1000);
    return () => clearTimeout(timer);
  }, [i18n.language]);

  const triggerGoogleTranslate = (lang) => {
    try {
      // Set the Google Translate cookie manually
      const gtCookie = lang === 'mr' ? '/en/mr' : '/en/en';
      document.cookie = `googtrans=${gtCookie}; path=/`;
      document.cookie = `googtrans=${gtCookie}; domain=${window.location.hostname}; path=/`;

      // Find and trigger the hidden Google Translate dropdown if it exists
      const gtCombo = document.querySelector('.goog-te-combo');
      if (gtCombo) {
        gtCombo.value = lang;
        gtCombo.dispatchEvent(new Event('change'));
      }
    } catch (e) {
      console.warn('Google Translate not ready yet', e);
    }
  };

  const toggleLanguage = () => {
    const newLang = currentLanguage === 'en' ? 'mr' : 'en';
    i18n.changeLanguage(newLang);
    setCurrentLanguage(newLang);
    localStorage.setItem('i18nextLng', newLang);
    document.body.setAttribute('data-lang', newLang);
    document.documentElement.setAttribute('lang', newLang);
    triggerGoogleTranslate(newLang);
  };

  const setLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setCurrentLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
    document.body.setAttribute('data-lang', lang);
    document.documentElement.setAttribute('lang', lang);
    triggerGoogleTranslate(lang);
  };

  const value = {
    currentLanguage,
    toggleLanguage,
    setLanguage,
    isEnglish: currentLanguage === 'en',
    isMarathi: currentLanguage === 'mr'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
