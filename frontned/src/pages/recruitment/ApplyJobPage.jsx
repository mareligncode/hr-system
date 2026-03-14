import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import recruitmentService from '../../services/recruitmentService';
import {
    ArrowLeft,
    Upload,
    FileText,
    CheckCircle2,
    AlertCircle,
    Loader2
} from 'lucide-react';

const ApplyJobPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        cover_letter: '',
        resume: null
    });

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const data = await recruitmentService.getPublicJobPostingById(id);
                setJob(data);
            } catch (error) {
                console.error('Failed to fetch job:', error);
                navigate('/careers');
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, resume: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        if (!formData.resume) {
            setError('Please upload your resume');
            setSubmitting(false);
            return;
        }

        const data = new FormData();
        data.append('job_posting_id', id);
        data.append('first_name', formData.first_name);
        data.append('last_name', formData.last_name);
        data.append('email', formData.email);
        data.append('phone', formData.phone);
        data.append('cover_letter', formData.cover_letter);
        data.append('resume', formData.resume);

        try {
            await recruitmentService.submitApplication(data);
            setSuccess(true);
            window.scrollTo(0, 0);
        } catch (error) {
            console.error('Submission error:', error);
            setError(error.response?.data?.error || 'Failed to submit application. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-xl text-center border border-gray-100">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Sent!</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        Thank you for your interest in the <strong>{job.title}</strong> role.
                        We've received your application and will email you a confirmation shortly.
                    </p>
                    <Link
                        to="/careers"
                        className="block w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                    >
                        Back to Careers
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <Link to={`/careers/${id}`} className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors font-medium">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to job details
                    </Link>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 mt-12">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-indigo-600 px-8 py-10 text-white">
                        <h1 className="text-3xl font-bold mb-2">Apply for {job.title}</h1>
                        <p className="text-indigo-100">Send us your details and resume to get started.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
                        {error && (
                            <div className="flex items-center p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100">
                                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">First Name</label>
                                <input
                                    required
                                    type="text"
                                    name="first_name"
                                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 transition-all"
                                    placeholder="John"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Last Name</label>
                                <input
                                    required
                                    type="text"
                                    name="last_name"
                                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 transition-all"
                                    placeholder="Doe"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    name="email"
                                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 transition-all"
                                    placeholder="john.doe@example.com"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Phone Number</label>
                                <input
                                    required
                                    type="tel"
                                    name="phone"
                                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 transition-all"
                                    placeholder="+1 234 567 890"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Resume / CV (PDF or Word)</label>
                            <label className={`
                                border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all gap-2
                                ${formData.resume ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'}
                            `}>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFileChange}
                                />
                                {formData.resume ? (
                                    <>
                                        <FileText className="w-10 h-10 text-emerald-500" />
                                        <span className="font-bold text-emerald-700">{formData.resume.name}</span>
                                        <span className="text-xs text-emerald-600">Click to change file</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-10 h-10 text-gray-400 group-hover:text-indigo-400" />
                                        <span className="font-bold text-gray-600">Choose file or drag here</span>
                                        <span className="text-xs text-gray-500">Maximum size 5MB</span>
                                    </>
                                )}
                            </label>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Cover Letter (Optional)</label>
                            <textarea
                                name="cover_letter"
                                rows="5"
                                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 transition-all"
                                placeholder="Tell us why you're a great fit for this role..."
                                value={formData.cover_letter}
                                onChange={handleInputChange}
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-70 transition-all mt-4"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    Submitting Application...
                                </>
                            ) : (
                                'Submit Application'
                            )}
                        </button>
                    </form>
                </div>

                <p className="mt-8 text-center text-sm text-gray-500">
                    By submitting your application, you agree to our recruitment terms and privacy policy.
                    We protect your personal data according to global standards.
                </p>
            </div>
        </div>
    );
};

export default ApplyJobPage;
