import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import recruitmentService from '../../services/recruitmentService';
import { useSettings } from '../../context/SettingsContext.jsx';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    ExternalLink,
    Edit,
    Trash2,
    CheckCircle,
    Eye,
    Briefcase,
    Users,
    Clock,
    RotateCcw
} from 'lucide-react';

const JobManagementPage = () => {
    const { t } = useSettings();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchJobs();
    }, [filterStatus]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const data = await recruitmentService.getAllJobPostings({ status: filterStatus });
            setJobs(data);
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm(t('confirmDeleteJob'))) {
            try {
                await recruitmentService.deleteJobPosting(id);
                fetchJobs();
            } catch (error) {
                alert(t('failedToDeleteJob'));
            }
        }
    };

    const handlePublish = async (id) => {
        try {
            await recruitmentService.publishJobPosting(id);
            alert(t('jobPublishedSuccess'));
            fetchJobs();
        } catch (error) {
            alert(t('failedToPublishJob'));
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'published': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'closed': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'published': return t('published');
            case 'draft': return t('draft');
            case 'closed': return t('closed');
            default: return status;
        }
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-main)]">{t('recruitmentJobPostings')}</h1>
                    <p className="text-[var(--text-muted)]">{t('manageHotelCareers')}</p>
                </div>
                <Link
                    to="/recruitment/jobs/create"
                    className="inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold shadow-sm hover:bg-indigo-700 transition-all gap-2"
                >
                    <Plus className="w-5 h-5" />
                    {t('newJobPosting')}
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-[var(--bg-surface)] p-4 rounded-2xl shadow-sm border border-[var(--border-main)] mb-6 flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-5 h-5" />
                    <input
                        type="text"
                        placeholder={t('searchJobsPlaceholder')}
                        className="w-full pl-10 pr-4 py-2 bg-[var(--bg-input)] border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-[var(--text-main)] placeholder-[var(--text-muted)]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="bg-[var(--bg-input)] border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 font-medium text-[var(--text-soft)]"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="">{t('allStatuses')}</option>
                    <option value="draft">{t('draft')}</option>
                    <option value="published">{t('published')}</option>
                    <option value="closed">{t('closed')}</option>
                </select>
                <button
                    onClick={fetchJobs}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                    <RotateCcw className="w-5 h-5" />
                </button>
            </div>

            {/* Job Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                </div>
            ) : jobs.length === 0 ? (
                <div className="text-center py-20 bg-[var(--bg-surface)] rounded-3xl border border-dashed border-[var(--border-main)]">
                    <Briefcase className="w-12 h-12 text-[var(--text-muted)] opacity-20 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-[var(--text-main)]">{t('noJobPostingsFound')}</h3>
                    <p className="text-[var(--text-muted)]">{t('getStartedCreatingJob')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {jobs.filter(j => j.title.toLowerCase().includes(searchTerm.toLowerCase()) || j.reference_code.toLowerCase().includes(searchTerm.toLowerCase())).map((job) => (
                        <div key={job.id} className="bg-[var(--bg-surface)] rounded-3xl p-6 shadow-sm border border-[var(--border-main)] hover:shadow-md transition-shadow group">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(job.status)}`}>
                                            {getStatusLabel(job.status)}
                                        </span>
                                        <span className="text-xs text-[var(--text-muted)] font-medium">#{job.reference_code}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-[var(--text-main)] group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                                    <div className="mt-1 flex items-center text-sm text-[var(--text-muted)]">
                                        <span className="font-semibold text-[var(--text-soft)]">{job.Position?.Department?.name}</span>
                                        <span className="mx-2">•</span>
                                        <span>{job.Position?.title}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Link
                                        to={`/careers/${job.id}`}
                                        target="_blank"
                                        className="p-2 text-[var(--text-muted)] hover:text-indigo-600 hover:bg-indigo-500/10 rounded-lg transition-all"
                                        title={t('viewPublicPage')}
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                    </Link>
                                    <Link
                                        to={`/recruitment/jobs/edit/${job.id}`}
                                        className="p-2 text-[var(--text-muted)] hover:text-indigo-600 hover:bg-indigo-500/10 rounded-lg transition-all"
                                        title={t('editPosting')}
                                    >
                                        <Edit className="w-5 h-5" />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(job.id)}
                                        className="p-2 text-[var(--text-muted)] hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-all"
                                        title={t('deletePosting')}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <hr className="my-5 border-[var(--border-main)] opacity-50" />

                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-3 bg-[var(--bg-surface-soft)] rounded-2xl">
                                    <p className="text-xs text-[var(--text-muted)] mb-1">{t('applications')}</p>
                                    <p className="text-lg font-bold text-[var(--text-main)] flex items-center justify-center gap-2">
                                        <Users className="w-4 h-4 text-indigo-600" />
                                        {job.applications_received}
                                    </p>
                                </div>
                                <div className="text-center p-3 bg-[var(--bg-surface-soft)] rounded-2xl">
                                    <p className="text-xs text-[var(--text-muted)] mb-1">{t('vacancies')}</p>
                                    <p className="text-lg font-bold text-[var(--text-main)]">{job.vacancies_count}</p>
                                </div>
                                <div className="text-center p-3 bg-[var(--bg-surface-soft)] rounded-2xl">
                                    <p className="text-xs text-[var(--text-muted)] mb-1">{t('employmentType')}</p>
                                    <p className="text-sm font-bold text-[var(--text-main)] capitalize">{job.employment_type?.replace('_', ' ')}</p>
                                </div>
                            </div>

                            <div className="mt-5 flex items-center justify-between">
                                <div className="flex items-center text-xs text-[var(--text-muted)]">
                                    <Clock className="w-3.5 h-3.5 mr-1" />
                                    {t('posted')}: {new Date(job.created_at).toLocaleDateString()}
                                </div>
                                <div className="flex gap-2">
                                    {job.status === 'draft' && (
                                        <button
                                            onClick={() => handlePublish(job.id)}
                                            className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                                        >
                                            <CheckCircle className="w-3.5 h-3.5" />
                                            {t('publish')}
                                        </button>
                                    )}
                                    <Link
                                        to={`/recruitment/applicants?job_posting_id=${job.id}`}
                                        className="px-4 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        {t('reviewApplicants')}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default JobManagementPage;
