import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword, clearErrors, clearSuccess } from '../../store/authSlice.js';
import AuthLayout from '../../components/auth/AuthLayout.jsx';
import Input from '../../components/ui/Input.jsx';
import CodeInput from '../../components/ui/CodeInput.jsx';
import Button from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';

const ResetPasswordPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { loading, error, successMessage } = useSelector((state) => state.auth);
    const { t } = useSettings();

    const [form, setForm] = useState({
        email: searchParams.get('email') || '',
        code: '',
        password: '',
        confirm: ''
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
            const timer = setTimeout(() => navigate('/login'), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');

        if (form.code.length !== 6) {
            setFormError(t('invalidCode') || 'Verification code must be 6 digits');
            return;
        }
        if (form.password !== form.confirm) {
            setFormError(t('passwordsDoNotMatch') || 'Passwords do not match');
            return;
        }
        if (form.password.length < 8) {
            setFormError(t('passwordTooShort') || 'Password must be at least 8 characters');
            return;
        }

        dispatch(resetPassword({
            email: form.email,
            code: form.code,
            password: form.password
        }));
    };

    return (
        <AuthLayout title={t('resetPassword')} subtitle={t('resetPasswordDesc')}>
            {successMessage ? (
                <div className="text-center space-y-6 py-4">
                    <div className="w-20 h-20 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto animate-bounce">
                        <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-[var(--text-main)] font-bold text-xl">{t('passwordReset')}</h3>
                        <p className="text-[var(--text-soft)] text-sm mt-2">{successMessage}</p>
                        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            {t('redirectingToLogin')}
                        </div>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Alert type="error" message={error || formError} />

                    <div className="space-y-4">
                        <Input
                            id="email"
                            label={t('email')}
                            type="email"
                            placeholder="you@hotel.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />

                        <div className="pt-2">
                            <CodeInput
                                label={t('verificationCode')}
                                value={form.code}
                                onChange={(val) => setForm({ ...form, code: val })}
                                error={formError.includes('code') ? formError : null}
                            />
                        </div>

                        <div className="h-px bg-[var(--border-main)] my-4"></div>

                        <Input
                            id="password"
                            label={t('newPassword')}
                            type="password"
                            placeholder="Min. 8 characters"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                        />

                        {/* Password strength indicator */}
                        {form.password && (
                            <div className="space-y-2 px-1">
                                <div className="flex gap-1.5">
                                    {[...Array(4)].map((_, i) => {
                                        const strength = Math.min(
                                            Math.floor(form.password.length / 3) +
                                            (/[A-Z]/.test(form.password) ? 1 : 0) +
                                            (/[0-9]/.test(form.password) ? 1 : 0) +
                                            (/[^A-Za-z0-9]/.test(form.password) ? 1 : 0),
                                            4
                                        );
                                        const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
                                        return (
                                            <div
                                                key={i}
                                                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < strength ? colors[strength - 1] : 'bg-slate-700'}`}
                                            />
                                        );
                                    })}
                                </div>
                                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                                    {t('passwordStrengthAdvice')}
                                </p>
                            </div>
                        )}

                        <Input
                            id="confirm"
                            label={t('confirmPassword')}
                            type="password"
                            placeholder="Repeat new password"
                            value={form.confirm}
                            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                            required
                        />
                    </div>

                    <Button type="submit" loading={loading} className="w-full py-4 text-base font-semibold shadow-lg shadow-blue-900/20">
                        {loading ? t('resetting') : t('resetPasswordBtn')}
                    </Button>

                    <p className="text-center pt-2">
                        <Link to="/login" className="text-[var(--accent)] hover:text-[var(--accent-hover)] text-sm font-medium transition-colors">
                            {t('backToLogin')}
                        </Link>
                    </p>
                </form>
            )
            }
        </AuthLayout >
    );
};

export default ResetPasswordPage;
