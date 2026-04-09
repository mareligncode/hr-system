import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Clock,
    Video,
    MapPin,
    User,
    MoreHorizontal,
    CheckCircle2,
    X,
    Plus,
    Filter,
    ChevronLeft,
    ChevronRight,
    MessageCircle,
    Star
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import recruitmentService from '../../services/recruitmentService';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const InterviewScheduler = () => {
    const { t } = useTranslation();
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInterviews();
    }, []);

    const fetchInterviews = async () => {
        try {
            setLoading(true);
            const res = await recruitmentService.getInterviews();
            setInterviews(res.data);
        } catch (error) {
            toast.error(t('failedToLoadInterviews'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-10 max-w-7xl mx-auto space-y-12">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <div className="p-5 bg-purple-600 rounded-3xl shadow-xl shadow-purple-100">
                        <Calendar className="text-white" size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">{t('hiringSchedule')}</h1>
                        <p className="text-gray-500 font-medium text-lg">{t('managingInterviewsAndCandidateEvaluations')}</p>
                    </div>
                </div>
                <button className="flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-3xl font-black shadow-2xl shadow-gray-200">
                    <Plus size={20} />
                    {t('scheduleInterview')}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Lateral Calendar Summary */}
                <div className="space-y-8">
                    <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-gray-50 border border-gray-50">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-gray-900">{format(new Date(), 'MMMM yyyy')}</h3>
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-gray-50 rounded-lg"><ChevronLeft size={16} /></button>
                                <button className="p-2 hover:bg-gray-50 rounded-lg"><ChevronRight size={16} /></button>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-2 mb-4">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <span key={d} className="text-[10px] font-black text-gray-300 text-center">{d}</span>)}
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {Array(31).fill(0).map((_, i) => (
                                <div key={i} className={`h-10 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${i + 1 === new Date().getDate() ? 'bg-purple-600 text-white shadow-lg shadow-purple-100' : 'text-gray-400 hover:bg-gray-50'}`}>
                                    {i + 1}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-gray-50 border border-gray-100">
                        <h4 className="font-black text-gray-900 mb-6 flex items-center gap-2">
                            <Star className="text-amber-500" size={18} />
                            {t('priorityEvaluations')}
                        </h4>
                        <div className="space-y-6">
                            {[1, 2].map(i => (
                                <div key={i} className="flex gap-4 group cursor-pointer">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center font-black text-gray-400 group-hover:bg-purple-50 group-hover:text-purple-600 transition-all">S</div>
                                    <div>
                                        <p className="text-sm font-black text-gray-900 leading-tight">Sarah Jenkins</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Exec. Chef (Round 3)</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Schedule List */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex justify-between items-center bg-gray-100/50 p-2 rounded-[2rem]">
                        <button className="flex-grow py-4 bg-white rounded-[1.8rem] font-black text-xs uppercase tracking-widest text-gray-900 shadow-md">
                            {t('upcoming')}
                        </button>
                        <button className="flex-grow py-4 font-black text-xs uppercase tracking-widest text-gray-400">
                            {t('completed')}
                        </button>
                    </div>

                    <div className="space-y-6">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => <div key={i} className="h-40 bg-gray-50 rounded-[3rem] animate-pulse" />)
                        ) : interviews.length === 0 ? (
                            <div className="py-32 text-center bg-white rounded-[4rem] border border-dashed border-gray-200 opacity-20">
                                <Video size={64} className="mx-auto mb-4" />
                                <p className="font-black uppercase tracking-widest text-xl">{t('noInterviewsScheduled')}</p>
                            </div>
                        ) : interviews.map(interview => (
                            <div key={interview.id} className="group bg-white rounded-[3rem] border border-gray-50 p-10 flex flex-col md:flex-row items-center justify-between gap-8 hover:shadow-2xl hover:shadow-purple-50 transition-all relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-2 h-full bg-purple-600" />

                                <div className="flex items-center gap-8 flex-grow">
                                    <div className="text-center min-w-[80px]">
                                        <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">{format(new Date(interview.interview_date), 'MMM')}</p>
                                        <p className="text-4xl font-black text-gray-900 tracking-tighter">{format(new Date(interview.interview_date), 'dd')}</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 bg-gray-900 text-white rounded-lg text-[10px] font-black uppercase tracking-tighter">
                                                {format(new Date(interview.start_time), 'hh:mm a')}
                                            </span>
                                            <span className="text-gray-300 font-bold">•</span>
                                            <span className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-widest ${interview.interview_type === 'online' ? 'text-blue-500' : 'text-orange-500'}`}>
                                                {interview.interview_type === 'online' ? <Video size={14} /> : <MapPin size={14} />}
                                                {interview.interview_type}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900 group-hover:text-purple-600 transition-colors">
                                            {interview.JobApplication?.Applicant?.first_name} {interview.JobApplication?.Applicant?.last_name}
                                        </h3>
                                        <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            <span className="flex items-center gap-2"><User size={14} /> {interview.Interviewer?.first_name} (Panelist)</span>
                                            <span className="flex items-center gap-2"><Briefcase size={14} /> {interview.JobApplication?.JobPosting?.title}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button className="p-4 bg-gray-50 rounded-2xl text-gray-400 hover:bg-purple-50 hover:text-purple-600 transition-all">
                                        <MessageCircle size={20} />
                                    </button>
                                    <button className="px-8 py-4 bg-gray-900 text-white rounded-3xl font-black shadow-xl shadow-gray-200 whitespace-nowrap">
                                        {t('viewDossier')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterviewScheduler;
