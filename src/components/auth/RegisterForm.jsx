import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { GoogleLoginButton } from './GoogleLoginButton';

export const RegisterForm = () => {
    const { register, login } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        const result = await register(username, email, password, confirmPassword);
        
        if (result.success) {
            setSuccess(true);
            // Auto login after registration
            const autoLoginResult = await login(email, password);
            setLoading(false);
            if (autoLoginResult.success) {
                navigate('/');
            } else {
                setError('Registration successful! Please login manually.');
                setTimeout(() => navigate('/login'), 2000);
            }
        } else {
            setLoading(false);
            setError(result.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {success ? (
                <Alert type="success" message="Registration successful! Redirecting..." />
            ) : (
                <>
                    <Alert type="error" message={error} />

                    <Input
                        label="Username"
                        type="text"
                        id="username"
                        placeholder="john_doe"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    <Input
                        label="Email Address"
                        type="email"
                        id="email"
                        placeholder="name@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        id="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <Input
                        label="Confirm Password"
                        type="password"
                        id="confirmPassword"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        loading={loading}
                        className="w-full py-2.5 text-black font-bold shadow-md shadow-yellow-500/10 cursor-pointer"
                    >
                        Sign Up
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
                </>
            )}

            {/* Link to Login */}
            <p className="text-center text-xs text-gray-400 mt-6 font-medium">
                Already have an account?{' '}
                <Link
                    to="/login"
                    className="text-yellow-500 hover:text-yellow-400 font-bold cursor-pointer transition-colors"
                >
                    Log In
                </Link>
            </p>
        </form>
    );
};
