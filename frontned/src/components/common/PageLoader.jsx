/**
 * PageLoader — shown by Suspense while a lazy-loaded page chunk is downloading.
 * Matches the app's design system (CSS variables from index.css).
 * Kept dependency-free (no MUI) so it renders even if MUI hasn't loaded yet.
 */
const PageLoader = () => {
    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-base, #f8fafc)',
                gap: '1.25rem',
            }}
        >
            {/* Spinning ring */}
            <div
                style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    border: '3px solid var(--border-main, #e2e8f0)',
                    borderTopColor: '#2563eb',
                    animation: 'page-loader-spin 0.7s linear infinite',
                }}
            />

            <p
                style={{
                    color: 'var(--text-muted, #94a3b8)',
                    fontSize: '0.9375rem',
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 500,
                    margin: 0,
                }}
            >
                Loading…
            </p>

            {/* Inject the keyframe animation once */}
            <style>{`
                @keyframes page-loader-spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

/**
 * ContentSkeleton — lightweight skeleton for individual sections inside a page.
 * Use when you know a section will take time (e.g. a dashboard card).
 *
 * <ContentSkeleton lines={4} />
 */
export const ContentSkeleton = ({ lines = 3 }) => {
    return (
        <div
            style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
            }}
        >
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    style={{
                        height: '14px',
                        borderRadius: '6px',
                        background: 'var(--border-main, #e2e8f0)',
                        width: i === lines - 1 ? '60%' : '100%',
                        animation: 'skeleton-pulse 1.5s ease-in-out infinite',
                    }}
                />
            ))}
            <style>{`
                @keyframes skeleton-pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
            `}</style>
        </div>
    );
};

/**
 * CardSkeleton — skeleton shaped like a dashboard stat card.
 */
export const CardSkeleton = () => (
    <div
        style={{
            borderRadius: '16px',
            background: 'var(--bg-surface, #fff)',
            border: '1px solid var(--border-main, #e2e8f0)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
        }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={skeletonStyle('40%', '14px')} />
            <div style={{ ...skeletonStyle('40px', '40px'), borderRadius: '10px' }} />
        </div>
        <div style={skeletonStyle('55%', '28px')} />
        <div style={skeletonStyle('70%', '12px')} />
        <style>{`
            @keyframes skeleton-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.4; }
            }
        `}</style>
    </div>
);

const skeletonStyle = (width, height) => ({
    width,
    height,
    borderRadius: '6px',
    background: 'var(--border-main, #e2e8f0)',
    animation: 'skeleton-pulse 1.5s ease-in-out infinite',
});

export default PageLoader;
