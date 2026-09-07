import api from '../lib/axios';

export const psuService = {
  getAll: async (filters: Record<string, any> = {}) => {
    const res = await api.get('/psus', { params: filters });
    return res.data;
  },
  getBySlug: async (slug: string) => {
    const res = await api.get(`/psus/${slug}`);
    return res.data;
  },
  create: async (data: Record<string, any>) => {
    const res = await api.post('/psus', data);
    return res.data;
  },
  update: async (slug: string, data: Record<string, any>) => {
    const res = await api.put(`/psus/${slug}`, data);
    return res.data;
  },
  delete: async (slug: string) => {
    const res = await api.delete(`/psus/${slug}`);
    return res.data;
  },
};