import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../api/authService';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';

export const ForgotPasswordForm = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await authService.forgotPassword(email);
            setSuccess('If the email is registered, we have sent a reset link to your email address.');
            setEmail('');
        } catch (err) {
            console.error('Forgot password error:', err);
            setError(err.response?.data?.detail || err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Alert type="error" message={error} />
            <Alert type="success" message={success} />

            {!success && (
                <>
                    <p className="text-xs text-gray-400 font-medium leading-relaxed mb-2">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>

                    <Input
                        label="Email Address"
                        type="email"
                        id="email"
                        placeholder="name@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        loading={loading}
                        className="w-full py-2.5 text-black font-bold shadow-md shadow-yellow-500/10 cursor-pointer"
                    >
                        Send Reset Link
                    </Button>
                </>
            )}

            <p className="text-center text-xs text-gray-400 mt-6 font-medium">
                Remember your password?{' '}
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
