import api from '../lib/axios';

export const authService = {
  forgotPassword: async (email: string) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },
  resetPassword: async (payload: Record<string, any>) => {
    const res = await api.post('/auth/reset-password', payload);
    return res.data;
  },
  verifyEmail: async (token: string) => {
    const res = await api.get(`/auth/verify-email/${token}`);
    return res.data;
  },
};