import React, { useState, useEffect } from 'react';
import {
    Award,
    Star,
    Zap,
    Heart,
    ShieldCheck,
    TrendingUp,
    Plus,
    X,
    Send
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import performanceService from '../../services/performanceService';
import employeeService from '../../services/employeeService';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const RecognitionWall = () => {
    const { t } = useTranslation();
    const [wallItems, setWallItems] = useState([]);
    const [badges, setBadges] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isNominateOpen, setIsNominateOpen] = useState(false);

    const { user } = useSelector(state => state.auth);
    const [nomination, setNomination] = useState({
        employee_id: '',
        badge_id: '',
        reason: ''
    });

    useEffect(() => {
        fetchWall();
        fetchInitialData();
    }, []);

    const fetchWall = async () => {
        try {
            setLoading(true);
            const res = await performanceService.getRecognitionWall();
            setWallItems(res.data);
        } catch (error) {
            toast.error(t('failedToLoadWall'));
        } finally {
            setLoading(false);
        }
    };

    const fetchInitialData = async () => {
        try {
            const [badgesRes, empRes] = await Promise.all([
                performanceService.getBadges(),
                employeeService.getEmployees()
            ]);
            setBadges(badgesRes.data);
            setEmployees(empRes.employees || empRes);
        } catch (error) {
            console.error('Error loading nomination data', error);
        }
    };

    const handleNominate = async (e) => {
        e.preventDefault();
        try {
            // For this version, we'll auto-award if requester is manager/admin, else nominate
            const isManager = ['admin', 'hr', 'manager'].includes(user.role);
            if (isManager) {
                await performanceService.awardBadge(nomination);
                toast.success(t('badgeAwardedSuccessfully'));
            } else {
                await performanceService.nominateColleague(nomination);
                toast.success(t('nominationSentToHR'));
            }
            setIsNominateOpen(false);
            setNomination({ employee_id: '', badge_id: '', reason: '' });
            fetchWall();
        } catch (error) {
            toast.error(error.response?.data?.error || t('failedToProcessNomination'));
        }
    };

    const getBadgeIcon = (name) => {
        switch (name?.toLowerCase()) {
            case 'star of the month': return <Star className="text-yellow-500" size={24} />;
            case 'efficiency master': return <Zap className="text-blue-500" size={24} />;
            case 'safety shield': return <ShieldCheck className="text-green-500" size={24} />;
            case 'team player': return <Heart className="text-red-500" size={24} />;
            default: return <Award className="text-indigo-500" size={24} />;
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{t('recognitionWall')}</h1>
                    <p className="text-gray-500 mt-2 text-lg">{t('celebratingOurStars')}</p>
                </div>
                <button
                    onClick={() => setIsNominateOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 transform hover:-translate-y-1 active:scale-95"
                >
                    <Plus size={20} />
                    {t('recognizeColleague')}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {wallItems.length === 0 && !loading && (
                    <div className="col-span-full py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                        <Award size={64} className="mb-4 opacity-20" />
                        <p className="text-xl font-medium">{t('noRecognitionsYet')}</p>
                    </div>
                )}

                {wallItems.map((item, idx) => (
                    <div
                        key={item.id}
                        className="bg-white rounded-[2rem] shadow-xl shadow-gray-100 border border-gray-50 p-8 flex flex-col hover:shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-5 duration-500"
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-indigo-50 p-4 rounded-2xl">
                                {getBadgeIcon(item.Badge?.name)}
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-50 px-3 py-1 rounded-full">
                                    {item.Badge?.name}
                                </span>
                                <p className="text-xs text-gray-400 mt-2">{format(new Date(item.awarded_at), 'MMMM dd, yyyy')}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-inner">
                                {item.Employee?.User?.first_name?.[0]}{item.Employee?.User?.last_name?.[0]}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-xl">
                                    {item.Employee?.User?.first_name} {item.Employee?.User?.last_name}
                                </h3>
                                <p className="text-sm text-gray-500">{item.Employee?.Position?.name || t('teamMember')}</p>
                            </div>
                        </div>

                        <blockquote className="italic text-gray-600 border-l-4 border-indigo-200 pl-4 py-1 mb-6 flex-grow">
                            "{item.reason}"
                        </blockquote>

                        <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">{t('nominatedBy')}</span>
                                <span className="text-xs font-bold text-gray-700">{item.Nominator?.first_name} {item.Nominator?.last_name}</span>
                            </div>
                            <div className="flex gap-1">
                                <TrendingUp size={14} className="text-green-500" />
                                <span className="text-[10px] font-bold text-green-600">+10 XP</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Nomination Modal */}
            {isNominateOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{t('spreadSomeJoy')}</h2>
                                <p className="text-sm text-gray-500">{t('tellUsWhyTheyAreGreat')}</p>
                            </div>
                            <button onClick={() => setIsNominateOpen(false)} className="bg-white p-2 rounded-xl text-gray-400 hover:text-gray-600 shadow-sm transition-all hover:rotate-90">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleNominate} className="p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">{t('whoAreWeCelebrating?')}</label>
                                <select
                                    required
                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-medium text-gray-700 appearance-none"
                                    value={nomination.employee_id}
                                    onChange={(e) => setNomination({ ...nomination, employee_id: e.target.value })}
                                >
                                    <option value="">{t('selectColleague')}</option>
                                    {employees.filter(e => e.user_id !== user.id).map(emp => (
                                        <option key={emp.user_id} value={emp.user_id}>{emp.User?.first_name} {emp.User?.last_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">{t('chooseABadge')}</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {badges.map(b => (
                                        <button
                                            key={b.id}
                                            type="button"
                                            onClick={() => setNomination({ ...nomination, badge_id: b.id })}
                                            className={`p-4 rounded-2xl text-left transition-all border-2 flex flex-col items-center gap-2 ${nomination.badge_id === b.id ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-50' : 'border-gray-50 bg-gray-50 hover:bg-white hover:border-indigo-200'}`}
                                        >
                                            <div className={nomination.badge_id === b.id ? 'transform scale-110 duration-200' : ''}>
                                                {getBadgeIcon(b.name)}
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-center">{b.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">{t('whatDidTheyDo?')}</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-medium text-gray-700 placeholder:text-gray-300 resize-none"
                                    placeholder={t('writeAHeartfeltReason')}
                                    value={nomination.reason}
                                    onChange={(e) => setNomination({ ...nomination, reason: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 group"
                            >
                                <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                {['admin', 'hr', 'manager'].includes(user.role) ? t('awardDirectly') : t('sendNomination')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecognitionWall;
