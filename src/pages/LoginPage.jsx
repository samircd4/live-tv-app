import React from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { LoginForm } from '../components/auth/LoginForm';

export const LoginPage = () => {
    return (
        <AuthLayout 
            title="Welcome Back" 
            subtitle="Sign in to your account to start streaming live TV"
        >
            <LoginForm />
        </AuthLayout>
    );
};
export default LoginPage;
