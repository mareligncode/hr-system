import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
    DollarSign,
    PieChart as PieIcon,
    CreditCard,
    Activity,
    AlertCircle,
    ArrowRight,
    Download,
    TrendingUp,
    Briefcase
} from 'lucide-react';
import reportService from '../../services/reportService';
import { useSettings } from '../../context/SettingsContext';

const FinanceDashboard = () => {
    const { t } = useSettings();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        fetchData();
    }, []);

    const handleExport = (type) => {
        reportService.exportReport(type);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
    );

    const COLORS = ['#2563eb', '#8b5cf6', '#d946ef', '#f43f5e', '#f59e0b'];

    return (
        <div className="space-y-6 sm:space-y-8 pb-20 px-1">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
                        <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
                        {t('financeDashboard') || 'Finance Dashboard'}
                    </h1>
                    <p className="text-xs sm:text-sm text-[var(--text-soft)]">{t('financeOverviewDesc') || 'Real-time payroll analytics and financial performance tracking'}</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleExport('payroll-summary')}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl sm:rounded-2xl hover:bg-[var(--bg-card)] transition-all font-bold text-xs sm:text-sm"
                    >
                        <Download className="w-4 h-4" />
                        Payroll CSV
                    </button>
                </div>
            </div>

            {/* Action Required Widget */}
            {data?.metrics?.pendingPeriods > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-5 sm:p-6 rounded-3xl sm:rounded-[2rem] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group cursor-pointer hover:bg-amber-500/15 transition-all">
                    <div className="flex items-center gap-4 sm:gap-5">
                        <div className="p-3 sm:p-4 bg-amber-500 text-white rounded-xl sm:rounded-2xl shadow-lg shadow-amber-500/20 animate-pulse flex-shrink-0">
                            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-black text-amber-500 italic uppercase">Action Required</h3>
                            <p className="text-xs sm:text-sm text-amber-500/80 font-bold">
                                There are <span className="text-lg underline">{data.metrics.pendingPeriods}</span> periods awaiting review.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] sm:text-xs text-amber-500 font-black group-hover:translate-x-2 transition-transform uppercase">
                        PROCESS NOW <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                </div>
            )}

            {/* Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                    { label: t('currentPayroll') || 'Current Gross', value: `$${data?.metrics?.currentPayroll?.toLocaleString()}`, icon: DollarSign, color: 'blue' },
                    { label: t('netPayable') || 'Net Payable', value: `$${data?.metrics?.netPay?.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: CreditCard, color: 'purple' },
                    { label: t('deductions') || 'Est. Deductions', value: `$${data?.metrics?.totalDeductions?.toLocaleString()}`, icon: TrendingUp, color: 'rose' },
                    { label: t('totalOT') || 'Total OT Hours', value: data?.metrics?.totalOT, icon: Activity, color: 'amber' }
                ].map((card, idx) => (
                    <div key={idx} className="bg-[var(--bg-surface)] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[var(--border-main)] shadow-sm hover:border-blue-500/50 transition-colors">
                        <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-${card.color}-500/10 text-${card.color}-500 w-fit mb-3 sm:mb-4`}>
                            <card.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1 truncate">{card.label}</p>
                        <h3 className="text-xl sm:text-3xl font-black">{card.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Payroll History */}
                <div className="lg:col-span-2 bg-[var(--bg-surface)] p-6 sm:p-8 rounded-3xl sm:rounded-[2rem] border border-[var(--border-main)] shadow-sm">
                    <div className="flex items-center justify-between mb-6 sm:mb-8">
                        <h2 className="text-lg sm:text-xl font-bold">{t('payrollHistory') || 'Payroll Trend'}</h2>
                        <div className="text-[9px] sm:text-xs font-black text-blue-500 uppercase tracking-tighter">Approved Periods</div>
                    </div>
                    <div className="h-[250px] sm:h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.payrollHistory}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-main)" />
                                <XAxis
                                    dataKey="period"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 'bold' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                                    tickFormatter={(val) => `$${val / 1000}k`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'var(--bg-card)', opacity: 0.4 }}
                                    contentStyle={{
                                        borderRadius: '20px',
                                        backgroundColor: 'var(--bg-surface)',
                                        border: '1px solid var(--border-main)',
                                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Bar dataKey="amount" fill="#2563eb" radius={[6, 6, 0, 0]}>
                                    {data?.payrollHistory?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === data.payrollHistory.length - 1 ? '#2563eb' : '#2563eb80'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Overtime Departments */}
                <div className="bg-[var(--bg-surface)] p-6 sm:p-8 rounded-3xl sm:rounded-[2rem] border border-[var(--border-main)] shadow-sm">
                    <h2 className="text-lg sm:text-xl font-bold mb-5 sm:mb-6">{t('topOTDepts') || 'Top Overtime'}</h2>
                    <div className="space-y-4 sm:space-y-6">
                        {data?.topOTDepts?.length > 0 ? data.topOTDepts.map((dept, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 sm:p-4 bg-[var(--bg-card)] rounded-xl sm:rounded-2xl border border-[var(--border-main)]">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-${idx === 0 ? 'amber' : 'blue'}-500/10 text-${idx === 0 ? 'amber' : 'blue'}-500`}>
                                        <Briefcase className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-black text-xs sm:text-sm uppercase italic">{dept.name}</p>
                                        <p className="text-[10px] sm:text-xs text-[var(--text-muted)] font-bold">{dept.hours}h Total</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 sm:px-2 sm:py-1 bg-blue-500/10 text-blue-500 rounded-lg">
                                        RANK #{idx + 1}
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] py-10 opacity-50 italic text-sm">
                                <Activity className="w-8 h-8 mb-2" />
                                <p>No overtime recorded</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Labor Cost by Dept */}
                <div className="bg-[var(--bg-surface)] p-6 sm:p-8 rounded-3xl sm:rounded-[2rem] border border-[var(--border-main)] shadow-sm">
                    <h2 className="text-lg sm:text-xl font-bold mb-6 sm:mb-8">{t('laborCostByDept') || 'Cost Distribution'}</h2>
                    <div className="h-[250px] sm:h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.laborCostByDept} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-main)" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 'bold' }} width={80} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '15px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-main)' }}
                                />
                                <Bar dataKey="cost" fill="#8b5cf6" radius={[0, 6, 6, 0]} barSize={15} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quick Reports Section */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 sm:p-10 rounded-3xl sm:rounded-[2.5rem] text-white shadow-xl shadow-blue-500/20 flex flex-col justify-between overflow-hidden">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black mb-2 italic uppercase">Financial Reports</h2>
                        <p className="text-blue-100 font-bold mb-6 sm:mb-8 text-xs sm:text-sm">Generate and export detailed financial statements for auditing.</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {[
                                { name: 'Payroll Summary', type: 'payroll-summary' },
                                { name: 'Headcount', type: 'employee-headcount' }
                            ].map((report) => (
                                <button
                                    key={report.type}
                                    onClick={() => handleExport(report.type)}
                                    className="flex items-center justify-between p-3.5 sm:p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl sm:rounded-2xl transition-all group"
                                >
                                    <span className="font-bold text-[10px] sm:text-sm">{report.name}</span>
                                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-y-0.5 transition-transform" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 pt-6 sm:pt-8 border-t border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-ping"></div>
                            <span className="text-[9px] sm:text-xs font-black uppercase tracking-widest text-blue-200">System Live</span>
                        </div>
                        <p className="text-[8px] sm:text-[10px] text-blue-300 font-bold italic">Secure • Audited</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinanceDashboard;

