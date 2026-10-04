import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/axios';

export interface MyMemberInput {
  fullName: string;
  roleTitle?: string;
  category?: 'current' | 'alumni';
  branch?: string;
  bio?: string;
  photoUrl?: string;
  linkedinUrl?: string;
  // Required (12 digits) when category is 'current', must be omitted for
  // 'alumni' — enforced server-side in member.controller.ts regardless of
  // what the frontend sends.
  rollNumber?: string;
}

// Returns { data: null } (not a 404) when the signed-in user hasn't
// joined yet — that's an expected state, not an error, so callers should
// branch on `data === null` rather than on `isError`.
export function useMyMember() {
  return useQuery({
    queryKey: ['my-member'],
    queryFn: async () => (await api.get('/members/me')).data?.data,
    // Approval status can change on the server (admin publishes it) with
    // no action on this user's part — so don't trust a cached "pending"
    // answer just because they were already on this page recently.
    // Always hit the network fresh when the dashboard/profile mounts.
    refetchOnMount: 'always',
  });
}

export function useJoinMembers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: MyMemberInput) => (await api.post('/members/join', input)).data?.data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-member'] }),
  });
}

export function useUpdateMyMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: MyMemberInput) => (await api.put('/members/me', input)).data?.data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-member'] }),
  });
}
