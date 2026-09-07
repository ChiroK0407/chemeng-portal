import api from '../lib/axios';

export const projectService = {
  getAll: async (filters: Record<string, any> = {}) => {
    const res = await api.get('/projects', { params: filters });
    return res.data;
  },
  getBySlug: async (slug: string) => {
    const res = await api.get(`/projects/${slug}`);
    return res.data;
  },
  create: async (data: Record<string, any>) => {
    const res = await api.post('/projects', data);
    return res.data;
  },
  update: async (slug: string, data: Record<string, any>) => {
    const res = await api.put(`/projects/${slug}`, data);
    return res.data;
  },
  delete: async (slug: string) => {
    const res = await api.delete(`/projects/${slug}`);
    return res.data;
  },
};