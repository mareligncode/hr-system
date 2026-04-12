import React, { useState, useEffect } from 'react';
import {
    Play,
    CheckCircle,
    Clock,
    BookOpen,
    Search,
    Filter,
    Award,
    Star,
    Sparkles,
    ChevronRight,
    TrendingUp
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import lmsService from '../../services/lmsService';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const TrainingCatalog = () => {
    const { t } = useTranslation();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('all');

    const categories = [
        { id: 'all', label: t('allModules'), icon: <Sparkles size={18} /> },
        { id: 'onboarding', label: t('onboarding'), icon: <Star size={18} /> },
        { id: 'safety', label: t('safetyCompliance'), icon: <Award size={18} /> },
        { id: 'service', label: t('serviceExcellence'), icon: <TrendingUp size={18} /> },
    ];

    useEffect(() => {
        fetchCourses();
    }, [category]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const params = category !== 'all' ? { category } : {};
            const res = await lmsService.getCourses(params);
            setCourses(res.data);
        } catch (error) {
            toast.error(t('failedToLoadCatalog'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-10 max-w-[1600px] mx-auto space-y-12">
            {/* Hero Section */}
            <div className="relative h-[400px] rounded-[3rem] overflow-hidden bg-gray-900 group">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/40 to-transparent z-10" />
                <img
                    src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                    alt="Training Hero"
                />
                <div className="relative z-20 h-full flex flex-col justify-center p-16 space-y-6 max-w-2xl">
                    <span className="inline-flex items-center gap-2 px-4 py-1 bg-indigo-500 text-white rounded-full text-xs font-black uppercase tracking-widest">
                        <Sparkles size={14} />
                        {t('featuredTraining')}
                    </span>
                    <h1 className="text-6xl font-black text-white leading-tight">
                        {t('masterTheArtOf')} <span className="text-indigo-400">{t('hospitality')}</span>
                    </h1>
                    <p className="text-gray-300 text-xl font-medium leading-relaxed">
                        {t('elevateYourSkillsAndLevelUpYourCareerWithOurPremiumLearningModules')}
                    </p>
                    <div className="flex gap-4 pt-4">
                        <button className="px-8 py-4 bg-white text-gray-900 rounded-2xl font-black flex items-center gap-3 hover:bg-gray-100 transition-all shadow-xl shadow-white/10">
                            <Play size={20} fill="currentColor" />
                            {t('resumeLearning')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-8">
                <div className="flex gap-4 p-2 bg-gray-100/50 rounded-3xl backdrop-blur-sm overflow-x-auto no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setCategory(cat.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap ${category === cat.id ? 'bg-white text-indigo-600 shadow-md scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {cat.icon}
                            {cat.label}
                        </button>
                    ))}
                </div>
                <div className="flex-grow max-w-md relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                    <input
                        type="text"
                        placeholder={t('searchModules')}
                        className="w-full pl-16 pr-6 py-4 bg-white border-none rounded-3xl outline-none focus:ring-4 focus:ring-indigo-100 shadow-xl shadow-gray-50 font-medium"
                    />
                </div>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="h-[450px] bg-gray-100 rounded-[2.5rem] animate-pulse" />
                    ))
                ) : courses.map(course => (
                    <Link
                        to={`/training/play/${course.id}`}
                        key={course.id}
                        className="group bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-gray-100 border border-gray-50 transition-all hover:-translate-y-3 flex flex-col h-full"
                    >
                        <div className="relative h-56 overflow-hidden">
                            <img
                                src={course.thumbnail_url || `https://images.unsplash.com/photo-1517245318773-b7b8309ba3a6?q=80&w=2070&auto=format&fit=crop`}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                alt={course.title}
                            />
                            <div className="absolute top-6 left-6 flex gap-2">
                                {course.is_mandatory && (
                                    <span className="px-3 py-1 bg-red-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20">
                                        {t('mandatory')}
                                    </span>
                                )}
                                <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-gray-900 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                    {course.category}
                                </span>
                            </div>
                            <div className="absolute inset-0 bg-gray-900/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white ring-4 ring-white/10 scale-50 group-hover:scale-100 transition-transform">
                                    <Play size={24} fill="white" />
                                </div>
                            </div>
                        </div>

                        <div className="p-8 flex flex-col flex-grow">
                            <div className="flex items-center gap-4 text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
                                <span className="flex items-center gap-1.5"><Clock size={16} /> {course.estimated_minutes} {t('min')}</span>
                                <span className="flex items-center gap-1.5"><BookOpen size={16} /> {t('quizIncluded')}</span>
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-4 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                                {course.title}
                            </h3>
                            <p className="text-gray-500 text-sm font-medium line-clamp-3 mb-8 flex-grow">
                                {course.description}
                            </p>

                            <div className="mt-auto space-y-6">
                                {/* Progress Bar */}
                                {course.CourseProgresses?.[0] && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            <span>{t('yourProgress')}</span>
                                            <span>{course.CourseProgresses[0].percent_complete}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                                                style={{ width: `${course.CourseProgresses[0].percent_complete}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between group-hover:translate-x-2 transition-transform">
                                    <span className="text-gray-900 font-black text-sm uppercase tracking-widest flex items-center gap-2">
                                        {course.CourseProgresses?.[0]?.status === 'completed' ? (
                                            <><CheckCircle className="text-green-500" size={18} /> {t('completed')}</>
                                        ) : (
                                            <>{t('startLearning')} <ChevronRight size={18} className="text-gray-300" /></>
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default TrainingCatalog;
