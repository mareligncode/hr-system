import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyEmail } from '../../store/authSlice.js';
import AuthLayout from '../../components/auth/AuthLayout.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';

const VerifyEmailPage = () => {
    const dispatch = useDispatch();
    const { token } = useParams();
    const { loading, error, successMessage } = useSelector((state) => state.auth);
    const { t } = useSettings();

    useEffect(() => {
        if (token) {
            dispatch(verifyEmail(token));
        }
    }, [token, dispatch]);

    return (
        <AuthLayout title={t('emailVerification')} subtitle={t('verifyingEmail')}>
            <div className="text-center space-y-6 py-4">
                {loading && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                        <p className="text-muted text-sm">{t('verifyingEmail')}</p>
                    </div>
                )}

                {!loading && successMessage && (
                    <>
                        <div className="w-20 h-20 bg-green-900/40 border-2 border-green-500/40 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-primary font-bold text-xl">{t('emailVerified')}</h3>
                            <p className="text-muted text-sm mt-2">{successMessage}</p>
                            <p className="text-secondary text-sm mt-1">{t('accountActiveSignIn')}</p>
                        </div>
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-axent hover:bg-axenthv text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            {t('signInNow')}
                        </Link>
                    </>
                )}

                {!loading && error && (
                    <>
                        <div className="w-20 h-20 bg-red-900/40 border-2 border-red-500/40 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-primary font-bold text-xl">{t('verificationFailed')}</h3>
                            <p className="text-muted text-sm mt-2">{error}</p>
                            <p className="text-secondary text-sm mt-1">{t('linkExpired')}</p>
                        </div>
                        <Link
                            to="/forgot-password"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-input border border-binput hover:bg-bdr text-primary rounded-lg text-sm font-medium transition-colors"
                        >
                            {t('requestNewLink')}
                        </Link>
                    </>
                )}

                {!loading && !successMessage && !error && !token && (
                    <div className="text-muted text-sm">{t('invalidVerificationLink')}</div>
                )}
            </div>
        </AuthLayout>
    );
};

export default VerifyEmailPage;
