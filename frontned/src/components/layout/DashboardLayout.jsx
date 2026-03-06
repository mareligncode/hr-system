import { Outlet, Link, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { useSettings } from '../../context/SettingsContext.jsx';

const DashboardLayout = () => {
    const { t } = useSettings();
    const location = useLocation();

    const menuItems = [
        { path: '/profile', label: t('profile'), icon: '👤' },
        { path: '/departments', label: t('departments'), icon: '🏢' },
        { path: '/positions', label: t('positions'), icon: '👔' },
        { path: '/org-chart', label: t('orgChart'), icon: '📊' },
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-main)] transition-colors duration-300">
            <Navbar />

            <div className="flex pt-16">
                {/* Sidebar */}
                <aside className="w-64 fixed left-0 top-16 bottom-0 bg-[var(--bg-surface)] border-r border-[var(--border-main)] hidden lg:block overflow-y-auto">
                    <div className="p-4 flex flex-col gap-1">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                            : 'text-[var(--text-soft)] hover:bg-[var(--bg-surface-soft)] hover:text-[var(--text-main)]'
                                        }`}
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Nav */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-surface)] border-t border-[var(--border-main)] backdrop-blur-md flex items-center justify-around h-16 z-50">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center gap-1 p-2 ${isActive ? 'text-blue-500' : 'text-[var(--text-muted)]'
                                }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-[10px] font-medium uppercase tracking-widest">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default DashboardLayout;
