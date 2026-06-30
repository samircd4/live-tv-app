import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = async () => {
        try {
            const userData = await authService.getMe();
            setUser(userData);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
            logoutLocally();
        }
    };

    const logoutLocally = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setIsAuthenticated(false);
        setUser(null);
    };

    useEffect(() => {
        const initializeAuth = async () => {
            const accessToken = localStorage.getItem('access_token');
            if (accessToken) {
                await fetchUserProfile();
            }
            setLoading(false);
        };
        initializeAuth();
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const data = await authService.login(email, password);
            const token = data.access_token || data.access;
            const refresh = data.refresh_token || data.refresh;

            if (token) localStorage.setItem('access_token', token);
            if (refresh) localStorage.setItem('refresh_token', refresh);

            setIsAuthenticated(true);
            await fetchUserProfile();
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Invalid email or password';
            return { success: false, message: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    const register = async (username, email, password, confirmPassword) => {
        setLoading(true);
        try {
            await authService.register(username, email, password, confirmPassword);
            return { success: true };
        } catch (error) {
            console.error('Registration error:', error);
            let errorMsg = 'Failed to register';
            if (error.response?.data) {
                const data = error.response.data;
                if (typeof data === 'string') {
                    errorMsg = data;
                } else {
                    const firstKey = Object.keys(data)[0];
                    const firstVal = data[firstKey];
                    errorMsg = Array.isArray(firstVal) ? firstVal[0] : JSON.stringify(firstVal);
                    if (firstKey !== 'detail' && firstKey !== 'non_field_errors') {
                        errorMsg = `${firstKey}: ${errorMsg}`;
                    }
                }
            }
            return { success: false, message: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
            try {
                await authService.logout(refreshToken);
            } catch (error) {
                console.error('Logout error on backend:', error);
            }
        }
        logoutLocally();
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, loading, login, register, logout, setUser, setIsAuthenticated, fetchUserProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
