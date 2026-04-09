import React, { useState, useEffect } from 'react';
import {
    Heart,
    HandHelping,
    ShieldCheck,
    MessageCircle,
    ChevronRight,
    Plus,
    X,
    Filter,
    Clock,
    UserCircle,
    FileText,
    Send,
    AlertCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import welfareService from '../../services/welfareService';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const WelfareSupportPage = () => {
    const { t } = useTranslation();
    const { user } = useSelector(state => state.auth);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRequestOpen, setIsRequestOpen] = useState(false);

    const [newRequest, setNewRequest] = useState({
        request_type: 'mental_health',
        priority: 'low',
        description: ''
    });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await welfareService.getWelfareRequests();
            setRequests(res.data);
        } catch (error) {
            toast.error(t('failedToLoadRequests'));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await welfareService.createWelfareRequest(newRequest);
            toast.success(t('requestSubmittedConfidentialityGuaranteed'));
            setIsRequestOpen(false);
            setNewRequest({ request_type: 'mental_health', priority: 'low', description: '' });
            fetchRequests();
        } catch (error) {
            toast.error(t('failedToSubmitRequest'));
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return 'bg-orange-50 text-orange-600';
            case 'under_review': return 'bg-blue-50 text-blue-600';
            case 'resolved': return 'bg-green-50 text-green-600';
            case 'rejected': return 'bg-red-50 text-red-600';
            default: return 'bg-gray-50 text-gray-400';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'mental_health': return <Heart className="text-pink-500" />;
            case 'financial_aid': return <HandHelping className="text-emerald-500" />;
            case 'grievance': return <AlertCircle className="text-red-500" />;
            case 'internal_transfer': return <MessageCircle className="text-indigo-500" />;
            default: return <UserCircle className="text-gray-500" />;
        }
    };

    return (
        <div className="p-10 max-w-7xl mx-auto space-y-12">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-8">
                    <div className="p-6 bg-gradient-to-br from-pink-500 to-rose-600 rounded-[2.5rem] shadow-2xl shadow-rose-100 ring-8 ring-rose-50">
                        <Heart className="text-white" size={32} />
                    </div>
                    <div>
                        <h1 className="text-5xl font-black text-gray-900 tracking-tighter">{t('welfareAndSupport')}</h1>
                        <p className="text-gray-400 font-medium text-lg mt-2">{t('yourWellbeingIsOurPriorityConfidentialSupportAlwaysReady')}</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsRequestOpen(true)}
                    className="flex items-center gap-3 px-10 py-5 bg-gray-900 text-white rounded-[2rem] font-black shadow-2xl shadow-gray-200 hover:bg-black transition-all transform hover:-translate-y-1"
                >
                    <Plus size={24} />
                    {t('requestSupport')}
                </button>
            </div>

            {/* Quick Support Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { title: t('mentalHealthFirstAid'), desc: t('anonymousAccessToCertifiedCounselors'), icon: <Heart className="text-pink-600" />, color: 'bg-pink-50' },
                    { title: t('financialStability'), desc: t('emergencyLoansAndPayAdvanceInquiry'), icon: <HandHelping className="text-emerald-600" />, color: 'bg-emerald-50' },
                    { title: t('growthAndMove'), desc: t('internalTransfersAndCareerPivots'), icon: <MessageCircle className="text-indigo-600" />, color: 'bg-indigo-50' },
                ].map((card, i) => (
                    <div key={i} className={`p-10 rounded-[3rem] ${card.color} border border-white relative overflow-hidden group hover:shadow-2xl transition-all cursor-pointer`}>
                        <div className="relative z-10 space-y-4">
                            <div className="p-4 bg-white rounded-2xl w-fit shadow-sm">{card.icon}</div>
                            <h3 className="text-2xl font-black text-gray-900">{card.title}</h3>
                            <p className="text-gray-500 font-medium leading-relaxed">{card.desc}</p>
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-900 transition-colors">
                                {t('learnMore')} <ChevronRight size={16} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Past Requests / Timeline */}
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-gray-900">{t('mySupportJourney')}</h2>
                    <div className="flex gap-4">
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-100 rounded-xl font-bold text-xs text-gray-400 hover:bg-gray-50 transition-all">
                            <Filter size={16} />
                            {t('allRecords')}
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-100 border border-gray-50 overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <th className="px-10 py-6">{t('requestType')}</th>
                                <th className="px-10 py-6">{t('priority')}</th>
                                <th className="px-10 py-6">{t('description')}</th>
                                <th className="px-10 py-6">{t('status')}</th>
                                <th className="px-10 py-6 text-right">{t('lastUpdate')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => <tr key={i} className="animate-pulse px-10 py-8"><td colSpan={5} className="h-20 bg-gray-50/50" /></tr>)
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-10 py-24 text-center opacity-30">
                                        <ShieldCheck size={64} className="mx-auto mb-4" />
                                        <p className="font-black uppercase tracking-widest">{t('noSupportRequestsFound')}</p>
                                    </td>
                                </tr>
                            ) : requests.map(req => (
                                <tr key={req.id} className="group hover:bg-gray-50/30 transition-colors">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-white transition-colors">{getTypeIcon(req.request_type)}</div>
                                            <span className="font-black text-xs uppercase tracking-widest text-gray-900">{req.request_type.replace('_', ' ')}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${req.priority === 'critical' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
                                            {req.priority}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <p className="text-sm font-medium text-gray-500 line-clamp-1 max-w-xs">{req.description}</p>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-tighter ${getStatusStyle(req.status)}`}>
                                            <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                            {req.status.replace('_', ' ')}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs font-black text-gray-900">{format(new Date(req.updated_at), 'MMM dd, yyyy')}</span>
                                            <span className="text-[10px] text-gray-300 font-bold uppercase">{format(new Date(req.updated_at), 'hh:mm a')}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Request Modal */}
            {isRequestOpen && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xl z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-12 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                            <div>
                                <h2 className="text-4xl font-black text-gray-900 tracking-tighter">{t('supportRequest')}</h2>
                                <p className="text-gray-400 font-medium mt-2">{t('yourInformationIsSecuredByEndToEndEncryption')}</p>
                            </div>
                            <button onClick={() => setIsRequestOpen(false)} className="bg-white p-4 rounded-3xl text-gray-400 hover:text-gray-600 shadow-xl shadow-gray-100 transition-all hover:rotate-90">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-12 space-y-10">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{t('natureOfSupport')}</label>
                                    <select
                                        required
                                        className="w-full px-6 py-5 bg-gray-50 border-none rounded-3xl outline-none focus:ring-4 focus:ring-indigo-100 font-black text-sm text-gray-700 appearance-none shadow-inner"
                                        value={newRequest.request_type}
                                        onChange={(e) => setNewRequest({ ...newRequest, request_type: e.target.value })}
                                    >
                                        <option value="mental_health">{t('mentalHealthSupport')}</option>
                                        <option value="financial_aid">{t('financialAssistance')}</option>
                                        <option value="grievance">{t('formalGrievance')}</option>
                                        <option value="internal_transfer">{t('internalTransfer')}</option>
                                        <option value="other">{t('other')}</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{t('urgencyLevel')}</label>
                                    <select
                                        required
                                        className="w-full px-6 py-5 bg-gray-50 border-none rounded-3xl outline-none focus:ring-4 focus:ring-indigo-100 font-black text-sm text-gray-700 appearance-none shadow-inner"
                                        value={newRequest.priority}
                                        onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value })}
                                    >
                                        <option value="low">{t('lowPriority')}</option>
                                        <option value="medium">{t('medium')}</option>
                                        <option value="high">{t('highPriority')}</option>
                                        <option value="critical">{t('criticalUrgency')}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{t('howCanWeHelp')}</label>
                                <textarea
                                    required
                                    rows={5}
                                    className="w-full px-8 py-6 bg-gray-50 border-none rounded-[2.5rem] outline-none focus:ring-4 focus:ring-indigo-100 font-medium text-gray-700 placeholder:text-gray-300 shadow-inner resize-none"
                                    placeholder={t('describeYourSituationInDetailProfessionalStaffWillRespondPromptly')}
                                    value={newRequest.description}
                                    onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-6 bg-gray-900 text-white rounded-[2.5rem] font-black text-lg shadow-2xl shadow-gray-200 hover:bg-black transition-all flex items-center justify-center gap-4 group"
                            >
                                <Send size={24} className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                                {t('submitConfidentialRequest')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WelfareSupportPage;
