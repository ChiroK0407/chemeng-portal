import api from '../lib/axios';

export const blogService = {
  getAll: async (filters: Record<string, any> = {}) => {
    const res = await api.get('/blogs', { params: filters });
    return res.data;
  },
  getBySlug: async (slug: string) => {
    const res = await api.get(`/blogs/${slug}`);
    return res.data;
  },
  create: async (data: Record<string, any>) => {
    const res = await api.post('/blogs', data);
    return res.data;
  },
  update: async (slug: string, data: Record<string, any>) => {
    const res = await api.put(`/blogs/${slug}`, data);
    return res.data;
  },
  delete: async (slug: string) => {
    const res = await api.delete(`/blogs/${slug}`);
    return res.data;
  },
};