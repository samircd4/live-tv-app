import { useEffect, useState } from 'react';
import { authService } from '../../api/authService';
import { useAuth } from '../../context/AuthContext';

export const GoogleLoginButton = ({ onSuccess, onFailure }) => {
    const { setIsAuthenticated, fetchUserProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [tokenClient, setTokenClient] = useState(null);

    useEffect(() => {
        const scriptId = 'google-gsi-client';
        let script = document.getElementById(scriptId);

        const initializeGoogleSignIn = () => {
            if (!window.google) return;

            try {
                const client = window.google.accounts.oauth2.initTokenClient({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                    scope: 'openid email profile',
                    callback: handleTokenResponse,
                });
                setTokenClient(client);
            } catch (err) {
                console.error('Failed to initialize Google Sign In:', err);
            }
        };

        const handleTokenResponse = async (response) => {
            if (response.error) {
                console.error('Google Sign In Error:', response.error);
                if (onFailure) onFailure(response.error_description || 'Google Authentication aborted.');
                return;
            }

            if (!response.access_token) {
                return;
            }

            setLoading(true);
            try {
                const data = await authService.googleLogin(response.access_token);
                const token = data.access_token || data.access;
                const refresh = data.refresh_token || data.refresh;
                
                if (token) localStorage.setItem('access_token', token);
                if (refresh) localStorage.setItem('refresh_token', refresh);
                
                setIsAuthenticated(true);
                await fetchUserProfile();
                if (onSuccess) onSuccess();
            } catch (error) {
                console.error('Google login backend failure:', error);
                const msg = error.response?.data?.detail || 'Google authentication failed on backend.';
                if (onFailure) onFailure(msg);
            } finally {
                setLoading(false);
            }
        };

        if (!script) {
            script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.id = scriptId;
            script.async = true;
            script.defer = true;
            script.onload = initializeGoogleSignIn;
            document.body.appendChild(script);
        } else {
            initializeGoogleSignIn();
        }
    }, [onSuccess, onFailure, setIsAuthenticated, fetchUserProfile]);

    const handleGoogleLoginClick = () => {
        if (tokenClient) {
            tokenClient.requestAccessToken();
        } else {
            console.error('Google token client not initialized.');
        }
    };

    return (
        <div className="w-full flex flex-col gap-2">
            <button
                type="button"
                onClick={handleGoogleLoginClick}
                disabled={loading || !tokenClient}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-md font-semibold text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 shadow-sm"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                </svg>
                <span>Sign in with Google</span>
            </button>
            {loading && (
                <p className="text-[10px] text-gray-400 text-center font-semibold animate-pulse">
                    Connecting with Google...
                </p>
            )}
        </div>
    );
};
