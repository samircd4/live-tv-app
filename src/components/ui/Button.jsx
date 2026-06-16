import React from 'react';

export const Button = ({
    children,
    type = 'button',
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    onClick,
    className = '',
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 cursor-pointer outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-950 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-yellow-500 text-black hover:bg-yellow-400 active:scale-[0.98]',
        secondary: 'bg-gray-800 text-white hover:bg-gray-700 active:scale-[0.98] border border-gray-700',
        danger: 'bg-red-600 text-white hover:bg-red-500 active:scale-[0.98]',
        ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-gray-900',
        gold: 'bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-black shadow-lg hover:shadow-yellow-500/20 hover:brightness-110 active:scale-[0.98]'
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
    };

    return (
        <button
            type={type}
            disabled={disabled || loading}
            onClick={onClick}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {loading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                </>
            ) : (
                children
            )}
        </button>
    );
};
