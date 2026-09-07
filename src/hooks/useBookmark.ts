import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/axios';

export function useBookmark(entityType: string, entityId: string) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. Fetch active bookmark tracking record if it exists
  const { data: bookmarkRecord, isLoading: checkLoading } = useQuery({
    queryKey: ['bookmarkState', entityType, entityId],
    queryFn: async () => {
      if (!user) return null;
      // Scans current account buffers to find active relation keys
      const res = await api.get(`/bookmarks/check`, { params: { entityType, entityId } });
      return res.data?.data || null; // Expected structure: { isBookmarked: boolean, bookmarkId?: string }
    },
    enabled: !!user && !!entityId
  });

  const isBookmarked = !!bookmarkRecord?.isBookmarked;

  // 2. Atomic Toggle Mutation Action Stream Configuration
  const toggleBookmarkMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        // Enforce protected authentication boundary constraints
        navigate('/auth/login');
        return;
      }

      if (isBookmarked && bookmarkRecord?.bookmarkId) {
        // Delete operational asset branch route if already pinned
        await api.delete(`/bookmarks/${bookmarkRecord.bookmarkId}`);
      } else {
        // Post fresh relational bookmark data node mapping string
        await api.post('/bookmarks', { entityType, entityId });
      }
    },
    onSuccess: () => {
      alert(isBookmarked ? 'Bookmark successfully removed.' : 'Asset successfully added to bookmarks directory.');
      
      // Invalidate relevant collection arrays to trigger automatic UI hydration refreshes
      queryClient.invalidateQueries({ queryKey: ['bookmarkState', entityType, entityId] });
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['previewBookmarks'] });
      queryClient.invalidateQueries({ queryKey: [entityType] });
      queryClient.invalidateQueries({ queryKey: [`${entityType}s`] });
    },
    onError: (err: any) => {
      console.error('Bookmark toggle operation exception thrown:', err);
      alert('Failed to modify bookmark state configuration tracking records.');
    }
  });

  return {
    isBookmarked,
    toggleBookmark: () => toggleBookmarkMutation.mutate(),
    isLoading: checkLoading || toggleBookmarkMutation.isPending
  };
}