import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/axios';

export interface EventFilters {
  page?: number;
  limit?: number;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  search?: string;
  isOnline?: boolean;
}

export function useEvents(filters: EventFilters) {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: async () => {
      const res = await api.get('/events', { params: filters });
      return res.data; // Format: { success: true, data: [...], featured: {...} }
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useEvent(slug: string) {
  return useQuery({
    queryKey: ['event', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Missing target slug path.');
      const res = await api.get(`/events/${slug}`);
      return res.data?.data || res.data;
    },
    enabled: !!slug,
  });
}

export function useRSVP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const res = await api.post(`/events/${eventId}/rsvp`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event'] });
    }
  });
}