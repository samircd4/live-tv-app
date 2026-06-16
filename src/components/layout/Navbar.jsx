import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserDropdown } from './UserDropdown';
import { MobileMenu } from './MobileMenu';

export const Navbar = () => {
    const { isAuthenticated, user } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-8 py-3.5 flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center gap-4">
                <Link to="/" className="flex items-center gap-3 cursor-pointer group">
                    <img 
                        src="/logo.png" 
                        alt="Sarker Live TV Logo" 
                        className="h-8 w-auto object-contain cursor-pointer transition-transform group-hover:scale-105" 
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                    <span className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 cursor-pointer">
                        LIVE TV
                    </span>
                </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6">
                <a
                    href="https://sarker.shop"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-gray-300 hover:text-white cursor-pointer transition-colors"
                >
                    Go to Shop
                </a>
                <Link
                    to="/about"
                    className="text-sm font-semibold text-gray-300 hover:text-white cursor-pointer transition-colors"
                >
                    About Us
                </Link>
                <Link
                    to="/contact"
                    className="text-sm font-semibold text-gray-300 hover:text-white cursor-pointer transition-colors"
                >
                    Contact Us
                </Link>
                
                {/* FIFA World Cup Highlighted Button */}
                <Link
                    to="/fifa-world-cup"
                    className="relative px-4 py-1.5 rounded-lg bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-black text-xs font-black uppercase tracking-wider cursor-pointer shadow-md hover:shadow-yellow-500/20 transition-all hover:scale-105"
                >
                    🏆 FIFA World Cup
                </Link>
            </nav>

            {/* Right Action / Auth Panel */}
            <div className="flex items-center gap-4">
                {isAuthenticated ? (
                    /* User Dropdown Trigger */
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-800 transition-colors cursor-pointer border border-gray-800 hover:border-gray-700 outline-none"
                        >
                            {/* User Avatar */}
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-sm font-black text-black select-none">
                                {user?.avatar || user?.avatar_url || user?.profile_picture ? (
                                    <img 
                                        src={user.avatar || user.avatar_url || user.profile_picture} 
                                        alt={user.username || 'User'} 
                                        className="w-full h-full object-cover" 
                                    />
                                ) : (
                                    user?.username?.substring(0, 1).toUpperCase() || user?.email?.substring(0, 1).toUpperCase() || 'U'
                                )}
                            </div>
                            <span className="hidden sm:inline text-xs font-bold text-gray-200 pr-1">
                                {user?.username || 'Account'}
                            </span>
                            <svg className="w-4 h-4 text-gray-400 hidden sm:inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        
                        {/* Dropdown Menu */}
                        <UserDropdown isOpen={dropdownOpen} onClose={() => setDropdownOpen(false)} />
                    </div>
                ) : (
                    /* Auth Action Buttons */
                    <div className="hidden lg:flex items-center gap-3">
                        <Link
                            to="/login"
                            className="px-3 py-1.5 text-xs font-bold text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
                        >
                            Log In
                        </Link>
                        <Link
                            to="/register"
                            className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold rounded-lg cursor-pointer transition-all hover:scale-[1.02] shadow-sm shadow-yellow-500/10"
                        >
                            Register
                        </Link>
                    </div>
                )}

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="lg:hidden p-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white cursor-pointer hover:bg-gray-700 transition-colors"
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                </button>
            </div>

            {/* Mobile Menu Slide-in Drawer */}
            <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        </header>
    );
};
