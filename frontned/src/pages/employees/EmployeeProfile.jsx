import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Users, Mail, Phone, MapPin, Briefcase, Calendar, Building2,
    FileText, Award, ShieldCheck, Clock, Download,
    Plus, Trash2, CheckCircle, AlertCircle, ExternalLink, X,
    ChevronLeft, Edit, Upload, CheckCircle2, ArrowRightLeft, History
} from 'lucide-react';
import { fetchEmployeeById } from '../../store/employeeSlice';
import employeeService from '../../services/employeeService';
import shiftService from '../../services/shiftService';
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
    const [shifts, setShifts] = useState([]);
    const [swapRequests, setSwapRequests] = useState([]);
    const [docsLoading, setDocsLoading] = useState(false);
    const [imgError, setImgError] = useState(false);

    // Swap Modal State
    const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
    const [selectedShift, setSelectedShift] = useState(null);
    const [swapReason, setSwapReason] = useState('');

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
            const [docs, certs, shiftRes] = await Promise.all([
                employeeService.getDocuments(id),
                employeeService.getCertifications(id),
                shiftService.getShiftAssignments({ employee_id: id })
            ]);
            setDocuments(docs);
            setCertifications(certs);
            setShifts(shiftRes.data);

            if (isOwnProfile) {
                const swapRes = await shiftService.getShiftSwaps({ status: 'pending' });
                setSwapRequests(swapRes.data);
            }
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
            if (key === 'file') {
                if (certForm.file) formData.append('certification', certForm.file);
            } else if (certForm[key]) {
                formData.append(key, certForm[key]);
            }
        });

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

    const handleRequestSwap = async (e) => {
        e.preventDefault();
        try {
            await shiftService.createShiftSwap({
                shift_assignment_id: selectedShift.id,
                target_employee_id: null, // Peer-to-peer is open
                reason: swapReason
            });
            alert('Swap request submitted successfully');
            setIsSwapModalOpen(false);
            setSwapReason('');
            loadSubData();
        } catch (err) {
            alert('Failed to submit swap request');
        }
    };

    const tabs = [
        { id: 'overview', label: t('overview'), icon: User },
        { id: 'shifts', label: t('shifts') || 'Shifts', icon: Clock },
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                    onClick={() => navigate('/employees')}
                    className="flex items-center gap-2 text-[var(--text-soft)] hover:text-blue-500 transition-colors font-bold text-xs uppercase tracking-widest"
                >
                    <ChevronLeft className="w-4 h-4" />
                    {t('backToStaff')}
                </button>
                <div className="flex gap-2 w-full sm:w-auto">
                    {(hasPermission('manage_employees') || isOwnProfile) && (
                        <Button variant="secondary" className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-10 px-4 text-xs font-black uppercase tracking-tighter">
                            <Edit className="w-3.5 h-3.5" />
                            {t('editProfile')}
                        </Button>
                    )}
                    {hasPermission('manage_employees') && !isOwnProfile && (
                        emp.employment_status === 'inactive' ? (
                            <Button
                                variant="success"
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-10 px-4 text-xs font-black uppercase tracking-tighter"
                                onClick={handleActivate}
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {t('activate')}
                            </Button>
                        ) : (
                            <Button
                                variant="danger"
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-10 px-4 text-xs font-black uppercase tracking-tighter"
                                onClick={handleDeactivate}
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                {t('deactivate')}
                            </Button>
                        )
                    )}
                </div>
            </div>

            {/* Profile Header Card */}
            <div className="bg-[var(--bg-surface)] rounded-[2.5rem] border border-[var(--border-main)] overflow-hidden shadow-sm">
                <div className="h-24 sm:h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                </div>
                <div className="px-5 sm:px-8 pb-8">
                    <div className="relative -mt-12 sm:-mt-16 mb-6 flex flex-col items-center sm:items-end justify-center sm:justify-between gap-4 sm:gap-6">
                        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 text-center sm:text-left">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-[var(--bg-surface)] p-1 border-4 border-[var(--bg-surface)] shadow-2xl relative">
                                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 flex items-center justify-center overflow-hidden">
                                    {(emp.User?.profile_picture_url && !imgError) ? (
                                        <img
                                            src={emp.User.profile_picture_url}
                                            alt=""
                                            className="w-full h-full object-cover"
                                            onError={() => setImgError(true)}
                                        />
                                    ) : (
                                        <User className="w-8 h-8 text-blue-500" />
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 border-4 border-[var(--bg-surface)] rounded-full flex items-center justify-center shadow-lg">
                                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                                </div>
                            </div>
                            <div className="pb-1 sm:pb-2">
                                <h1 className="text-xl sm:text-3xl font-black text-[var(--text-main)] transition-colors">
                                    {emp.User?.first_name} {emp.User?.last_name}
                                </h1>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                                    <span className="flex items-center gap-1.5 bg-blue-500/10 text-blue-600 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-tighter border border-blue-500/20">
                                        <Briefcase className="w-3 h-3" />
                                        {emp.Position?.title}
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-slate-500/10 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-tighter border border-slate-500/20">
                                        <Building2 className="w-3 h-3" />
                                        {emp.Department?.name}
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-500 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-tighter border border-indigo-500/20">
                                        #{emp.employee_number}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-6 border-t border-[var(--border-main)]/50">
                        <StatBox label={t('employment')} value={t(emp.employment_status + 'Status')} icon={ShieldCheck} color="text-emerald-500" />
                        <StatBox label={t('joiningDate')} value={new Date(emp.hire_date).toLocaleDateString()} icon={Calendar} color="text-blue-500" />
                        <StatBox label={t('reportingTo')} value={emp.Manager?.first_name ? `${emp.Manager.first_name}` : 'N/A'} icon={Users} color="text-amber-500" />
                        <StatBox label={t('workPhone')} value={emp.work_phone || 'N/A'} icon={Phone} color="text-purple-500" />
                    </div>
                </div>
            </div>

            {/* Main Content Tabs */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-[2rem] overflow-hidden shadow-sm">
                <div className="flex border-b border-[var(--border-main)] bg-[var(--bg-surface-soft)]/30 overflow-x-auto no-scrollbar scroll-smooth">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 sm:flex-none px-6 sm:px-8 py-4 sm:py-5 text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all relative whitespace-nowrap ${isActive ? 'text-blue-600 bg-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-soft)]'
                                    }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {tab.label}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabProfile"
                                        className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="p-5 sm:p-8">
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-12"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
                                    {/* Personal Column */}
                                    <section>
                                        <h3 className="text-lg sm:text-xl font-black mb-6 flex items-center gap-3 uppercase tracking-tighter">
                                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                                                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </div>
                                            {t('personalInfo')}
                                        </h3>
                                        <div className="space-y-4">
                                            {[
                                                { label: t('name'), value: `${emp.User?.first_name} ${emp.User?.last_name}` },
                                                { label: t('email'), value: emp.User?.email },
                                                { label: t('gender'), value: emp.gender },
                                                { label: t('maritalStatus'), value: emp.marital_status },
                                                { label: t('address'), value: `${emp.address_line1}, ${emp.city}`, full: true }
                                            ].map((item, idx) => (
                                                <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-[var(--border-main)]/30 gap-1 sm:gap-4">
                                                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">{item.label}</span>
                                                    <span className={`text-sm font-bold text-[var(--text-main)] ${item.full ? 'sm:max-w-[250px] truncate' : ''}`}>{item.value || 'N/A'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Work Column */}
                                    <section>
                                        <h3 className="text-lg sm:text-xl font-black mb-6 flex items-center gap-3 uppercase tracking-tighter">
                                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                                                <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </div>
                                            {t('professionalProfile')}
                                        </h3>
                                        <div className="space-y-4">
                                            {[
                                                { label: t('department'), value: emp.Department?.name },
                                                { label: t('position'), value: emp.Position?.title },
                                                { label: t('contractType'), value: emp.contract_type },
                                                { label: t('workEmail'), value: emp.work_email },
                                                { label: t('manager'), value: emp.Manager?.first_name ? `${emp.Manager.first_name} ${emp.Manager.last_name}` : 'N/A' }
                                            ].map((item, idx) => (
                                                <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-[var(--border-main)]/30 gap-1 sm:gap-4">
                                                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">{item.label}</span>
                                                    <span className="text-sm font-bold text-[var(--text-main)] capitalize">{item.value || 'N/A'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>

                                {/* Emergency Section */}
                                <section className="bg-[var(--bg-surface-soft)]/50 p-6 sm:p-8 rounded-[2rem] border border-[var(--border-main)]/50">
                                    <h3 className="text-md sm:text-lg font-black mb-6 flex items-center gap-3 uppercase tracking-tighter">
                                        <AlertCircle className="w-5 h-5 text-rose-500" />
                                        {t('emergencyContact')}
                                    </h3>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{t('name')}</p>
                                            <p className="font-bold text-sm text-[var(--text-main)] transition-colors">{emp.emergency_contact_name || t('notProvided')}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{t('relation')}</p>
                                            <p className="font-bold text-sm text-[var(--text-main)] transition-colors">{emp.emergency_contact_relation || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1 col-span-2 lg:col-span-1">
                                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{t('phone')}</p>
                                            <p className="font-bold text-sm text-[var(--text-main)] transition-colors">{emp.emergency_contact_phone || 'N/A'}</p>
                                        </div>
                                    </div>
                                </section>
                            </motion.div>
                        )}

                        {activeTab === 'shifts' && (
                            <motion.div
                                key="shifts"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold">{t('shiftSchedule') || 'Shift Schedule'}</h3>
                                    {isOwnProfile && (
                                        <div className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                                            <History className="w-3 h-3" />
                                            {swapRequests.length} Pending Swaps
                                        </div>
                                    )}
                                </div>

                                {shifts.length === 0 ? (
                                    <div className="p-16 text-center border-2 border-dashed border-[var(--border-main)] rounded-3xl">
                                        <Clock className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                                        <p className="text-[var(--text-soft)]">No shifts assigned for this period.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {shifts.map((shift) => (
                                            <div key={shift.id} className="bg-[var(--bg-surface-soft)] p-5 rounded-2xl border border-[var(--border-main)] hover:border-blue-500/30 transition-all flex justify-between items-center">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex flex-col items-center justify-center text-blue-600">
                                                        <span className="text-[10px] font-black uppercase tracking-tighter">{new Date(shift.assignment_date).toLocaleDateString('en', { weekday: 'short' })}</span>
                                                        <span className="text-lg font-bold leading-none">{new Date(shift.assignment_date).getDate()}</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-[var(--text-main)]">{shift.ShiftType?.name || 'Shift'}</h4>
                                                        <div className="flex items-center gap-2 text-xs text-[var(--text-soft)] mt-0.5">
                                                            <Clock className="w-3 h-3" />
                                                            {shift.ShiftType?.start_time.substring(0, 5)} - {shift.ShiftType?.end_time.substring(0, 5)}
                                                        </div>
                                                    </div>
                                                </div>
                                                {isOwnProfile && new Date(shift.assignment_date) >= new Date() && (
                                                    <button
                                                        onClick={() => { setSelectedShift(shift); setIsSwapModalOpen(true); }}
                                                        className="p-3 bg-white border border-gray-100 rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                        title="Request Swap"
                                                    >
                                                        <ArrowRightLeft className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
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
                                                            href={doc.file_url}
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

                        {activeTab === 'certifications' && (
                            <motion.div
                                key="certifications"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold">{t('certifications')}</h3>
                                    {(hasPermission('manage_employees') || isOwnProfile) && (
                                        <Button
                                            onClick={() => setIsCertModalOpen(true)}
                                            className="flex items-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            {t('addCertification')}
                                        </Button>
                                    )}
                                </div>
                                {certifications.length === 0 ? (
                                    <div className="p-16 text-center border-2 border-dashed border-[var(--border-main)] rounded-3xl">
                                        <Award className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                                        <p className="text-[var(--text-soft)]">{t('noCertificationsFound')}</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {certifications.map((cert) => (
                                            <div key={cert.id} className="bg-[var(--bg-surface-soft)] p-6 rounded-2xl border border-[var(--border-main)] hover:border-indigo-500/50 transition-all group">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500">
                                                        <Award className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {cert.file_url && (
                                                            <a
                                                                href={cert.file_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2 hover:bg-white rounded-lg transition-colors text-indigo-500"
                                                                title="View Certificate"
                                                            >
                                                                <ExternalLink className="w-4 h-4" />
                                                            </a>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteCertification(cert.id)}
                                                            className="p-2 hover:bg-rose-500/10 rounded-lg transition-colors text-rose-500"
                                                            title="Delete Certification"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <h4 className="font-bold text-[var(--text-main)] truncate mb-1">{cert.certification_name}</h4>
                                                <p className="text-xs text-[var(--text-soft)] mb-2">{cert.issuing_body}</p>
                                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mt-4">
                                                    <span className={cert.is_verified ? 'text-emerald-500' : 'text-amber-500'}>
                                                        {cert.is_verified ? t('verified') : t('pending')}
                                                    </span>
                                                    <span className="text-[var(--text-muted)]">
                                                        {new Date(cert.issue_date).toLocaleDateString()}
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
            {/* Certification Upload Modal */}
            <AnimatePresence>
                {isCertModalOpen && (
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
                                    <Award className="w-5 h-5 text-indigo-500" />
                                    {t('addCertification')}
                                </h3>
                                <button
                                    onClick={() => setIsCertModalOpen(false)}
                                    className="p-2 hover:bg-[var(--bg-surface-soft)] rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                    <span className="sr-only">Close</span>
                                </button>
                            </div>

                            <form onSubmit={handleCertUploadSubmit} className="p-6 space-y-4">
                                {uploadError && <Alert type="error" message={uploadError} />}

                                <Input
                                    label={t('certificationName')}
                                    value={certForm.certification_name}
                                    onChange={(e) => setCertForm({ ...certForm, certification_name: e.target.value })}
                                    required
                                />

                                <Input
                                    label={t('issuingBody')}
                                    value={certForm.issuing_body}
                                    onChange={(e) => setCertForm({ ...certForm, issuing_body: e.target.value })}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label={t('issueDate')}
                                        type="date"
                                        value={certForm.issue_date}
                                        onChange={(e) => setCertForm({ ...certForm, issue_date: e.target.value })}
                                        required
                                    />
                                    <Input
                                        label={t('expiryDate')}
                                        type="date"
                                        value={certForm.expiry_date}
                                        onChange={(e) => setCertForm({ ...certForm, expiry_date: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-[var(--text-soft)]">{t('certificateFile')}</label>
                                    <input
                                        type="file"
                                        onChange={(e) => setCertForm({ ...certForm, file: e.target.files[0] })}
                                        className="w-full text-sm text-[var(--text-soft)] file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/10 file:text-indigo-500 hover:file:bg-indigo-500/20 border border-[var(--border-input)] rounded-xl p-1"
                                        required
                                    />
                                </div>

                                <div className="flex gap-3 pt-6 mt-6 border-t border-[var(--border-main)]">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setIsCertModalOpen(false)}
                                        className="flex-1"
                                    >
                                        {t('cancel')}
                                    </Button>
                                    <Button
                                        type="submit"
                                        loading={uploading}
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        {t('uploadCertification')}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Shift Swap Modal */}
            <AnimatePresence>
                {isSwapModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
                        >
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                                    <ArrowRightLeft className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900">Request Shift Swap</h3>
                                <p className="text-gray-500 mt-2">
                                    You are requesting to swap your <span className="font-bold text-blue-600">{selectedShift?.ShiftType?.name}</span> shift on <span className="font-bold">{new Date(selectedShift?.assignment_date).toLocaleDateString()}</span>.
                                </p>
                            </div>

                            <form onSubmit={handleRequestSwap} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Reason for request</label>
                                    <textarea
                                        required
                                        value={swapReason}
                                        onChange={(e) => setSwapReason(e.target.value)}
                                        className="w-full bg-gray-50 border-none rounded-3xl py-4 px-6 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-300 min-h-[120px]"
                                        placeholder="Briefly explain why you need to swap this shift..."
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsSwapModalOpen(false)}
                                        className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-100 rounded-3xl transition"
                                    >
                                        {t('cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-3xl shadow-xl shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-1 transition-all"
                                    >
                                        Submit Request
                                    </button>
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
