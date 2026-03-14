import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import recruitmentService from '../../services/recruitmentService';
import { useSettings } from '../../context/SettingsContext.jsx';
import { DollarSign } from 'lucide-react';
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
    History,
    Plus,
    Video,
    FileCheck,
    Star,
    AlertCircle,
    BadgeCheck,
    RotateCcw
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

    const [interviews, setInterviews] = useState([]);
    const [offers, setOffers] = useState([]);
    const [showInterviewModal, setShowInterviewModal] = useState(false);
    const [showOfferModal, setShowOfferModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [selectedInterview, setSelectedInterview] = useState(null);

    // Form states
    const [interviewForm, setInterviewForm] = useState({
        scheduled_at: '',
        duration_minutes: 30,
        interview_type: 'online',
        interview_round: 1,
        notes: ''
    });

    const [offerForm, setOfferForm] = useState({
        salary: 0,
        joining_date: '',
        expiry_date: '',
        notes: ''
    });

    const [feedbackForm, setFeedbackForm] = useState({
        technical_score: 5,
        communication_score: 5,
        cultural_fit_score: 5,
        recommendation: 'neutral',
        feedback_text: ''
    });

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            const appData = await recruitmentService.getApplicationById(id);
            setApplication(appData);
            const timelineData = await recruitmentService.getApplicationTimeline(id);
            setTimeline(timelineData);

            // Phase 9 data
            const interviewsData = await recruitmentService.getInterviews({ job_application_id: id });
            setInterviews(interviewsData);
            const offersData = await recruitmentService.getOffers({ job_application_id: id });
            setOffers(offersData);
        } catch (error) {
            console.error('Error fetching applicant details:', error);
            navigate('/recruitment/applicants');
        } finally {
            setLoading(false);
        }
    };

    const handleScheduleInterview = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            await recruitmentService.scheduleInterview({
                ...interviewForm,
                job_application_id: id
            });
            setShowInterviewModal(false);
            fetchDetails();
        } catch (error) {
            alert(t('failedToScheduleInterview') || 'Failed to schedule interview');
        } finally {
            setUpdating(false);
        }
    };

    const handleCreateOffer = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            await recruitmentService.createOffer({
                ...offerForm,
                job_application_id: id
            });
            setShowOfferModal(false);
            fetchDetails();
        } catch (error) {
            alert(t('failedToCreateOffer') || 'Failed to create offer');
        } finally {
            setUpdating(false);
        }
    };

    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            await recruitmentService.submitInterviewFeedback({
                ...feedbackForm,
                interview_id: selectedInterview.id
            });
            setShowFeedbackModal(false);
            fetchDetails();
        } catch (error) {
            alert(t('failedToSubmitFeedback') || 'Failed to submit feedback');
        } finally {
            setUpdating(false);
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
                        onClick={() => setShowInterviewModal(true)}
                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                        disabled={updating}
                    >
                        <Calendar className="w-4 h-4" />
                        {t('scheduleInterview')}
                    </button>
                    <button
                        onClick={() => setShowOfferModal(true)}
                        className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                        disabled={updating}
                    >
                        <FileCheck className="w-4 h-4" />
                        {t('createOffer')}
                    </button>
                    <div className="w-px h-8 bg-gray-200 mx-2"></div>
                    <button
                        onClick={() => handleStatusUpdate('rejected')}
                        className="px-5 py-2.5 bg-red-50 text-red-700 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center gap-2"
                        disabled={updating}
                    >
                        <XCircle className="w-4 h-4" />
                        {t('rejectApplication')}
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

                    {/* Interviews Section */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Video className="w-5 h-5 text-indigo-600" />
                                {t('interviews')}
                            </h2>
                            <button
                                onClick={() => setShowInterviewModal(true)}
                                className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {interviews.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    <Calendar className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm font-bold uppercase tracking-widest">{t('noInterviewsScheduled')}</p>
                                </div>
                            ) : (
                                interviews.map((interview) => (
                                    <div key={interview.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-indigo-200 transition-all">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                                    <Video className="w-4 h-4 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{interview.interview_type} - Round {interview.interview_round}</p>
                                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                                                        {new Date(interview.scheduled_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white border border-gray-200`}>
                                                {interview.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 mt-4">
                                            {interview.interview_type === 'online' && interview.status === 'scheduled' && (
                                                <Link
                                                    to={`/recruitment/interviews/room/${interview.id}`}
                                                    className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black text-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                                                >
                                                    {t('joinMeeting')}
                                                </Link>
                                            )}
                                            {interview.status === 'scheduled' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedInterview(interview);
                                                        setShowFeedbackModal(true);
                                                    }}
                                                    className="flex-1 py-2.5 bg-white text-indigo-600 border border-indigo-200 rounded-xl text-xs font-black hover:bg-indigo-50 transition-all text-center"
                                                >
                                                    {t('interviewFeedback')}
                                                </button>
                                            )}
                                        </div>

                                        {interview.Feedback && (
                                            <div className="mt-4 p-4 bg-white rounded-xl border border-indigo-50">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-1 text-indigo-600">
                                                        <Star className="w-3.5 h-3.5 fill-current" />
                                                        <span className="text-xs font-black">{interview.Feedback.overall_recommendation}</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <div className="px-2 py-1 bg-gray-50 rounded text-[8px] font-black uppercase">TECH: {interview.Feedback.technical_score}</div>
                                                        <div className="px-2 py-1 bg-gray-50 rounded text-[8px] font-black uppercase">COMM: {interview.Feedback.communication_score}</div>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-600 italic">"{interview.Feedback.comments}"</p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Offers Section */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <FileCheck className="w-5 h-5 text-emerald-600" />
                                {t('offers')}
                            </h2>
                            <button
                                onClick={() => setShowOfferModal(true)}
                                className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {offers.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm font-bold uppercase tracking-widest">{t('noOffersSent')}</p>
                                </div>
                            ) : (
                                offers.map((offer) => (
                                    <div key={offer.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-emerald-200 transition-all">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                                    <DollarSign className="w-4 h-4 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-lg text-gray-900 tracking-tighter">{offer.salary.toLocaleString()}</p>
                                                    <p className="text-[10px] text-gray-400 font-black uppercase leading-none">ANNUAL SALARY</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100`}>
                                                {offer.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                            <div className="p-3 bg-white rounded-xl border border-gray-100">
                                                <p className="text-[8px] font-black text-gray-400 uppercase mb-1">{t('joiningDate')}</p>
                                                <p className="text-xs font-bold text-gray-700">{new Date(offer.joining_date).toLocaleDateString()}</p>
                                            </div>
                                            <div className="p-3 bg-white rounded-xl border border-gray-100">
                                                <p className="text-[8px] font-black text-gray-400 uppercase mb-1">{t('expiryDate')}</p>
                                                <p className="text-xs font-bold text-gray-700">{new Date(offer.expiry_date).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        {offer.status === 'sent' && (
                                            <div className="flex gap-2 mt-4">
                                                <button
                                                    onClick={async () => {
                                                        await recruitmentService.acceptOffer(offer.id);
                                                        fetchDetails();
                                                    }}
                                                    className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
                                                >
                                                    {t('markAccepted') || "Mark Accepted"}
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        const reason = prompt("Reason for rejection?");
                                                        await recruitmentService.rejectOffer(offer.id, { rejection_reason: reason });
                                                        fetchDetails();
                                                    }}
                                                    className="flex-1 py-2 bg-white text-red-600 border border-red-100 rounded-xl text-[10px] font-black hover:bg-red-50 transition-all"
                                                >
                                                    {t('markRejected') || "Mark Rejected"}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Timeline History */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-2">
                            <History className="w-5 h-5 text-indigo-600" />
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
            {/* Modals */}
            {/* Interview Modal */}
            {showInterviewModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] w-full max-w-lg p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                            <Calendar className="w-6 h-6 text-indigo-600" />
                            {t('scheduleInterview')}
                        </h2>
                        <form onSubmit={handleScheduleInterview} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{t('scheduledAt') || "Date & Time"}</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 font-bold"
                                        value={interviewForm.scheduled_at}
                                        onChange={(e) => setInterviewForm({ ...interviewForm, scheduled_at: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{t('durationIdx') || "Duration (min)"}</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 font-bold"
                                        value={interviewForm.duration_minutes}
                                        onChange={(e) => setInterviewForm({ ...interviewForm, duration_minutes: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{t('round')}</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 font-bold"
                                        value={interviewForm.interview_round}
                                        onChange={(e) => setInterviewForm({ ...interviewForm, interview_round: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{t('interviewType')}</label>
                                <select
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 font-bold outline-none"
                                    value={interviewForm.interview_type}
                                    onChange={(e) => setInterviewForm({ ...interviewForm, interview_type: e.target.value })}
                                >
                                    <option value="online">Online (Jitsi)</option>
                                    <option value="in_person">On-site</option>
                                    <option value="phone">Phone</option>
                                </select>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowInterviewModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black hover:bg-gray-200 transition-all">{t('cancel')}</button>
                                <button type="submit" disabled={updating} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20">
                                    {updating ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t('scheduleInterview')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Offer Modal */}
            {showOfferModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] w-full max-w-lg p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                            <DollarSign className="w-6 h-6 text-emerald-600" />
                            {t('createOffer')}
                        </h2>
                        <form onSubmit={handleCreateOffer} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{t('salary')}</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 w-5 h-5" />
                                    <input
                                        type="number"
                                        required
                                        placeholder="Annual salary..."
                                        className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 font-black text-xl"
                                        value={offerForm.salary}
                                        onChange={(e) => setOfferForm({ ...offerForm, salary: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{t('joiningDate')}</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-emerald-500 font-bold"
                                        value={offerForm.joining_date}
                                        onChange={(e) => setOfferForm({ ...offerForm, joining_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{t('expiryDate')}</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-emerald-500 font-bold"
                                        value={offerForm.expiry_date}
                                        onChange={(e) => setOfferForm({ ...offerForm, expiry_date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowOfferModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black hover:bg-gray-200 transition-all">{t('cancel')}</button>
                                <button type="submit" disabled={updating} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20">
                                    {updating ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t('createOffer')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Feedback Modal */}
            {showFeedbackModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] w-full max-w-xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300 overflow-y-auto max-h-[90vh]">
                        <h2 className="text-2xl font-black text-gray-900 mb-6">{t('interviewFeedback')}</h2>
                        <form onSubmit={handleSubmitFeedback} className="space-y-8">
                            {[
                                { id: 'technical_score', label: 'technicalScore' },
                                { id: 'communication_score', label: 'communicationScore' },
                                { id: 'cultural_fit_score', label: 'culturalFit' }
                            ].map(score => (
                                <div key={score.id}>
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{t(score.label)}</label>
                                        <span className="text-lg font-black text-indigo-600">{feedbackForm[score.id]}/10</span>
                                    </div>
                                    <input
                                        type="range" min="1" max="10"
                                        className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        value={feedbackForm[score.id]}
                                        onChange={(e) => setFeedbackForm({ ...feedbackForm, [score.id]: parseInt(e.target.value) })}
                                    />
                                </div>
                            ))}

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">{t('overallRecommendation')}</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { label: 'Reject', value: 'not_hire' },
                                        { label: 'Neutral', value: 'neutral' },
                                        { label: 'Hire', value: 'hire' }
                                    ].map(rec => (
                                        <button
                                            key={rec.value}
                                            type="button"
                                            onClick={() => setFeedbackForm({ ...feedbackForm, recommendation: rec.value })}
                                            className={`py-3 rounded-2xl font-black text-xs transition-all ${feedbackForm.recommendation === rec.value
                                                ? (rec.value === 'hire' ? 'bg-emerald-600 text-white' : rec.value === 'not_hire' ? 'bg-red-600 text-white' : 'bg-gray-800 text-white')
                                                : 'bg-gray-50 text-gray-400 border border-gray-100'
                                                }`}
                                        >
                                            {rec.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{t('comments')}</label>
                                <textarea
                                    rows="4"
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Final thoughts and comments..."
                                    value={feedbackForm.feedback_text}
                                    onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback_text: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowFeedbackModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black hover:bg-gray-200 transition-all">{t('cancel')}</button>
                                <button type="submit" disabled={updating} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20">
                                    {updating ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t('submitFeedback') || "Submit Feedback"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplicantDetailPage;
