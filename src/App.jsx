import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Global Context and Security Gate
import { AuthProvider } from './context/AuthContext';

// Import Page Components
import { CountriesPage } from './pages/CountriesPage';
import { ChannelsPage } from './pages/ChannelsPage';
import { WatchPage } from './pages/WatchPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { FifaWorldCupPage } from './pages/FifaWorldCupPage';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Auth Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                    {/* Public Info & Navigation Routes */}
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/fifa-world-cup" element={<FifaWorldCupPage />} />

                    {/* Player View: Live Stream + Sidebar + Dynamic Product Ads (Homepage) */}
                    <Route path="/" element={<WatchPage />} />
                    <Route
                        path="/watch/:channelId"
                        element={<WatchPage />}
                    />

                    {/* Global Catch-all: Redirect unknown paths to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;