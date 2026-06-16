import React from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { RegisterForm } from '../components/auth/RegisterForm';

export const RegisterPage = () => {
    return (
        <AuthLayout 
            title="Create an Account" 
            subtitle="Sign up now to get full premium access to Live TV streaming zones"
        >
            <RegisterForm />
        </AuthLayout>
    );
};
export default RegisterPage;
