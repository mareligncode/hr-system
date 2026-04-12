import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import recruitmentService from '../../services/recruitmentService';
import { useSettings } from '../../context/SettingsContext.jsx';
import {
    Briefcase,
    MapPin,
    Clock,
    ArrowLeft,
    CheckCircle2,
    Globe,
    DollarSign,
    Award,
    Calendar,
    Users
} from 'lucide-react';

const JobDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useSettings();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const data = await recruitmentService.getPublicJobPostingById(id);
                setJob(data);
            } catch (error) {
                console.error('Failed to fetch job details:', error);
                navigate('/careers');
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!job) return null;

    const sections = [
        { title: t('jobDescription'), content: job.description, icon: <Briefcase className="w-5 h-5" /> },
        { title: t('requirements'), content: job.requirements, icon: <CheckCircle2 className="w-5 h-5" /> },
        { title: t('responsibilities'), content: job.responsibilities, icon: <Award className="w-5 h-5" /> },
        { title: t('qualifications'), content: job.qualifications, icon: <CheckCircle2 className="w-5 h-5" /> },
        { title: t('benefits'), content: job.benefits, icon: <DollarSign className="w-5 h-5" /> }
    ].filter(s => s.content);

    return (
        <div className="min-h-screen bg-[var(--bg-main)] pb-20">
            {/* Navigation Header */}
            <div className="bg-[var(--bg-surface)] border-b border-[var(--border-main)] sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to="/careers" className="flex items-center text-[var(--text-muted)] hover:text-indigo-600 transition-colors font-medium">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        {t('backToJobs')}
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link
                            to={`/careers/apply/${job.id}`}
                            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm hover:bg-indigo-700 transition-colors"
                        >
                            {t('applyNow')}
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 mt-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Header Card */}
                        <div className="bg-[var(--bg-surface)] rounded-3xl p-8 shadow-sm border border-[var(--border-main)]">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                                    {job.Position?.Department?.name || 'Department'}
                                </span>
                                {job.is_remote && (
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center">
                                        <Globe className="w-3 h-3 mr-1" />
                                        {t('remoteAvailable')}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--text-main)] mb-6">{job.title}</h1>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-[var(--bg-surface-soft)] rounded-2xl">
                                    <p className="text-xs text-[var(--text-muted)] mb-1">{t('employmentType')}</p>
                                    <p className="font-semibold text-[var(--text-main)] capitalize flex items-center">
                                        <Clock className="w-4 h-4 mr-2 text-indigo-600" />
                                        {job.employment_type?.replace('_', ' ')}
                                    </p>
                                </div>
                                <div className="p-4 bg-[var(--bg-surface-soft)] rounded-2xl">
                                    <p className="text-xs text-[var(--text-muted)] mb-1">{t('workLocation')}</p>
                                    <p className="font-semibold text-[var(--text-main)] flex items-center">
                                        <MapPin className="w-4 h-4 mr-2 text-indigo-600" />
                                        {job.location || t('onSite')}
                                    </p>
                                </div>
                                <div className="p-4 bg-[var(--bg-surface-soft)] rounded-2xl">
                                    <p className="text-xs text-[var(--text-muted)] mb-1">{t('experience')}</p>
                                    <p className="font-semibold text-[var(--text-main)] capitalize flex items-center">
                                        <Briefcase className="w-4 h-4 mr-2 text-indigo-600" />
                                        {job.experience_level || 'N/A'}
                                    </p>
                                </div>
                                <div className="p-4 bg-[var(--bg-surface-soft)] rounded-2xl">
                                    <p className="text-xs text-[var(--text-muted)] mb-1">{t('salary')}</p>
                                    <p className="font-semibold text-[var(--text-main)] flex items-center">
                                        <DollarSign className="w-4 h-4 mr-1 text-indigo-600" />
                                        {job.max_salary ? `${job.min_salary} - ${job.max_salary}` : t('competitive')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Detail Sections */}
                        {sections.map((section, idx) => (
                            <section key={idx} className="bg-[var(--bg-surface)] rounded-3xl p-8 shadow-sm border border-[var(--border-main)]">
                                <h3 className="text-xl font-bold text-[var(--text-main)] mb-6 flex items-center">
                                    <span className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg mr-3">
                                        {section.icon}
                                    </span>
                                    {section.title}
                                </h3>
                                <div className="prose prose-indigo max-w-none text-[var(--text-soft)] whitespace-pre-line leading-relaxed">
                                    {section.content}
                                </div>
                            </section>
                        ))}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-lg shadow-indigo-200 sticky top-28">
                            <h3 className="text-xl font-bold mb-4">{t('readyToApply')}</h3>
                            <p className="text-indigo-100 mb-8 leading-relaxed">
                                {t('recruitmentTeamReview')}
                            </p>
                            <Link
                                to={`/careers/apply/${job.id}`}
                                className="block w-full bg-white text-indigo-600 py-4 px-6 rounded-2xl font-bold text-center hover:bg-white/90 transition-colors"
                            >
                                {t('applyForThisPosition')}
                            </Link>

                            <hr className="my-8 border-indigo-500" />

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="w-5 h-5 text-indigo-300" />
                                    <span>{t('posted')}: {new Date(job.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Users className="w-5 h-5 text-indigo-300" />
                                    <span>{t('openVacancies')}: {job.vacancies_count}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Briefcase className="w-5 h-5 text-indigo-300" />
                                    <span>{t('ref')}: {job.reference_code}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[var(--bg-surface)] rounded-3xl p-8 shadow-sm border border-[var(--border-main)]">
                            <h4 className="font-bold text-[var(--text-main)] mb-4">{t('shareThisRole')}</h4>
                            <div className="flex gap-4">
                                <button className="p-3 bg-[var(--bg-surface-soft)] hover:bg-indigo-500/10 hover:text-indigo-500 rounded-2xl transition-all flex-1 border border-[var(--border-main)] text-[var(--text-soft)]">
                                    LinkedIn
                                </button>
                                <button className="p-3 bg-[var(--bg-surface-soft)] hover:bg-indigo-500/10 hover:text-indigo-500 rounded-2xl transition-all flex-1 border border-[var(--border-main)] text-[var(--text-soft)]">
                                    Twitter
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetailPage;
