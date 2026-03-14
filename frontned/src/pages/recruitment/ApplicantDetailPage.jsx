import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import recruitmentService from '../../services/recruitmentService';
import { useSettings } from '../../context/SettingsContext.jsx';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    FileText,
    ExternalLink,
    Briefcase,
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    Send,
    Loader2,
    MessageSquare,
    ChevronRight,
    History
} from 'lucide-react';

const ApplicantDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useSettings();

    const [application, setApplication] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [statusNote, setStatusNote] = useState('');

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            const appData = await recruitmentService.getApplicationById(id);
            setApplication(appData);
            const timelineData = await recruitmentService.getApplicationTimeline(id);
            setTimeline(timelineData);
        } catch (error) {
            console.error('Error fetching applicant details:', error);
            navigate('/recruitment/applicants');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        setUpdating(true);
        try {
            await recruitmentService.updateApplicationStatus(id, {
                status: newStatus,
                notes: statusNote
            });
            setStatusNote('');
            fetchDetails();
        } catch (error) {
            alert(t('failedToUpdateStatus'));
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!application) return null;

    const stages = [
        { key: 'applied', label: t('applied') },
        { key: 'screening', label: t('screening') },
        { key: 'interview', label: t('interview') },
        { key: 'offer', label: t('offer') },
        { key: 'hired', label: t('hired') },
        { key: 'rejected', label: t('rejected') }
    ];

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

    const currentStageIdx = stages.findIndex(s => s.key === application.status);

    return (
        <div className="p-6 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link to="/recruitment/applicants" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-500" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {application.Applicant?.first_name} {application.Applicant?.last_name}
                            </h1>
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-black uppercase rounded-full border border-indigo-100">
                                {getStatusLabel(application.status)}
                            </span>
                        </div>
                        <p className="text-gray-500 flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            {t('applyingFor', { title: application.JobPosting?.title })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleStatusUpdate('rejected')}
                        className="px-5 py-2.5 bg-red-50 text-red-700 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center gap-2"
                        disabled={updating}
                    >
                        <XCircle className="w-4 h-4" />
                        {t('rejectApplication')}
                    </button>
                    <button
                        onClick={() => handleStatusUpdate('hired')}
                        className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-send flex items-center gap-2"
                        disabled={updating}
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        {t('hireCandidate')}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile & Pipeline */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Pipeline Progress */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-2">
                            <History className="w-5 h-5 text-indigo-600" />
                            {t('recruitmentPipeline')}
                        </h2>
                        <div className="relative">
                            <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100 -z-0"></div>
                            <div className="flex justify-between relative z-10">
                                {stages.slice(0, 5).map((stage, idx) => {
                                    const isCompleted = idx <= currentStageIdx;
                                    const isCurrent = idx === currentStageIdx;
                                    return (
                                        <button
                                            key={stage.key}
                                            onClick={() => handleStatusUpdate(stage.key)}
                                            disabled={updating}
                                            className="flex flex-col items-center group"
                                        >
                                            <div className={`
                                                w-10 h-10 rounded-full flex items-center justify-center transition-all border-4
                                                ${isCurrent ? 'bg-indigo-600 border-indigo-100 scale-110 shadow-lg' :
                                                    isCompleted ? 'bg-white border-indigo-600 text-indigo-600' : 'bg-white border-gray-100 text-gray-300'}
                                            `}>
                                                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                                            </div>
                                            <span className={`mt-3 text-xs font-bold uppercase tracking-wider ${isCurrent ? 'text-indigo-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {stage.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Resume & Documents */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-600" />
                                {t('documents')}
                            </h2>
                        </div>
                        <div className="space-y-4">
                            {application.resume_url ? (
                                <a
                                    href={application.resume_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-indigo-200 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-red-50 text-red-500 rounded-xl">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">RESUME_CANDIDATE_{application.Applicant?.last_name.toUpperCase()}.PDF</p>
                                            <p className="text-xs text-gray-500 uppercase tracking-widest font-black">{t('mainCVDocument')}</p>
                                        </div>
                                    </div>
                                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
                                </a>
                            ) : (
                                <div className="text-center py-8 text-gray-500">{t('noResumeUploaded')}</div>
                            )}
                        </div>
                    </div>

                    {/* Timeline History */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-indigo-600" />
                            {t('activityLog')}
                        </h2>
                        <div className="space-y-6">
                            {timeline.length === 0 ? (
                                <p className="text-center text-gray-400 py-4">{t('noActivityRecorded')}</p>
                            ) : (
                                timeline.map((entry, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="flex flex-col items-center flex-shrink-0">
                                            <div className="w-2 h-2 rounded-full bg-indigo-600 mb-1"></div>
                                            <div className="w-0.5 h-full bg-gray-100"></div>
                                        </div>
                                        <div className="pb-6">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-bold text-gray-900 uppercase">
                                                    {t('statusChangedTo', { status: getStatusLabel(entry.status) })}
                                                </span>
                                                <span className="text-xs text-gray-400">• {new Date(entry.created_at).toLocaleString()}</span>
                                            </div>
                                            {entry.notes && (
                                                <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-600 italic">
                                                    "{entry.notes}"
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Contact & Stats */}
                <div className="space-y-6">
                    {/* Contact Info */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-xs opacity-50">{t('contactInformation')}</h3>
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs text-gray-400">{t('emailAddress')}</p>
                                    <p className="text-sm font-bold text-gray-900 truncate">{application.Applicant?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">{t('phoneNumber')}</p>
                                    <p className="text-sm font-bold text-gray-900">{application.Applicant?.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">{t('appliedOn')}</p>
                                    <p className="text-sm font-bold text-gray-900">{new Date(application.application_date).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status Update Note */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs opacity-50">{t('addInternalNote')}</h3>
                        <textarea
                            rows="4"
                            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 mb-4"
                            placeholder={t('internalNotePlaceholder')}
                            value={statusNote}
                            onChange={(e) => setStatusNote(e.target.value)}
                        ></textarea>
                        <p className="text-[10px] text-gray-400 mb-4">{t('noteSavedWithStatus')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicantDetailPage;
