import api from '../lib/axios';

export const resourceService = {
  getAll: async (filters: Record<string, any> = {}) => {
    const res = await api.get('/resources', { params: filters });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/resources/${id}`);
    return res.data;
  },
  getCategories: async () => {
    const res = await api.get('/resources/categories');
    return res.data;
  },
  create: async (data: Record<string, any>) => {
    const res = await api.post('/resources', data);
    return res.data;
  },
  update: async (id: string, data: Record<string, any>) => {
    const res = await api.put(`/resources/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/resources/${id}`);
    return res.data;
  },
};