import { useState, useEffect } from 'react';
import { Award,Calendar } from 'lucide-react';
import {
    ChevronLeft, Edit, Upload, Camera, User, Briefcase,
    MapPin, Wallet, Shield, Heart, FileText, Info,
    AtSign, Phone, Globe, CreditCard
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, updateProfile, changePassword, clearErrors, clearSuccess } from '../store/authSlice.js';
import Navbar from '../components/layout/Navbar.jsx';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import Alert from '../components/ui/Alert.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import usePermission from '../hooks/usePermission';
import { motion, AnimatePresence } from 'framer-motion';

const ProfilePage = () => {
    const dispatch = useDispatch();
    const { loading, error, successMessage } = useSelector((state) => state.auth);
    const { user, role, hasPermission, isAdmin } = usePermission();
    const { t } = useSettings();

    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);

    const [profileForm, setProfileForm] = useState({
        // User fields
        first_name: '',
        last_name: '',
        phone: '',
        language_preference: 'en',

        // Employee fields
        date_of_birth: '',
        gender: '',
        marital_status: '',
        nationality: '',
        id_number: '',
        id_type: 'national_id',
        id_expiry_date: '',

        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',

        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relation: '',

        bank_name: '',
        bank_account_number: '',
        bank_account_name: '',
        bank_iban: '',
        bank_swift: '',
        tax_id: '',
        social_security_number: '',

        work_email: '',
        work_phone: '',
        office_location: '',
    });

    const [passwordForm, setPasswordForm] = useState({
        old_password: '',
        new_password: '',
        confirm_password: '',
    });
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        dispatch(fetchProfile());
    }, [dispatch]);

    useEffect(() => {
        if (user) {
            const emp = user.Employee || {};
            setProfileForm({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone: user.phone || '',
                language_preference: user.language_preference || 'en',

                date_of_birth: emp.date_of_birth || '',
                gender: emp.gender || '',
                marital_status: emp.marital_status || '',
                nationality: emp.nationality || '',
                id_number: emp.id_number || '',
                id_type: emp.id_type || 'national_id',
                id_expiry_date: emp.id_expiry_date || '',

                address_line1: emp.address_line1 || '',
                address_line2: emp.address_line2 || '',
                city: emp.city || '',
                state: emp.state || '',
                postal_code: emp.postal_code || '',
                country: emp.country || '',

                emergency_contact_name: emp.emergency_contact_name || '',
                emergency_contact_phone: emp.emergency_contact_phone || '',
                emergency_contact_relation: emp.emergency_contact_relation || '',

                bank_name: emp.bank_name || '',
                bank_account_number: emp.bank_account_number || '',
                bank_account_name: emp.bank_account_name || '',
                bank_iban: emp.bank_iban || '',
                bank_swift: emp.bank_swift || '',
                tax_id: emp.tax_id || '',
                social_security_number: emp.social_security_number || '',

                work_email: emp.work_email || '',
                work_phone: emp.work_phone || '',
                office_location: emp.office_location || '',
            });
        }
    }, [user]);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => dispatch(clearSuccess()), 4000);
            setIsEditing(false);
            return () => clearTimeout(timer);
        }
    }, [successMessage, dispatch]);

    const handleProfileSave = (e) => {
        e.preventDefault();
        dispatch(clearErrors());

        const payload = { ...profileForm };
        // If there's a file, it should be handled via FormData (but here we only handle text fields for profile update)
        // Profile picture is handled separately via handleFileChange

        dispatch(updateProfile(payload));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('profile_picture', file);
            dispatch(updateProfile(formData));
        }
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        setPasswordError('');
        dispatch(clearErrors());
        if (passwordForm.new_password !== passwordForm.confirm_password) {
            setPasswordError(t('passwordsDoNotMatch'));
            return;
        }
        if (passwordForm.new_password.length < 8) {
            setPasswordError(t('passwordTooShort'));
            return;
        }
        dispatch(changePassword({
            old_password: passwordForm.old_password,
            new_password: passwordForm.new_password,
        })).then((res) => {
            if (!res.error) {
                setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
            }
        });
    };

    const tabs = [
        { id: 'overview', label: t('overviewNav'), icon: Info },
        { id: 'personal', label: t('personalNav'), icon: User },
        { id: 'contact', label: t('contactNav'), icon: MapPin },
        { id: 'financial', label: t('financialNav'), icon: Wallet },
        { id: 'security', label: t('securityNav'), icon: Shield },
    ];

    const statusColors = {
        active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        inactive: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    };

    return (
        <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-main)]">
            <Navbar />

            <main className="pt-24 pb-20 max-w-6xl mx-auto px-4 sm:px-6">
                {/* Profile Header */}
                <div className="relative mb-8">
                    <div className="h-48 rounded-[2.5rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 shadow-xl overflow-hidden opacity-90">
                        <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
                        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl" />
                    </div>

                    <div className="px-8 -mt-16 flex flex-col md:flex-row items-end gap-6 relative z-10">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-[2.5rem] bg-[var(--bg-surface)] border-4 border-[var(--bg-surface)] shadow-2xl overflow-hidden flex items-center justify-center text-4xl font-black text-blue-600">
                                {user?.profile_picture_url ? (
                                    <img src={user.profile_picture_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase()
                                )}
                            </div>
                            <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer rounded-[2.5rem] backdrop-blur-sm">
                                <Camera className="w-8 h-8 text-white" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>

                        <div className="flex-1 pb-2">
                            <div className="flex flex-wrap items-center gap-3 mb-1">
                                <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-md">
                                    {user?.first_name} {user?.last_name}
                                </h1>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${statusColors[user?.status] || statusColors.inactive}`}>
                                    {user?.status}
                                </span>
                            </div>
                            <p className="text-white/80 font-medium flex items-center gap-2">
                                <AtSign className="w-4 h-4" /> {user?.email}
                            </p>
                        </div>

                        <div className="flex gap-3 mb-2">
                            <div className="bg-[var(--bg-surface)]/80 backdrop-blur-md p-3 px-6 rounded-2xl border border-white/20 shadow-lg text-center">
                                <p className="text-2xl font-black text-blue-600 leading-tight">{user?.Employee?.employee_number || '—'}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{t('employeeId')}</p>
                            </div>
                            {!isEditing && activeTab !== 'security' && (
                                <Button
                                    onClick={() => setIsEditing(true)}
                                    className="rounded-2xl px-6 h-fit py-3 shadow-xl flex items-center gap-2"
                                >
                                    <Edit className="w-4 h-4" /> {t('editProfile')}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Tabs */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-[var(--bg-surface)] p-2 rounded-3xl border border-[var(--border-main)] shadow-sm stick top-24">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => { setActiveTab(tab.id); setIsEditing(false); dispatch(clearErrors()); }}
                                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${activeTab === tab.id
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 translate-x-1'
                                            : 'text-[var(--text-soft)] hover:bg-[var(--bg-surface-soft)] hover:text-blue-600'
                                        }`}
                                >
                                    <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'group-hover:scale-110 transition-transform'}`} />
                                    <span className="font-bold text-sm tracking-tight">{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Quick Stats Card */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2rem] text-white shadow-xl overflow-hidden relative">
                            <div className="relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{t('tenure')}</p>
                                <h4 className="text-2xl font-black mb-1">
                                    {user?.Employee?.hire_date ? Math.floor((new Date() - new Date(user.Employee.hire_date)) / (1000 * 60 * 60 * 24 * 365)) : 0} {t('years')}
                                </h4>
                                <p className="text-slate-400 text-xs italic">{t('atCompanySince')} {user?.Employee?.hire_date}</p>
                            </div>
                            <Globe className="absolute -bottom-8 -right-8 w-32 h-32 opacity-10" />
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="bg-[var(--bg-surface)] rounded-[2.5rem] border border-[var(--border-main)] shadow-sm overflow-hidden"
                            >
                                {/* Feedback Section */}
                                <div className="px-8 pt-6">
                                    {successMessage && <Alert type="success" message={successMessage} className="mb-4" />}
                                    {(error || passwordError) && <Alert type="error" message={error || passwordError} className="mb-4" />}
                                </div>

                                <form onSubmit={handleProfileSave}>
                                    {/* Tab Content Header */}
                                    <div className="px-10 py-8 border-b border-[var(--border-main)] flex items-center justify-between">
                                        <div>
                                            <h2 className="text-2xl font-black tracking-tight">{tabs.find(t => t.id === activeTab).label}</h2>
                                            <p className="text-[var(--text-muted)] text-sm mt-1">{t(`${activeTab}Description`)}</p>
                                        </div>
                                        {isEditing && (
                                            <div className="flex gap-3">
                                                <Button type="button" variant="secondary" onClick={() => setIsEditing(false)} className="rounded-xl px-6">
                                                    {t('cancel')}
                                                </Button>
                                                <Button type="submit" loading={loading} className="rounded-xl px-8 shadow-lg shadow-blue-600/30">
                                                    {t('saveChanges')}
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-10">
                                        {/* Overview Tab */}
                                        {activeTab === 'overview' && (
                                            <div className="space-y-10">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                                    <div className="p-6 bg-[var(--bg-surface-soft)] rounded-3xl border border-[var(--border-main)]/50 group hover:border-blue-500/30 transition-all">
                                                        <div className="p-3 bg-blue-500/10 text-blue-600 rounded-2xl w-fit mb-4">
                                                            <Briefcase className="w-5 h-5" />
                                                        </div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">{t('department')}</p>
                                                        <p className="text-xl font-bold">{user?.Employee?.Department?.name || '—'}</p>
                                                    </div>
                                                    <div className="p-6 bg-[var(--bg-surface-soft)] rounded-3xl border border-[var(--border-main)]/50 group hover:border-purple-500/30 transition-all">
                                                        <div className="p-3 bg-purple-500/10 text-purple-600 rounded-2xl w-fit mb-4">
                                                            <Award className="w-5 h-5" />
                                                        </div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">{t('position')}</p>
                                                        <p className="text-xl font-bold">{user?.Employee?.Position?.title || '—'}</p>
                                                    </div>
                                                    <div className="p-6 bg-[var(--bg-surface-soft)] rounded-3xl border border-[var(--border-main)]/50 group hover:border-emerald-500/30 transition-all">
                                                        <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl w-fit mb-4">
                                                            <Calendar className="w-5 h-5" />
                                                        </div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">{t('hireDate')}</p>
                                                        <p className="text-xl font-bold">{user?.Employee?.hire_date || '—'}</p>
                                                    </div>
                                                </div>

                                                <div className="bg-slate-500/5 p-8 rounded-[2rem] border border-[var(--border-main)]/30">
                                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                                        <FileText className="w-5 h-5 text-blue-500" />
                                                        {t('jobDescription')}
                                                    </h3>
                                                    <p className="text-[var(--text-soft)] leading-relaxed text-sm whitespace-pre-line">
                                                        {user?.Employee?.Position?.job_description || t('noDescriptionAvailable')}
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-4">
                                                        <h3 className="font-bold flex items-center gap-2 px-2">
                                                            <User className="w-4 h-4 text-blue-500" /> {t('reportingTo')}
                                                        </h3>
                                                        <div className="p-6 bg-[var(--bg-surface-soft)] rounded-3xl border border-[var(--border-main)] flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black">
                                                                {user?.Employee?.Manager ? `${user.Employee.Manager.first_name?.[0]}${user.Employee.Manager.last_name?.[0]}` : <Briefcase />}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-lg">{user?.Employee?.Manager ? `${user.Employee.Manager.first_name} ${user.Employee.Manager.last_name}` : 'Not Assigned'}</p>
                                                                <p className="text-xs text-[var(--text-muted)]">{user?.Employee?.Manager?.email || '-'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <h3 className="font-bold flex items-center gap-2 px-2">
                                                            <Shield className="w-4 h-4 text-emerald-500" /> {t('accountSecurity')}
                                                        </h3>
                                                        <div className="p-6 bg-[var(--bg-surface-soft)] rounded-3xl border border-[var(--border-main)]">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="text-sm font-medium">{t('emailVerified')}</span>
                                                                <span className={user?.email_verified_at ? "text-emerald-500" : "text-amber-500"}>
                                                                    {user?.email_verified_at ? t('yes') : t('no')}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm font-medium">{t('lastLogin')}</span>
                                                                <span className="text-xs text-[var(--text-muted)]">
                                                                    {user?.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Personal Tab */}
                                        {activeTab === 'personal' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                                                <Input
                                                    label={t('firstName')}
                                                    value={profileForm.first_name}
                                                    disabled={!isEditing}
                                                    onChange={e => setProfileForm({ ...profileForm, first_name: e.target.value })}
                                                    className="rounded-2xl"
                                                />
                                                <Input
                                                    label={t('lastName')}
                                                    value={profileForm.last_name}
                                                    disabled={!isEditing}
                                                    onChange={e => setProfileForm({ ...profileForm, last_name: e.target.value })}
                                                    className="rounded-2xl"
                                                />
                                                <Input
                                                    label={t('dateOfBirth')}
                                                    type="date"
                                                    value={profileForm.date_of_birth}
                                                    disabled={!isEditing}
                                                    onChange={e => setProfileForm({ ...profileForm, date_of_birth: e.target.value })}
                                                    className="rounded-2xl"
                                                />
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] px-1">{t('gender')}</label>
                                                    <select
                                                        className="w-full bg-[var(--bg-surface-soft)] border border-[var(--border-main)] rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 appearance-none"
                                                        value={profileForm.gender}
                                                        disabled={!isEditing}
                                                        onChange={e => setProfileForm({ ...profileForm, gender: e.target.value })}
                                                    >
                                                        <option value="">{t('selectGender')}</option>
                                                        <option value="male">{t('male')}</option>
                                                        <option value="female">{t('female')}</option>
                                                        <option value="other">{t('other')}</option>
                                                    </select>
                                                </div>
                                                <Input
                                                    label={t('nationality')}
                                                    value={profileForm.nationality}
                                                    disabled={!isEditing}
                                                    onChange={e => setProfileForm({ ...profileForm, nationality: e.target.value })}
                                                    className="rounded-2xl"
                                                />
                                                <Input
                                                    label={t('maritalStatus')}
                                                    value={profileForm.marital_status}
                                                    disabled={!isEditing}
                                                    onChange={e => setProfileForm({ ...profileForm, marital_status: e.target.value })}
                                                    className="rounded-2xl"
                                                />
                                                <div className="md:col-span-2 border-t border-[var(--border-main)] pt-8 mt-4">
                                                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                                        <FileText className="w-5 h-5 text-indigo-500" />
                                                        {t('identificationInfo')}
                                                    </h3>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] px-1">{t('idType')}</label>
                                                    <select
                                                        className="w-full bg-[var(--bg-surface-soft)] border border-[var(--border-main)] rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 appearance-none"
                                                        value={profileForm.id_type}
                                                        disabled={!isEditing}
                                                        onChange={e => setProfileForm({ ...profileForm, id_type: e.target.value })}
                                                    >
                                                        <option value="national_id">{t('nationalId')}</option>
                                                        <option value="passport">{t('passport')}</option>
                                                        <option value="driving_license">{t('drivingLicense')}</option>
                                                    </select>
                                                </div>
                                                <Input
                                                    label={t('idNumber')}
                                                    value={profileForm.id_number}
                                                    disabled={!isEditing}
                                                    onChange={e => setProfileForm({ ...profileForm, id_number: e.target.value })}
                                                    className="rounded-2xl"
                                                />
                                                <Input
                                                    label={t('idExpiryDate')}
                                                    type="date"
                                                    value={profileForm.id_expiry_date}
                                                    disabled={!isEditing}
                                                    onChange={e => setProfileForm({ ...profileForm, id_expiry_date: e.target.value })}
                                                    className="rounded-2xl"
                                                />
                                            </div>
                                        )}

                                        {/* Contact Tab */}
                                        {activeTab === 'contact' && (
                                            <div className="space-y-12">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                                                    <div className="md:col-span-2">
                                                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                                            <MapPin className="w-5 h-5 text-rose-500" />
                                                            {t('residentialAddress')}
                                                        </h3>
                                                    </div>
                                                    <Input
                                                        label={t('addressLine1')}
                                                        value={profileForm.address_line1}
                                                        disabled={!isEditing}
                                                        onChange={e => setProfileForm({ ...profileForm, address_line1: e.target.value })}
                                                        className="rounded-2xl md:col-span-2"
                                                    />
                                                    <Input
                                                        label={t('city')}
                                                        value={profileForm.city}
                                                        disabled={!isEditing}
                                                        onChange={e => setProfileForm({ ...profileForm, city: e.target.value })}
                                                        className="rounded-2xl"
                                                    />
                                                    <Input
                                                        label={t('stateProvince')}
                                                        value={profileForm.state}
                                                        disabled={!isEditing}
                                                        onChange={e => setProfileForm({ ...profileForm, state: e.target.value })}
                                                        className="rounded-2xl"
                                                    />
                                                    <Input
                                                        label={t('postalCode')}
                                                        value={profileForm.postal_code}
                                                        disabled={!isEditing}
                                                        onChange={e => setProfileForm({ ...profileForm, postal_code: e.target.value })}
                                                        className="rounded-2xl"
                                                    />
                                                    <Input
                                                        label={t('country')}
                                                        value={profileForm.country}
                                                        disabled={!isEditing}
                                                        onChange={e => setProfileForm({ ...profileForm, country: e.target.value })}
                                                        className="rounded-2xl"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 pt-8 border-t border-[var(--border-main)]">
                                                    <div className="md:col-span-2">
                                                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                                            <Heart className="w-5 h-5 text-rose-500" />
                                                            {t('emergencyContact')}
                                                        </h3>
                                                    </div>
                                                    <Input
                                                        label={t('contactPerson')}
                                                        value={profileForm.emergency_contact_name}
                                                        disabled={!isEditing}
                                                        onChange={e => setProfileForm({ ...profileForm, emergency_contact_name: e.target.value })}
                                                        className="rounded-2xl"
                                                    />
                                                    <Input
                                                        label={t('relationship')}
                                                        value={profileForm.emergency_contact_relation}
                                                        disabled={!isEditing}
                                                        onChange={e => setProfileForm({ ...profileForm, emergency_contact_relation: e.target.value })}
                                                        className="rounded-2xl"
                                                    />
                                                    <Input
                                                        label={t('phoneNumber')}
                                                        value={profileForm.emergency_contact_phone}
                                                        disabled={!isEditing}
                                                        onChange={e => setProfileForm({ ...profileForm, emergency_contact_phone: e.target.value })}
                                                        className="rounded-2xl"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Financial Tab */}
                                        {activeTab === 'financial' && (
                                            <div className="space-y-12">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                                                    <div className="md:col-span-2">
                                                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                                            <CreditCard className="w-5 h-5 text-emerald-500" />
                                                            {t('bankingDetails')}
                                                        </h3>
                                                    </div>
                                                    <Input
                                                        label={t('bankName')}
                                                        value={profileForm.bank_name}
                                                        disabled={!isEditing}
                                                        onChange={e => setProfileForm({ ...profileForm, bank_name: e.target.value })}
                                                        className="rounded-2xl"
                                                    />
                                                    <Input
                                                        label={t('accountHolderName')}
                                                        value={profileForm.bank_account_name}
                                                        disabled={!isEditing}
                                                        onChange={e => setProfileForm({ ...profileForm, bank_account_name: e.target.value })}
                                                        className="rounded-2xl"
                                                    />
                                                    <Input
                                                        label={t('accountNumber')}
                                                        value={profileForm.bank_account_number}
                                                        disabled={!isEditing}
                                                        onChange={e => setProfileForm({ ...profileForm, bank_account_number: e.target.value })}
                                                        className="rounded-2xl"
                                                    />
                                                    <Input
                                                        label={t('iban')}
                                                        value={profileForm.bank_iban}
                                                        disabled={!isEditing}
                                                        onChange={e => setProfileForm({ ...profileForm, bank_iban: e.target.value })}
                                                        className="rounded-2xl"
                                                    />
                                                    <Input
                                                        label={t('swiftCode')}
                                                        value={profileForm.bank_swift}
                                                        disabled={!isEditing}
                                                        onChange={e => setProfileForm({ ...profileForm, bank_swift: e.target.value })}
                                                        className="rounded-2xl"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 pt-8 border-t border-[var(--border-main)]">
                                                    <div className="md:col-span-2">
                                                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                                            <FileText className="w-5 h-5 text-blue-500" />
                                                            {t('taxLegal')}
                                                        </h3>
                                                    </div>
                                                    <Input
                                                        label={t('taxIdNumber')}
                                                        value={profileForm.tax_id}
                                                        disabled={!isEditing}
                                                        onChange={e => setProfileForm({ ...profileForm, tax_id: e.target.value })}
                                                        className="rounded-2xl"
                                                    />
                                                    <Input
                                                        label={t('socialSecurityNumber')}
                                                        value={profileForm.social_security_number}
                                                        disabled={!isEditing}
                                                        onChange={e => setProfileForm({ ...profileForm, social_security_number: e.target.value })}
                                                        className="rounded-2xl"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Security Tab */}
                                        {activeTab === 'security' && (
                                            <div className="max-w-md mx-auto py-4">
                                                <div className="flex items-center gap-4 mb-8 p-6 bg-blue-500/5 rounded-3xl border border-blue-500/20">
                                                    <Shield className="w-10 h-10 text-blue-600" />
                                                    <div>
                                                        <h3 className="font-bold">{t('secureAccount')}</h3>
                                                        <p className="text-xs text-[var(--text-soft)]">{t('lastPasswordChange')} {t('never')}</p>
                                                    </div>
                                                </div>

                                                <form onSubmit={handlePasswordChange} className="space-y-6">
                                                    <Input
                                                        label={t('currentPassword')}
                                                        type="password"
                                                        value={passwordForm.old_password}
                                                        onChange={e => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                                                        className="rounded-2xl"
                                                    />
                                                    <Input
                                                        label={t('newPassword')}
                                                        type="password"
                                                        value={passwordForm.new_password}
                                                        onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                                                        className="rounded-2xl"
                                                    />
                                                    <Input
                                                        label={t('confirmNewPassword')}
                                                        type="password"
                                                        value={passwordForm.confirm_password}
                                                        onChange={e => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                                                        className="rounded-2xl"
                                                    />
                                                    <Button type="submit" loading={loading} className="w-full rounded-2xl py-4 shadow-xl shadow-blue-600/20">
                                                        {t('updatePassword')}
                                                    </Button>
                                                </form>
                                            </div>
                                        )}
                                    </div>
                                </form>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;
