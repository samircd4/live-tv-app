import { axiosInstance } from './axiosInstance';

export const authService = {
    login: async (email, password) => {
        const response = await axiosInstance.post('/auth/login/', { email, password });
        return response.data; // Expects { access_token, refresh_token, or access, refresh }
    },

    register: async (username, email, password, confirmPassword) => {
        const response = await axiosInstance.post('/auth/register/', {
            username,
            email,
            password,
            confirm_password: confirmPassword
        });
        return response.data;
    },

    refresh: async (refreshToken) => {
        const response = await axiosInstance.post('/auth/refresh/', { refresh: refreshToken });
        return response.data;
    },

    logout: async (refreshToken) => {
        const response = await axiosInstance.post('/auth/logout/', { refresh: refreshToken });
        return response.data;
    },

    changePassword: async (oldPassword, newPassword, confirmPassword) => {
        const response = await axiosInstance.post('/auth/change-password/', {
            old_password: oldPassword,
            new_password: newPassword,
            confirm_password: confirmPassword
        });
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await axiosInstance.post('/auth/forgot-password/', { email });
        return response.data;
    },

    resetPassword: async (token, uidb64, newPassword, confirmPassword) => {
        const response = await axiosInstance.post('/auth/reset-password/', {
            token,
            uidb64,
            new_password: newPassword,
            confirm_password: confirmPassword
        });
        return response.data;
    },

    verifyEmail: async (key) => {
        const response = await axiosInstance.post('/auth/verify-email/', { key });
        return response.data;
    },

    resendVerification: async (email) => {
        const response = await axiosInstance.post('/auth/resend-verification-email/', { email });
        return response.data;
    },

    googleLogin: async (tokenId) => {
        const response = await axiosInstance.post('/auth/google/', { access_token: tokenId });
        return response.data;
    },

    getMe: async () => {
        const response = await axiosInstance.get('/customers/me/');
        return response.data;
    }
};
