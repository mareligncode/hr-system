import { useState, useEffect } from 'react';
import { Award, Calendar, Edit, Camera, User, Briefcase, MapPin, Wallet,
    Shield, Heart, FileText, Info, AtSign, Globe, CreditCard, Phone, CheckCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, updateProfile, changePassword, clearErrors, clearSuccess } from '../store/authSlice.js';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import Alert from '../components/ui/Alert.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import usePermission from '../hooks/usePermission';
import { motion, AnimatePresence } from 'framer-motion';

// ── Reusable styled select matching Input component ───────────────────────────
const Select = ({ label, value, onChange, disabled, children }) => (
    <div className="flex flex-col gap-1.5">
        {label && (
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] px-1">
                {label}
            </label>
        )}
        <select
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`w-full px-4 py-3.5 rounded-xl text-sm font-medium border outline-none transition-all duration-200
                bg-[var(--bg-surface-soft)] text-[var(--text-main)]
                ${disabled
                    ? 'border-[var(--border-main)] opacity-70 cursor-not-allowed'
                    : 'border-[var(--border-main)] hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                }`}
        >
            {children}
        </select>
    </div>
);

// ── Read-only display field (shows value clearly when not editing) ─────────────
const Field = ({ label, value, icon: Icon }) => (
    <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] px-1 flex items-center gap-1.5">
            {Icon && <Icon className="w-3 h-3" />}{label}
        </span>
        <div className="px-4 py-3.5 rounded-xl text-sm font-medium bg-[var(--bg-surface-soft)] border border-[var(--border-main)] text-[var(--text-main)] min-h-[48px]">
            {value || <span className="text-[var(--text-muted)] italic">Not set</span>}
        </div>
    </div>
);

const ProfilePage = () => {
    const dispatch = useDispatch();
    const { loading, error, successMessage } = useSelector((state) => state.auth);
    const { user } = usePermission();
    const { t } = useSettings();

    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    const [form, setForm] = useState({
        first_name: '', last_name: '', phone: '', language_preference: 'en',
        date_of_birth: '', gender: '', marital_status: '', nationality: '',
        id_number: '', id_type: 'national_id', id_expiry_date: '',
        address_line1: '', address_line2: '', city: '', state: '',
        postal_code: '', country: '',
        emergency_contact_name: '', emergency_contact_phone: '', emergency_contact_relation: '',
        bank_name: '', bank_account_number: '', bank_account_name: '',
        bank_iban: '', bank_swift: '', tax_id: '', social_security_number: '',
        work_email: '', work_phone: '', office_location: '',
    });

    const [passwordForm, setPasswordForm] = useState({
        old_password: '', new_password: '', confirm_password: '',
    });

    const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));
    const setP = (field) => (e) => setPasswordForm(f => ({ ...f, [field]: e.target.value }));

    useEffect(() => { dispatch(fetchProfile()); }, [dispatch]);

    useEffect(() => {
        if (user) {
            const e = user.Employee || {};
            setForm({
                first_name: user.first_name || '', last_name: user.last_name || '',
                phone: user.phone || '', language_preference: user.language_preference || 'en',
                date_of_birth: e.date_of_birth?.split('T')[0] || '',
                gender: e.gender || '', marital_status: e.marital_status || '',
                nationality: e.nationality || '', id_number: e.id_number || '',
                id_type: e.id_type || 'national_id',
                id_expiry_date: e.id_expiry_date?.split('T')[0] || '',
                address_line1: e.address_line1 || '', address_line2: e.address_line2 || '',
                city: e.city || '', state: e.state || '',
                postal_code: e.postal_code || '', country: e.country || '',
                emergency_contact_name: e.emergency_contact_name || '',
                emergency_contact_phone: e.emergency_contact_phone || '',
                emergency_contact_relation: e.emergency_contact_relation || '',
                bank_name: e.bank_name || '', bank_account_number: e.bank_account_number || '',
                bank_account_name: e.bank_account_name || '', bank_iban: e.bank_iban || '',
                bank_swift: e.bank_swift || '', tax_id: e.tax_id || '',
                social_security_number: e.social_security_number || '',
                work_email: e.work_email || '', work_phone: e.work_phone || '',
                office_location: e.office_location || '',
            });
        }
    }, [user]);

    useEffect(() => {
        if (successMessage) {
            setIsEditing(false);
            const t = setTimeout(() => dispatch(clearSuccess()), 4000);
            return () => clearTimeout(t);
        }
    }, [successMessage, dispatch]);

    const handleSave = (e) => {
        e.preventDefault();
        dispatch(clearErrors());
        dispatch(updateProfile({ ...form }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const fd = new FormData();
        fd.append('profile_picture', file);
        dispatch(updateProfile(fd));
    };

    const handlePasswordSubmit = () => {
        setPasswordError('');
        dispatch(clearErrors());
        if (passwordForm.new_password !== passwordForm.confirm_password) {
            setPasswordError('Passwords do not match');
            return;
        }
        if (passwordForm.new_password.length < 8) {
            setPasswordError('Password must be at least 8 characters');
            return;
        }
        dispatch(changePassword({
            old_password: passwordForm.old_password,
            new_password: passwordForm.new_password,
        })).then((res) => {
            if (!res.error) setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
        });
    };

    const cancelEdit = () => { setIsEditing(false); dispatch(clearErrors()); };
    const changeTab = (id) => { setActiveTab(id); setIsEditing(false); dispatch(clearErrors()); };

    const tabs = [
        { id: 'overview',  label: 'Overview',  icon: Info     },
        { id: 'personal',  label: 'Personal',  icon: User     },
        { id: 'contact',   label: 'Contact',   icon: MapPin   },
        { id: 'financial', label: 'Financial', icon: Wallet   },
        { id: 'security',  label: 'Security',  icon: Shield   },
    ];

    const statusColor = {
        active:   'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
        pending:  'bg-amber-500/10   text-amber-500   border-amber-500/30',
        inactive: 'bg-slate-500/10  text-slate-500   border-slate-500/30',
    };

    return (
        <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-main)]">
            <main className="pt-6 pb-20 max-w-6xl mx-auto px-4 sm:px-6">

                {/* ── Banner + Avatar ─────────────────────────────────────── */}
                <div className="relative mb-8">
                    <div className="h-40 sm:h-52 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 shadow-xl overflow-hidden">
                        <div className="absolute inset-0 bg-white/5" />
                        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl" />
                    </div>

                    <div className="px-4 sm:px-8 -mt-12 sm:-mt-16 flex flex-col md:flex-row md:items-end gap-4 sm:gap-6 relative z-10">
                        {/* Avatar */}
                        <div className="relative group self-center md:self-auto">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-[var(--bg-surface)] border-4 border-[var(--bg-surface)] shadow-2xl overflow-hidden flex items-center justify-center text-3xl font-black text-blue-600">
                                {user?.profile_picture_url
                                    ? <img src={user.profile_picture_url} alt="avatar" className="w-full h-full object-cover" />
                                    : `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase()
                                }
                            </div>
                            <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer rounded-3xl">
                                <Camera className="w-7 h-7 text-white" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>

                        {/* Name + meta */}
                        <div className="flex-1 pb-2 text-center md:text-left">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-1">
                                <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">
                                    {user?.first_name} {user?.last_name}
                                </h1>
                                <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColor[user?.status] || statusColor.inactive}`}>
                                    {user?.status}
                                </span>
                            </div>
                            <p className="text-white/80 text-sm flex items-center justify-center md:justify-start gap-2">
                                <AtSign className="w-3.5 h-3.5" />{user?.email}
                            </p>
                        </div>

                        {/* Employee ID + edit button */}
                        <div className="flex items-center gap-3 pb-2 justify-center md:justify-end">
                            <div className="bg-[var(--bg-surface)]/90 backdrop-blur px-5 py-3 rounded-2xl border border-white/20 shadow-lg text-center">
                                <p className="text-xl font-black text-blue-500 leading-tight">{user?.Employee?.employee_number || '—'}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Employee ID</p>
                            </div>
                            {!isEditing && activeTab !== 'security' && (
                                <Button onClick={() => setIsEditing(true)} className="rounded-2xl px-5 py-3 h-fit flex items-center gap-2 text-sm">
                                    <Edit className="w-4 h-4" /> Edit Profile
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Layout ──────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Tab nav */}
                        <div className="bg-[var(--bg-surface)] p-2 rounded-2xl border border-[var(--border-main)] shadow-sm lg:sticky lg:top-20">
                            <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => changeTab(tab.id)}
                                        className={`flex-shrink-0 lg:w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                                            ${activeTab === tab.id
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                                : 'text-[var(--text-soft)] hover:bg-[var(--bg-surface-soft)] hover:text-blue-600'}`}
                                    >
                                        <tab.icon className="w-4 h-4 flex-shrink-0" />
                                        <span className="font-bold text-xs sm:text-sm whitespace-nowrap">{tab.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tenure card */}
                        <div className="hidden lg:block bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Tenure</p>
                            <h4 className="text-2xl font-black mb-1">
                                {user?.Employee?.hire_date
                                    ? Math.floor((new Date() - new Date(user.Employee.hire_date)) / (365.25 * 24 * 60 * 60 * 1000))
                                    : 0} years
                            </h4>
                            <p className="text-slate-400 text-xs">Since {user?.Employee?.hire_date?.split('T')[0] || '—'}</p>
                            <Globe className="absolute -bottom-6 -right-6 w-28 h-28 opacity-10" />
                        </div>
                    </div>

                    {/* Main panel */}
                    <div className="lg:col-span-3">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.18 }}
                                className="bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-main)] shadow-sm overflow-hidden"
                            >
                                {/* Alerts */}
                                {(successMessage || error || passwordError) && (
                                    <div className="px-6 pt-5">
                                        {successMessage && <Alert type="success" message={successMessage} className="mb-0" />}
                                        {(error || passwordError) && <Alert type="error" message={error || passwordError} className="mb-0" />}
                                    </div>
                                )}

                                {/* ── Profile form (all tabs except security) ── */}
                                {activeTab !== 'security' && (
                                    <form onSubmit={handleSave}>
                                        {/* Header */}
                                        <div className="px-6 sm:px-8 py-5 border-b border-[var(--border-main)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <h2 className="text-xl font-black">{tabs.find(t => t.id === activeTab)?.label}</h2>
                                                <p className="text-[var(--text-muted)] text-xs mt-0.5">
                                                    {isEditing ? 'Make your changes below and save' : 'Click Edit Profile to make changes'}
                                                </p>
                                            </div>
                                            {isEditing && (
                                                <div className="flex gap-3 w-full sm:w-auto">
                                                    <Button type="button" variant="secondary" onClick={cancelEdit} className="flex-1 sm:flex-none sm:w-24 rounded-xl h-11">
                                                        Cancel
                                                    </Button>
                                                    <Button type="submit" loading={loading} className="flex-1 sm:flex-none sm:w-32 rounded-xl h-11 shadow-lg shadow-blue-600/20">
                                                        Save Changes
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-6 sm:p-8">

                                            {/* ── OVERVIEW ─────────────────────────────── */}
                                            {activeTab === 'overview' && (
                                                <div className="space-y-6">
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                        {[
                                                            { label: 'Department', value: user?.Employee?.Department?.name, icon: Briefcase, color: 'blue' },
                                                            { label: 'Position',   value: user?.Employee?.Position?.title,  icon: Award,     color: 'purple' },
                                                            { label: 'Hire Date',  value: user?.Employee?.hire_date?.split('T')[0], icon: Calendar, color: 'emerald' },
                                                        ].map(card => (
                                                            <div key={card.label} className="p-5 bg-[var(--bg-surface-soft)] rounded-2xl border border-[var(--border-main)]/50">
                                                                <div className={`p-2.5 bg-${card.color}-500/10 text-${card.color}-500 rounded-xl w-fit mb-3`}>
                                                                    <card.icon className="w-4 h-4" />
                                                                </div>
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">{card.label}</p>
                                                                <p className="text-base font-bold truncate">{card.value || '—'}</p>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="p-5 bg-[var(--bg-surface-soft)] rounded-2xl border border-[var(--border-main)]/50">
                                                        <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500" /> Job Description</h3>
                                                        <p className="text-[var(--text-soft)] text-sm leading-relaxed">
                                                            {user?.Employee?.Position?.job_description || 'No description available.'}
                                                        </p>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div className="p-5 bg-[var(--bg-surface-soft)] rounded-2xl border border-[var(--border-main)]/50">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 flex items-center gap-1.5"><User className="w-3 h-3" />Reports To</p>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                                                                    {user?.Employee?.Manager
                                                                        ? `${user.Employee.Manager.first_name?.[0]}${user.Employee.Manager.last_name?.[0]}`
                                                                        : <Briefcase className="w-4 h-4" />}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="font-bold text-sm truncate">
                                                                        {user?.Employee?.Manager
                                                                            ? `${user.Employee.Manager.first_name} ${user.Employee.Manager.last_name}`
                                                                            : 'Not Assigned'}
                                                                    </p>
                                                                    <p className="text-xs text-[var(--text-muted)] truncate">{user?.Employee?.Manager?.email || '—'}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="p-5 bg-[var(--bg-surface-soft)] rounded-2xl border border-[var(--border-main)]/50">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 flex items-center gap-1.5"><Shield className="w-3 h-3" />Account</p>
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-xs text-[var(--text-soft)]">Email verified</span>
                                                                    <span className={`text-xs font-bold ${user?.email_verified_at ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                                        {user?.email_verified_at ? '✓ Yes' : '✗ No'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-xs text-[var(--text-soft)]">Last login</span>
                                                                    <span className="text-xs text-[var(--text-muted)] font-medium">
                                                                        {user?.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-xs text-[var(--text-soft)]">Role</span>
                                                                    <span className="text-xs font-bold text-blue-500 uppercase">{user?.role}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* ── PERSONAL ─────────────────────────────── */}
                                            {activeTab === 'personal' && (
                                                <div className="space-y-6">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                        {isEditing ? (
                                                            <>
                                                                <Input label="First Name" value={form.first_name} onChange={set('first_name')} />
                                                                <Input label="Last Name"  value={form.last_name}  onChange={set('last_name')} />
                                                                <Input label="Phone"      value={form.phone}      onChange={set('phone')} />
                                                                <Input label="Date of Birth" type="date" value={form.date_of_birth} onChange={set('date_of_birth')} />
                                                                <Select label="Gender" value={form.gender} onChange={set('gender')}>
                                                                    <option value="">Select gender</option>
                                                                    <option value="male">Male</option>
                                                                    <option value="female">Female</option>
                                                                    <option value="other">Other</option>
                                                                </Select>
                                                                <Input label="Nationality"    value={form.nationality}    onChange={set('nationality')} />
                                                                <Input label="Marital Status" value={form.marital_status} onChange={set('marital_status')} />
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Field label="First Name"     value={form.first_name} />
                                                                <Field label="Last Name"      value={form.last_name} />
                                                                <Field label="Phone"          value={form.phone} />
                                                                <Field label="Date of Birth"  value={form.date_of_birth} />
                                                                <Field label="Gender"         value={form.gender} />
                                                                <Field label="Nationality"    value={form.nationality} />
                                                                <Field label="Marital Status" value={form.marital_status} />
                                                            </>
                                                        )}
                                                    </div>

                                                    <div className="border-t border-[var(--border-main)] pt-6">
                                                        <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-indigo-500" />Identification</h3>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                            {isEditing ? (
                                                                <>
                                                                    <Select label="ID Type" value={form.id_type} onChange={set('id_type')}>
                                                                        <option value="national_id">National ID</option>
                                                                        <option value="passport">Passport</option>
                                                                        <option value="driving_license">Driving License</option>
                                                                    </Select>
                                                                    <Input label="ID Number"      value={form.id_number}      onChange={set('id_number')} />
                                                                    <Input label="ID Expiry Date" type="date" value={form.id_expiry_date} onChange={set('id_expiry_date')} />
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Field label="ID Type"        value={form.id_type?.replace('_', ' ')} />
                                                                    <Field label="ID Number"      value={form.id_number} />
                                                                    <Field label="ID Expiry Date" value={form.id_expiry_date} />
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* ── CONTACT ──────────────────────────────── */}
                                            {activeTab === 'contact' && (
                                                <div className="space-y-8">
                                                    <div>
                                                        <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><MapPin className="w-4 h-4 text-rose-500" />Residential Address</h3>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                            {isEditing ? (
                                                                <>
                                                                    <div className="sm:col-span-2"><Input label="Address Line 1" value={form.address_line1} onChange={set('address_line1')} /></div>
                                                                    <div className="sm:col-span-2"><Input label="Address Line 2" value={form.address_line2} onChange={set('address_line2')} /></div>
                                                                    <Input label="City"          value={form.city}        onChange={set('city')} />
                                                                    <Input label="State/Province" value={form.state}       onChange={set('state')} />
                                                                    <Input label="Postal Code"   value={form.postal_code} onChange={set('postal_code')} />
                                                                    <Input label="Country"       value={form.country}     onChange={set('country')} />
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <div className="sm:col-span-2"><Field label="Address Line 1" value={form.address_line1} /></div>
                                                                    <div className="sm:col-span-2"><Field label="Address Line 2" value={form.address_line2} /></div>
                                                                    <Field label="City"          value={form.city} />
                                                                    <Field label="State/Province" value={form.state} />
                                                                    <Field label="Postal Code"   value={form.postal_code} />
                                                                    <Field label="Country"       value={form.country} />
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="border-t border-[var(--border-main)] pt-6">
                                                        <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><Heart className="w-4 h-4 text-rose-500" />Emergency Contact</h3>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                            {isEditing ? (
                                                                <>
                                                                    <Input label="Contact Name"  value={form.emergency_contact_name}     onChange={set('emergency_contact_name')} />
                                                                    <Input label="Relationship"  value={form.emergency_contact_relation}  onChange={set('emergency_contact_relation')} />
                                                                    <Input label="Phone Number"  value={form.emergency_contact_phone}     onChange={set('emergency_contact_phone')} />
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Field label="Contact Name"  value={form.emergency_contact_name} />
                                                                    <Field label="Relationship"  value={form.emergency_contact_relation} />
                                                                    <Field label="Phone Number"  value={form.emergency_contact_phone} />
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* ── FINANCIAL ────────────────────────────── */}
                                            {activeTab === 'financial' && (
                                                <div className="space-y-8">
                                                    <div>
                                                        <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4 text-emerald-500" />Banking Details</h3>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                            {isEditing ? (
                                                                <>
                                                                    <Input label="Bank Name"           value={form.bank_name}           onChange={set('bank_name')} />
                                                                    <Input label="Account Holder Name" value={form.bank_account_name}   onChange={set('bank_account_name')} />
                                                                    <Input label="Account Number"      value={form.bank_account_number} onChange={set('bank_account_number')} />
                                                                    <Input label="IBAN"                value={form.bank_iban}           onChange={set('bank_iban')} />
                                                                    <Input label="SWIFT / BIC"         value={form.bank_swift}          onChange={set('bank_swift')} />
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Field label="Bank Name"           value={form.bank_name} />
                                                                    <Field label="Account Holder Name" value={form.bank_account_name} />
                                                                    <Field label="Account Number"      value={form.bank_account_number ? '••••' + form.bank_account_number.slice(-4) : ''} />
                                                                    <Field label="IBAN"                value={form.bank_iban} />
                                                                    <Field label="SWIFT / BIC"         value={form.bank_swift} />
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="border-t border-[var(--border-main)] pt-6">
                                                        <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500" />Tax & Legal</h3>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                            {isEditing ? (
                                                                <>
                                                                    <Input label="Tax ID Number"         value={form.tax_id}                 onChange={set('tax_id')} />
                                                                    <Input label="Social Security Number" value={form.social_security_number}  onChange={set('social_security_number')} />
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Field label="Tax ID Number"          value={form.tax_id} />
                                                                    <Field label="Social Security Number" value={form.social_security_number ? '••••' + form.social_security_number.slice(-4) : ''} />
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </form>
                                )}

                                {/* ── SECURITY (separate — no outer form) ──── */}
                                {activeTab === 'security' && (
                                    <div>
                                        <div className="px-6 sm:px-8 py-5 border-b border-[var(--border-main)]">
                                            <h2 className="text-xl font-black">Security</h2>
                                            <p className="text-[var(--text-muted)] text-xs mt-0.5">Change your password</p>
                                        </div>
                                        <div className="p-6 sm:p-8">
                                            <div className="max-w-md space-y-5">
                                                <div className="flex items-center gap-4 p-5 bg-blue-500/5 rounded-2xl border border-blue-500/20">
                                                    <Shield className="w-10 h-10 text-blue-600 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-sm">Secure your account</p>
                                                        <p className="text-xs text-[var(--text-soft)]">Use a strong password of at least 8 characters</p>
                                                    </div>
                                                </div>
                                                <Input label="Current Password"  type="password" value={passwordForm.old_password}    onChange={setP('old_password')} />
                                                <Input label="New Password"      type="password" value={passwordForm.new_password}    onChange={setP('new_password')} />
                                                <Input label="Confirm Password"  type="password" value={passwordForm.confirm_password} onChange={setP('confirm_password')} />
                                                <Button onClick={handlePasswordSubmit} loading={loading} className="w-full rounded-xl h-12 shadow-lg shadow-blue-600/20 font-bold">
                                                    Update Password
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;
