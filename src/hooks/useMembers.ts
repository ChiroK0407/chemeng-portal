import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';

export interface MemberFilters {
  category?: string; // 'current' | 'alumni'
}

export function useMembers(filters: MemberFilters = {}) {
  return useQuery({
    queryKey: ['members', filters],
    queryFn: async () => {
      const res = await api.get('/members', { params: filters });
      return res.data; // { success: true, data: [...] }
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useMember(id: string) {
  return useQuery({
    queryKey: ['member', id],
    queryFn: async () => {
      const res = await api.get(`/members/${id}`);
      return res.data?.data;
    },
    enabled: !!id,
  });
}
