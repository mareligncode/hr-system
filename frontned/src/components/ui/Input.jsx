// Shared Input component with dark theme styling
const Input = ({ id, label, type = 'text', placeholder, value, onChange, error, required, ...rest }) => {
    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-[var(--text-soft)]">
                    {label} {required && <span className="text-red-400">*</span>}
                </label>
            )}
            <input
                id={id}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                className={`
          w-full px-4 py-3 rounded-lg text-sm transition-all duration-200
          outline-none focus:ring-2 focus:ring-blue-500
          bg-[var(--bg-input)] text-[var(--text-main)] placeholder-[var(--text-muted)]
          ${error ? 'border-red-500 bg-red-900/10' : 'border-[var(--border-input)] hover:border-[var(--text-muted)]'}
        `}
                {...rest}
            />
            {error && <p className="text-xs text-red-400 mt-0.5">{error}</p>}
        </div>
    );
};

export default Input;
