import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import recruitmentService from '../../services/recruitmentService';
import organizationService from '../../services/organizationService';
import {
    ArrowLeft,
    Save,
    X,
    ChevronRight,
    Loader2,
    Info,
    CheckCircle,
    FileText,
    DollarSign
} from 'lucide-react';

const JobCreatePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);
    const [positions, setPositions] = useState([]);
    const [formData, setFormData] = useState({
        position_id: '',
        title: '',
        reference_code: `JOB-${Math.floor(Math.random() * 9000) + 1000}`,
        description: '',
        requirements: '',
        responsibilities: '',
        qualifications: '',
        benefits: '',
        employment_type: 'full_time',
        experience_level: 'mid_level',
        min_salary: '',
        max_salary: '',
        location: 'On-site',
        vacancies_count: 1,
        status: 'draft'
    });

    useEffect(() => {
        fetchPositions();
        if (isEdit) fetchJobData();
    }, [id]);

    const fetchPositions = async () => {
        try {
            const data = await organizationService.getPositions();
            setPositions(data);
        } catch (error) {
            console.error('Failed to fetch positions:', error);
        }
    };

    const fetchJobData = async () => {
        try {
            const data = await recruitmentService.getJobPostingById(id);
            setFormData({
                ...data,
                min_salary: data.min_salary || '',
                max_salary: data.max_salary || ''
            });
        } catch (error) {
            console.error('Failed to fetch job:', error);
            navigate('/recruitment/jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (isEdit) {
                await recruitmentService.updateJobPosting(id, formData);
            } else {
                await recruitmentService.createJobPosting(formData);
            }
            navigate('/recruitment/jobs');
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save job posting');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link to="/recruitment/jobs" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-500" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Job Posting' : 'Create New Job'}</h1>
                        <p className="text-sm text-gray-500">Ref: {formData.reference_code}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 pb-20">
                {/* Basic Info */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-8 py-5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="font-bold text-gray-900 flex items-center gap-2">
                            <Info className="w-5 h-5 text-indigo-600" />
                            General Information
                        </h2>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Job Title</label>
                            <input
                                required
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g. Senior Receptionist"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Associated Position</label>
                            <select
                                required
                                name="position_id"
                                value={formData.position_id}
                                onChange={handleInputChange}
                                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Select a position...</option>
                                {positions.map(p => (
                                    <option key={p.id} value={p.id}>{p.title} ({p.Department?.name})</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Employment Type</label>
                            <select
                                name="employment_type"
                                value={formData.employment_type}
                                onChange={handleInputChange}
                                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="full_time">Full Time</option>
                                <option value="part_time">Part Time</option>
                                <option value="contract">Contract</option>
                                <option value="intern">Intern</option>
                                <option value="temporary">Temporary</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Experience Level</label>
                            <select
                                name="experience_level"
                                value={formData.experience_level}
                                onChange={handleInputChange}
                                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="entry_level">Entry Level</option>
                                <option value="mid_level">Mid Level</option>
                                <option value="senior_level">Senior Level</option>
                                <option value="executive">Executive</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Work Location</label>
                            <input
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g. Main Lobby, Downtown Hotel"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Number of Vacancies</label>
                            <input
                                type="number"
                                name="vacancies_count"
                                value={formData.vacancies_count}
                                onChange={handleInputChange}
                                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500"
                                min="1"
                            />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-8 py-5 bg-gray-50 border-b border-gray-100">
                        <h2 className="font-bold text-gray-900 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-600" />
                            Job Content
                        </h2>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Description</label>
                            <textarea
                                required
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="4"
                                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500"
                                placeholder="Describe the role and the ideal candidate..."
                            ></textarea>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Requirements</label>
                                <textarea
                                    name="requirements"
                                    value={formData.requirements}
                                    onChange={handleInputChange}
                                    rows="4"
                                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500"
                                    placeholder="List key skills and criteria..."
                                ></textarea>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Responsibilities</label>
                                <textarea
                                    name="responsibilities"
                                    value={formData.responsibilities}
                                    onChange={handleInputChange}
                                    rows="4"
                                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Daily tasks and goals..."
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Salary & Secondary Details */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-8 py-5 bg-gray-50 border-b border-gray-100">
                        <h2 className="font-bold text-gray-900 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-indigo-600" />
                            Compensation & Benefits
                        </h2>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Min Salary</label>
                                <input
                                    type="number"
                                    name="min_salary"
                                    value={formData.min_salary}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Max Salary</label>
                                <input
                                    type="number"
                                    name="max_salary"
                                    value={formData.max_salary}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Benefits</label>
                            <textarea
                                name="benefits"
                                value={formData.benefits}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500"
                                placeholder="Perks, insurance, meals, etc."
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Form Footer */}
                <div className="flex items-center justify-end gap-4 p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
                    <button
                        type="button"
                        onClick={() => navigate('/recruitment/jobs')}
                        className="px-6 py-3 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-colors"
                    >
                        Discard
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-10 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-70 transition-all flex items-center gap-2"
                    >
                        {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                        {isEdit ? 'Update Posting' : 'Create Posting'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default JobCreatePage;
