import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';

export interface ResourceFilters {
  page?: number;
  limit?: number;
  type?: string;
  search?: string;
  subject?: string;
  semester?: string;
}

export function useResources(filters: ResourceFilters) {
  return useQuery({
    queryKey: ['resources', filters],
    queryFn: async () => (await api.get('/resources', { params: filters })).data,
    placeholderData: (previousData) => previousData,
  });
}
