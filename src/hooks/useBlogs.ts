import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';

export interface BlogFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export function useBlogs(filters: BlogFilters = {}) {
  return useQuery({
    queryKey: ['blogs', filters],
    queryFn: async () => {
      const res = await api.get('/blogs', { params: filters });
      return res.data; // { success: true, data: [...], meta: {...} }
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useBlog(slug: string) {
  return useQuery({
    queryKey: ['blog', slug],
    queryFn: async () => {
      const res = await api.get(`/blogs/${slug}`);
      return res.data?.data;
    },
    enabled: !!slug,
  });
}
