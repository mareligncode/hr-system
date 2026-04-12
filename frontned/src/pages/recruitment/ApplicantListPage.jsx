import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import recruitmentService from '../../services/recruitmentService';
import { useSettings } from '../../context/SettingsContext.jsx';
import {
    Search,
    Filter,
    MoreVertical,
    Eye,
    FileText,
    User,
    Mail,
    Phone,
    Briefcase,
    Calendar,
    ChevronRight,
    RotateCcw,
    CheckCircle2,
    Users
} from 'lucide-react';

const ApplicantListPage = () => {
    const { t } = useSettings();
    const [searchParams] = useSearchParams();
    const jobPostingId = searchParams.get('job_posting_id');

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    useEffect(() => {
        fetchApplications();
    }, [filterStatus]);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const data = await recruitmentService.getAllApplications({
                job_posting_id: jobPostingId,
                status: filterStatus
            });
            setApplications(data);
        } catch (error) {
            console.error('Failed to fetch applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'applied': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'screening': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
            case 'interview': return 'bg-purple-50 text-purple-700 border-purple-100';
            case 'offer': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'hired': return 'bg-green-600 text-white border-green-700';
            case 'rejected': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'applied': return t('newApplied');
            case 'screening': return t('screening');
            case 'interview': return t('interview');
            case 'offer': return t('offer');
            case 'hired': return t('hired');
            case 'rejected': return t('rejected');
            default: return status;
        }
    };

    const filteredApps = applications.filter(app =>
        `${app.Applicant?.first_name} ${app.Applicant?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.JobPosting?.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-main)]">{t('applicantTracking')}</h1>
                    <p className="text-[var(--text-muted)]">{t('monitorManageCandidates')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                        <Users className="w-5 h-5" />
                    </span>
                    <span className="font-bold text-[var(--text-soft)]">{t('totalApplicants', { count: applications.length })}</span>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-[var(--bg-surface)] p-4 rounded-3xl shadow-sm border border-[var(--border-main)] mb-6 flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-5 h-5" />
                    <input
                        type="text"
                        placeholder={t('searchApplicantsPlaceholder')}
                        className="w-full pl-11 pr-4 py-3 bg-[var(--bg-input)] border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-[var(--text-main)] placeholder-[var(--text-muted)]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <Filter className="w-5 h-5 text-[var(--text-muted)]" />
                    <select
                        className="bg-[var(--bg-input)] border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 font-medium text-[var(--text-soft)] min-w-[160px]"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">{t('allStages')}</option>
                        <option value="applied">{t('newApplied')}</option>
                        <option value="screening">{t('screening')}</option>
                        <option value="interview">{t('interview')}</option>
                        <option value="offer">{t('offer')}</option>
                        <option value="hired">{t('hired')}</option>
                        <option value="rejected">{t('rejected')}</option>
                    </select>
                </div>
                <button
                    onClick={fetchApplications}
                    className="p-3 bg-[var(--bg-input)] text-[var(--text-muted)] hover:bg-indigo-500/10 hover:text-indigo-500 rounded-xl transition-all"
                >
                    <RotateCcw className="w-5 h-5" />
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                </div>
            ) : filteredApps.length === 0 ? (
                <div className="text-center py-24 bg-[var(--bg-surface)] rounded-3xl border-2 border-dashed border-[var(--border-main)]">
                    <User className="w-16 h-16 text-[var(--text-muted)] opacity-20 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-[var(--text-main)]">{t('noApplicantsFound')}</h3>
                    <p className="text-[var(--text-muted)] max-w-sm mx-auto">{t('tryAdjustingSearch')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredApps.map((app) => (
                        <Link
                            key={app.id}
                            to={`/recruitment/applicants/${app.id}`}
                            className="bg-[var(--bg-surface)] rounded-3xl p-5 shadow-sm border border-[var(--border-main)] hover:border-indigo-500/50 hover:shadow-md transition-all group relative overflow-hidden"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                {/* Avatar/Initials */}
                                <div className="w-14 h-14 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center font-bold text-xl flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    {app.Applicant?.first_name[0]}{app.Applicant?.last_name[0]}
                                </div>

                                {/* Main Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-bold text-[var(--text-main)] group-hover:text-indigo-600 transition-colors truncate">
                                            {app.Applicant?.first_name} {app.Applicant?.last_name}
                                        </h3>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(app.status)}`}>
                                            {getStatusLabel(app.status)}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--text-muted)]">
                                        <span className="flex items-center font-medium text-indigo-700">
                                            <Briefcase className="w-4 h-4 mr-1.5 opacity-70" />
                                            {app.JobPosting?.title}
                                        </span>
                                        <span className="flex items-center">
                                            <Mail className="w-4 h-4 mr-1.5 opacity-70" />
                                            {app.Applicant?.email}
                                        </span>
                                        <span className="flex items-center">
                                            <Phone className="w-4 h-4 mr-1.5 opacity-70" />
                                            {app.Applicant?.phone}
                                        </span>
                                    </div>
                                </div>

                                {/* Meta Info */}
                                <div className="flex flex-col lg:items-end gap-3 flex-shrink-0">
                                    <div className="flex items-center text-xs text-[var(--text-muted)] font-medium">
                                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                        {t('applied')}: {new Date(app.application_date).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 bg-[var(--bg-surface-soft)] text-[var(--text-muted)] rounded-lg text-xs font-bold border border-[var(--border-main)]">
                                            ID: #{app.id}
                                        </span>
                                        <div className="p-2 text-[var(--text-muted)] opacity-20 group-hover:opacity-100 group-hover:text-indigo-600 transition-all">
                                            <ChevronRight className="w-6 h-6" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ApplicantListPage;
