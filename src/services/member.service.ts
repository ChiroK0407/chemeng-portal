import api from '../lib/axios';

export const memberService = {
  getAll: async (filters: Record<string, any> = {}) => {
    const res = await api.get('/members', { params: filters });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/members/${id}`);
    return res.data;
  },
  updateProfile: async (data: Record<string, any>) => {
    const res = await api.put('/members/me', data);
    return res.data;
  },
};