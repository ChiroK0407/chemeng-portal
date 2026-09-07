import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/axios';

export interface PSUFilters {
  page?: number;
  limit?: number;
  search?: string;
  sector?: string;
  gateRequired?: string; // 'yes' | 'no' | 'any'
  minPackage?: number;
  maxPackage?: number;
  branch?: string;
  sortBy?: string;
}

export function usePSUs(filters: PSUFilters) {
  return useQuery({
    queryKey: ['psus', filters],
    queryFn: async () => {
      const res = await api.get('/psus', { params: filters });
      return res.data; // Expected: { success: true, data: [...], meta: { total, page, limit } }
    },
    placeholderData: (previousData) => previousData,
  });
}

export function usePSU(slug: string) {
  return useQuery({
    queryKey: ['psu', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Slug parameter constraint missing.');
      const res = await api.get(`/psus/${slug}`);
      return res.data?.data || res.data;
    },
    enabled: !!slug,
  });
}

export function useBookmarkPSU() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (psuId: string) => {
      const res = await api.post(`/bookmarks/toggle`, { entityType: 'psu', entityId: psuId });
      return res.data;
    },
    onSuccess: () => {
      // Invalidate active queues to update state toggles globally across rows
      queryClient.invalidateQueries({ queryKey: ['psus'] });
      queryClient.invalidateQueries({ queryKey: ['psu'] });
    }
  });
}