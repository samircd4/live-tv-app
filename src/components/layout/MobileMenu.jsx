import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const MobileMenu = ({ isOpen, onClose }) => {
    const { isAuthenticated, logout, user } = useAuth();
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            ></div>

            {/* Menu Drawer */}
            <div className="relative ml-auto flex h-full w-72 max-w-sm flex-col bg-gray-950 border-l border-gray-800 p-6 shadow-2xl transition-transform duration-300 transform translate-x-0">
                {/* Close button */}
                <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
                    <span className="text-sm font-bold text-gray-400">Navigation</span>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white cursor-pointer p-1 rounded-lg hover:bg-gray-900 transition-colors"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
                    {/* FIFA WORLD CUP Link */}
                    <Link
                        to="/fifa-world-cup"
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500/20 via-amber-500/10 to-orange-500/20 border border-yellow-500/30 text-yellow-400 font-extrabold cursor-pointer hover:brightness-110 transition-all text-center justify-center animate-pulse"
                    >
                        🏆 FIFA World Cup
                    </Link>

                    <a
                        href="https://sarker.shop"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-4 py-2 text-base font-semibold text-gray-300 hover:text-white rounded-lg hover:bg-gray-900 cursor-pointer transition-colors"
                    >
                        🛍️ Go to Shop
                    </a>

                    <Link
                        to="/about"
                        onClick={onClose}
                        className="flex items-center px-4 py-2 text-base font-semibold text-gray-300 hover:text-white rounded-lg hover:bg-gray-900 cursor-pointer transition-colors"
                    >
                        ℹ️ About Us
                    </Link>

                    <Link
                        to="/contact"
                        onClick={onClose}
                        className="flex items-center px-4 py-2 text-base font-semibold text-gray-300 hover:text-white rounded-lg hover:bg-gray-900 cursor-pointer transition-colors"
                    >
                        📞 Contact Us
                    </Link>

                    {/* Authenticated user links */}
                    {isAuthenticated ? (
                        <div className="border-t border-gray-800 pt-6 mt-4 flex flex-col gap-3">
                            <div className="px-4 py-2 bg-gray-900/40 border border-gray-800/80 rounded-xl mb-2">
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Account</p>
                                <p className="text-sm font-bold text-gray-200 truncate mt-1">{user?.email || 'Premium User'}</p>
                            </div>

                            <button
                                onClick={() => {
                                    alert('Profile Section is currently under maintenance.');
                                    onClose();
                                }}
                                className="flex w-full items-center px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-900 cursor-pointer rounded-lg transition-colors"
                            >
                                Profile
                            </button>
                            <button
                                onClick={() => {
                                    window.open('https://sarker.shop/account', '_blank');
                                    onClose();
                                }}
                                className="flex w-full items-center px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-900 cursor-pointer rounded-lg transition-colors"
                            >
                                Subscription
                            </button>
                            <button
                                onClick={() => {
                                    alert('Settings Section is currently under maintenance.');
                                    onClose();
                                }}
                                className="flex w-full items-center px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-900 cursor-pointer rounded-lg transition-colors"
                            >
                                Settings
                            </button>
                            <button
                                onClick={() => {
                                    logout();
                                    onClose();
                                }}
                                className="flex w-full items-center px-4 py-2.5 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-950/20 cursor-pointer rounded-lg transition-colors mt-2"
                            >
                                Log out
                            </button>
                        </div>
                    ) : (
                        <div className="border-t border-gray-800 pt-6 mt-4 flex flex-col gap-3">
                            <Link
                                to="/login"
                                onClick={onClose}
                                className="flex justify-center items-center px-4 py-2.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-sm font-bold text-white rounded-lg cursor-pointer transition-all active:scale-95"
                            >
                                Log In
                            </Link>
                            <Link
                                to="/register"
                                onClick={onClose}
                                className="flex justify-center items-center px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-sm font-bold text-black rounded-lg cursor-pointer transition-all active:scale-95 shadow-md shadow-yellow-500/10"
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
