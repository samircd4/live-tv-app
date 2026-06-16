import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
    return (
        <footer className="bg-gray-950 border-t border-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Brand Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <img 
                            src="/logo.png" 
                            alt="Logo" 
                            className="h-7 w-auto object-contain"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <span className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                            SARKER <span className="text-white font-light text-sm">LIVE TV</span>
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
                        Enjoy high-quality live TV feeds from different territories instantly. Designed for high performance and premium viewing experience.
                    </p>
                </div>

                {/* Quick Navigation Links */}
                <div>
                    <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-4">Navigation</h4>
                    <ul className="space-y-2 text-xs">
                        <li>
                            <Link to="/" className="hover:text-yellow-400 cursor-pointer transition-colors">
                                Home
                            </Link>
                        </li>
                        <li>
                            <a
                                href="https://sarker.shop"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-yellow-400 cursor-pointer transition-colors"
                            >
                                Shop
                            </a>
                        </li>
                        <li>
                            <Link to="/about" className="hover:text-yellow-400 cursor-pointer transition-colors">
                                About Us
                            </Link>
                        </li>
                        <li>
                            <Link to="/contact" className="hover:text-yellow-400 cursor-pointer transition-colors">
                                Contact Us
                            </Link>
                        </li>
                        <li>
                            <Link to="/fifa-world-cup" className="hover:text-yellow-400 cursor-pointer transition-colors">
                                FIFA World Cup
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Legal Column */}
                <div>
                    <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-4">Legal</h4>
                    <ul className="space-y-2 text-xs">
                        <li>
                            <a href="#" className="hover:text-yellow-400 cursor-pointer transition-colors">
                                Privacy Policy
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-yellow-400 cursor-pointer transition-colors">
                                Terms of Service
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-yellow-400 cursor-pointer transition-colors">
                                DMCA Disclaimer
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Support Column */}
                <div>
                    <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-4">Support</h4>
                    <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                        Need assistance? Reach out to our technical support team available 24/7.
                    </p>
                    <Link
                        to="/contact"
                        className="inline-block px-4 py-2 bg-gray-900 border border-gray-800 text-xs font-bold text-gray-200 rounded-lg hover:bg-gray-800 hover:text-white cursor-pointer transition-colors"
                    >
                        Get Help
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto border-t border-gray-900 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-600 gap-4">
                <p>&copy; {new Date().getFullYear()} Sarker Live TV. All rights reserved.</p>
                <div className="flex items-center gap-4">
                    <a href="#" className="hover:text-yellow-500 cursor-pointer transition-colors">Facebook</a>
                    <a href="#" className="hover:text-yellow-500 cursor-pointer transition-colors">Twitter</a>
                    <a href="#" className="hover:text-yellow-500 cursor-pointer transition-colors">Instagram</a>
                </div>
            </div>
        </footer>
    );
};
