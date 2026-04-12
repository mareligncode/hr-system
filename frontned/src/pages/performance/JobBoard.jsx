import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    MapPin,
    Clock,
    Briefcase,
    ArrowRight,
    Heart,
    Share2,
    DollarSign,
    Sparkles,
    CheckCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import recruitmentService from '../../services/recruitmentService';
import { toast } from 'react-hot-toast';

const JobBoard = () => {
    const { t } = useTranslation();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const res = await recruitmentService.getJobs({ status: 'published' });
            setJobs(res.data);
        } catch (error) {
            toast.error(t('failedToLoadJobs'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative min-h-[500px] lg:h-[600px] overflow-hidden bg-gray-900 group">
                <img
                    src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop"
                    className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-1000"
                    alt="Careers at Royal Hotel"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 text-center flex flex-col items-center justify-center p-6 sm:p-10 space-y-6 sm:space-y-8">
                    <span className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 text-indigo-400 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest">
                        <Sparkles size={14} />
                        {t('joinTheWorldOfExcellence')}
                    </span>
                    <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black text-white leading-tight tracking-tighter max-w-5xl">
                        {t('yourNextCareer')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{t('awaitsInHospitality')}</span>
                    </h1>
                    <p className="text-gray-300 text-lg sm:text-2xl font-medium max-w-2xl leading-relaxed">
                        {t('joinAEliteTeamThatRedefinesServiceAndLuxuryEverySingleDay')}
                    </p>

                    {/* Floating Search Bar */}
                    <div className="w-full max-w-4xl bg-white/10 backdrop-blur-3xl p-3 sm:p-4 rounded-3xl sm:rounded-[3.5rem] flex flex-col sm:flex-row gap-3 sm:gap-4 border border-white/20 shadow-2xl lg:transform lg:translate-y-20">
                        <div className="flex-grow flex items-center bg-white px-6 sm:px-8 py-4 sm:py-5 rounded-2xl sm:rounded-[2.5rem]">
                            <Search className="text-gray-300 mr-4" />
                            <input
                                type="text"
                                placeholder={t('findRoleTitleOrDepartment')}
                                className="w-full bg-transparent border-none outline-none font-bold text-gray-900 text-sm sm:text-base"
                            />
                        </div>
                        <button className="px-8 sm:px-12 py-4 sm:py-5 bg-indigo-600 text-white rounded-2xl sm:rounded-[2.5rem] font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 text-sm sm:text-base">
                            {t('searchRoles')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-6 sm:px-10 py-20 lg:py-40 space-y-12 sm:space-y-20">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    <div>
                        <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tighter">{t('currentOpenings')}</h2>
                        <div className="flex overflow-x-auto pb-4 sm:pb-0 gap-3 sm:gap-4 mt-6 scrollbar-hide">
                            {[t('allDepartments'), t('frontOffice'), t('culinary'), t('executive')].map((dept, i) => (
                                <button key={i} className={`whitespace-nowrap px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest border transition-all ${i === 0 ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}>
                                    {dept}
                                </button>
                            ))}
                        </div>
                    </div>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] sm:text-xs">{jobs.length} {t('rolesAvailable')}</p>
                </div>

                {/* Job Grid */}
                <div className="grid grid-cols-1 gap-6 sm:gap-10">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => <div key={i} className="h-48 sm:h-64 bg-gray-50 rounded-3xl sm:rounded-[3rem] animate-pulse" />)
                    ) : jobs.length === 0 ? (
                        <div className="py-20 text-center opacity-20">
                            <Briefcase size={80} className="mx-auto" />
                            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-widest mt-4">{t('noOpeningsAtTheMoment')}</h3>
                        </div>
                    ) : jobs.map((job) => (
                        <div key={job.id} className="group relative bg-white rounded-[2rem] sm:rounded-[3.5rem] border border-gray-100 p-6 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 transition-all hover:shadow-2xl hover:shadow-gray-100 hover:-translate-y-2">
                            <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-12 flex-grow">
                                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-indigo-50 rounded-2xl sm:rounded-[2rem] flex items-center justify-center text-indigo-600 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                    <Sparkles className="w-8 h-8 sm:w-10 sm:h-10" />
                                </div>
                                <div className="space-y-3 sm:space-y-4 text-center lg:text-left">
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-center lg:justify-start">
                                        <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-gray-100 text-gray-500 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                            {job.Position?.Department?.name}
                                        </span>
                                        <span className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-gray-400 font-bold">
                                            <MapPin size={14} /> {job.location || 'Main Campus'}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">{job.title}</h3>
                                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 justify-center lg:justify-start text-[10px] sm:text-sm font-bold text-gray-400">
                                        <span className="flex items-center gap-1.5 sm:gap-2"><Clock size={14} /> {job.employment_type.replace('_', ' ')}</span>
                                        <span className="flex items-center gap-1.5 sm:gap-2"><DollarSign size={14} /> {job.min_salary}k - {job.max_salary}k / year</span>
                                        <span className="flex items-center gap-1.5 sm:gap-2 text-green-500"><CheckCircle size={14} /> {t('highMatchPriority')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 sm:gap-4 w-full lg:w-auto">
                                <button className="p-4 sm:p-6 bg-gray-50 rounded-2xl sm:rounded-3xl text-gray-400 hover:text-rose-500 transition-all hover:bg-rose-50">
                                    <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                                <button className="flex-grow lg:flex-none px-6 sm:px-12 py-4 sm:py-6 bg-gray-900 text-white rounded-[1.5rem] sm:rounded-[2.5rem] font-black text-sm sm:text-lg flex items-center justify-center gap-2 sm:gap-4 hover:bg-black transition-all shadow-xl shadow-gray-200">
                                    {t('applyNow')}
                                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer / CTA */}
            <div className="bg-gray-50 py-20 sm:py-32 text-center px-6 sm:px-10">
                <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
                    <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tighter">{t('didntFindYourPerfectRole')}</h2>
                    <p className="text-base sm:text-xl text-gray-500 font-medium">{t('sendUsYourCVAndOurAIAgentWillContactYouWhenAMatchAppears')}</p>
                    <button className="px-8 sm:px-12 py-4 sm:py-6 bg-white border-2 border-gray-900 text-gray-900 rounded-2xl sm:rounded-[2.5rem] font-black text-sm sm:text-lg hover:bg-gray-900 hover:text-white transition-all">
                        {t('joinOurTalentPool')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JobBoard;
