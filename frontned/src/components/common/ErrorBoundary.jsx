import { Component } from 'react';

/**
 * Global error boundary — catches any unhandled render error in the tree below it.
 * Wrap around <App /> in main.jsx so the whole app is protected.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        // In production, forward to your error tracking service (e.g. Sentry):
        // import * as Sentry from '@sentry/react';
        // Sentry.captureException(error, { extra: errorInfo });
        console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    }

    handleReload = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.href = '/';
    };

    render() {
        if (!this.state.hasError) return this.props.children;

        const isDev = import.meta.env.DEV;

        return (
            <div
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-base, #f8fafc)',
                    padding: '2rem',
                    fontFamily: '"Inter", sans-serif',
                }}
            >
                <div
                    style={{
                        maxWidth: '560px',
                        width: '100%',
                        background: 'var(--bg-surface, #ffffff)',
                        borderRadius: '16px',
                        padding: '2.5rem',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                        textAlign: 'center',
                    }}
                >
                    {/* Icon */}
                    <div
                        style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '16px',
                            background: '#fef2f2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            fontSize: '2rem',
                        }}
                    >
                        ⚠️
                    </div>

                    <h1
                        style={{
                            fontSize: '1.375rem',
                            fontWeight: 700,
                            color: 'var(--text-main, #0f172a)',
                            marginBottom: '0.75rem',
                        }}
                    >
                        Something went wrong
                    </h1>

                    <p
                        style={{
                            color: 'var(--text-soft, #64748b)',
                            fontSize: '0.9375rem',
                            lineHeight: 1.6,
                            marginBottom: '2rem',
                        }}
                    >
                        An unexpected error occurred. The team has been notified.
                        You can try reloading the app.
                    </p>

                    <button
                        onClick={this.handleReload}
                        style={{
                            background: '#2563eb',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '0.75rem 2rem',
                            fontSize: '0.9375rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        Reload app
                    </button>

                    {/* Stack trace visible in development only */}
                    {isDev && this.state.error && (
                        <details
                            style={{
                                marginTop: '2rem',
                                textAlign: 'left',
                                background: '#1e293b',
                                borderRadius: '10px',
                                padding: '1rem',
                            }}
                        >
                            <summary
                                style={{
                                    color: '#f97316',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    marginBottom: '0.5rem',
                                }}
                            >
                                Developer details
                            </summary>
                            <pre
                                style={{
                                    color: '#e2e8f0',
                                    fontSize: '0.75rem',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    margin: 0,
                                }}
                            >
                                {this.state.error.toString()}
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </details>
                    )}
                </div>
            </div>
        );
    }
}

export default ErrorBoundary;
