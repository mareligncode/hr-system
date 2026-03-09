import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Briefcase, FileText, ChevronRight, ChevronLeft,
    Save, CheckCircle2, AlertCircle, Upload, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useSettings } from '../../context/SettingsContext';
import { fetchDepartments, fetchPositions } from '../../store/organizationSlice';
import employeeService from '../../services/employeeService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';

const EmployeeCreate = () => {
    const { t } = useSettings();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { departments, positions } = useSelector(state => state.organization);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        // Auth/Basic
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        profile_picture: null,
        password: '',

        // Professional
        department_id: '',
        position_id: '',
        hire_date: new Date().toISOString().split('T')[0],
        contract_type: 'permanent',
        employment_status: 'active',

        // Personal
        date_of_birth: '',
        gender: '',
        marital_status: '',
        address_line1: '',
        city: '',
        country: '',

        // Emergency
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relation: '',
    });

    useEffect(() => {
        dispatch(fetchDepartments());
        dispatch(fetchPositions());
    }, [dispatch]);

    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== '') {
                    submitData.append(key, formData[key]);
                }
            });

            await employeeService.createEmployee(submitData);
            navigate('/employees');
        } catch (err) {
            console.error(err);
            const apiError = err.response?.data;
            const errorMsg = apiError?.details || apiError?.error || apiError?.message || 'Failed to create employee';
            setError(errorMsg);
            setLoading(false);
        }
    };

    const steps = [
        { id: 1, title: 'Personal Information', icon: User },
        { id: 2, title: 'Professional Details', icon: Briefcase },
        { id: 3, title: 'Additional Info', icon: FileText }
    ];

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/employees')}
                    className="text-sm text-[var(--text-soft)] hover:text-blue-500 flex items-center gap-1 mb-2 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Directory
                </button>
                <h1 className="text-3xl font-bold text-[var(--text-main)] transition-colors">
                    Onboard New Staff
                </h1>
                <p className="text-[var(--text-soft)]">
                    Register a new hotel employee and set up their professional profile.
                </p>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between mb-12 bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border-main)] shadow-sm">
                {steps.map((s, idx) => {
                    const Icon = s.icon;
                    const isActive = step === s.id;
                    const isCompleted = step > s.id;

                    return (
                        <React.Fragment key={s.id}>
                            <div className="flex flex-col items-center gap-2 relative z-10">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/10' :
                                    isCompleted ? 'bg-emerald-500 text-white' : 'bg-[var(--bg-surface-soft)] text-[var(--text-muted)]'
                                    }`}>
                                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                                </div>
                                <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-blue-500' : 'text-[var(--text-muted)]'}`}>
                                    {s.title}
                                </span>
                            </div>
                            {idx < steps.length - 1 && (
                                <div className="flex-1 h-1 mx-4 bg-[var(--bg-surface-soft)] rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-blue-600"
                                        initial={{ width: '0%' }}
                                        animate={{ width: isCompleted ? '100%' : '0%' }}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {error && <Alert type="error" message={error} className="mb-6" />}

            {/* Form Content */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-3xl p-8 shadow-sm">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="First Name" name="first_name" value={formData.first_name}
                                        onChange={handleInputChange} required
                                    />
                                    <Input
                                        label="Last Name" name="last_name" value={formData.last_name}
                                        onChange={handleInputChange} required
                                    />
                                    <Input
                                        label="Email Address" name="email" type="email" value={formData.email}
                                        onChange={handleInputChange} required
                                    />
                                    <Input
                                        label="Phone Number" name="phone" value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                    <div className="space-y-1">
                                        <Input
                                            label="Temporary Password" name="password"
                                            value={formData.password} onChange={handleInputChange}
                                            placeholder="Defaults to Email if empty"
                                        />
                                        <p className="text-[10px] text-[var(--text-muted)] mt-1 px-1">
                                            If left blank, the employee's email will be used as their temporary password.
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-[var(--text-soft)]">Profile Picture</label>
                                        <input
                                            type="file" name="profile_picture" accept="image/*"
                                            onChange={handleInputChange}
                                            className="w-full text-sm text-[var(--text-soft)] file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-blue-500 hover:file:bg-blue-500/20 border border-[var(--border-input)] rounded-xl p-1"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-[var(--text-soft)]">Gender</label>
                                        <select
                                            name="gender" value={formData.gender} onChange={handleInputChange}
                                            className="w-full bg-[var(--bg-input)] border border-[var(--border-input)] rounded-xl py-3 px-4 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <Input
                                        label="Date of Birth" name="date_of_birth" type="date"
                                        value={formData.date_of_birth} onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-[var(--text-soft)]">Department</label>
                                        <select
                                            name="department_id" value={formData.department_id} onChange={handleInputChange} required
                                            className="w-full bg-[var(--bg-input)] border border-[var(--border-input)] rounded-xl py-3 px-4 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-[var(--text-soft)]">Position</label>
                                        <select
                                            name="position_id" value={formData.position_id} onChange={handleInputChange} required
                                            className="w-full bg-[var(--bg-input)] border border-[var(--border-input)] rounded-xl py-3 px-4 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        >
                                            <option value="">Select Position</option>
                                            {positions.filter(p => p.department_id === parseInt(formData.department_id)).map(p => (
                                                <option key={p.id} value={p.id}>{p.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <Input
                                        label="Hire Date" name="hire_date" type="date"
                                        value={formData.hire_date} onChange={handleInputChange} required
                                    />
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-[var(--text-soft)]">Contract Type</label>
                                        <select
                                            name="contract_type" value={formData.contract_type} onChange={handleInputChange}
                                            className="w-full bg-[var(--bg-input)] border border-[var(--border-input)] rounded-xl py-3 px-4 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        >
                                            <option value="permanent">Permanent</option>
                                            <option value="contract">Contract</option>
                                            <option value="intern">Intern</option>
                                            <option value="part_time">Part Time</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-8">
                                <div className="bg-[var(--bg-surface-soft)] p-6 rounded-2xl">
                                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-blue-500" />
                                        Emergency Contact
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="Contact Name" name="emergency_contact_name"
                                            value={formData.emergency_contact_name} onChange={handleInputChange}
                                        />
                                        <Input
                                            label="Relationship" name="emergency_contact_relation"
                                            value={formData.emergency_contact_relation} onChange={handleInputChange}
                                        />
                                        <Input
                                            label="Phone Number" name="emergency_contact_phone"
                                            value={formData.emergency_contact_phone} onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <Input label="Address Line 1" name="address_line1" value={formData.address_line1} onChange={handleInputChange} />
                                    <div className="grid grid-cols-2 gap-6">
                                        <Input label="City" name="city" value={formData.city} onChange={handleInputChange} />
                                        <Input label="Country" name="country" value={formData.country} onChange={handleInputChange} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Actions */}
                <div className="flex items-center justify-between mt-12 pt-8 border-t border-[var(--border-main)]">
                    <Button
                        type="button" variant="secondary" onClick={prevStep}
                        disabled={step === 1 || loading} className="flex items-center gap-2 px-8"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                    </Button>

                    {step < 3 ? (
                        <Button
                            type="button" onClick={nextStep}
                            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-10 shadow-lg shadow-blue-500/20"
                        >
                            Next Step
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button
                            type="button" onClick={handleSubmit} loading={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-10 shadow-lg shadow-blue-500/20"
                        >
                            <Save className="w-4 h-4" />
                            Complete Registration
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmployeeCreate;
