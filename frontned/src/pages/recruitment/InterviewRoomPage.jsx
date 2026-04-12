import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import recruitmentService from '../../services/recruitmentService';
import { useSettings } from '../../context/SettingsContext.jsx';
import {
    Loader2,
    ArrowLeft,
    MessageSquare,
    Star,
    User,
    ShieldCheck,
    ChevronRight,
    VideoOff
} from 'lucide-react';

const InterviewRoomPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useSettings();
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [jitsiLoaded, setJitsiLoaded] = useState(false);
    const jitsiContainerRef = useRef(null);
    const jitsiApiRef = useRef(null);

    useEffect(() => {
        fetchInterviewDetails();

        // Load Jitsi script
        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = () => setJitsiLoaded(true);
        document.body.appendChild(script);

        return () => {
            if (jitsiApiRef.current) {
                jitsiApiRef.current.dispose();
            }
            document.body.removeChild(script);
        };
    }, [id]);

    const fetchInterviewDetails = async () => {
        try {
            const data = await recruitmentService.getInterviewById(id);
            setInterview(data);
        } catch (error) {
            console.error('Failed to fetch interview details:', error);
            // navigate('/recruitment/interviews');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (jitsiLoaded && interview && jitsiContainerRef.current && !jitsiApiRef.current) {
            const domain = 'meet.jit.si';
            const roomName = interview.meeting_link.split('/').pop();

            const options = {
                roomName: roomName,
                width: '100%',
                height: '100%',
                parentNode: jitsiContainerRef.current,
                userInfo: {
                    displayName: 'Interviewer (HR)'
                },
                interfaceConfigOverwrite: {
                    TOOLBAR_BUTTONS: [
                        'microphone', 'camera', 'closedcaptions', 'desktop', 'embedmeeting', 'fullscreen',
                        'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                        'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                        'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                        'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                        'security'
                    ],
                },
                configOverwrite: {
                    disableDeepLinking: true
                }
            };

            jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);

            jitsiApiRef.current.addEventListeners({
                readyToClose: () => {
                    navigate('/recruitment/interviews');
                }
            });
        }
    }, [jitsiLoaded, interview]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-base)]">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-[var(--text-soft)] font-medium">{t('initializingRoom') || "Initializing interview room..."}</p>
            </div>
        );
    }

    if (!interview) {
        return (
            <div className="flex flex-col items-center justify-center min-vh-100 bg-[var(--bg-base)] text-center p-6">
                <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mb-6">
                    <VideoOff className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-[var(--text-main)] mb-2">{t('interviewNotFound') || "Interview Not Found"}</h2>
                <p className="text-[var(--text-soft)] mb-8 max-w-md">{t('interviewNotFoundDesc') || "We couldn't find the interview session you're looking for. It might have been cancelled or already completed."}</p>
                <button
                    onClick={() => navigate('/recruitment/interviews')}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg"
                >
                    {t('backToInterviews') || "Back to Interviews"}
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row h-screen bg-[var(--bg-base)] overflow-hidden">
            {/* Main Interview Area */}
            <div className="flex-1 relative bg-black">
                <div className="absolute top-6 left-6 z-20 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white/10 backdrop-blur-md text-white rounded-2xl hover:bg-white/20 transition-all border border-white/5"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/5">
                        <p className="text-[10px] text-white/50 font-black uppercase tracking-widest leading-none mb-1">{t('activeInterview') || "Active Interview"}</p>
                        <p className="text-white font-bold text-sm leading-none">
                            {interview.JobApplication?.Applicant?.first_name} {interview.JobApplication?.Applicant?.last_name}
                        </p>
                    </div>
                </div>

                <div
                    ref={jitsiContainerRef}
                    className="w-full h-full"
                />
            </div>

            {/* Sidebar: Candidate Info & Feedback Quick View */}
            <div className="w-full lg:w-96 bg-[var(--bg-surface)] border-l border-[var(--border-main)] flex flex-col h-full overflow-y-auto">
                <div className="p-8 border-b border-[var(--border-main)] bg-[var(--bg-surface-soft)]">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center font-black text-3xl text-white shadow-xl mb-6 transform -rotate-3">
                        {interview.JobApplication?.Applicant?.first_name[0]}{interview.JobApplication?.Applicant?.last_name[0]}
                    </div>
                    <h2 className="text-2xl font-black text-[var(--text-main)] mb-1">
                        {interview.JobApplication?.Applicant?.first_name} {interview.JobApplication?.Applicant?.last_name}
                    </h2>
                    <p className="text-indigo-500 font-bold uppercase tracking-widest text-xs mb-6">
                        {interview.JobApplication?.JobPosting?.title}
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm text-[var(--text-soft)]">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <span className="font-bold">{interview.interview_type}</span>
                            <span className="opacity-30">•</span>
                            <span>Round {interview.interview_round}</span>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-8 flex-1">
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-6 flex items-center gap-2">
                            <MessageSquare className="w-3 h-3" />
                            {t('quickFeedback') || "Quick Evaluation"}
                        </h3>

                        <div className="space-y-6">
                            <div className="group">
                                <p className="text-xs font-bold text-[var(--text-main)] mb-3 flex justify-between">
                                    {t('technicalSkills') || "Technical Skills"}
                                    <span className="text-indigo-500">0/10</span>
                                </p>
                                <div className="h-2 w-full bg-[var(--bg-surface-soft)] rounded-full overflow-hidden">
                                    <div className="h-full w-0 bg-indigo-500 rounded-full group-hover:w-full transition-all duration-1000 opacity-20"></div>
                                </div>
                            </div>

                            <div className="group">
                                <p className="text-xs font-bold text-[var(--text-main)] mb-3 flex justify-between">
                                    {t('communication') || "Communication"}
                                    <span className="text-purple-500">0/10</span>
                                </p>
                                <div className="h-2 w-full bg-[var(--bg-surface-soft)] rounded-full overflow-hidden">
                                    <div className="h-full w-0 bg-purple-500 rounded-full group-hover:w-full transition-all duration-1000 opacity-20"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-[var(--border-main)]">
                        <button
                            onClick={() => navigate(`/recruitment/applicants/${interview.job_application_id}`)}
                            className="w-full py-4 bg-[var(--bg-surface-soft)] text-[var(--text-main)] rounded-2xl font-black text-sm hover:bg-[var(--border-main)] transition-all flex items-center justify-center gap-2"
                        >
                            {t('fullCandidateProfile') || "View Full Profile"}
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <p className="text-[10px] text-[var(--text-muted)] text-center mt-4">
                            Feedback can be finalized on the candidate profile page.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterviewRoomPage;
