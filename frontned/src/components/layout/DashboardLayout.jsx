import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown,
    ChevronRight,
    Home,
    LayoutDashboard,
    User,
    Clock,
    Calendar,
    ClipboardList,
    CheckCircle,
    BarChart3,
    FileText,
    PenSquare,
    CalendarDays,
    Scale,
    Settings2,
    Users,
    Building2,
    Briefcase,
    Network,
    Timer,
    CalendarRange,
    Repeat,
    ClipboardCopy,
    Layers,
    RefreshCw,
    TrendingUp,
    Megaphone,
    FilePlus,
    UserPlus,
    Kanban,
    Video,
    HandCoins,
    Wallet,
    Landmark,
    FileLineChart,
    PieChart,
    BarChart,
    Activity,
    LineChart,
    Coins,
    FileBarChart,
    ShieldCheck,
    ShieldAlert,
    History
} from 'lucide-react';
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
            icon: <Home className="w-5 h-5" />,
            items: [
                { path: '/dashboard', label: t('dashboard'), icon: <LayoutDashboard className="w-4 h-4" /> },
                { path: '/profile', label: t('profile'), icon: <User className="w-4 h-4" /> },
            ]
        },
        {
            title: t('timeAndAttendance'),
            icon: <Clock className="w-5 h-5" />,
            items: [
                { path: '/attendance', label: t('attendance'), icon: <Clock className="w-4 h-4" /> },
                { path: '/attendance/calendar', label: t('attendanceCalendar'), icon: <Calendar className="w-4 h-4" /> },
                { path: '/attendance/team', label: t('todayAttendance'), icon: <ClipboardList className="w-4 h-4" />, roles: ['admin', 'hr', 'manager'] },
                { path: '/attendance/approvals', label: t('pendingApprovals'), icon: <CheckCircle className="w-4 h-4" />, roles: ['admin', 'hr', 'manager'] },
                { path: '/attendance/reports', label: t('attendanceReports'), icon: <BarChart3 className="w-4 h-4" />, roles: ['admin', 'hr', 'manager', 'finance'] },
            ]
        },
        {
            title: t('leaveManagement'),
            icon: <FileText className="w-5 h-5" />,
            items: [
                { path: '/leave/request', label: t('requestLeave'), icon: <PenSquare className="w-4 h-4" /> },
                { path: '/leave/history', label: t('myLeave'), icon: <CalendarDays className="w-4 h-4" /> },
                { path: '/leave/encashments', label: t('leaveEncashment') || 'Leave Encashment', icon: <Coins className="w-4 h-4" /> },
                { path: '/leave/approvals', label: t('leaveApprovals'), icon: <Scale className="w-4 h-4" />, roles: ['admin', 'hr', 'manager'] },
                { path: '/leave/types', label: t('leaveTypes'), icon: <Settings2 className="w-4 h-4" />, roles: ['admin', 'hr'] },
                { path: '/leave/blackout', label: t('blackoutDates') || 'Blackout Dates', icon: <ShieldAlert className="w-4 h-4" />, roles: ['admin', 'hr'] },
            ]
        },
        {
            title: t('workforce'),
            icon: <Users className="w-5 h-5" />,
            items: [
                { path: '/employees', label: t('employees'), icon: <Users className="w-4 h-4" />, permission: 'view_employees' },
                { path: '/departments', label: t('departments'), icon: <Building2 className="w-4 h-4" />, roles: ['admin', 'hr', 'manager'] },
                { path: '/positions', label: t('positions'), icon: <Briefcase className="w-4 h-4" />, roles: ['admin', 'hr', 'manager'] },
                { path: '/org-chart', label: t('orgChart'), icon: <Network className="w-4 h-4" />, permission: 'view_employees' },
            ]
        },
        {
            title: t('shiftManagement'),
            icon: <Timer className="w-5 h-5" />,
            items: [
                { path: '/shifts/my', label: t('myShifts'), icon: <Timer className="w-4 h-4" /> },
                { path: '/shifts/calendar', label: t('shiftScheduler'), icon: <CalendarRange className="w-4 h-4" />, roles: ['admin', 'hr', 'manager'] },
                { path: '/shifts/swaps', label: t('shiftSwaps'), icon: <Repeat className="w-4 h-4" /> },
                { path: '/shifts/templates', label: t('shiftTemplates'), icon: <ClipboardCopy className="w-4 h-4" />, roles: ['admin', 'hr', 'manager'] },
                { path: '/shifts/types', label: t('shiftTypes'), icon: <Layers className="w-4 h-4" />, roles: ['admin', 'hr'] },
                { path: '/shifts/rotations', label: t('shiftRotations'), icon: <RefreshCw className="w-4 h-4" />, roles: ['admin', 'hr', 'manager'] },
                { path: '/shifts/reports', label: t('shiftReports'), icon: <TrendingUp className="w-4 h-4" />, roles: ['admin', 'hr', 'manager', 'finance'] },
            ]
        },
        {
            title: t('recruitment'),
            icon: <Megaphone className="w-5 h-5" />,
            items: [
                { path: '/recruitment/jobs', label: t('jobPostings'), icon: <FilePlus className="w-4 h-4" />, roles: ['admin', 'hr'] },
                { path: '/recruitment/applicants', label: t('applicants'), icon: <UserPlus className="w-4 h-4" />, roles: ['admin', 'hr'] },
                { path: '/recruitment/pipeline', label: t('pipeline'), icon: <Kanban className="w-4 h-4" />, roles: ['admin', 'hr'] },
                { path: '/recruitment/interviews', label: t('interviews'), icon: <Video className="w-4 h-4" />, roles: ['admin', 'hr', 'manager'] },
                { path: '/recruitment/offers', label: t('offers'), icon: <HandCoins className="w-4 h-4" />, roles: ['admin', 'hr'] },
            ]
        },
        {
            title: t('payroll'),
            icon: <Wallet className="w-5 h-5" />,
            items: [
                { path: '/payroll/periods', label: t('payrollManagement'), icon: <Landmark className="w-4 h-4" />, roles: ['admin', 'hr', 'finance'] },
                { path: '/payroll/payslips', label: t('myPayslips'), icon: <FileLineChart className="w-4 h-4" /> },
            ]
        },
        {
            title: t('analytics'),
            icon: <PieChart className="w-5 h-5" />,
            items: [
                { path: '/dashboard/executive', label: t('executiveAnalytics'), icon: <BarChart className="w-4 h-4" />, roles: ['admin', 'hr', 'finance'] },
                { path: '/dashboard/hr', label: t('hrAnalytics'), icon: <Activity className="w-4 h-4" />, roles: ['admin', 'hr'] },
                { path: '/dashboard/manager', label: t('teamAnalytics'), icon: <LineChart className="w-4 h-4" />, roles: ['admin', 'hr', 'manager'] },
                { path: '/dashboard/finance', label: t('financeAnalytics'), icon: <Coins className="w-4 h-4" />, roles: ['admin', 'hr', 'finance'] },
                { path: '/reports', label: t('reportCenter'), icon: <FileBarChart className="w-4 h-4" />, roles: ['admin', 'hr', 'manager', 'finance'] },
            ]
        },
        {
            title: t('administration'),
            icon: <ShieldCheck className="w-5 h-5" />,
            items: [
                { path: '/admin/roles', label: t('rolesAndSecurity'), icon: <ShieldAlert className="w-4 h-4" />, role: 'admin' },
                { path: '/admin/audit', label: t('auditLogs'), icon: <History className="w-4 h-4" />, permission: 'view_audit_logs' },
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
                <aside className="w-72 fixed left-0 top-16 bottom-0 bg-[var(--bg-surface)]/80 backdrop-blur-xl border-r border-[var(--border-main)] hidden lg:block overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--border-main)] hover:scrollbar-thumb-[var(--text-muted)] transition-all duration-300">
                    <div className="p-5 flex flex-col gap-6">
                        {filteredSections.map((section) => {
                            const isExpanded = expandedSections[section.title];
                            const hasActiveItem = section.items.some(item => location.pathname === item.path);

                            return (
                                <div key={section.title} className="flex flex-col gap-2">
                                    <button
                                        onClick={() => toggleSection(section.title)}
                                        className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-300 group ${hasActiveItem
                                            ? 'bg-blue-500/10'
                                            : 'hover:bg-[var(--bg-surface-soft)]'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <div className={`p-2 rounded-lg transition-all duration-300 ${hasActiveItem
                                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                                : 'bg-[var(--bg-surface-soft)] text-[var(--text-muted)] group-hover:text-[var(--text-main)] group-hover:bg-[var(--border-main)]'}`}>
                                                {section.icon}
                                            </div>
                                            <h3 className={`text-[11px] font-bold uppercase tracking-[0.15em] transition-colors ${hasActiveItem
                                                ? 'text-[var(--text-main)]'
                                                : 'text-[var(--text-muted)] group-hover:text-[var(--text-main)]'
                                                }`}>
                                                {section.title}
                                            </h3>
                                        </div>
                                        <motion.div
                                            animate={{ rotate: isExpanded ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ChevronDown className={`w-3.5 h-3.5 transition-colors ${hasActiveItem ? 'text-blue-500' : 'text-[var(--text-muted)]'}`} />
                                        </motion.div>
                                    </button>


                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden flex flex-col gap-1.5 ml-3 pl-4 border-l border-[var(--border-main)]/50"
                                            >
                                                {section.items.map((item) => {
                                                    const isActive = location.pathname === item.path;
                                                    return (
                                                        <Link
                                                            key={item.path}
                                                            to={item.path}
                                                            className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 relative ${isActive
                                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                                                                : 'text-[var(--text-soft)] hover:bg-[var(--bg-surface-soft)] hover:text-[var(--text-main)]'
                                                                }`}
                                                        >
                                                            {isActive && (
                                                                <motion.div
                                                                    layoutId="active-indicator"
                                                                    className="absolute -left-4 w-1 h-5 bg-blue-500 rounded-r-full"
                                                                />
                                                            )}
                                                            <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                                                {item.icon}
                                                            </span>
                                                            <span className="font-medium text-[13px]">{item.label}</span>
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
                <main className="flex-1 lg:ml-72 p-4 sm:p-6 lg:p-10 transition-all duration-300">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Nav */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-surface)]/80 backdrop-blur-xl border-t border-[var(--border-main)] flex items-center justify-around h-16 z-50 overflow-x-auto">
                {allFilteredItems.slice(0, 5).map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center gap-1 p-2 min-w-[64px] transition-all duration-300 ${isActive ? 'text-blue-500 scale-110' : 'text-[var(--text-muted)]'
                                }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span className="text-[9px] font-bold uppercase tracking-tight truncate w-full text-center">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default DashboardLayout;

