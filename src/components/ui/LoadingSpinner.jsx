import React from 'react';

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
    const sizes = {
        sm: 'w-6 h-6 border-2',
        md: 'w-10 h-10 border-3',
        lg: 'w-16 h-16 border-4'
    };

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <div className={`${sizes[size]} border-t-yellow-500 border-gray-800 rounded-full animate-spin`}></div>
        </div>
    );
};
