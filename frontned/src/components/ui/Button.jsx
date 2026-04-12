// Shared Button component with multiple variants
const Button = ({ children, type = 'button', onClick, loading, disabled, variant = 'primary', className = '', ...rest }) => {
    const variants = {
        primary: 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-lg shadow-blue-900/30',
        secondary: 'bg-[var(--bg-surface-soft)] hover:bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-main)]',
        ghost: 'bg-transparent hover:bg-[var(--bg-surface-soft)] text-[var(--text-soft)]',
        danger: 'bg-red-600 hover:bg-red-500 text-white',
        gold: 'bg-yellow-600 hover:bg-yellow-500 text-black font-semibold',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`
        flex items-center justify-center gap-2
        px-5 py-3 rounded-lg text-sm font-medium
        transition-all duration-200 w-full
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
            {...rest}
        >
            {loading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
            )}
            {children}
        </button>
    );
};

export default Button;
