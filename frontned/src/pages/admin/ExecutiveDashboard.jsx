import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Users, TrendingUp, DollarSign, Building2, Download } from 'lucide-react';
import reportService from '../../services/reportService';
import { useSettings } from '../../context/SettingsContext';
import Button from '../../components/ui/Button';

const COLORS = ['#2563eb', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

const ExecutiveDashboard = () => {
    const { t } = useSettings();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await reportService.getExecutiveDashboard();
                setData(result);
            } catch (error) {
                console.error("Failed to fetch executive dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const exportToExcel = () => {
        reportService.exportReport('employee-headcount');
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">{t('executiveDashboard') || 'Executive Dashboard'}</h1>
                    <p className="text-[var(--text-soft)]">{t('executiveOverviewDesc') || 'Strategic overview of workforce and performance'}</p>
                </div>
                <Button onClick={exportToExcel} variant="secondary" className="flex items-center gap-2">
                    <Download className="w-4 h-4" /> {t('exportReport') || 'Export Data'}
                </Button>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: t('totalEmployees'), value: data?.metrics?.totalEmployees, icon: Users, color: 'blue' },
                    { label: t('turnoverRate'), value: data?.metrics?.turnoverRate, icon: TrendingUp, color: 'purple' },
                    { label: t('totalPayroll'), value: `$${data?.metrics?.totalPayrollCost?.toLocaleString()}`, icon: DollarSign, color: 'emerald' },
                    { label: t('activeDepartments'), value: data?.metrics?.totalDepts, icon: Building2, color: 'amber' }
                ].map((card, idx) => (
                    <div key={idx} className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border-main)] shadow-sm">
                        <div className={`p-3 rounded-2xl bg-${card.color}-500/10 text-${card.color}-500 w-fit mb-4`}>
                            <card.icon className="w-6 h-6" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">{card.label}</p>
                        <h3 className="text-3xl font-black">{card.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Headcount Trend */}
                <div className="bg-[var(--bg-surface)] p-8 rounded-[2rem] border border-[var(--border-main)] shadow-sm">
                    <h2 className="text-xl font-bold mb-8">{t('headcountTrend') || 'Headcount Trend'}</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data?.headcountTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-main)" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)', borderRadius: '12px' }}
                                    itemStyle={{ color: 'var(--text-main)', fontWeight: 'bold' }}
                                />
                                <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={4} dot={{ r: 6, fill: '#2563eb' }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Dept Distribution */}
                <div className="bg-[var(--bg-surface)] p-8 rounded-[2rem] border border-[var(--border-main)] shadow-sm">
                    <h2 className="text-xl font-bold mb-8">{t('deptDistribution') || 'Department Distribution'}</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.deptDistribution}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-main)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)', borderRadius: '12px' }}
                                />
                                <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExecutiveDashboard;
