import { useSettings } from '../../context/SettingsContext.jsx';
import brandingImage from '../../assets/images/e.jpg';

// Shared auth layout wrapper with branding panel
const AuthLayout = ({ children, title, subtitle }) => {
    const { theme, t } = useSettings();
    const isLight = theme === 'light';
    return (
        <div className="min-h-screen flex bg-[var(--bg-base)] text-[var(--text-main)]">
            {/* Left Branding Panel */}
            <div className={`hidden lg:flex flex-col justify-between w-2/5 p-12 relative overflow-hidden ${isLight
                ? 'bg-gradient-to-br from-blue-50 via-white to-blue-50'
                : 'bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900'
                }`}>
                {/* Branding Image Background */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={brandingImage}
                        alt="Branding"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className={`absolute inset-0 ${isLight ? 'bg-white/20' : 'bg-slate-950/20'}`} />
                </div>

                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2 z-0" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full translate-y-1/2 -translate-x-1/2 z-0" />

                {/* Logo */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <span className={`${isLight ? 'text-slate-800' : 'text-white'} font-bold text-lg tracking-tight`}>
                            {t('appName')}
                        </span>
                    </div>
                </div>

                {/* Feature Highlights */}

                {/* Feature Highlights */}
                <div className="relative z-10 space-y-6">
                    <h2 className={`text-3xl font-bold leading-tight ${isLight ? 'text-slate-800' : 'text-white'}`}>
                        {t('streamlineYour') || 'Streamline Your'}<br />
                        <span className="text-blue-500">{t('hotelHROperations') || 'Hotel HR Operations'}</span>
                    </h2>
                    <div className="space-y-4">
                        {[
                            { icon: '👥', text: 'Complete employee lifecycle management' },
                            { icon: '📅', text: 'Intelligent shift scheduling & swaps' },
                            { icon: '💰', text: 'Automated payroll with tip distribution' },
                            { icon: '📊', text: 'Real-time analytics & dashboards' },
                        ].map(({ icon, text }) => (
                            <div key={text} className={`flex items-center gap-3 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                                <span className="text-xl">{icon}</span>
                                <span className="text-sm">{t(text.replace(/\s+/g, '')) || text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 text-slate-500 text-xs">
                    © 2026 {t('appName')}. {t('allRightsReserved') || 'All rights reserved.'}
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
                <div className="w-full max-w-md space-y-8">
                    {/* Mobile logo */}
                    <div className="lg:hidden text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl shadow-lg shadow-blue-900/50 mb-4">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <p className="text-[var(--text-soft)] text-xs">{t('appName')}</p>
                    </div>

                    {/* Title */}
                    <div>
                        <h1 className="text-2xl font-bold">{title}</h1>
                        {subtitle && <p className="text-[var(--text-soft)] text-sm mt-1">{subtitle}</p>}
                    </div>

                    {/* Form content */}
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
