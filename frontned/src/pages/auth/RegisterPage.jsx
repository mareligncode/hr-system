import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearErrors, clearSuccess } from '../../store/authSlice.js';
import AuthLayout from '../../components/auth/AuthLayout.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';

const RegisterPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, successMessage } = useSelector((state) => state.auth);
    const { t } = useSettings();

    const [form, setForm] = useState({
        employee_id: '',
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        password: '',
        confirm_password: '',
    });
    const [formError, setFormError] = useState('');

    useEffect(() => {
        return () => {
            dispatch(clearErrors());
            dispatch(clearSuccess());
        };
    }, [dispatch]);

    useEffect(() => {
        if (successMessage) {
            setTimeout(() => navigate('/login'), 3000);
        }
    }, [successMessage, navigate]);

    const handleChange = (e) => setForm({ ...form, [e.target.id]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        if (form.password !== form.confirm_password) {
            setFormError('Passwords do not match');
            return;
        }
        if (form.password.length < 8) {
            setFormError('Password must be at least 8 characters');
            return;
        }
        const { confirm_password, ...submitData } = form;
        dispatch(registerUser(submitData));
    };

    return (
        <AuthLayout
            title={t('createAccount')}
            subtitle={t('createAccountDesc')}
        >
            {successMessage ? (
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-900/40 border border-green-500/30 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-secondary font-semibold text-lg">Registration Successful!</h3>
                        <p className="text-muted text-sm mt-1">{successMessage}</p>
                        <p className="text-muted text-xs mt-3">Redirecting to login in 3 seconds…</p>
                    </div>
                    <Link to="/login" className="text-axent hover:text-axenthv text-sm">
                        {t('signIn')} →
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Alert type="error" message={error || formError} />

                    <div className="grid grid-cols-2 gap-4">
                        <Input id="first_name" label={t('firstName')} placeholder="John" value={form.first_name} onChange={handleChange} required />
                        <Input id="last_name" label={t('lastName')} placeholder="Smith" value={form.last_name} onChange={handleChange} required />
                    </div>

                    <Input
                        id="employee_id"
                        label={t('employeeId')}
                        placeholder="EMP-001"
                        value={form.employee_id}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        id="email"
                        label={t('email')}
                        type="email"
                        placeholder="john.smith@hotel.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        id="phone"
                        label={t('phone')}
                        type="tel"
                        placeholder="+1 234 567 8900"
                        value={form.phone}
                        onChange={handleChange}
                    />

                    <Input
                        id="password"
                        label={t('password')}
                        type="password"
                        placeholder="Min. 8 characters"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        id="confirm_password"
                        label={t('confirmPassword')}
                        type="password"
                        placeholder="Repeat password"
                        value={form.confirm_password}
                        onChange={handleChange}
                        required
                    />

                    <Button type="submit" loading={loading} className="mt-2">
                        {loading ? t('creatingAccount') : t('createAccount')}
                    </Button>

                    <p className="text-center text-secondary text-sm">
                        {t('haveAccount')}{' '}
                        <Link to="/login" className="text-axent hover:text-axenthv font-medium transition-colors">
                            {t('signIn')}
                        </Link>
                    </p>
                </form>
            )}
        </AuthLayout>
    );
};

export default RegisterPage;
