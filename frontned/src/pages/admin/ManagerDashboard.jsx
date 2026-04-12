import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Users, Clock, Calendar, CheckSquare } from 'lucide-react';
import reportService from '../../services/reportService';
import { useSettings } from '../../context/SettingsContext';

const ManagerDashboard = () => {
    const { t } = useSettings();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await reportService.getManagerDashboard();
                setData(result);
            } catch (error) {
                console.error("Failed to fetch manager dashboard:", error);
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
            <div>
                <h1 className="text-3xl font-black tracking-tight">{t('managerDashboard') || 'Manager Dashboard'}</h1>
                <p className="text-[var(--text-soft)]">{t('managerOverviewDesc') || 'Team performance and attendance overview'}</p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: t('teamSize'), value: data?.metrics?.teamSize, icon: Users, color: 'blue' },
                    { label: t('presentToday'), value: data?.metrics?.presentToday, icon: CheckSquare, color: 'emerald' },
                    { label: t('onLeaveToday'), value: data?.metrics?.onLeaveToday, icon: Calendar, color: 'purple' },
                    { label: t('attendanceRate'), value: data?.metrics?.attendanceRate, icon: Clock, color: 'amber' }
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

            <div className="bg-[var(--bg-surface)] p-8 rounded-[2rem] border border-[var(--border-main)] shadow-sm">
                <h2 className="text-xl font-bold mb-8">{t('weeklyAttendance') || 'Weekly Attendance'}</h2>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data?.weeklyAttendance}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-main)" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: '12px' }} />
                            <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
