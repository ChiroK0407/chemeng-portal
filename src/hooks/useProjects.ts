import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';

export interface ProjectFilters {
  page?: number;
  limit?: number;
}

export function useProjects(filters: ProjectFilters = {}) {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: async () => {
      const res = await api.get('/projects', { params: filters });
      return res.data; // { success: true, data: [...], meta: {...} }
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useProject(slug: string) {
  return useQuery({
    queryKey: ['project', slug],
    queryFn: async () => {
      const res = await api.get(`/projects/${slug}`);
      return res.data?.data;
    },
    enabled: !!slug,
  });
}
