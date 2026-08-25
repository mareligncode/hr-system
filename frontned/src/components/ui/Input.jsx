const Input = ({ id, label, type = 'text', placeholder, value, onChange, error, required, disabled, className = '', ...rest }) => {
    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label
                    htmlFor={id}
                    className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] px-1"
                >
                    {label} {required && <span className="text-red-400">*</span>}
                </label>
            )}
            <input
                id={id}
                type={type}
                placeholder={placeholder}
                value={value ?? ''}
                onChange={onChange}
                required={required}
                disabled={disabled}
                className={`
                    w-full px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200
                    border outline-none
                    bg-[var(--bg-surface-soft)]
                    text-[var(--text-main)]
                    placeholder-[var(--text-muted)]
                    ${disabled
                        ? 'border-[var(--border-main)] opacity-70 cursor-not-allowed bg-[var(--bg-surface-soft)] text-[var(--text-main)]'
                        : 'border-[var(--border-main)] hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    }
                    ${error ? 'border-red-500 bg-red-500/5 focus:ring-red-500/20' : ''}
                    ${className}
                `}
                {...rest}
            />
            {error && <p className="text-xs text-red-400 mt-0.5 px-1">{error}</p>}
        </div>
    );
};

export default Input;
