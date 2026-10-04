import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';

export interface EventFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  isOnline?: boolean;
}

export function useEvents(filters: EventFilters) {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: async () => (await api.get('/events', { params: filters })).data,
    placeholderData: (previousData) => previousData,
  });
}

export function useEvent(slug: string) {
  return useQuery({
    queryKey: ['event', slug],
    queryFn: async () => (await api.get(`/events/${slug}`)).data?.data,
    enabled: !!slug,
  });
}
