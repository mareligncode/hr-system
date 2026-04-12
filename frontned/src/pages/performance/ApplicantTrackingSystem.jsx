import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Filter,
    Plus,
    ChevronRight,
    Mail,
    Phone,
    FileText,
    Star,
    Clock,
    MoreVertical,
    CheckCircle2,
    XCircle,
    Calendar,
    ArrowUpRight,
    Briefcase
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import recruitmentService from '../../services/recruitmentService';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const ApplicantTrackingSystem = () => {
    const { t } = useTranslation();
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState('all');

    const statusStages = [
        { id: 'applied', label: t('applied'), color: 'bg-gray-100 text-gray-600', count: 0 },
        { id: 'screening', label: t('screening'), color: 'bg-indigo-50 text-indigo-600', count: 0 },
        { id: 'interview', label: t('interview'), color: 'bg-amber-50 text-amber-600', count: 0 },
        { id: 'offer', label: t('offer'), color: 'bg-purple-50 text-purple-600', count: 0 },
        { id: 'hired', label: t('hired'), color: 'bg-green-50 text-green-600', count: 0 },
    ];

    useEffect(() => {
        fetchApplicants();
    }, []);

    const fetchApplicants = async () => {
        try {
            setLoading(true);
            const res = await recruitmentService.getApplicants();
            setApplicants(res.data);
        } catch (error) {
            toast.error(t('failedToLoadApplicants'));
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (applicationId, newStatus) => {
        try {
            await recruitmentService.updateApplicationStatus(applicationId, { status: newStatus });
            toast.success(t('statusUpdatedByAutomatedIntelligence'));
            fetchApplicants();
        } catch (error) {
            toast.error(t('failedToUpdateStatus'));
        }
    };

    return (
        <div className="p-10 max-w-[1600px] mx-auto space-y-12">
            {/* Header Section */}
            <div className="flex justify-between items-end">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest">
                        <Users size={14} />
                        {t('talentAcquisition')}
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 leading-tight tracking-tighter">
                        {t('applicantTrackingSystem')}
                    </h1>
                    <p className="text-gray-400 font-medium text-lg max-w-xl">
                        {t('streamlinedHiringPipelineFromFirstClickToFirstDay')}
                    </p>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-[2rem] font-black shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
                        <Plus size={20} />
                        {t('postNewJob')}
                    </button>
                </div>
            </div>

            {/* Kanban Stats / Navigation */}
            <div className="flex gap-4 p-2 bg-gray-100/50 rounded-[2.5rem] backdrop-blur-md overflow-x-auto no-scrollbar scroll-smooth">
                {statusStages.map(stage => {
                    const count = applicants.filter(a => a.JobApplications?.[0]?.status === stage.id).length;
                    return (
                        <button
                            key={stage.id}
                            onClick={() => setSelectedStatus(stage.id)}
                            className={`flex flex-col items-start gap-4 p-8 min-w-[240px] rounded-[2rem] transition-all group ${selectedStatus === stage.id ? 'bg-white shadow-2xl shadow-gray-200' : 'hover:bg-white/50'}`}
                        >
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${stage.color}`}>
                                {stage.label}
                            </span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-gray-900">{count}</span>
                                <span className="text-gray-300 font-bold uppercase tracking-tighter text-xs">{t('candidates')}</span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Main Applicant Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {loading ? (
                    Array(8).fill(0).map((_, i) => <div key={i} className="h-[450px] bg-gray-100 rounded-[3rem] animate-pulse" />)
                ) : applicants.filter(a => selectedStatus === 'all' || a.JobApplications?.[0]?.status === selectedStatus).map((candidate) => {
                    const latestApp = candidate.JobApplications?.[0];
                    return (
                        <div key={candidate.id} className="bg-white rounded-[3.5rem] border border-gray-100 p-10 space-y-8 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.06)] transition-all group relative overflow-hidden">
                            {/* Profile Header */}
                            <div className="flex justify-between items-start">
                                <div className="relative">
                                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-100">
                                        {candidate.first_name?.[0]}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-white rounded-full flex items-center justify-center shadow-lg">
                                        <Star size={12} className="text-white" fill="currentColor" />
                                    </div>
                                </div>
                                <button className="text-gray-200 hover:text-gray-900 transition-colors">
                                    <MoreVertical />
                                </button>
                            </div>

                            {/* Candidate Info */}
                            <div className="space-y-4">
                                <h3 className="text-2xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors">
                                    {candidate.first_name} {candidate.last_name}
                                </h3>
                                <div className="space-y-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    <p className="flex items-center gap-2"><Briefcase size={16} className="text-gray-300" /> {latestApp?.JobPosting?.title}</p>
                                    <p className="flex items-center gap-2"><Clock size={16} className="text-gray-300" /> {format(new Date(candidate.created_at), 'MMM dd, yyyy')}</p>
                                </div>
                            </div>

                            {/* Matching Score / Progress */}
                            <div className="space-y-3 p-6 bg-gray-50 rounded-[2rem]">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('matchScore')}</span>
                                    <span className="text-lg font-black text-indigo-600">82%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full w-[82%]" />
                                </div>
                            </div>

                            {/* Actions Area */}
                            <div className="grid grid-cols-2 gap-4">
                                <button className="flex flex-col items-center justify-center gap-2 py-5 bg-gray-50 rounded-[2rem] text-[10px] font-black uppercase text-gray-400 hover:bg-gray-900 hover:text-white transition-all transform hover:-translate-y-1">
                                    <FileText size={18} />
                                    {t('resume')}
                                </button>
                                <button className="flex flex-col items-center justify-center gap-2 py-5 bg-indigo-50 rounded-[2rem] text-[10px] font-black uppercase text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all transform hover:-translate-y-1 shadow-sm">
                                    <Calendar size={18} />
                                    {t('interview')}
                                </button>
                            </div>

                            {/* Stage Transition */}
                            <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${statusStages.find(s => s.id === latestApp?.status)?.color}`}>
                                    {latestApp?.status}
                                </span>
                                <button className="text-gray-300 hover:text-indigo-500 transition-colors">
                                    <ArrowUpRight size={20} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ApplicantTrackingSystem;
