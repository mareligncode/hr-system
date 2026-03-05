import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword, clearErrors, clearSuccess } from '../../store/authSlice.js';
import AuthLayout from '../../components/auth/AuthLayout.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';

const ForgotPasswordPage = () => {
    const dispatch = useDispatch();
    const { loading, error, successMessage } = useSelector((state) => state.auth);
    const { t } = useSettings();
    const [email, setEmail] = useState('');

    useEffect(() => {
        return () => {
            dispatch(clearErrors());
            dispatch(clearSuccess());
        };
    }, [dispatch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(forgotPassword(email));
    };

    return (
        <AuthLayout
            title={t('forgotPasswordTitle')}
            subtitle={t('forgotPasswordDesc')}
        >
            {successMessage ? (
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-[var(--text-main)] font-semibold text-lg">{t('checkEmail')}</h3>
                        <p className="text-[var(--text-soft)] text-sm mt-1">{successMessage}</p>
                        <p className="text-[var(--text-muted)] text-xs mt-3">{t('codeInstructions') || 'Once you have the code, proceed to reset your password.'}</p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <Link to="/reset-password" name="reset-link" className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            {t('resetPasswordBtn')}
                        </Link>
                        <Link to="/login" className="text-[var(--text-soft)] hover:text-[var(--text-main)] text-sm transition-colors">
                            {t('backToLogin')}
                        </Link>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                    <Alert type="error" message={error} />

                    <Input
                        id="email"
                        label={t('email')}
                        type="email"
                        placeholder="you@hotel.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <Button type="submit" loading={loading}>
                        {loading ? t('sending') : t('sendResetLink')}
                    </Button>

                    <p className="text-center">
                        <Link to="/login" className="text-[var(--accent)] hover:text-[var(--accent-hover)] text-sm transition-colors font-medium">
                            {t('backToLogin')}
                        </Link>
                    </p>
                </form>
            )}
        </AuthLayout>
    );
};

export default ForgotPasswordPage;
