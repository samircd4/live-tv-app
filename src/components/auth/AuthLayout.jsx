import React from 'react';
import { Link } from 'react-router-dom';

export const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
            {/* Background decorative gradients */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-md z-10 space-y-6">
                {/* Brand Header */}
                <div className="text-center">
                    <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
                        <img 
                            src="/logo.png" 
                            alt="Logo" 
                            className="h-9 w-auto object-contain cursor-pointer transition-transform group-hover:scale-105"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <span className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 cursor-pointer">
                            SARKER <span className="text-white font-light text-base">LIVE TV</span>
                        </span>
                    </Link>
                    <h2 className="text-xl font-bold text-white tracking-wide">{title}</h2>
                    {subtitle && <p className="mt-1.5 text-xs text-gray-400 font-medium">{subtitle}</p>}
                </div>

                {/* Main Card Wrapper */}
                <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
                    {children}
                </div>

                {/* Back to homepage link */}
                <div className="text-center">
                    <Link 
                        to="/" 
                        className="text-xs font-semibold text-gray-500 hover:text-yellow-400 cursor-pointer transition-colors"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};
