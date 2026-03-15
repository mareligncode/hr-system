import React, { useEffect, useState } from 'react';
import { Legend } from 'recharts';
import {
    BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Cell, PieChart, Pie
} from 'recharts';
import { UserPlus, Calendar, Briefcase, CheckCircle, Download } from 'lucide-react';
import reportService from '../../services/reportService';
import { useSettings } from '../../context/SettingsContext';
import Button from '../../components/ui/Button';

const HRDashboard = () => {
    const { t } = useSettings();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await reportService.getHRDashboard();
                setData(result);
            } catch (error) {
                console.error("Failed to fetch HR dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">{t('hrDashboard') || 'HR Dashboard'}</h1>
                    <p className="text-[var(--text-soft)]">{t('hrOverviewDesc') || 'Operational HR metrics and recruitment pipeline'}</p>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: t('newHires'), value: data?.metrics?.newHires, icon: UserPlus, color: 'blue' },
                    { label: t('pendingLeaves'), value: data?.metrics?.pendingLeaves, icon: Calendar, color: 'purple' },
                    { label: t('activeJobs'), value: data?.metrics?.activeJobs, icon: Briefcase, color: 'emerald' },
                    { label: t('compliance'), value: data?.metrics?.complianceRate, icon: CheckCircle, color: 'amber' }
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
                {/* Hiring Trend */}
                <div className="bg-[var(--bg-surface)] p-8 rounded-[2rem] border border-[var(--border-main)] shadow-sm">
                    <h2 className="text-xl font-bold mb-8">{t('hiringTrend') || 'Hiring Trend'}</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.hiringTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-main)" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                                <Bar dataKey="hires" fill="#2563eb" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Leave by Type */}
                <div className="bg-[var(--bg-surface)] p-8 rounded-[2rem] border border-[var(--border-main)] shadow-sm">
                    <h2 className="text-xl font-bold mb-8">{t('leaveByType') || 'Leave by Type'}</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data?.leaveByType}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="type"
                                >
                                    {data?.leaveByType?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#2563eb', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][index % 5]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HRDashboard;
