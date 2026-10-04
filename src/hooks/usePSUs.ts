import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';

export interface PSUFilters {
  page?: number;
  limit?: number;
  search?: string;
  sector?: string;
  gateRequired?: string;
  minPackage?: number;
  maxPackage?: number;
  branch?: string;
  sortBy?: string;
}

export function usePSUs(filters: PSUFilters) {
  return useQuery({
    queryKey: ['psus', filters],
    queryFn: async () => (await api.get('/psus', { params: filters })).data,
    placeholderData: (previousData) => previousData,
  });
}

export function usePSU(slug: string) {
  return useQuery({
    queryKey: ['psu', slug],
    queryFn: async () => (await api.get(`/psus/${slug}`)).data?.data,
    enabled: !!slug,
  });
}
