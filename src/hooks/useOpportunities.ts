import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';

export interface OpportunityFilters {
  page?: number;
  limit?: number;
  type?: string; // 'internship' | 'job' | 'research' | 'other'
  search?: string;
}

export function useOpportunities(filters: OpportunityFilters) {
  return useQuery({
    queryKey: ['opportunities', filters],
    queryFn: async () => {
      const res = await api.get('/opportunities', { params: filters });
      return res.data; // { success: true, data: [...], meta: { total, page, totalPages } }
    },
    placeholderData: (previousData) => previousData,
  });
}
