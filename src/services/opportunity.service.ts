import api from '../lib/axios';

export const opportunityService = {
  getAll: async (filters: Record<string, any> = {}) => {
    const res = await api.get('/opportunities', { params: filters });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/opportunities/${id}`);
    return res.data;
  },
  create: async (data: Record<string, any>) => {
    const res = await api.post('/opportunities', data);
    return res.data;
  },
  update: async (id: string, data: Record<string, any>) => {
    const res = await api.put(`/opportunities/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/opportunities/${id}`);
    return res.data;
  },
  bookmark: async (id: string) => {
    const res = await api.post(`/opportunities/${id}/bookmark`);
    return res.data;
  },
};