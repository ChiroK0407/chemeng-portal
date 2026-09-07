import api from '../lib/axios';

export const eventService = {
  getAll: async (filters: Record<string, any> = {}) => {
    const res = await api.get('/events', { params: filters });
    return res.data;
  },
  getBySlug: async (slug: string) => {
    const res = await api.get(`/events/${slug}`);
    return res.data;
  },
  create: async (data: Record<string, any>) => {
    const res = await api.post('/events', data);
    return res.data;
  },
  update: async (slug: string, data: Record<string, any>) => {
    const res = await api.put(`/events/${slug}`, data);
    return res.data;
  },
  delete: async (slug: string) => {
    const res = await api.delete(`/events/${slug}`);
    return res.data;
  },
  rsvp: async (slug: string) => {
    const res = await api.post(`/events/${slug}/rsvp`);
    return res.data;
  },
  cancelRsvp: async (slug: string) => {
    const res = await api.delete(`/events/${slug}/rsvp`);
    return res.data;
  },
};