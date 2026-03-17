import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Navbar from './Navbar';
import { useSettings } from '../../context/SettingsContext.jsx';
import usePermission from '../../hooks/usePermission';

const DashboardLayout = () => {
    const { t } = useSettings();
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);
    const { role, hasPermission } = usePermission();

    const [expandedSections, setExpandedSections] = useState({});

    const menuSections = [
        {
            title: t('main'),
            icon: '🏠',
            items: [
                { path: '/dashboard', label: t('dashboard'), icon: '📊' },
                { path: '/profile', label: t('profile'), icon: '👤' },
            ]
        },
        {
            title: t('timeAndAttendance'),
            icon: '🕒',
            items: [
                { path: '/attendance', label: t('attendance'), icon: '🕒' },
                { path: '/attendance/calendar', label: t('attendanceCalendar'), icon: '📅' },
                { path: '/attendance/team', label: t('todayAttendance'), icon: '📋', roles: ['admin', 'hr', 'manager'] },
                { path: '/attendance/approvals', label: t('pendingApprovals'), icon: '✔️', roles: ['admin', 'hr', 'manager'] },
                { path: '/attendance/reports', label: t('attendanceReports'), icon: '📊', roles: ['admin', 'hr', 'manager', 'finance'] },
            ]
        },
        {
            title: t('leaveManagement'),
            icon: '📝',
            items: [
                { path: '/leave/request', label: t('requestLeave'), icon: '📝' },
                { path: '/leave/history', label: t('myLeave'), icon: '📅' },
                { path: '/leave/approvals', label: t('leaveApprovals'), icon: '⚖️', roles: ['admin', 'hr', 'manager'] },
                { path: '/leave/types', label: t('leaveTypes'), icon: '⚙️', roles: ['admin', 'hr'] },
            ]
        },
        {
            title: t('workforce'),
            icon: '👥',
            items: [
                { path: '/employees', label: t('employees'), icon: '👥', permission: 'view_employees' },
                { path: '/departments', label: t('departments'), icon: '🏢' },
                { path: '/positions', label: t('positions'), icon: '👔' },
                { path: '/org-chart', label: t('orgChart'), icon: '📊', permission: 'view_employees' },
            ]
        },
        {
            title: t('shiftManagement'),
            icon: '⏰',
            items: [
                { path: '/shifts/my', label: t('myShifts'), icon: '⏰' },
                { path: '/shifts/calendar', label: t('shiftScheduler'), icon: '📅', roles: ['admin', 'hr', 'manager'] },
                { path: '/shifts/swaps', label: t('shiftSwaps'), icon: '🔄' },
                { path: '/shifts/templates', label: t('shiftTemplates'), icon: '📋', roles: ['admin', 'hr', 'manager'] },
                { path: '/shifts/types', label: t('shiftTypes'), icon: '⚙️', roles: ['admin', 'hr'] },
                { path: '/shifts/rotations', label: t('shiftRotations'), icon: '🔄', roles: ['admin', 'hr', 'manager'] },
                { path: '/shifts/reports', label: t('shiftReports'), icon: '📈', roles: ['admin', 'hr', 'manager', 'finance'] },
            ]
        },
        {
            title: t('recruitment'),
            icon: '📢',
            items: [
                { path: '/recruitment/jobs', label: t('jobPostings'), icon: '📢', roles: ['admin', 'hr'] },
                { path: '/recruitment/applicants', label: t('applicants'), icon: '👤', roles: ['admin', 'hr'] },
                { path: '/recruitment/pipeline', label: t('pipeline'), icon: '📋', roles: ['admin', 'hr'] },
                { path: '/recruitment/interviews', label: t('interviews'), icon: '📅', roles: ['admin', 'hr', 'manager'] },
                { path: '/recruitment/offers', label: t('offers'), icon: '💰', roles: ['admin', 'hr'] },
            ]
        },
        {
            title: t('payroll'),
            icon: '💰',
            items: [
                { path: '/payroll/periods', label: t('payrollManagement'), icon: '💰', roles: ['admin', 'hr', 'finance'] },
                { path: '/payroll/payslips', label: t('myPayslips'), icon: '📄' },
            ]
        },
        {
            title: t('analytics'),
            icon: '📈',
            items: [
                { path: '/dashboard/executive', label: t('executiveAnalytics'), icon: '📈', roles: ['admin', 'hr', 'finance'] },
                { path: '/dashboard/hr', label: t('hrAnalytics'), icon: '📊', roles: ['admin', 'hr'] },
                { path: '/dashboard/manager', label: t('teamAnalytics'), icon: '📈', roles: ['admin', 'hr', 'manager'] },
                { path: '/dashboard/finance', label: t('financeAnalytics'), icon: '💰', roles: ['admin', 'hr', 'finance'] },
                { path: '/reports', label: t('reportCenter'), icon: '📋', roles: ['admin', 'hr', 'manager', 'finance'] },
            ]
        },
        {
            title: t('administration'),
            icon: '🛡️',
            items: [
                { path: '/admin/roles', label: t('rolesAndSecurity'), icon: '🛡️', role: 'admin' },
                { path: '/admin/audit', label: t('auditLogs'), icon: '📜', permission: 'view_audit_logs' },
            ]
        }
    ];

    useEffect(() => {
        // Auto-expand section containing current route
        const activeSection = menuSections.find(section =>
            section.items.find(item => item.path === location.pathname)
        );
        if (activeSection) {
            setExpandedSections(prev => ({ ...prev, [activeSection.title]: true }));
        }
    }, [location.pathname]);

    const toggleSection = (title) => {
        setExpandedSections(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    const filterItem = (item) => {
        if (item.role && role !== item.role) return false;
        if (item.roles && !item.roles.includes(role)) return false;
        if (item.permission && !hasPermission(item.permission)) return false;
        return true;
    };

    const filteredSections = menuSections.map(section => ({
        ...section,
        items: section.items.filter(filterItem)
    })).filter(section => section.items.length > 0);

    const allFilteredItems = filteredSections.flatMap(s => s.items);

    return (
        <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-main)] transition-colors duration-300">
            <Navbar />

            <div className="flex pt-16">
                {/* Sidebar */}
                <aside className="w-64 fixed left-0 top-16 bottom-0 bg-[var(--bg-surface)] border-r border-[var(--border-main)] hidden lg:block overflow-y-auto">
                    <div className="p-4 flex flex-col gap-3">
                        {filteredSections.map((section) => {
                            const isExpanded = expandedSections[section.title];
                            const hasActiveItem = section.items.some(item => location.pathname === item.path);

                            return (
                                <div key={section.title} className="flex flex-col gap-1">
                                    <button
                                        onClick={() => toggleSection(section.title)}
                                        className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all group ${hasActiveItem
                                            ? 'bg-blue-500/10 border border-blue-500/20'
                                            : 'hover:bg-[var(--bg-surface-soft)]'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`text-lg transition-transform duration-300 ${isExpanded ? 'scale-110' : ''}`}>
                                                {section.icon}
                                            </span>
                                            <h3 className={`text-xs font-bold uppercase tracking-wider transition-colors ${hasActiveItem
                                                ? 'text-blue-500'
                                                : 'text-[var(--text-muted)] group-hover:text-[var(--text-main)]'
                                                }`}>
                                                {section.title}
                                            </h3>
                                        </div>
                                        <motion.div
                                            animate={{ rotate: isExpanded ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ChevronDown className={`w-4 h-4 transition-colors ${hasActiveItem ? 'text-blue-500' : 'text-[var(--text-muted)]'}`} />
                                        </motion.div>
                                    </button>


                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden flex flex-col gap-1"
                                            >
                                                {section.items.map((item) => {
                                                    const isActive = location.pathname === item.path;
                                                    return (
                                                        <Link
                                                            key={item.path}
                                                            to={item.path}
                                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${isActive
                                                                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/10'
                                                                : 'text-[var(--text-soft)] hover:bg-[var(--bg-surface-soft)] hover:text-[var(--text-main)]'
                                                                }`}
                                                        >
                                                            <span className="text-lg">{item.icon}</span>
                                                            <span className="font-semibold text-sm">{item.label}</span>
                                                        </Link>
                                                    );
                                                })}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </aside>


                {/* Main Content */}
                <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-10 transition-all duration-300">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Nav */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-surface)] border-t border-[var(--border-main)] backdrop-blur-md flex items-center justify-around h-16 z-50 overflow-x-auto">
                {allFilteredItems.slice(0, 5).map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center gap-1 p-2 min-w-[64px] ${isActive ? 'text-blue-500' : 'text-[var(--text-muted)]'
                                }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-[10px] font-bold uppercase tracking-tight truncate w-full text-center">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default DashboardLayout;

