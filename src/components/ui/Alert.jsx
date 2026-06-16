import React from 'react';

export const Alert = ({ type = 'error', message, className = '' }) => {
    if (!message) return null;

    const styles = {
        error: 'bg-red-950/40 border border-red-500/30 text-red-400',
        success: 'bg-green-950/40 border border-green-500/30 text-green-400',
        warning: 'bg-yellow-950/40 border border-yellow-500/30 text-yellow-400',
        info: 'bg-blue-950/40 border border-blue-500/30 text-blue-400'
    };

    const icons = {
        error: '⚠️',
        success: '✅',
        warning: '⚡',
        info: 'ℹ️'
    };

    return (
        <div className={`p-4 rounded-xl text-sm flex items-start gap-3 ${styles[type]} ${className}`}>
            <span className="text-base shrink-0">{icons[type]}</span>
            <div className="flex-1 font-medium leading-relaxed">{message}</div>
        </div>
    );
};
