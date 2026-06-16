import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { GoogleLoginButton } from './GoogleLoginButton';

export const LoginForm = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);
        setLoading(false);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Alert type="error" message={error} />

            <Input
                label="Email Address"
                type="email"
                id="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />

            <div className="space-y-1">
                <div className="flex justify-between items-center">
                    <label htmlFor="password" className="text-xs font-semibold text-gray-300 tracking-wide">
                        Password <span className="text-red-500">*</span>
                    </label>
                    <Link
                        to="/forgot-password"
                        className="text-xs text-yellow-500 hover:text-yellow-400 font-semibold cursor-pointer transition-colors"
                    >
                        Forgot password?
                    </Link>
                </div>
                <Input
                    type="password"
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>

            <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full py-2.5 text-black font-bold shadow-md shadow-yellow-500/10 cursor-pointer"
            >
                Sign In
            </Button>

            {/* Divider */}
            <div className="relative my-6 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-800"></div>
                </div>
                <span className="relative bg-gray-900 px-3 text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                    Or continue with
                </span>
            </div>

            {/* Google Login */}
            <GoogleLoginButton
                onSuccess={() => navigate('/')}
                onFailure={(msg) => setError(msg)}
            />

            {/* Link to Register */}
            <p className="text-center text-xs text-gray-400 mt-6 font-medium">
                Don't have an account?{' '}
                <Link
                    to="/register"
                    className="text-yellow-500 hover:text-yellow-400 font-bold cursor-pointer transition-colors"
                >
                    Create Account
                </Link>
            </p>
        </form>
    );
};
