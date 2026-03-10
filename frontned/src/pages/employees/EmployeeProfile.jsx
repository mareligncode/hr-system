import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Users, Mail, Phone, MapPin, Briefcase, Calendar, Building2,
    FileText, Award, ShieldCheck, Clock, Download,
    Plus, Trash2, CheckCircle, AlertCircle, ExternalLink,
    ChevronLeft, Edit, Upload, CheckCircle2
} from 'lucide-react';
import { fetchEmployeeById } from '../../store/employeeSlice';
import employeeService from '../../services/employeeService';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import usePermission from '../../hooks/usePermission';
import { useSettings } from '../../context/SettingsContext';

const EmployeeProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { t } = useSettings();
    const { hasPermission, user: currentUser } = usePermission();
    const { currentEmployee: emp, loading, error } = useSelector((state) => state.employees);

    // Check if the user is viewing their own profile
    const isOwnProfile = currentUser?.id === parseInt(id);

    const [activeTab, setActiveTab] = useState('overview');
    const [documents, setDocuments] = useState([]);
    const [certifications, setCertifications] = useState([]);
    const [docsLoading, setDocsLoading] = useState(false);
    const [imgError, setImgError] = useState(false);

    // Document Upload Modal State
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isCertModalOpen, setIsCertModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [uploadForm, setUploadForm] = useState({
        document_type: 'contract',
        document_number: '',
        issue_date: '',
        expiry_date: '',
        issuing_authority: '',
        notes: '',
        file: null
    });

    const [certForm, setCertForm] = useState({
        certification_name: '',
        certification_code: '',
        issuing_body: '',
        issue_date: '',
        expiry_date: '',
        notes: '',
        file: null
    });

    useEffect(() => {
        dispatch(fetchEmployeeById(id));
        loadSubData();
    }, [dispatch, id]);

    const loadSubData = async () => {
        try {
            setDocsLoading(true);
            const [docs, certs] = await Promise.all([
                employeeService.getDocuments(id),
                employeeService.getCertifications(id)
            ]);
            setDocuments(docs);
            setCertifications(certs);
        } catch (err) {
            console.error('Failed to load sub data', err);
        } finally {
            setDocsLoading(false);
        }
    };

    if (loading) return <div className="p-20 text-center text-[var(--text-soft)] animate-pulse">{t('loadingProfile')}</div>;
    if (error) return <Alert type="error" message={error} className="m-8" />;
    if (!emp) return <div className="p-20 text-center">{t('employeeNotFound')}</div>;

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        setUploadError(null);
        if (!uploadForm.file) {
            setUploadError(t('selectFileToUpload'));
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('employee_id', id);
            Object.keys(uploadForm).forEach(key => {
                if (uploadForm[key]) {
                    if (key === 'file') {
                        formData.append('document', uploadForm[key]);
                    } else {
                        formData.append(key, uploadForm[key]);
                    }
                }
            });

            await employeeService.uploadDocument(formData);
            await loadSubData(); // Refresh documents
            setIsUploadModalOpen(false);
            setUploadForm({ ...uploadForm, file: null }); // Reset form
        } catch (err) {
            console.error('Upload failed', err);
            setUploadError(err.response?.data?.error || t('uploadFailed'));
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (docId, fileName) => {
        try {
            const { download_url } = await employeeService.getDocumentDownloadUrl(docId);

            // Cloudinary signed URLs are time-sensitive. 
            // We use 'no-cache' to ensure we don't fetch an expired one from browser cache
            const response = await fetch(download_url, { cache: 'no-cache' });
            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName; // Force specific filename
            document.body.appendChild(link);
            link.click();

            // Clean up
            link.remove();
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
        } catch (err) {
            console.error('Download failed', err);
            // Absolute fallback: try opening directly if fetch (CORS/Permissions) fails
            try {
                const { download_url } = await employeeService.getDocumentDownloadUrl(docId);
                window.open(download_url, '_blank');
            } catch (innerErr) {
                alert('Could not download document. Please try again or contact support.');
            }
        }
    };

    const handleDeactivate = async () => {
        if (!window.confirm(t('confirmDeactivate'))) return;

        try {
            await employeeService.updateEmployee(id, { employment_status: 'inactive' });
            dispatch(fetchEmployeeById(id));
        } catch (err) {
            console.error('Deactivation failed', err);
            alert(err.response?.data?.error || t('deactivateFailed'));
        }
    };

    const handleActivate = async () => {
        if (!window.confirm(t('confirmActivate'))) return;

        try {
            await employeeService.updateEmployee(id, { employment_status: 'active' });
            dispatch(fetchEmployeeById(id));
        } catch (err) {
            console.error('Activation failed', err);
            alert(err.response?.data?.error || t('activateFailed'));
        }
    };

    const handleDeleteDocument = async (docId) => {
        if (!window.confirm(t('confirmDeleteDoc'))) return;

        try {
            await employeeService.deleteDocument(docId);
            await loadSubData();
        } catch (err) {
            console.error('Deletion failed', err);
            alert(err.response?.data?.error || 'Failed to delete document');
        }
    };

    const handleDeleteCertification = async (certId) => {
        if (!window.confirm(t('confirmDeleteCert'))) return;

        try {
            await employeeService.deleteCertification(certId);
            await loadSubData();
        } catch (err) {
            console.error('Deletion failed', err);
            alert(err.response?.data?.error || 'Failed to delete certification');
        }
    };

    const handleCertUploadSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        setUploadError(null);

        const formData = new FormData();
        formData.append('employee_id', id);
        Object.keys(certForm).forEach(key => {
            if (certForm[key]) formData.append(key, certForm[key]);
        });
        if (certForm.file) {
            formData.append('certification', certForm.file);
        }

        try {
            await employeeService.createCertification(formData);
            setIsCertModalOpen(false);
            setCertForm({
                certification_name: '',
                certification_code: '',
                issuing_body: '',
                issue_date: '',
                expiry_date: '',
                notes: '',
                file: null
            });
            await loadSubData();
        } catch (err) {
            setUploadError(err.response?.data?.details?.join(', ') || err.response?.data?.error || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const tabs = [
        { id: 'overview', label: t('overview'), icon: User },
        { id: 'documents', label: t('documents'), icon: FileText },
        { id: 'certifications', label: t('certifications'), icon: Award },
    ];

    const StatBox = ({ label, value, icon: Icon, color }) => (
        <div className="bg-[var(--bg-surface-soft)] p-4 rounded-2xl border border-[var(--border-main)]/50">
            <div className="flex items-center gap-3 mb-1">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-xs font-semibold text-[var(--text-soft)] uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-lg font-bold text-[var(--text-main)] transition-colors">{value}</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-20">
            {/* Action Bar */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/employees')}
                    className="flex items-center gap-2 text-[var(--text-soft)] hover:text-blue-500 transition-colors font-medium"
                >
                    <ChevronLeft className="w-5 h-5" />
                    {t('backToStaff')}
                </button>
                <div className="flex gap-3">
                    {(hasPermission('manage_employees') || isOwnProfile) && (
                        <Button variant="secondary" className="flex items-center gap-2">
                            <Edit className="w-4 h-4" />
                            {t('editProfile')}
                        </Button>
                    )}
                    {hasPermission('manage_employees') && !isOwnProfile && (
                        emp.employment_status === 'inactive' ? (
                            <Button
                                variant="success"
                                className="flex items-center gap-2"
                                onClick={handleActivate}
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                {t('activate')}
                            </Button>
                        ) : (
                            <Button
                                variant="danger"
                                className="flex items-center gap-2"
                                onClick={handleDeactivate}
                            >
                                <Trash2 className="w-4 h-4" />
                                {t('deactivate')}
                            </Button>
                        )
                    )}
                </div>
            </div>

            {/* Profile Header Card */}
            <div className="bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-main)] overflow-hidden shadow-sm">
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                </div>
                <div className="px-8 pb-8">
                    <div className="relative -mt-16 mb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                            <div className="w-32 h-32 rounded-3xl bg-[var(--bg-surface)] p-1 border-4 border-[var(--bg-surface)] shadow-2xl relative">
                                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 flex items-center justify-center overflow-hidden">
                                    {(emp.User?.profile_picture && !imgError) ? (
                                        <img
                                            src={emp.User.profile_picture.startsWith('http') ? emp.User.profile_picture.replace('http://', 'https://') : emp.User.profile_picture}
                                            alt=""
                                            className="w-full h-full object-cover"
                                            onError={() => setImgError(true)}
                                        />
                                    ) : (
                                        <User className="w-8 h-8 text-blue-500" />
                                    )}
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 border-4 border-[var(--bg-surface)] rounded-full flex items-center justify-center shadow-lg">
                                    <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                            </div>
                            <div className="pb-2">
                                <h1 className="text-3xl font-bold text-[var(--text-main)] transition-colors">
                                    {emp.User?.first_name} {emp.User?.last_name}
                                </h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2 text-[var(--text-soft)]">
                                    <span className="flex items-center gap-1.5 bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/20">
                                        <Briefcase className="w-3.5 h-3.5" />
                                        {emp.Position?.title}
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-slate-500/10 px-3 py-1 rounded-full text-xs font-bold border border-slate-500/20">
                                        <Building2 className="w-3.5 h-3.5" />
                                        {emp.Department?.name}
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-500 px-3 py-1 rounded-full text-xs font-bold border border-indigo-500/20">
                                        ID: {emp.employee_number}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-[var(--border-main)]/50">
                        <StatBox label={t('employment')} value={t(emp.employment_status + 'Status')} icon={ShieldCheck} color="text-emerald-500" />
                        <StatBox label={t('joiningDate')} value={new Date(emp.hire_date).toLocaleDateString()} icon={Calendar} color="text-blue-500" />
                        <StatBox label={t('reportingTo')} value={emp.Manager?.first_name ? `${emp.Manager.first_name} ${emp.Manager.last_name}` : 'N/A'} icon={Users} color="text-amber-500" />
                        <StatBox label={t('workPhone')} value={emp.work_phone || 'N/A'} icon={Phone} color="text-purple-500" />
                    </div>
                </div>
            </div>

            {/* Main Content Tabs */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-3xl overflow-hidden shadow-sm">
                <div className="flex border-b border-[var(--border-main)] bg-[var(--bg-surface-soft)]/30">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 md:flex-none px-8 py-5 text-sm font-bold flex items-center justify-center gap-2 transition-all relative ${isActive ? 'text-blue-500' : 'text-[var(--text-muted)] hover:text-[var(--text-soft)]'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabProfile"
                                        className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-12"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    {/* Personal Column */}
                                    <section>
                                        <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                <User className="w-5 h-5" />
                                            </div>
                                            {t('personalInformation')}
                                        </h3>
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center py-4 border-b border-[var(--border-main)]/30">
                                                <span className="text-[var(--text-soft)] font-medium">{t('firstName')} & {t('lastName')}</span>
                                                <span className="font-semibold">{emp.User?.first_name} {emp.User?.last_name}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-4 border-b border-[var(--border-main)]/30">
                                                <span className="text-[var(--text-soft)] font-medium">Email Address</span>
                                                <span className="font-semibold">{emp.User?.email}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-4 border-b border-[var(--border-main)]/30">
                                                <span className="text-[var(--text-soft)] font-medium">Gender</span>
                                                <span className="font-semibold capitalize">{emp.gender || 'Not specified'}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-4 border-b border-[var(--border-main)]/30">
                                                <span className="text-[var(--text-soft)] font-medium">Marital Status</span>
                                                <span className="font-semibold capitalize">{emp.marital_status || 'Not specified'}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-4 border-b border-[var(--border-main)]/30">
                                                <span className="text-[var(--text-soft)] font-medium">Home Address</span>
                                                <span className="font-semibold text-right max-w-[200px] truncate">{emp.address_line1}, {emp.city}</span>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Work Column */}
                                    <section>
                                        <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                                <Briefcase className="w-5 h-5" />
                                            </div>
                                            {t('professionalProfile')}
                                        </h3>
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center py-4 border-b border-[var(--border-main)]/30">
                                                <span className="text-[var(--text-soft)] font-medium">Department</span>
                                                <span className="font-semibold">{emp.Department?.name}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-4 border-b border-[var(--border-main)]/30">
                                                <span className="text-[var(--text-soft)] font-medium">Position</span>
                                                <span className="font-semibold">{emp.Position?.title}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-4 border-b border-[var(--border-main)]/30">
                                                <span className="text-[var(--text-soft)] font-medium">Contract Type</span>
                                                <span className="font-semibold capitalize">{emp.contract_type}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-4 border-b border-[var(--border-main)]/30">
                                                <span className="text-[var(--text-soft)] font-medium">Work Email</span>
                                                <span className="font-semibold">{emp.work_email || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-4 border-b border-[var(--border-main)]/30">
                                                <span className="text-[var(--text-soft)] font-medium">Managed By</span>
                                                <span className="font-semibold">{emp.Manager?.first_name ? `${emp.Manager.first_name} ${emp.Manager.last_name}` : 'N/A'}</span>
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                {/* Emergency Section */}
                                <section className="bg-[var(--bg-surface-soft)]/50 p-8 rounded-3xl border border-[var(--border-main)]/50">
                                    <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 text-rose-500" />
                                        {t('emergencyContactDetails')}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">{t('firstName')}</p>
                                            <p className="font-bold text-[var(--text-main)] transition-colors">{emp.emergency_contact_name || t('notProvided')}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">{t('relationship')}</p>
                                            <p className="font-bold text-[var(--text-main)] transition-colors">{emp.emergency_contact_relation || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">{t('phone')}</p>
                                            <p className="font-bold text-[var(--text-main)] transition-colors">{emp.emergency_contact_phone || 'N/A'}</p>
                                        </div>
                                    </div>
                                </section>
                            </motion.div>
                        )}

                        {activeTab === 'documents' && (
                            <motion.div
                                key="documents"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold">{t('filesAndRecords')}</h3>
                                    {(hasPermission('manage_employees') || isOwnProfile) && (
                                        <Button
                                            onClick={() => setIsUploadModalOpen(true)}
                                            className="flex items-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            {t('uploadDocument')}
                                        </Button>
                                    )}
                                </div>
                                {documents.length === 0 ? (
                                    <div className="p-16 text-center border-2 border-dashed border-[var(--border-main)] rounded-3xl">
                                        <FileText className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                                        <p className="text-[var(--text-soft)]">{t('noDocumentsUploaded')}</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {documents.map((doc) => (
                                            <div key={doc.id} className="bg-[var(--bg-surface-soft)] p-6 rounded-2xl border border-[var(--border-main)] hover:border-blue-500/50 transition-all group">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                                                        <FileText className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <a
                                                            href={doc.file_path}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 hover:bg-white rounded-lg transition-colors text-blue-500"
                                                            title="View Document"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                        <button
                                                            onClick={() => handleDownload(doc.id, doc.document_name)}
                                                            className="p-2 hover:bg-white rounded-lg transition-colors text-emerald-500"
                                                            title="Download File"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteDocument(doc.id)}
                                                            className="p-2 hover:bg-rose-500/10 rounded-lg transition-colors text-rose-500"
                                                            title="Delete Document"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <h4 className="font-bold text-[var(--text-main)] truncate mb-1">{doc.document_name}</h4>
                                                <p className="text-xs text-[var(--text-soft)] mb-4">{doc.document_type}</p>
                                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest overflow-hidden">
                                                    <span className={doc.is_verified ? 'text-emerald-500' : 'text-amber-500'}>
                                                        {doc.is_verified ? t('verified') : t('pending')}
                                                    </span>
                                                    <span className="text-[var(--text-muted)]">
                                                        {new Date(doc.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Document Upload Modal */}
            <AnimatePresence>
                {isUploadModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[var(--bg-surface)] w-full max-w-lg rounded-3xl border border-[var(--border-main)] shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center p-6 border-b border-[var(--border-main)]">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Upload className="w-5 h-5 text-blue-500" />
                                    {t('uploadDocument')}
                                </h3>
                                <button
                                    onClick={() => setIsUploadModalOpen(false)}
                                    className="p-2 hover:bg-[var(--bg-surface-soft)] rounded-full transition-colors"
                                >
                                    <FileText className="w-4 h-4" /> {/* Fallback exit button */}
                                    <span className="sr-only">Close</span>
                                </button>
                            </div>

                            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
                                {uploadError && <Alert type="error" message={uploadError} />}

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-[var(--text-soft)]">{t('documentType')}</label>
                                    <select
                                        value={uploadForm.document_type}
                                        onChange={(e) => setUploadForm({ ...uploadForm, document_type: e.target.value })}
                                        className="w-full bg-[var(--bg-input)] border border-[var(--border-input)] rounded-xl py-3 px-4 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        required
                                    >
                                        <option value="national_id">{t('nationalId')}</option>
                                        <option value="passport">{t('passport')}</option>
                                        <option value="contract">{t('employmentContract')}</option>
                                        <option value="resume">{t('resumeCv')}</option>
                                        <option value="certificate">{t('certificateDegree')}</option>
                                        <option value="other">{t('other')}</option>
                                    </select>
                                </div>

                                <Input
                                    label={t('documentNumberOptional')}
                                    value={uploadForm.document_number}
                                    onChange={(e) => setUploadForm({ ...uploadForm, document_number: e.target.value })}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label={t('issueDate')}
                                        type="date"
                                        value={uploadForm.issue_date}
                                        onChange={(e) => setUploadForm({ ...uploadForm, issue_date: e.target.value })}
                                    />
                                    <Input
                                        label={t('expiryDate')}
                                        type="date"
                                        value={uploadForm.expiry_date}
                                        onChange={(e) => setUploadForm({ ...uploadForm, expiry_date: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-[var(--text-soft)]">{t('fileAttachment')}</label>
                                    <input
                                        type="file"
                                        onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                                        className="w-full text-sm text-[var(--text-soft)] file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-blue-500 hover:file:bg-blue-500/20 border border-[var(--border-input)] rounded-xl p-1"
                                        required
                                    />
                                </div>

                                <div className="flex gap-3 pt-6 mt-6 border-t border-[var(--border-main)]">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setIsUploadModalOpen(false)}
                                        className="flex-1"
                                    >
                                        {t('cancel')}
                                    </Button>
                                    <Button
                                        type="submit"
                                        loading={uploading}
                                        className="flex-1"
                                    >
                                        {t('uploadFile')}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EmployeeProfile;
