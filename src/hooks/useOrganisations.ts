import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';

export interface OrganisationFilters {
  page?: number;
  limit?: number;
  search?: string;
  orgType?: string;
  gateRequired?: string;
  branch?: string;
  sortBy?: string;
}

export function useOrganisations(filters: OrganisationFilters) {
  return useQuery({
    queryKey: ['organisations', filters],
    queryFn: async () => (await api.get('/organisations', { params: filters })).data,
    placeholderData: (previousData) => previousData,
  });
}

export function useOrganisation(slug: string) {
  return useQuery({
    queryKey: ['organisation', slug],
    queryFn: async () => (await api.get(`/organisations/${slug}`)).data?.data,
    enabled: !!slug,
  });
}
