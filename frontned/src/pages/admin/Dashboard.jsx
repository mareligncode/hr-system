import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
    Users, Building2, MapPin, Award,
    AlertTriangle, Calendar, FileText,
    ArrowUpRight, Clock, Activity, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import dashboardService from '../../services/dashboardService';
import { useSettings } from '../../context/SettingsContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import Button from '../../components/ui/Button';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

const Dashboard = () => {
    const { t } = useSettings();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [stats, setStats] = useState(null);
    const [employeeData, setEmployeeData] = useState(null);
    const [expiring, setExpiring] = useState({ documents: [], certifications: [] });
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    const isEmployee = user?.role === 'employee';
    const canSeeStats = ['admin', 'hr', 'manager', 'finance'].includes(user?.role);
    const canSeeAlerts = ['admin', 'hr', 'manager'].includes(user?.role);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // All users can have an employee profile, so we always try to fetch it
                const employeeProfilePromise = dashboardService.getEmployeeDashboard().catch(() => null);

                const promises = [employeeProfilePromise];
                if (canSeeStats) promises.push(dashboardService.getStats());
                else promises.push(Promise.resolve(null));

                if (canSeeAlerts) {
                    promises.push(dashboardService.getExpiringAssets());
                    if (['admin', 'hr'].includes(user?.role)) {
                        promises.push(dashboardService.getActivity());
                    } else {
                        promises.push(Promise.resolve([]));
                    }
                } else {
                    promises.push(Promise.resolve({ documents: [], certifications: [] }));
                    promises.push(Promise.resolve([]));
                }

                const [empData, statsData, expiringData, activityData] = await Promise.all(promises);

                // Flatten complex chart data if needed
                if (statsData?.payrollTrends) {
                    statsData.payrollTrends = statsData.payrollTrends.map(item => ({
                        ...item,
                        total_payroll: item.PayrollItems?.[0]?.total_payroll || 0
                    }));
                }

                setEmployeeData(empData);
                setStats(statsData);
                setExpiring(expiringData || { documents: [], certifications: [] });
                setActivity(activityData || []);
            } catch (error) {
                console.error("Dashboard Load Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [user?.role, canSeeStats, canSeeAlerts]);

    const statCards = [
        {
            label: stats?.isScoped ? t('teamSize') : t('totalWorkforce'),
            value: stats?.metrics?.totalEmployees || 0,
            icon: Users,
            color: 'blue',
            trend: stats?.isScoped ? t('activeStaff') : t('fromLastMonth', { percent: '4%' })
        },
        {
            label: stats?.isScoped ? t('departmentUnit') : t('departments'),
            value: stats?.metrics?.totalDepartments || 0,
            icon: Building2,
            color: 'purple',
            trend: t('activeUnits')
        },
        {
            label: stats?.isScoped ? t('teamCerts') : t('activeCerts'),
            value: stats?.metrics?.activeCertifications || 0,
            icon: Award,
            color: 'emerald',
            trend: t('complianceRate', { rate: '94%' })
        },
        {
            label: stats?.isScoped ? t('departmentPositions') : t('openPositions'),
            value: stats?.metrics?.totalPositions || 0,
            icon: MapPin,
            color: 'amber',
            trend: t('hiringActive')
        }
    ];

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-6 sm:space-y-8 pb-20">
            {/* Welcome Header */}
            <div className="bg-[var(--bg-surface)] p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] border border-[var(--border-main)] shadow-sm relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
                            {t('welcomeBack')}, {user?.first_name}!
                        </h1>
                        <p className="text-[var(--text-soft)] text-xs sm:text-sm max-w-md">
                            {isEmployee
                                ? t('dashboardWelcomeEmployee')
                                : t('dashboardWelcome')}
                        </p>
                    </div>

                    {employeeData && (
                        <div className="flex flex-wrap gap-3 sm:gap-4">
                            <div className="bg-blue-500/10 border border-blue-500/20 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3 flex-grow sm:flex-none sm:min-w-[200px]">
                                <div className="p-1.5 sm:p-2 bg-blue-500 rounded-lg text-white">
                                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div>
                                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-blue-500">{t('department')}</p>
                                    <p className="text-xs sm:text-sm font-bold text-[var(--text-main)] transition-colors">{employeeData.organization?.department?.name || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="bg-purple-500/10 border border-purple-500/20 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3 flex-grow sm:flex-none sm:min-w-[200px]">
                                <div className="p-1.5 sm:p-2 bg-purple-500 rounded-lg text-white">
                                    <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div>
                                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-purple-500">{t('position')}</p>
                                    <p className="text-xs sm:text-sm font-bold text-[var(--text-main)] transition-colors">{employeeData.organization?.position?.title || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Activity className="w-32 h-32" />
                </div>
            </div>

            {/* Employee Content */}
            {isEmployee && employeeData && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Stats & Quick Actions */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Record Stats */}
                        <div className="bg-[var(--bg-surface)] p-5 sm:p-6 rounded-3xl sm:rounded-[2rem] border border-[var(--border-main)] shadow-sm">
                            <h3 className="text-base sm:text-lg font-bold mb-6 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-500" />
                                {t('personalRecords')}
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 sm:p-4 bg-[var(--bg-surface-soft)] rounded-xl sm:rounded-2xl border border-[var(--border-main)]/50">
                                    <div>
                                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{t('documents')}</p>
                                        <p className="text-lg sm:text-xl font-black">{employeeData.stats.totalDocuments}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] sm:text-[10px] font-bold text-emerald-500">{employeeData.stats.verifiedDocuments} {t('verified')}</p>
                                        <p className="text-[9px] sm:text-[10px] font-bold text-rose-500">{employeeData.stats.expiringDocuments} {t('expiringSoon')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 sm:p-4 bg-[var(--bg-surface-soft)] rounded-xl sm:rounded-2xl border border-[var(--border-main)]/50">
                                    <div>
                                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{t('certifications')}</p>
                                        <p className="text-lg sm:text-xl font-black">{employeeData.stats.totalCertifications}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] sm:text-[10px] font-bold text-emerald-500">{employeeData.stats.verifiedCertifications} {t('verified')}</p>
                                        <p className="text-[9px] sm:text-[10px] font-bold text-amber-500">{employeeData.stats.expiringCertifications} {t('expiringSoon')}</p>
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="secondary"
                                className="w-full mt-6 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest border-[var(--border-main)]"
                                onClick={() => navigate(`/profile/${user.id}`)}
                            >
                                {t('manageRecords')} <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>

                        {/* Org Manager Card */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 sm:p-8 rounded-3xl sm:rounded-[2rem] text-white shadow-xl relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">{t('reportingTo')}</p>
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-base sm:text-lg">
                                            {employeeData.organization.manager
                                                ? `${employeeData.organization.manager.first_name} ${employeeData.organization.manager.last_name}`
                                                : t('noDirectManager')}
                                        </h4>
                                        <p className="text-slate-400 text-xs sm:text-sm">{employeeData.organization.manager?.email || "N/A"}</p>
                                    </div>
                                </div>
                                <button className="mt-6 sm:mt-8 text-[10px] sm:text-xs font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2">
                                    {t('contactManager')} <ArrowUpRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Users className="w-24 h-24" />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Detailed Context */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Position Description */}
                        <div className="bg-[var(--bg-surface)] p-8 rounded-[2rem] border border-[var(--border-main)] shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
                                    <Award className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold">{t('positionDescription')}</h2>
                            </div>
                            <div className="prose prose-sm text-[var(--text-soft)] max-w-none">
                                <p className="leading-relaxed whitespace-pre-line">
                                    {employeeData.organization.position?.job_description || t('noJobDescription')}
                                </p>
                            </div>
                        </div>

                        {/* Employment Timeline & Details */}
                        <div className="bg-[var(--bg-surface)] p-6 sm:p-8 rounded-3xl sm:rounded-[2rem] border border-[var(--border-main)] shadow-sm">
                            <div className="flex items-center gap-3 mb-6 sm:mb-8">
                                <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <h2 className="text-lg sm:text-xl font-bold">{t('employmentDetails')}</h2>
                            </div>
                            <div className="grid grid-cols-2 gap-6 sm:gap-8">
                                <div className="space-y-1">
                                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{t('hireDate')}</p>
                                    <p className="font-bold text-sm sm:text-lg">{format(new Date(employeeData.profile.hire_date), 'MMM d, yyyy')}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{t('contractType')}</p>
                                    <p className="font-bold text-sm sm:text-lg capitalize">{employeeData.profile.contract_type}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{t('empNumber')}</p>
                                    <p className="font-bold text-sm sm:text-lg">{employeeData.profile.employee_number}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{t('employeeStatus')}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="font-bold text-emerald-500 uppercase text-[9px] sm:text-xs tracking-widest">{employeeData.profile.employment_status}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Role-Based Quick Actions */}
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                <Button
                    variant="outline"
                    className="flex flex-col items-center gap-2 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-[var(--border-main)] hover:bg-blue-500/5 hover:border-blue-500/30 group"
                    onClick={() => navigate('/attendance/my')}
                >
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 group-hover:scale-110 transition-transform" />
                    <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-center">{t('clockInOut')}</span>
                </Button>
                {['admin', 'hr'].includes(user?.role) && (
                    <Button
                        variant="outline"
                        className="flex flex-col items-center gap-2 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-[var(--border-main)] hover:bg-purple-500/5 hover:border-purple-500/30 group"
                        onClick={() => navigate('/employees/add')}
                    >
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500 group-hover:scale-110 transition-transform" />
                        <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-center">{t('addEmployee')}</span>
                    </Button>
                )}
                {['admin', 'finance'].includes(user?.role) && (
                    <Button
                        variant="outline"
                        className="flex flex-col items-center gap-2 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-[var(--border-main)] hover:bg-emerald-500/5 hover:border-emerald-500/30 group"
                        onClick={() => navigate('/payroll/periods')}
                    >
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 group-hover:scale-110 transition-transform" />
                        <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-center">{t('processPayroll')}</span>
                    </Button>
                )}
                <Button
                    variant="outline"
                    className="flex flex-col items-center gap-2 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-[var(--border-main)] hover:bg-amber-500/5 hover:border-amber-500/30 group"
                    onClick={() => navigate('/leave/request')}
                >
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 group-hover:scale-110 transition-transform" />
                    <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-center">{t('requestLeave')}</span>
                </Button>
                <Button
                    variant="outline"
                    className="flex flex-col items-center gap-2 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-[var(--border-main)] hover:bg-rose-500/5 hover:border-rose-500/30 group"
                    onClick={() => navigate('/notifications')}
                >
                    <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500 group-hover:scale-110 transition-transform" />
                    <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-center">{t('viewActivity')}</span>
                </Button>
            </div>

            {/* Content for Admins/Managers only */}
            {!isEmployee && (
                <>
                    {/* Metrics Grid */}
                    {canSeeStats && (
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            {statCards.map((card, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-[var(--bg-surface)] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[var(--border-main)] hover:border-blue-500/30 transition-all group shadow-sm"
                                >
                                    <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-${card.color}-500/10 text-${card.color}-500 w-fit mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
                                        <card.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1 truncate">{card.label}</p>
                                    <div className="flex flex-col sm:flex-row sm:items-end gap-1 sm:gap-2">
                                        <h3 className="text-xl sm:text-3xl font-black">{card.value}</h3>
                                        <span className="text-[8px] sm:text-[10px] text-emerald-500 font-bold mb-1 flex items-center">
                                            <ArrowUpRight className="w-3 h-3 mr-0.5" /> {card.trend}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Advanced Analytics Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                        {/* Workforce Composition Chart */}
                        <div className="bg-[var(--bg-surface)] p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] border border-[var(--border-main)] shadow-sm">
                            <h2 className="text-lg sm:text-xl font-bold mb-6 sm:mb-8 flex items-center gap-3">
                                <Users className="w-5 h-5 text-blue-500" />
                                {t('departmentDistribution')}
                            </h2>
                            <div className="h-[250px] sm:h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats?.departmentDistribution || []}
                                            dataKey="employee_count"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={5}
                                        >
                                            {(stats?.departmentDistribution || []).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)', borderRadius: '1rem' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Attendance Trends Chart */}
                        <div className="bg-[var(--bg-surface)] p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] border border-[var(--border-main)] shadow-sm">
                            <h2 className="text-lg sm:text-xl font-bold mb-6 sm:mb-8 flex items-center gap-3">
                                <Activity className="w-5 h-5 text-emerald-500" />
                                {t('attendancePulse')}
                            </h2>
                            <div className="h-[250px] sm:h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats?.attendanceTrends || []}>
                                        <defs>
                                            <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-main)" />
                                        <XAxis dataKey="week" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)', borderRadius: '1rem' }}
                                        />
                                        <Area type="monotone" dataKey="total_hours" stroke="#10b981" fillOpacity={1} fill="url(#colorHours)" strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Payroll Trends Chart - only for finance/admin */}
                        {['admin', 'finance'].includes(user?.role) && (
                            <div className="bg-[var(--bg-surface)] p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] border border-[var(--border-main)] shadow-sm">
                                <h2 className="text-lg sm:text-xl font-bold mb-6 sm:mb-8 flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-purple-500" />
                                    {t('payrollFlow')}
                                </h2>
                                <div className="h-[250px] sm:h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats?.payrollTrends || []}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-main)" />
                                            <XAxis dataKey="description" stroke="var(--text-muted)" fontSize={8} tickLine={false} axisLine={false} />
                                            <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }}
                                                contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)', borderRadius: '1rem' }}
                                            />
                                            <Bar dataKey="total_payroll" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={30} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Employee Growth Chart */}
                        <div className="bg-[var(--bg-surface)] p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] border border-[var(--border-main)] shadow-sm">
                            <h2 className="text-lg sm:text-xl font-bold mb-6 sm:mb-8 flex items-center gap-3">
                                <Building2 className="w-5 h-5 text-amber-500" />
                                {t('workforceGrowth')}
                            </h2>
                            <div className="h-[250px] sm:h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats?.employeeGrowth || []}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-main)" />
                                        <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)', borderRadius: '1rem' }}
                                        />
                                        <Bar dataKey="hires" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {(canSeeAlerts || canSeeStats) && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Expiring Alerts */}
                            {canSeeAlerts && (
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-[var(--bg-surface)] rounded-3xl sm:rounded-[2rem] border border-[var(--border-main)] shadow-sm overflow-hidden min-h-[350px] sm:min-h-[400px]">
                                        <div className="p-6 sm:p-8 border-b border-[var(--border-main)] flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 sm:p-2.5 rounded-xl bg-rose-500/10 text-rose-500">
                                                    <AlertTriangle className="w-5 h-5" />
                                                </div>
                                                <h2 className="text-lg sm:text-xl font-bold">{t('complianceAlerts')}</h2>
                                            </div>
                                            <span className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                                                {expiring.documents.length + expiring.certifications.length} {t('critical')}
                                            </span>
                                        </div>

                                        <div className="p-4 space-y-3">
                                            {[...expiring.documents, ...expiring.certifications].length === 0 ? (
                                                <div className="py-20 text-center flex flex-col items-center">
                                                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                                                        < Award className="w-8 h-8" />
                                                    </div>
                                                    <p className="text-[var(--text-soft)] font-medium">{t('allAssetsCompliant')}</p>
                                                </div>
                                            ) : (
                                                <>
                                                    {expiring.documents.map((doc) => (
                                                        <div key={doc.id} className="group p-4 bg-[var(--bg-surface-soft)]/50 rounded-2xl border border-transparent hover:border-rose-500/20 transition-all flex items-center justify-between">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-white border border-[var(--border-main)] flex items-center justify-center text-[var(--text-soft)]">
                                                                    <FileText className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-sm font-bold">{doc.document_name}</h4>
                                                                    <p className="text-[11px] text-[var(--text-muted)]">{t('employees')}: {doc.Employee?.User?.first_name} {doc.Employee?.User?.last_name}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[10px] font-black uppercase text-rose-500 mb-1">{t('expiresIn')}</p>
                                                                <div className="flex items-center gap-2 text-rose-600">
                                                                    <Clock className="w-3.5 h-3.5" />
                                                                    <span className="text-sm font-bold">{format(new Date(doc.expiry_date), 'MMM d, yyyy')}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {expiring.certifications.map((cert) => (
                                                        <div key={cert.id} className="group p-4 bg-[var(--bg-surface-soft)]/50 rounded-2xl border border-transparent hover:border-amber-500/20 transition-all flex items-center justify-between">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-white border border-[var(--border-main)] flex items-center justify-center text-[var(--text-soft)]">
                                                                    <Award className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-sm font-bold">{cert.certification_name}</h4>
                                                                    <p className="text-[11px] text-[var(--text-muted)]">{t('employees')}: {cert.Employee?.User?.first_name} {cert.Employee?.User?.last_name}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[10px] font-black uppercase text-amber-500 mb-1">{t('expiresIn')}</p>
                                                                <div className="flex items-center gap-2 text-amber-600">
                                                                    <Clock className="w-3.5 h-3.5" />
                                                                    <span className="text-sm font-bold">{format(new Date(cert.expiry_date), 'MMM d, yyyy')}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Recent Activity Timeline */}
                            {canSeeAlerts && (
                                <div className="space-y-6">
                                    <div className="bg-[var(--bg-surface)] rounded-[2rem] border border-[var(--border-main)] shadow-sm overflow-hidden h-full">
                                        <div className="p-8 border-b border-[var(--border-main)] flex items-center justify-between">
                                            <h2 className="text-xl font-bold">{t('activityPulse')}</h2>
                                            <Activity className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <div className="p-6 relative">
                                            {/* Vertical Line */}
                                            <div className="absolute left-10 top-10 bottom-10 w-px bg-[var(--border-main)]" />

                                            <div className="space-y-8 relative">
                                                {activity.map((log, idx) => (
                                                    <div key={log.id} className="flex gap-4">
                                                        <div className="relative z-10 w-8 h-8 rounded-full bg-[var(--bg-surface)] border-2 border-[var(--border-main)] flex items-center justify-center">
                                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <p className="text-xs font-bold">{log.User?.first_name} {log.User?.last_name}</p>
                                                                <span className="text-[10px] text-[var(--text-muted)]">{format(new Date(log.created_at), 'HH:mm')}</span>
                                                            </div>
                                                            <p className="text-xs text-[var(--text-soft)] mb-2">
                                                                <span className="text-blue-500 font-bold uppercase tracking-tighter text-[10px] mr-2">{log.action}</span>
                                                                {log.model_name} #{log.model_id}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <Button
                                                variant="secondary"
                                                className="w-full mt-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-[var(--border-main)] hover:bg-[var(--bg-surface-soft)]"
                                                onClick={() => navigate('/admin/audit')}
                                            >
                                                {t('viewDetailedLogs')} <ChevronRight className="w-3.5 h-3.5 ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Dashboard;
