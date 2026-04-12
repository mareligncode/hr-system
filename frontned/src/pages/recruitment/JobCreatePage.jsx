import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import recruitmentService from '../../services/recruitmentService';
import organizationService from '../../services/organizationService';
import { useSettings } from '../../context/SettingsContext.jsx';
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
    const { t } = useSettings();
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
            alert(t('failedToSaveJob'));
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
                    <Link to="/recruitment/jobs" className="p-2 hover:bg-[var(--bg-surface-soft)] rounded-xl transition-colors">
                        <ArrowLeft className="w-6 h-6 text-[var(--text-muted)]" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-main)]">
                            {isEdit ? t('editJobPosting') : t('createNewJob')}
                        </h1>
                        <p className="text-sm text-[var(--text-muted)]">{t('ref')}: {formData.reference_code}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 pb-20">
                {/* Basic Info */}
                <div className="bg-[var(--bg-surface)] rounded-3xl shadow-sm border border-[var(--border-main)] overflow-hidden">
                    <div className="px-8 py-5 bg-[var(--bg-surface-soft)] border-b border-[var(--border-main)] flex items-center justify-between">
                        <h2 className="font-bold text-[var(--text-main)] flex items-center gap-2">
                            <Info className="w-5 h-5 text-indigo-600" />
                            {t('generalInformation')}
                        </h2>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[var(--text-soft)] ml-1">{t('jobTitle')}</label>
                            <input
                                required
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full bg-[var(--bg-input)] border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 text-[var(--text-main)] placeholder-[var(--text-muted)]"
                                placeholder={t('jobTitlePlaceholder')}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[var(--text-soft)] ml-1">{t('associatedPosition')}</label>
                            <select
                                required
                                name="position_id"
                                value={formData.position_id}
                                onChange={handleInputChange}
                                className="w-full bg-[var(--bg-input)] border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 text-[var(--text-main)]"
                            >
                                <option value="">{t('selectPositionPlaceholder')}</option>
                                {positions.map(p => (
                                    <option key={p.id} value={p.id}>{p.title} ({p.Department?.name})</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[var(--text-soft)] ml-1">{t('employmentType')}</label>
                            <select
                                name="employment_type"
                                value={formData.employment_type}
                                onChange={handleInputChange}
                                className="w-full bg-[var(--bg-input)] border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 text-[var(--text-main)]"
                            >
                                <option value="full_time">{t('fullTime')}</option>
                                <option value="part_time">{t('partTime')}</option>
                                <option value="contract">{t('contract')}</option>
                                <option value="intern">{t('intern')}</option>
                                <option value="temporary">{t('temporary')}</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[var(--text-soft)] ml-1">{t('experienceLevel')}</label>
                            <select
                                name="experience_level"
                                value={formData.experience_level}
                                onChange={handleInputChange}
                                className="w-full bg-[var(--bg-input)] border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 text-[var(--text-main)]"
                            >
                                <option value="entry_level">{t('entryLevel')}</option>
                                <option value="mid_level">{t('midLevel')}</option>
                                <option value="senior_level">{t('seniorLevel')}</option>
                                <option value="executive">{t('executive')}</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[var(--text-soft)] ml-1">{t('workLocation')}</label>
                            <input
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                className="w-full bg-[var(--bg-input)] border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 text-[var(--text-main)] placeholder-[var(--text-muted)]"
                                placeholder={t('workLocationPlaceholder')}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[var(--text-soft)] ml-1">{t('numberOfVacancies')}</label>
                            <input
                                type="number"
                                name="vacancies_count"
                                value={formData.vacancies_count}
                                onChange={handleInputChange}
                                className="w-full bg-[var(--bg-input)] border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 text-[var(--text-main)]"
                                min="1"
                            />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-[var(--bg-surface)] rounded-3xl shadow-sm border border-[var(--border-main)] overflow-hidden">
                    <div className="px-8 py-5 bg-[var(--bg-surface-soft)] border-b border-[var(--border-main)]">
                        <h2 className="font-bold text-[var(--text-main)] flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-600" />
                            {t('jobContent')}
                        </h2>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[var(--text-soft)] ml-1">{t('jobDescription')}</label>
                            <textarea
                                required
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="4"
                                className="w-full bg-[var(--bg-input)] border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 text-[var(--text-main)] placeholder-[var(--text-muted)]"
                                placeholder={t('jobDescriptionPlaceholder')}
                            ></textarea>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[var(--text-soft)] ml-1">{t('requirements')}</label>
                                <textarea
                                    name="requirements"
                                    value={formData.requirements}
                                    onChange={handleInputChange}
                                    rows="4"
                                    className="w-full bg-[var(--bg-input)] border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 text-[var(--text-main)] placeholder-[var(--text-muted)]"
                                    placeholder={t('requirementsPlaceholder')}
                                ></textarea>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[var(--text-soft)] ml-1">{t('responsibilities')}</label>
                                <textarea
                                    name="responsibilities"
                                    value={formData.responsibilities}
                                    onChange={handleInputChange}
                                    rows="4"
                                    className="w-full bg-[var(--bg-input)] border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 text-[var(--text-main)] placeholder-[var(--text-muted)]"
                                    placeholder={t('responsibilitiesPlaceholder')}
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Salary & Secondary Details */}
                <div className="bg-[var(--bg-surface)] rounded-3xl shadow-sm border border-[var(--border-main)] overflow-hidden">
                    <div className="px-8 py-5 bg-[var(--bg-surface-soft)] border-b border-[var(--border-main)]">
                        <h2 className="font-bold text-[var(--text-main)] flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-indigo-600" />
                            {t('compensationBenefits')}
                        </h2>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[var(--text-soft)] ml-1">{t('minSalary')}</label>
                                <input
                                    type="number"
                                    name="min_salary"
                                    value={formData.min_salary}
                                    onChange={handleInputChange}
                                    className="w-full bg-[var(--bg-input)] border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 text-[var(--text-main)]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[var(--text-soft)] ml-1">{t('maxSalary')}</label>
                                <input
                                    type="number"
                                    name="max_salary"
                                    value={formData.max_salary}
                                    onChange={handleInputChange}
                                    className="w-full bg-[var(--bg-input)] border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 text-[var(--text-main)]"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[var(--text-soft)] ml-1">{t('benefits')}</label>
                            <textarea
                                name="benefits"
                                value={formData.benefits}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full bg-[var(--bg-input)] border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-indigo-500 text-[var(--text-main)] placeholder-[var(--text-muted)]"
                                placeholder={t('benefitsPlaceholder')}
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Form Footer */}
                <div className="flex items-center justify-end gap-4 p-6 bg-[var(--bg-surface)] rounded-3xl shadow-sm border border-[var(--border-main)]">
                    <button
                        type="button"
                        onClick={() => navigate('/recruitment/jobs')}
                        className="px-6 py-3 text-[var(--text-soft)] font-bold rounded-2xl hover:bg-[var(--bg-surface-soft)] transition-colors"
                    >
                        {t('discard')}
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-10 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-900/20 hover:bg-indigo-700 disabled:opacity-70 transition-all flex items-center gap-2"
                    >
                        {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                        {isEdit ? t('updatePosting') : t('createPosting')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default JobCreatePage;
