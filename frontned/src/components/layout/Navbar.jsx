import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../store/authSlice.js';
import { useSettings } from '../../context/SettingsContext.jsx';

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { theme, toggleTheme, language, setLanguage, t } = useSettings();
    const [showSettings, setShowSettings] = useState(false);

    const handleLogout = async () => {
        await dispatch(logoutUser());
        navigate('/login');
    };

    const initials = user
        ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
        : '??';

    const isLight = theme === 'light';

    return (
        <>
            {/* Navbar */}
            <header className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-colors duration-300 bg-[var(--bg-navbar)] border-[var(--border-main)] shadow-sm`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/40">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <span className="font-semibold text-sm hidden sm:block text-[var(--text-main)]">
                            {t('appName')}
                        </span>
                    </div>

                    {/* Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        <a href="/profile" className="px-3 py-2 text-sm rounded-lg transition-colors text-[var(--text-soft)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-soft)]">
                            {t('dashboard')}
                        </a>
                    </nav>

                    {/* Right section */}
                    <div className="flex items-center gap-2">
                        {/* Theme toggle */}
                        <button
                            onClick={toggleTheme}
                            title={isLight ? t('darkMode') : t('lightMode')}
                            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors text-[var(--text-soft)] hover:bg-[var(--bg-surface-soft)] hover:text-[var(--text-main)]"
                        >
                            {isLight ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            )}
                        </button>

                        {/* Language toggle */}
                        <button
                            onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
                            title={language === 'en' ? 'Switch to አማርኛ' : 'Switch to English'}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-[var(--border-input)] text-[var(--text-main)] hover:bg-[var(--bg-surface-soft)] bg-[var(--bg-surface)]"
                        >
                            {language === 'en' ? 'አማ' : 'EN'}
                        </button>

                        {/* Settings */}
                        <button
                            onClick={() => setShowSettings(true)}
                            title={t('settings')}
                            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors text-[var(--text-soft)] hover:bg-[var(--bg-surface-soft)] hover:text-[var(--text-main)]"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>

                        {/* User info + avatar */}
                        <div className="flex items-center gap-2 ml-1">
                            <div className="text-right hidden lg:block">
                                <p className="text-sm font-bold text-[var(--text-main)] truncate max-w-[120px]">
                                    {user?.first_name} {user?.last_name}
                                </p>
                                <div className="flex justify-end gap-2 items-center">
                                    <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                        {t(user?.role)}
                                    </span>
                                    <p className="text-[10px] text-[var(--text-muted)] truncate max-w-[80px]">{user?.email}</p>
                                </div>
                            </div>
                            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-black shadow-lg shadow-blue-500/30 border-2 border-white/10 overflow-hidden">
                                {user?.profile_picture ? (
                                    <img
                                        src={user.profile_picture.startsWith('http') ? user.profile_picture.replace('http://', 'https://') : user.profile_picture}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.style.display = 'none';
                                            e.target.parentNode.innerText = initials;
                                        }}
                                    />
                                ) : initials}
                            </div>
                        </div>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center w-9 h-9 rounded-lg transition-colors text-[var(--text-soft)] hover:text-red-500 hover:bg-red-500/10 lg:w-auto lg:px-3 lg:gap-1.5"
                            title={t('logout')}
                        >
                            <svg className="w-5 h-5 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="hidden lg:block text-sm font-medium">{t('logout')}</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowSettings(false)}
                    />

                    {/* Panel */}
                    <div className="relative z-10 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 transition-colors duration-300 bg-[var(--bg-surface)] border border-[var(--border-main)]">
                        {/* Handle bar (mobile) */}
                        <div className="w-10 h-1 bg-slate-400 rounded-full mx-auto mb-5 sm:hidden" />

                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-[var(--text-main)]">
                                {t('settingsTitle')}
                            </h2>
                            <button
                                onClick={() => setShowSettings(false)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-[var(--text-soft)] hover:bg-[var(--bg-surface-soft)]"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Theme section */}
                        <div className="mb-6">
                            <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-[var(--text-muted)]">
                                {t('themeSection')}
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                {/* Dark option */}
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === 'dark'
                                        ? 'border-blue-500 bg-blue-600/10'
                                        : 'border-[var(--border-main)] hover:border-[var(--text-muted)]'
                                        }`}
                                >
                                    <div className="w-10 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-medium text-[var(--text-soft)]">
                                        {t('darkMode')}
                                    </span>
                                    {theme === 'dark' && (
                                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </button>

                                {/* Light option */}
                                <button
                                    onClick={() => setTheme('light')}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === 'light'
                                        ? 'border-blue-500 bg-blue-600/10'
                                        : 'border-[var(--border-main)] hover:border-[var(--text-muted)]'
                                        }`}
                                >
                                    <div className="w-10 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-medium text-[var(--text-soft)]">
                                        {t('lightMode')}
                                    </span>
                                    {theme === 'light' && (
                                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Language section */}
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-[var(--text-muted)]">
                                {t('languageSection')}
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { code: 'en', label: 'English', flag: '🇬🇧', native: 'English' },
                                    { code: 'am', label: 'Amharic', flag: '🇪🇹', native: 'አማርኛ' },
                                ].map(({ code, label, flag, native }) => (
                                    <button
                                        key={code}
                                        onClick={() => setLanguage(code)}
                                        className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${language === code
                                            ? 'border-blue-500 bg-blue-600/10'
                                            : 'border-[var(--border-main)] hover:border-[var(--text-muted)]'
                                            }`}
                                    >
                                        <span className="text-2xl">{flag}</span>
                                        <div className="text-left">
                                            <p className="text-sm font-semibold text-[var(--text-main)]">{native}</p>
                                            <p className="text-xs text-[var(--text-muted)]">{label}</p>
                                        </div>
                                        {language === code && (
                                            <div className="ml-auto w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
