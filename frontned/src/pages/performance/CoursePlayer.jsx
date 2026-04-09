import React, { useState, useEffect } from 'react';
import {
    ChevronLeft,
    Play,
    Pause,
    RotateCcw,
    Volume2,
    Award,
    CheckCircle2,
    XCircle,
    ArrowRight,
    MessageSquare,
    HelpCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import lmsService from '../../services/lmsService';
import { toast } from 'react-hot-toast';

const CoursePlayer = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('video'); // 'video' or 'quiz'
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [quizResult, setQuizResult] = useState(null);

    useEffect(() => {
        fetchCourse();
    }, [id]);

    const fetchCourse = async () => {
        try {
            setLoading(true);
            const res = await lmsService.getCourseDetail(id);
            setCourse(res.data);

            // Mark as in-progress
            await lmsService.updateProgress(id, { status: 'in_progress', percent_complete: 50 });
        } catch (error) {
            toast.error(t('failedToLoadModule'));
        } finally {
            setLoading(false);
        }
    };

    const handleQuizSubmit = async () => {
        try {
            const answerPayload = course.QuizQuestions.map((_, idx) => answers[idx]);
            const res = await lmsService.submitQuiz(id, { answers: answerPayload });
            setQuizResult(res.data);
        } catch (error) {
            toast.error(t('failedToSubmitQuiz'));
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse">{t('loadingExcellence')}...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Bar */}
            <div className="bg-white px-8 py-6 flex items-center justify-between border-b border-gray-100 shadow-sm sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/training-catalog')} className="p-3 hover:bg-gray-50 rounded-2xl transition-all">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-xl font-black text-gray-900">{course.title}</h2>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-500">
                            <span className="bg-indigo-50 px-2 py-0.5 rounded-md">{course.category}</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-400">{t('module')} {course.id}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right mr-4">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{t('yourProgress')}</p>
                        <p className="text-sm font-black text-gray-900">{view === 'video' ? '50%' : '80%'}</p>
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-gray-100 flex items-center justify-center relative">
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-[spin_3s_linear_infinite]" />
                        <span className="text-xs font-black">🏃</span>
                    </div>
                </div>
            </div>

            <div className="flex-grow flex p-8 gap-8 max-w-7xl mx-auto w-full">
                {/* Main View Area */}
                <div className="flex-grow space-y-8">
                    {view === 'video' ? (
                        <div className="space-y-8">
                            <div className="relative aspect-video bg-black rounded-[3rem] overflow-hidden shadow-2xl group ring-8 ring-white">
                                <iframe
                                    className="w-full h-full"
                                    src={course.video_url || "https://www.youtube.com/embed/dQw4w9WgXcQ"}
                                    title={course.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>

                            <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-gray-100 border border-gray-50 space-y-6">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-2xl font-black text-gray-900">{t('aboutThisModule')}</h3>
                                    <button
                                        onClick={() => setView('quiz')}
                                        className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all transform hover:-translate-y-1"
                                    >
                                        {t('readyToTakeQuiz')}
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                                <p className="text-gray-500 leading-relaxed text-lg font-medium">
                                    {course.description}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[4rem] shadow-2xl p-16 flex flex-col min-h-[600px] animate-in slide-in-from-right-10 duration-500">
                            {!quizResult ? (
                                <div className="space-y-12">
                                    <div className="flex justify-between items-end border-b border-gray-100 pb-10">
                                        <div>
                                            <h3 className="text-4xl font-black text-gray-900">{t('knowledgeCheck')}</h3>
                                            <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-sm">{t('question')} {currentStep + 1} {t('of')} {course.QuizQuestions?.length}</p>
                                        </div>
                                        <HelpCircle className="text-indigo-200" size={48} />
                                    </div>

                                    <div className="space-y-10">
                                        <h4 className="text-2xl font-bold text-gray-800 leading-tight">
                                            {course.QuizQuestions[currentStep]?.question_text}
                                        </h4>
                                        <div className="grid grid-cols-1 gap-4">
                                            {course.QuizQuestions[currentStep]?.options.map((opt, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setAnswers({ ...answers, [currentStep]: idx })}
                                                    className={`p-6 rounded-3xl text-left font-bold transition-all border-2 text-lg ${answers[currentStep] === idx ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100 scale-[1.02]' : 'bg-gray-50 border-gray-50 text-gray-700 hover:bg-white hover:border-indigo-100'}`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm ${answers[currentStep] === idx ? 'bg-white/20' : 'bg-white shadow-sm'}`}>
                                                            {String.fromCharCode(65 + idx)}
                                                        </span>
                                                        {opt}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-between pt-10 border-t border-gray-50 mt-auto">
                                        <button
                                            disabled={currentStep === 0}
                                            onClick={() => setCurrentStep(currentStep - 1)}
                                            className="px-8 py-4 font-black text-gray-400 hover:text-gray-600 disabled:opacity-30 uppercase tracking-widest"
                                        >
                                            {t('previous')}
                                        </button>
                                        {currentStep < course.QuizQuestions.length - 1 ? (
                                            <button
                                                onClick={() => setCurrentStep(currentStep + 1)}
                                                className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black shadow-xl hover:bg-black transition-all"
                                            >
                                                {t('next')}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleQuizSubmit}
                                                className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                                            >
                                                {t('finishAttempt')}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-grow flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in duration-500">
                                    <div className={`p-10 rounded-full ${quizResult.passed ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                                        {quizResult.passed ? <CheckCircle2 size={120} /> : <XCircle size={120} />}
                                    </div>
                                    <div>
                                        <h3 className="text-5xl font-black text-gray-900 mb-2">
                                            {quizResult.passed ? t('congratulations') : t('keepTrying')}
                                        </h3>
                                        <p className="text-gray-500 text-xl font-medium">
                                            {quizResult.passed
                                                ? t('youHaveMasteredThisModule')
                                                : t('youNeed70%ToPassThisQualification')}
                                        </p>
                                    </div>
                                    <div className="flex gap-4 p-8 bg-gray-50 rounded-[3rem] w-full max-w-md justify-between">
                                        <div className="text-center flex-grow">
                                            <p className="text-xs font-black text-gray-400 uppercase mb-1">{t('score')}</p>
                                            <p className="text-3xl font-black text-gray-900">{quizResult.score}%</p>
                                        </div>
                                        <div className="w-px bg-gray-200" />
                                        <div className="text-center flex-grow">
                                            <p className="text-xs font-black text-gray-400 uppercase mb-1">{t('correct')}</p>
                                            <p className="text-3xl font-black text-gray-900">{quizResult.correctCount}/{quizResult.total}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 w-full max-w-md pt-6">
                                        <button
                                            onClick={() => window.location.reload()}
                                            className="flex-grow py-5 bg-white border-2 border-gray-100 rounded-3xl font-black text-gray-900 hover:bg-gray-50 transition-all"
                                        >
                                            {t('retryQuiz')}
                                        </button>
                                        <button
                                            onClick={() => navigate('/training-catalog')}
                                            className="flex-grow py-5 bg-indigo-600 text-white rounded-3xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                                        >
                                            {t('backToCatalog')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar Resources */}
                <div className="w-80 shrink-0 space-y-8">
                    <div className="bg-white p-8 rounded-[3rem] shadow-xl shadow-gray-50 border border-gray-50">
                        <h4 className="font-black text-gray-900 mb-6 flex items-center gap-2">
                            <MessageSquare className="text-indigo-500" size={18} />
                            {t('resources')}
                        </h4>
                        <div className="space-y-4">
                            {[t('trainingManual.pdf'), t('bestPractices.docx'), t('checklist.xlsx')].map((doc, idx) => (
                                <button key={idx} className="w-full p-4 bg-gray-50 rounded-2xl flex items-center gap-3 text-xs font-bold text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100">
                                    <Award size={16} />
                                    {doc}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoursePlayer;
