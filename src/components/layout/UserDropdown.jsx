import React, { useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export const UserDropdown = ({ isOpen, onClose }) => {
    const { logout, user } = useAuth();
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={dropdownRef}
            className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-gray-800 bg-gray-900/95 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 divide-y divide-gray-800 focus:outline-none z-50 animate-fade-in"
        >
            <div className="px-4 py-3">
                <p className="text-xs text-gray-400 font-medium">Signed in as</p>
                <p className="text-sm font-bold text-white truncate mt-0.5">{user?.email || 'Premium User'}</p>
                {user?.username && (
                    <p className="text-xs text-yellow-500 font-semibold mt-0.5">@{user.username}</p>
                )}
            </div>
            
            <div className="py-1.5">
                <button
                    onClick={() => {
                        alert('Profile Section is currently under maintenance.');
                        onClose();
                    }}
                    className="group flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/80 cursor-pointer font-medium transition-colors"
                >
                    <span className="mr-3 text-base">👤</span> Profile
                </button>
                <button
                    onClick={() => {
                        window.open('https://sarker.shop/account', '_blank');
                        onClose();
                    }}
                    className="group flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/80 cursor-pointer font-medium transition-colors"
                >
                    <span className="mr-3 text-base">💳</span> Subscription
                </button>
                <button
                    onClick={() => {
                        alert('Settings Section is currently under maintenance.');
                        onClose();
                    }}
                    className="group flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/80 cursor-pointer font-medium transition-colors"
                >
                    <span className="mr-3 text-base">⚙️</span> Settings
                </button>
            </div>

            <div className="py-1.5">
                <button
                    onClick={() => {
                        logout();
                        onClose();
                    }}
                    className="group flex w-full items-center px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/20 cursor-pointer font-bold transition-colors"
                >
                    <span className="mr-3 text-base text-red-400">🚪</span> Log out
                </button>
            </div>
        </div>
    );
};
