import React, { useRef, useState, useEffect } from 'react';

const CodeInput = ({ length = 6, value, onChange, label, error }) => {
    const [code, setCode] = useState(Array(length).fill(''));
    const inputs = useRef([]);

    // Synchronize local state with prop value if it changes externally (e.g. paste)
    useEffect(() => {
        if (value && value.length === length) {
            setCode(value.split(''));
        }
    }, [value, length]);

    const handleChange = (e, index) => {
        const val = e.target.value;
        if (isNaN(val)) return;

        const newCode = [...code];
        // Only take the last character if multiple are entered (handled by focus move)
        newCode[index] = val.slice(-1);
        setCode(newCode);

        const combinedCode = newCode.join('');
        onChange(combinedCode);

        // Move to next input if value is entered
        if (val && index < length - 1) {
            inputs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, length).split('');
        if (pastedData.some(char => isNaN(char))) return;

        const newCode = [...code];
        pastedData.forEach((char, i) => {
            if (i < length) newCode[i] = char;
        });

        setCode(newCode);
        onChange(newCode.join(''));

        // Focus the last input or the next empty one
        const lastIndex = Math.min(pastedData.length, length - 1);
        inputs.current[lastIndex].focus();
    };

    return (
        <div className="space-y-2">
            {label && <label className="block text-sm font-medium text-secondary">{label}</label>}
            <div className="flex gap-2 justify-between">
                {code.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => (inputs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onPaste={handlePaste}
                        className={`w-12 h-14 text-center text-xl font-bold bg-slate-800/50 border ${error ? 'border-red-500' : 'border-slate-700'
                            } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-axent focus:border-transparent transition-all`}
                    />
                ))}
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
};

export default CodeInput;
