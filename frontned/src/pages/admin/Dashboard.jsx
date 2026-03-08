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
import Button from '../../components/ui/Button';

const Dashboard = () => {
    const { t } = useSettings();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [stats, setStats] = useState(null);
    const [expiring, setExpiring] = useState({ documents: [], certifications: [] });
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    const isEmployee = user?.role === 'employee';
    const canSeeStats = ['admin', 'hr', 'manager'].includes(user?.role);
    const canSeeAlerts = ['admin', 'hr'].includes(user?.role);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!canSeeStats && !canSeeAlerts) {
                setLoading(false);
                return;
            }

            try {
                const promises = [];
                if (canSeeStats) promises.push(dashboardService.getStats());
                else promises.push(Promise.resolve(null));

                if (canSeeAlerts) {
                    promises.push(dashboardService.getExpiringAssets());
                    promises.push(dashboardService.getActivity());
                } else {
                    promises.push(Promise.resolve({ documents: [], certifications: [] }));
                    promises.push(Promise.resolve([]));
                }

                const [statsData, expiringData, activityData] = await Promise.all(promises);

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
    }, [canSeeStats, canSeeAlerts]);

    const statCards = [
        { label: t('totalWorkforce'), value: stats?.metrics?.totalEmployees || 0, icon: Users, color: 'blue', trend: '+4% from last month' },
        { label: t('departments'), value: stats?.metrics?.totalDepartments || 0, icon: Building2, color: 'purple', trend: 'Active units' },
        { label: t('activeCerts'), value: stats?.metrics?.activeCertifications || 0, icon: Award, color: 'emerald', trend: 'Compliance rate: 94%' },
        { label: t('openPositions'), value: stats?.metrics?.totalPositions || 0, icon: MapPin, color: 'amber', trend: 'Hiring active' }
    ];

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8 pb-20">
            {/* Welcome Header */}
            <div className="bg-[var(--bg-surface)] p-8 rounded-[2.5rem] border border-[var(--border-main)] shadow-sm relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight mb-2">
                            {t('welcomeBack')}, {user?.first_name}!
                        </h1>
                        <p className="text-[var(--text-soft)] text-sm max-w-md">
                            {isEmployee
                                ? "This is your personal workspace. Below are your current organizational assignments."
                                : t('dashboardWelcome')}
                        </p>
                    </div>

                    {isEmployee && user?.employee_details && (
                        <div className="flex flex-wrap gap-4">
                            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex items-center gap-3 min-w-[200px]">
                                <div className="p-2 bg-blue-500 rounded-lg text-white">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">{t('department')}</p>
                                    <p className="font-bold text-[var(--text-main)]">{user.employee_details.department}</p>
                                </div>
                            </div>
                            <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl flex items-center gap-3 min-w-[200px]">
                                <div className="p-2 bg-purple-500 rounded-lg text-white">
                                    <Award className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-purple-500">{t('position')}</p>
                                    <p className="font-bold text-[var(--text-main)]">{user.employee_details.position}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Activity className="w-32 h-32" />
                </div>
            </div>

            {/* Content for Admins/Managers only */}
            {!isEmployee && (
                <>
                    {/* Metrics Grid */}
                    {canSeeStats && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {statCards.map((card, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border-main)] hover:border-blue-500/30 transition-all group shadow-sm"
                                >
                                    <div className={`p-3 rounded-2xl bg-${card.color}-500/10 text-${card.color}-500 w-fit mb-4 group-hover:scale-110 transition-transform`}>
                                        <card.icon className="w-6 h-6" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">{card.label}</p>
                                    <div className="flex items-end gap-2">
                                        <h3 className="text-3xl font-black">{card.value}</h3>
                                        <span className="text-[10px] text-emerald-500 font-bold mb-1.5 flex items-center">
                                            <ArrowUpRight className="w-3 h-3 mr-0.5" /> {card.trend}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {(canSeeAlerts || canSeeStats) && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Expiring Alerts */}
                            {canSeeAlerts && (
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-[var(--bg-surface)] rounded-[2rem] border border-[var(--border-main)] shadow-sm overflow-hidden min-h-[400px]">
                                        <div className="p-8 border-b border-[var(--border-main)] flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500">
                                                    <AlertTriangle className="w-5 h-5" />
                                                </div>
                                                <h2 className="text-xl font-bold">{t('complianceAlerts')}</h2>
                                            </div>
                                            <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest">
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
                                                                    <p className="text-[11px] text-[var(--text-muted)]">Employee: {doc.Employee?.User?.first_name} {doc.Employee?.User?.last_name}</p>
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
