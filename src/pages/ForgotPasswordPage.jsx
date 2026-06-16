import React from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';

export const ForgotPasswordPage = () => {
    return (
        <AuthLayout 
            title="Recover Password" 
            subtitle="Let us help you reset your account credentials safely"
        >
            <ForgotPasswordForm />
        </AuthLayout>
    );
};
export default ForgotPasswordPage;
