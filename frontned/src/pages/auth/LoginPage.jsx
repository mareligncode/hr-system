import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearErrors } from '../../store/authSlice.js';
import AuthLayout from '../../components/auth/AuthLayout.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';

const LoginPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
    const { t } = useSettings();

    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (isAuthenticated) navigate('/dashboard', { replace: true });
        return () => dispatch(clearErrors());
    }, [isAuthenticated, navigate, dispatch]);

    const handleChange = (e) => setForm({ ...form, [e.target.id]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(loginUser(form));
    };

    return (
        <AuthLayout
            title={t('signIn')}
            subtitle={t('signInDesc')}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <Alert type="error" message={error} />

                <Input
                    id="email"
                    label={t('email')}
                    type="email"
                    placeholder="you@hotel.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                />

                <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                        <label htmlFor="password" className="text-sm font-medium text-[var(--text-soft)]">
                            {t('password')} <span className="text-red-400">*</span>
                        </label>
                        <Link
                            to="/forgot-password"
                            className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                        >
                            {t('forgotPassword')}
                        </Link>
                    </div>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder={t('passwordPlaceholder') || 'Enter your password'}
                            value={form.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 pr-11 rounded-lg text-sm transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-500 bg-[var(--bg-input)] text-[var(--text-main)] border-[var(--border-input)] hover:border-[var(--text-muted)] placeholder-[var(--text-muted)]"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                <Button type="submit" loading={loading}>
                    {loading ? t('signingIn') : t('signIn')}
                </Button>

                <div className="pt-4 border-t border-[var(--border-input)] text-center">
                    <p className="text-sm text-[var(--text-soft)]">
                        Looking for a career? {' '}
                        <Link
                            to="/careers"
                            className="text-[var(--accent)] font-bold hover:underline"
                        >
                            View Open Positions
                        </Link>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
};

export default LoginPage;
