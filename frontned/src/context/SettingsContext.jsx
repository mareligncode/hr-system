import { createContext, useContext, useState, useEffect } from 'react';
import translations from '../i18n/translations.js';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
    // Theme: 'dark' | 'light'
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
    // Language: 'en' | 'am'
    const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en');

    // Apply theme class to the <html> element
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'light') {
            root.classList.add('light-mode');
            root.classList.remove('dark-mode');
        } else {
            root.classList.add('dark-mode');
            root.classList.remove('light-mode');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('language', language);
        // Set dir for Amharic (LTR, but still good to declare lang)
        document.documentElement.lang = language;
    }, [language]);

    const t = (key) => translations[language]?.[key] || translations['en']?.[key] || key;

    const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

    return (
        <SettingsContext.Provider value={{ theme, setTheme, toggleTheme, language, setLanguage, t }}>
            {children}
        </SettingsContext.Provider>
    );
};

// Custom hook for easy access
export const useSettings = () => {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
    return ctx;
};

export default SettingsContext;
