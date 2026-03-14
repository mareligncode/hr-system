import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import recruitmentService from '../../services/recruitmentService';
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!job) return null;

    const sections = [
        { title: 'Job Description', content: job.description, icon: <Briefcase className="w-5 h-5" /> },
        { title: 'Requirements', content: job.requirements, icon: <CheckCircle2 className="w-5 h-5" /> },
        { title: 'Responsibilities', content: job.responsibilities, icon: <Award className="w-5 h-5" /> },
        { title: 'Qualifications', content: job.qualifications, icon: <CheckCircle2 className="w-5 h-5" /> },
        { title: 'Benefits', content: job.benefits, icon: <DollarSign className="w-5 h-5" /> }
    ].filter(s => s.content);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Navigation Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to="/careers" className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors font-medium">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to jobs
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link
                            to={`/careers/apply/${job.id}`}
                            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm hover:bg-indigo-700 transition-colors"
                        >
                            Apply Now
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 mt-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Header Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                                    {job.Position?.Department?.name || 'Department'}
                                </span>
                                {job.is_remote && (
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center">
                                        <Globe className="w-3 h-3 mr-1" />
                                        Remote Available
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">{job.title}</h1>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <p className="text-xs text-gray-500 mb-1">Type</p>
                                    <p className="font-semibold text-gray-900 capitalize flex items-center">
                                        <Clock className="w-4 h-4 mr-2 text-indigo-600" />
                                        {job.employment_type?.replace('_', ' ')}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <p className="text-xs text-gray-500 mb-1">Location</p>
                                    <p className="font-semibold text-gray-900 flex items-center">
                                        <MapPin className="w-4 h-4 mr-2 text-indigo-600" />
                                        {job.location || 'On-site'}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <p className="text-xs text-gray-500 mb-1">Experience</p>
                                    <p className="font-semibold text-gray-900 capitalize flex items-center">
                                        <Briefcase className="w-4 h-4 mr-2 text-indigo-600" />
                                        {job.experience_level || 'N/A'}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <p className="text-xs text-gray-500 mb-1">Salary</p>
                                    <p className="font-semibold text-gray-900 flex items-center">
                                        <DollarSign className="w-4 h-4 mr-1 text-indigo-600" />
                                        {job.max_salary ? `${job.min_salary} - ${job.max_salary}` : 'Competitive'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Detail Sections */}
                        {sections.map((section, idx) => (
                            <section key={idx} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                    <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg mr-3">
                                        {section.icon}
                                    </span>
                                    {section.title}
                                </h3>
                                <div className="prose prose-indigo max-w-none text-gray-600 whitespace-pre-line leading-relaxed">
                                    {section.content}
                                </div>
                            </section>
                        ))}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-lg shadow-indigo-200 sticky top-28">
                            <h3 className="text-xl font-bold mb-4">Ready to Apply?</h3>
                            <p className="text-indigo-100 mb-8 leading-relaxed">
                                Our recruitment team reviews every application within 48 hours. Start your journey with us today!
                            </p>
                            <Link
                                to={`/careers/apply/${job.id}`}
                                className="block w-full bg-white text-indigo-600 py-4 px-6 rounded-2xl font-bold text-center hover:bg-gray-50 transition-colors"
                            >
                                Apply for this Position
                            </Link>

                            <hr className="my-8 border-indigo-500" />

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="w-5 h-5 text-indigo-300" />
                                    <span>Posted: {new Date(job.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Users className="w-5 h-5 text-indigo-300" />
                                    <span>Open Vacancies: {job.vacancies_count}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Briefcase className="w-5 h-5 text-indigo-300" />
                                    <span>Ref: {job.reference_code}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h4 className="font-bold text-gray-900 mb-4">Share this role</h4>
                            <div className="flex gap-4">
                                <button className="p-3 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all flex-1 border border-gray-100">
                                    LinkedIn
                                </button>
                                <button className="p-3 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all flex-1 border border-gray-100">
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
