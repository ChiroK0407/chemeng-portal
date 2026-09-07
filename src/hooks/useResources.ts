import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';

export interface ResourceFilters {
  page?: number;
  limit?: number;
  type?: 'pdf' | 'video' | 'book' | 'notes' | 'link';
  search?: string;
  subject?: string;
  semester?: string;
  categoryId?: string;
}

export function useResources(filters: ResourceFilters) {
  return useQuery({
    queryKey: ['resources', filters],
    queryFn: async () => {
      const res = await api.get('/resources', { params: filters });
      return res.data; // Expected format: { success: true, data: [...], meta: { total, page } }
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useResourceCategories() {
  return useQuery({
    queryKey: ['resourceCategories'],
    queryFn: async () => {
      const res = await api.get('/resources/categories');
      return res.data?.data || res.data; // Expected: array of categories [{ id, name, slug }]
    }
  });
}