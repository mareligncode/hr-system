import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { DollarSign, PieChart as PieIcon, CreditCard, Activity } from 'lucide-react';
import reportService from '../../services/reportService';
import { useSettings } from '../../context/SettingsContext';

const FinanceDashboard = () => {
    const { t } = useSettings();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await reportService.getFinanceDashboard();
                setData(result);
            } catch (error) {
                console.error("Failed to fetch finance dashboard:", error);
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
                <h1 className="text-3xl font-black tracking-tight">{t('financeDashboard') || 'Finance Dashboard'}</h1>
                <p className="text-[var(--text-soft)]">{t('financeOverviewDesc') || 'Payroll costs and labor expense analytics'}</p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: t('currentPayroll'), value: `$${data?.metrics?.currentPayroll?.toLocaleString()}`, icon: DollarSign, color: 'blue' },
                    { label: t('netPayable'), value: `$${data?.metrics?.netPay?.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: CreditCard, color: 'purple' },
                    { label: t('totalOT'), value: data?.metrics?.totalOT, icon: Activity, color: 'amber' },
                    { label: t('laborCostRatio'), value: data?.metrics?.laborCostRatio, icon: PieIcon, color: 'emerald' }
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
                {/* Payroll History */}
                <div className="bg-[var(--bg-surface)] p-8 rounded-[2rem] border border-[var(--border-main)] shadow-sm">
                    <h2 className="text-xl font-bold mb-8">{t('payrollHistory') || 'Payroll History'}</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.payrollHistory}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-main)" />
                                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                                <Bar dataKey="amount" fill="#2563eb" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Labor Cost by Dept */}
                <div className="bg-[var(--bg-surface)] p-8 rounded-[2rem] border border-[var(--border-main)] shadow-sm">
                    <h2 className="text-xl font-bold mb-8">{t('laborCostByDept') || 'Labor Cost by Department'}</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.laborCostByDept} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-main)" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} width={100} />
                                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                                <Bar dataKey="cost" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinanceDashboard;
