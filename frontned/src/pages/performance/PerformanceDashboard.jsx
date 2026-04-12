import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    Target,
    BarChart2,
    History,
    Plus,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    CheckCircle2,
    Calendar
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar
} from 'recharts';
import { useTranslation } from 'react-i18next';
import performanceService from '../../services/performanceService';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const PerformanceDashboard = () => {
    const { t } = useTranslation();
    const { user } = useSelector(state => state.auth);
    const [summary, setSummary] = useState(null);
    const [kpis, setKPIs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRecordOpen, setIsRecordOpen] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [summaryRes, kpisRes] = await Promise.all([
                performanceService.getEmployeeSummary(user.id),
                performanceService.getKPIs()
            ]);
            setSummary(summaryRes.data);
            setKPIs(kpisRes.data);
        } catch (error) {
            toast.error(t('failedToLoadPerformanceData'));
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const chartData = summary?.scores?.map(s => ({
        date: format(new Date(s.recorded_at), 'MMM dd'),
        score: parseFloat(s.score),
        kpi: s.PerformanceKPI?.name
    })).reverse() || [];

    const stats = [
        { label: t('averageEfficiency'), value: '92%', change: '+4.5%', positive: true, icon: <TrendingUp className="text-green-500" /> },
        { label: t('targetAchievement'), value: '88%', change: '+12%', positive: true, icon: <Target className="text-blue-500" /> },
        { label: t('feedbackReceived'), value: '14', change: '-2', positive: false, icon: <BarChart2 className="text-indigo-500" /> },
        { label: t('qualityScore'), value: '4.8/5', change: 'Stable', positive: true, icon: <CheckCircle2 className="text-purple-500" /> },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 leading-none">{t('myPerformance')}</h1>
                    <p className="text-gray-500 mt-3 text-lg">{t('trackYourProgressAndGrowth')}</p>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-100 rounded-2xl font-bold shadow-sm hover:bg-gray-50 transition-all">
                        <Calendar size={18} />
                        {t('thisQuarter')}
                    </button>
                    {['admin', 'hr', 'manager'].includes(user.role) && (
                        <button
                            onClick={() => setIsRecordOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                        >
                            <Plus size={18} />
                            {t('recordMetric')}
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-50 border border-gray-50 relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
                                    {stat.icon}
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-bold ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                                    {stat.change}
                                    {stat.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                </div>
                            </div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</h3>
                            <p className="text-4xl font-black text-gray-900 mt-2">{stat.value}</p>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                            {React.cloneElement(stat.icon, { size: 120 })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-gray-100 border border-gray-50">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-gray-900">{t('performanceTrends')}</h3>
                            <p className="text-gray-400 font-medium">{t('scoreOverTime')}</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold">
                                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                                {t('liveData')}
                            </div>
                        </div>
                    </div>

                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ stroke: '#4f46e5', strokeWidth: 2, strokeDasharray: '4 4' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#4f46e5"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorScore)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Side History */}
                <div className="space-y-10">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-50 h-full">
                        <div className="flex items-center gap-3 mb-8">
                            <History className="text-gray-400" />
                            <h3 className="text-xl font-black text-gray-900">{t('recentLogs')}</h3>
                        </div>
                        <div className="space-y-6">
                            {summary?.scores?.map((log, idx) => (
                                <div key={log.id} className="flex gap-4 group cursor-pointer">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-3 h-3 rounded-full border-2 border-white ring-2 ${idx === 0 ? 'ring-indigo-500 bg-indigo-500' : 'ring-gray-100 bg-gray-100'}`} />
                                        <div className="flex-grow w-px bg-gray-100 mt-2" />
                                    </div>
                                    <div className="pb-6">
                                        <p className="text-[10px] uppercase tracking-tighter font-black text-gray-300 mb-1">{format(new Date(log.recorded_at), 'MMMM dd, hh:mm a')}</p>
                                        <h4 className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">{log.PerformanceKPI?.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{log.score} {log.PerformanceKPI?.unit}</span>
                                            <span className="text-[10px] text-gray-400 italic">"{log.comments?.substring(0, 30)}..."</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full py-4 mt-4 border-2 border-dashed border-gray-100 rounded-2xl text-xs font-bold text-gray-400 hover:border-indigo-100 hover:text-indigo-400 transition-all uppercase tracking-widest">
                            {t('viewFullHistory')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerformanceDashboard;
