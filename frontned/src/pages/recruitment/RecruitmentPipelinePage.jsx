import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import recruitmentService from '../../services/recruitmentService';
import { useSettings } from '../../context/SettingsContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    Plus,
    MoreVertical,
    Mail,
    Phone,
    Briefcase,
    Calendar,
    ChevronRight,
    User,
    ArrowRight,
    Loader2,
    CheckCircle2,
    XCircle,
    Clock,
    LayoutDashboard,
    AlertCircle
} from 'lucide-react';

const STAGES = [
    { id: 'applied', title: 'newApplied', color: 'blue' },
    { id: 'screening', title: 'screening', color: 'indigo' },
    { id: 'interview', title: 'interview', color: 'purple' },
    { id: 'offer', title: 'offer', color: 'emerald' },
    { id: 'hired', title: 'hired', color: 'green' },
    { id: 'rejected', title: 'rejected', color: 'red' }
];

const RecruitmentPipelinePage = () => {
    const { t } = useSettings();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedJob, setSelectedJob] = useState('');
    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        fetchJobs();
        fetchApplications();
    }, [selectedJob]);

    const fetchJobs = async () => {
        try {
            const data = await recruitmentService.getAllJobPostings();
            setJobs(data);
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        }
    };

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const data = await recruitmentService.getAllApplications({
                job_posting_id: selectedJob
            });
            setApplications(data);
        } catch (error) {
            console.error('Failed to fetch applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (appId, newStatus) => {
        try {
            await recruitmentService.updateApplicationStatus(appId, { status: newStatus });
            fetchApplications();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const filteredApplications = applications.filter(app =>
        `${app.Applicant?.first_name} ${app.Applicant?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.JobPosting?.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getAppsInStage = (stageId) => filteredApplications.filter(app => app.status === stageId);

    const getStageColor = (color) => {
        switch (color) {
            case 'blue': return 'bg-blue-500';
            case 'indigo': return 'bg-indigo-500';
            case 'purple': return 'bg-purple-500';
            case 'emerald': return 'bg-emerald-500';
            case 'green': return 'bg-green-600';
            case 'red': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getStageLightColor = (color) => {
        switch (color) {
            case 'blue': return 'bg-blue-50 border-blue-100';
            case 'indigo': return 'bg-indigo-50 border-indigo-100';
            case 'purple': return 'bg-purple-50 border-purple-100';
            case 'emerald': return 'bg-emerald-50 border-emerald-100';
            case 'green': return 'bg-green-50 border-green-100';
            case 'red': return 'bg-red-50 border-red-100';
            default: return 'bg-gray-50 border-gray-100';
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1800px] mx-auto min-h-screen bg-[var(--bg-base)]">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-main)] mb-2 flex items-center gap-3">
                        <LayoutDashboard className="w-8 h-8 text-blue-500" />
                        {t('recruitmentPipeline')}
                    </h1>
                    <p className="text-[var(--text-soft)] text-lg">
                        {t('monitorCandidatesPipeline')}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-5 h-5" />
                        <input
                            type="text"
                            placeholder={t('searchCandidatesPlaceholder') || "Search candidates..."}
                            className="w-full pl-12 pr-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="relative min-w-[200px]">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-5 h-5" />
                        <select
                            className="w-full pl-12 pr-10 py-3 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none appearance-none font-medium cursor-pointer"
                            value={selectedJob}
                            onChange={(e) => setSelectedJob(e.target.value)}
                        >
                            <option value="">{t('allJobs') || "All Jobs"}</option>
                            {jobs.map(job => (
                                <option key={job.id} value={job.id}>{job.title}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    <p className="text-[var(--text-soft)] font-medium animate-pulse">{t('loadingPipeline') || "Syncing pipeline data..."}</p>
                </div>
            ) : (
                <div className="flex gap-6 overflow-x-auto pb-8 snap-x">
                    {STAGES.map((stage) => (
                        <div key={stage.id} className="flex-shrink-0 w-80 snap-start">
                            <div className={`mb-4 p-4 rounded-2xl ${getStageLightColor(stage.color)} border-l-4 ${getStageColor(stage.color).replace('bg-', 'border-')} shadow-sm backdrop-blur-md`}>
                                <div className="flex items-center justify-between">
                                    <h3 className="font-black text-sm uppercase tracking-widest text-[var(--text-main)]">
                                        {t(stage.title)}
                                    </h3>
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${getStageColor(stage.color)} text-white shadow-lg`}>
                                        {getAppsInStage(stage.id).length}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 min-h-[500px] p-1">
                                <AnimatePresence mode="popLayout">
                                    {getAppsInStage(stage.id).map((app) => (
                                        <motion.div
                                            key={app.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                                            transition={{ type: "spring", damping: 25, stiffness: 350 }}
                                            className="bg-[var(--bg-surface)] p-5 rounded-3xl border border-[var(--border-main)] shadow-sm hover:shadow-xl hover:border-blue-500/50 transition-all group cursor-pointer relative"
                                        >
                                            <Link to={`/recruitment/applicants/${app.id}`} className="absolute inset-0 z-0" />

                                            <div className="relative z-10">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center font-black text-lg text-[var(--text-main)] group-hover:from-blue-500 group-hover:to-indigo-600 group-hover:text-white transition-all transform group-hover:scale-110 group-hover:rotate-3 shadow-sm">
                                                        {app.Applicant?.first_name[0]}{app.Applicant?.last_name[0]}
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button className="p-1.5 hover:bg-[var(--bg-surface-soft)] rounded-lg text-[var(--text-muted)] transition-colors">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <h4 className="font-bold text-[var(--text-main)] mb-1 group-hover:text-blue-500 transition-colors truncate">
                                                    {app.Applicant?.first_name} {app.Applicant?.last_name}
                                                </h4>

                                                <div className="flex items-center gap-2 text-xs text-[var(--text-soft)] mb-3">
                                                    <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                                                    <span className="truncate">{app.JobPosting?.title}</span>
                                                </div>

                                                <div className="flex items-center justify-between pt-4 border-t border-[var(--border-main)] mt-4">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(app.application_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </div>

                                                    <div className="flex gap-2">
                                                        {stage.id !== 'applied' && stage.id !== 'rejected' && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    const prevStage = STAGES[STAGES.findIndex(s => s.id === stage.id) - 1];
                                                                    handleUpdateStatus(app.id, prevStage.id);
                                                                }}
                                                                className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all scale-90"
                                                            >
                                                                <ArrowRight className="w-4 h-4 rotate-180" />
                                                            </button>
                                                        )}
                                                        {stage.id !== 'hired' && stage.id !== 'rejected' && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    const nextStage = STAGES[STAGES.findIndex(s => s.id === stage.id) + 1];
                                                                    handleUpdateStatus(app.id, nextStage.id);
                                                                }}
                                                                className="w-8 h-8 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all scale-95 shadow-sm"
                                                            >
                                                                <ArrowRight className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {getAppsInStage(stage.id).length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-10 opacity-30 select-none grayscale">
                                        <AlertCircle className="w-8 h-8 mb-2" />
                                        <p className="text-xs font-bold uppercase tracking-widest">{t('empty') || "Empty"}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecruitmentPipelinePage;
