import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import recruitmentService from '../../services/recruitmentService';
import { Briefcase, MapPin, Clock, Search, ChevronRight } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext.jsx';

const PublicCareersPage = () => {
    const { t } = useSettings();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const data = await recruitmentService.getPublicJobPostings();
            setJobs(data);
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.Position?.Department?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-indigo-700 text-white py-20 px-4">
                <div className="max-w-5xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('joinOurHospitalityTeam')}</h1>
                    <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-10">
                        {t('discoverExcitingCareer')}
                    </p>

                    <div className="max-w-xl mx-auto relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder={t('searchByRoleOrDept')}
                            className="block w-full pl-10 pr-3 py-4 border border-transparent rounded-xl leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white sm:text-lg shadow-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Job List section */}
            <div className="max-w-5xl mx-auto py-16 px-4">
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {t('currentOpenings', { count: filteredJobs.length })}
                    </h2>
                </div>

                {filteredJobs.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">{t('noPositionsFound')}</h3>
                        <p className="text-gray-500">{t('tryAdjustingSearch')}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredJobs.map((job) => (
                            <Link
                                key={job.id}
                                to={`/careers/${job.id}`}
                                className="block bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-indigo-300 hover:shadow-md transition-all group"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                                                {job.Position?.Department?.name || 'Hotel'}
                                            </span>
                                            <span className="inline-flex items-center text-xs text-gray-500">
                                                <Clock className="w-3.5 h-3.5 mr-1" />
                                                {job.employment_type?.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                            {job.title}
                                        </h3>
                                        <div className="mt-2 flex items-center text-sm text-gray-500 gap-4">
                                            <div className="flex items-center">
                                                <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                                                {job.location || t('onSite')}
                                            </div>
                                            {job.experience_level && (
                                                <div className="flex items-center capitalize">
                                                    <Briefcase className="w-4 h-4 mr-1 text-gray-400" />
                                                    {job.experience_level}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="hidden md:flex items-center text-indigo-600 font-semibold group-hover:translate-x-1 transition-transform">
                                            {t('viewDetails')}
                                            <ChevronRight className="w-5 h-5 ml-1" />
                                        </div>
                                        <button className="md:hidden w-full bg-indigo-600 text-white rounded-xl py-3 px-6 font-semibold">
                                            {t('applyNow')}
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-gray-200 py-12 mt-10">
                <div className="max-w-5xl mx-auto px-4 text-center">
                    <p className="text-gray-500 text-sm">
                        {t('allRightsReservedRecruitment')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PublicCareersPage;
