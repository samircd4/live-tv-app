import React from 'react';

export const Input = ({
    label,
    type = 'text',
    id,
    error,
    placeholder,
    value,
    onChange,
    className = '',
    required = false,
    ...props
}) => {
    return (
        <div className="w-full flex flex-col gap-1.5">
            {label && (
                <label htmlFor={id} className="text-xs font-semibold text-gray-300 tracking-wide">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <input
                type={type}
                id={id}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                className={`w-full px-4 py-2.5 bg-gray-900 border ${
                    error ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-800 focus:ring-yellow-500/20'
                } rounded-lg text-sm text-white placeholder-gray-500 outline-none focus:ring-4 transition-all duration-200 ${className}`}
                {...props}
            />
            {error && (
                <span className="text-[11px] text-red-500 font-semibold tracking-wide mt-0.5">
                    {error}
                </span>
            )}
        </div>
    );
};
