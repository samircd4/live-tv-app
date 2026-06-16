import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const Layout = ({ children, showFooter = true }) => {
    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans selection:bg-yellow-500 selection:text-black">
            {/* Header / Navbar */}
            <Navbar />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col">
                {children}
            </main>

            {/* Footer */}
            {showFooter && <Footer />}
        </div>
    );
};
