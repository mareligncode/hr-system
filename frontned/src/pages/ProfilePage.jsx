import { useState, useEffect } from 'react';
import {
    ChevronLeft, Edit, Upload, Camera
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, updateProfile, changePassword, clearErrors, clearSuccess } from '../store/authSlice.js';
import Navbar from '../components/layout/Navbar.jsx';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import Alert from '../components/ui/Alert.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import usePermission from '../hooks/usePermission';

const ProfilePage = () => {
    const dispatch = useDispatch();
    const { loading, error, successMessage } = useSelector((state) => state.auth);
    const { user, role, hasPermission, isAdmin } = usePermission();
    const { t } = useSettings();

    const [activeTab, setActiveTab] = useState('profile');
    const [profileForm, setProfileForm] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        language_preference: 'en',
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
            setProfileForm({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone: user.phone || '',
                language_preference: user.language_preference || 'en',
            });
        }
    }, [user]);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => dispatch(clearSuccess()), 4000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, dispatch]);

    const handleProfileSave = (e) => {
        e.preventDefault();
        dispatch(clearErrors());

        const formData = new FormData();
        Object.keys(profileForm).forEach(key => {
            formData.append(key, profileForm[key]);
        });

        dispatch(updateProfile(formData));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileForm(prev => ({ ...prev, profile_picture: file }));
            // Optional: Show immediate preview or just wait for save
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
        })).then(() => {
            setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
        });
    };

    const statusColors = {
        active: 'bg-green-500/10 text-green-500 border-green-500/20',
        pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        inactive: 'bg-[var(--bg-surface-soft)] text-[var(--text-soft)] border-[var(--border-main)]',
    };

    return (
        <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-main)]">
            <Navbar />

            <main className="pt-24 pb-12 max-w-5xl mx-auto px-4 sm:px-6">
                {/* Profile header */}
                <div className="mb-8 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-6 shadow-sm">
                    {/* Avatar */}
                    <div className="relative group mr-2">
                        <div className="w-24 h-24 bg-[var(--accent)] rounded-3xl flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-blue-900/40 shrink-0 overflow-hidden border-4 border-[var(--bg-surface)]">
                            {user?.profile_picture_url ? (
                                <img
                                    src={user.profile_picture_url}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
                            )}
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-3xl">
                            <Camera className="w-8 h-8 text-white" />
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold text-[var(--text-main)]">
                                {user ? `${user.first_name} ${user.last_name}` : t('loading')}
                            </h1>
                            {user?.status && (
                                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${statusColors[user.status] || statusColors.inactive}`}>
                                    {t(`${user.status}Status`) || user.status}
                                </span>
                            )}
                        </div>
                        <p className="text-[var(--text-soft)] text-sm">{user?.email}</p>
                    </div>

                    <div className="flex flex-wrap gap-3 shrink-0">
                        <div className="text-center px-4 py-2 bg-[var(--bg-surface-soft)] border border-[var(--border-main)] rounded-xl">
                            <p className="font-semibold text-lg text-[var(--text-main)]">{user?.employee_id || '—'}</p>
                            <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider font-bold">{t('employeeId')}</p>
                        </div>
                    </div>
                </div>

                {/* Role-Based Dashboard Widgets */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {isAdmin && (
                        <>
                            <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg shadow-blue-900/20">
                                <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">{t('systemHealth')}</p>
                                <p className="text-2xl font-bold">{t('allSystemsNominal')}</p>
                                <div className="mt-4 flex gap-2">
                                    <span className="px-2 py-1 bg-white/20 rounded text-[10px] font-bold">{t('auditLogsActive')}</span>
                                </div>
                            </div>
                            <div className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-main)]">
                                <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">{t('securityAlert')}</p>
                                <p className="text-2xl font-bold text-rose-500">0 {t('criticalIssues')}</p>
                            </div>
                        </>
                    )}
                    {hasPermission('manage_employees') && (
                        <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-lg shadow-indigo-900/20">
                            <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">{t('hrPulse')}</p>
                            <p className="text-2xl font-bold">12 {t('activeCandidates')}</p>
                            <div className="mt-4 flex gap-2">
                                <span className="px-2 py-1 bg-white/20 rounded text-[10px] font-bold">3 {t('interviewsToday')}</span>
                            </div>
                        </div>
                    )}
                    {role === 'finance' && (
                        <div className="bg-emerald-600 p-6 rounded-2xl text-white shadow-lg shadow-emerald-900/20">
                            <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">{t('financeHub')}</p>
                            <p className="text-2xl font-bold">{t('payrollBatch')} #42</p>
                            <div className="mt-4 flex gap-2">
                                <span className="px-2 py-1 bg-white/20 rounded text-[10px] font-bold">{t('processing')}...</span>
                            </div>
                        </div>
                    )}
                    {role === 'employee' && (
                        <div className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-main)]">
                            <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">{t('mySchedule')}</p>
                            <p className="text-2xl font-bold text-blue-500">{t('morningShift')}</p>
                            <p className="text-xs text-[var(--text-soft)] mt-1">{t('startsAt')} 8:00 AM</p>
                        </div>
                    )}
                    <div className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-main)]">
                        <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">{t('announcements')}</p>
                        <p className="text-lg font-bold">{t('staffMeetingTomorrow')}</p>
                        <p className="text-xs text-[var(--text-soft)] mt-1">10:00 AM {t('inConferenceRoom')}</p>
                    </div>
                </div>

                {/* Tab navigation */}
                <div className="flex gap-1 mb-6 bg-[var(--bg-surface)] p-1 rounded-xl border border-[var(--border-main)] w-fit">
                    {['profile', 'security'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); dispatch(clearErrors()); dispatch(clearSuccess()); }}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === tab
                                ? 'bg-[var(--accent)] text-white shadow-lg shadow-blue-900/30'
                                : 'text-[var(--text-soft)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-soft)]'
                                }`}
                        >
                            {t(`${tab}Nav`)}
                        </button>
                    ))}
                </div>

                {/* Feedback alerts */}
                <div className="mb-4 space-y-2">
                    {successMessage && <Alert type="success" message={successMessage} />}
                    {(error || passwordError) && <Alert type="error" message={error || passwordError} />}
                </div>

                {/* Profile tab */}
                {activeTab === 'profile' && (
                    <div className="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-2xl p-6 sm:p-8 shadow-sm">
                        <h2 className="text-lg font-semibold text-[var(--text-main)] mb-6">{t('personalInformation')}</h2>
                        <form onSubmit={handleProfileSave} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <Input
                                    id="first_name"
                                    label={t('firstName')}
                                    value={profileForm.first_name}
                                    onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                                    required
                                />
                                <Input
                                    id="last_name"
                                    label={t('lastName')}
                                    value={profileForm.last_name}
                                    onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                                    required
                                />
                            </div>

                            <Input
                                id="phone"
                                label={t('phone')}
                                type="tel"
                                placeholder="+1 234 567 8900"
                                value={profileForm.phone}
                                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            />

                            {/* Info grid */}
                            <div className="pt-4 border-t border-[var(--border-main)] grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">{t('email')}</span>
                                    <span className="text-sm font-medium">{user?.email}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">{t('accountStatusLabel')}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full w-fit font-medium ${user?.status === 'active' ? 'text-green-500 bg-green-500/10' : 'text-yellow-500 bg-yellow-500/10'}`}>
                                        {user?.status ? t(`${user.status}Status`) : '—'}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">{t('lastLoginLabel')}</span>
                                    <span className="text-sm font-medium">
                                        {user?.last_login_at ? new Date(user.last_login_at).toLocaleString() : '—'}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">{t('emailVerifiedLabel')}</span>
                                    <span className={`text-sm font-medium ${user?.email_verified_at ? 'text-green-500' : 'text-yellow-500'}`}>
                                        {user?.email_verified_at ? t('verifiedStatus') : t('notVerifiedStatus')}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button type="submit" loading={loading} className="w-auto px-10">
                                    {t('save')}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Security tab */}
                {activeTab === 'security' && (
                    <div className="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-2xl p-6 sm:p-8 shadow-sm">
                        <h2 className="text-lg font-semibold text-[var(--text-main)] mb-2">{t('updatePassword')}</h2>
                        <p className="text-[var(--text-soft)] text-sm mb-6">{t('passwordStrengthAdvice')}</p>

                        <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">
                            <Input
                                id="old_password"
                                label={t('oldPasswordLabel')}
                                type="password"
                                placeholder="..."
                                value={passwordForm.old_password}
                                onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                                required
                            />
                            <Input
                                id="new_password"
                                label={t('newPasswordLabel')}
                                type="password"
                                placeholder="..."
                                value={passwordForm.new_password}
                                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                                required
                            />
                            <Input
                                id="confirm_password"
                                label={t('confirmPasswordLabel')}
                                type="password"
                                placeholder="..."
                                value={passwordForm.confirm_password}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                                required
                            />

                            <div className="flex justify-end pt-2">
                                <Button type="submit" loading={loading} className="w-auto px-10">
                                    {t('updatePasswordBtn')}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ProfilePage;
