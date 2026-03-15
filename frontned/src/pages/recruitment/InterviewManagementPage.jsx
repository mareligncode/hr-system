import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import recruitmentService from '../../services/recruitmentService';
import { useSettings } from '../../context/SettingsContext.jsx';
import {
    Calendar,
    Clock,
    Video,
    User,
    ChevronRight,
    Search,
    Filter,
    MoreVertical,
    Loader2,
    Calendar as CalendarIcon,
    Play
} from 'lucide-react';

const InterviewManagementPage = () => {
    const { t } = useSettings();
    const navigate = useNavigate();
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    useEffect(() => {
        fetchInterviews();
    }, [filterStatus]);

    const fetchInterviews = async () => {
        setLoading(true);
        try {
            const data = await recruitmentService.getInterviews({
                status: filterStatus
            });
            setInterviews(data);
        } catch (error) {
            console.error('Failed to fetch interviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'scheduled': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-[var(--bg-surface-soft)] text-[var(--text-muted)] border-[var(--border-main)]';
        }
    };

    const filteredInterviews = interviews.filter(interview =>
        `${interview.JobApplication?.Applicant?.first_name} ${interview.JobApplication?.Applicant?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.JobApplication?.JobPosting?.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen bg-[var(--bg-base)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] mb-2 flex items-center gap-3">
                        <CalendarIcon className="w-8 h-8 text-indigo-500" />
                        {t('interviews')}
                    </h1>
                    <p className="text-[var(--text-soft)] text-lg">
                        {t('manageInterviewsDescription') || "Schedule and monitor recruitment interviews."}
                    </p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-[var(--bg-surface)] p-4 rounded-3xl shadow-sm border border-[var(--border-main)] mb-8 flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-5 h-5" />
                    <input
                        type="text"
                        placeholder={t('searchInterviewsPlaceholder') || "Search by candidate or job..."}
                        className="w-full pl-12 pr-4 py-3 bg-[var(--bg-surface-soft)] border border-[var(--border-main)] rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <Filter className="w-5 h-5 text-[var(--text-muted)]" />
                    <select
                        className="bg-[var(--bg-surface-soft)] border border-[var(--border-main)] rounded-2xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-medium text-[var(--text-main)] min-w-[160px] outline-none appearance-none cursor-pointer"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">{t('allStatuses')}</option>
                        <option value="scheduled">{t('scheduled') || "Scheduled"}</option>
                        <option value="completed">{t('completed') || "Completed"}</option>
                        <option value="cancelled">{t('cancelled') || "Cancelled"}</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                    <p className="text-[var(--text-soft)] font-medium animate-pulse">{t('loadingInterviews') || "Syncing interview data..."}</p>
                </div>
            ) : filteredInterviews.length === 0 ? (
                <div className="text-center py-24 bg-[var(--bg-surface)] rounded-3xl border-2 border-dashed border-[var(--border-main)]">
                    <Calendar className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4 opacity-20" />
                    <h3 className="text-xl font-bold text-[var(--text-main)]">{t('noInterviewsScheduled')}</h3>
                    <p className="text-[var(--text-soft)] max-w-sm mx-auto mt-2">{t('tryAdjustingSearch')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredInterviews.map((interview) => (
                        <div
                            key={interview.id}
                            className="bg-[var(--bg-surface)] rounded-3xl p-6 shadow-sm border border-[var(--border-main)] hover:border-indigo-500/50 hover:shadow-xl transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4">
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(interview.status)}`}>
                                    {interview.status}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:scale-110 group-hover:rotate-3">
                                    {interview.JobApplication?.Applicant?.first_name[0]}{interview.JobApplication?.Applicant?.last_name[0]}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg font-black text-[var(--text-main)] truncate">
                                        {interview.JobApplication?.Applicant?.first_name} {interview.JobApplication?.Applicant?.last_name}
                                    </h3>
                                    <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider">
                                        {interview.JobApplication?.JobPosting?.title}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-center text-sm text-[var(--text-soft)] font-medium gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface-soft)] flex items-center justify-center">
                                        <Calendar className="w-4 h-4 text-indigo-500" />
                                    </div>
                                    {new Date(interview.scheduled_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                                <div className="flex items-center text-sm text-[var(--text-soft)] font-medium gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface-soft)] flex items-center justify-center">
                                        <Clock className="w-4 h-4 text-indigo-500" />
                                    </div>
                                    {new Date(interview.scheduled_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                    <span className="mx-2 text-[var(--text-muted)] opacity-30">•</span>
                                    {interview.duration_minutes} {t('minutes') || "mins"}
                                </div>
                                <div className="flex items-center text-sm text-[var(--text-soft)] font-medium gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface-soft)] flex items-center justify-center">
                                        <Video className="w-4 h-4 text-indigo-500" />
                                    </div>
                                    {interview.interview_type} (Round {interview.interview_round})
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {interview.interview_type === 'online' && interview.status === 'scheduled' && (
                                    <button
                                        onClick={() => navigate(`/recruitment/interviews/room/${interview.id}`)}
                                        className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                                    >
                                        <Play className="w-4 h-4 fill-current" />
                                        {t('joinMeeting')}
                                    </button>
                                )}
                                <button
                                    onClick={() => navigate(`/recruitment/applicants/${interview.job_application_id}`)}
                                    className="px-4 py-3 bg-[var(--bg-surface-soft)] text-[var(--text-soft)] rounded-2xl font-bold text-sm hover:bg-[var(--border-main)] transition-all flex items-center justify-center"
                                >
                                    <User className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InterviewManagementPage;
