import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/axios';
import { Spinner } from '../../components/ui/Spinner';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Trash2, BookmarkCheck, ArrowUpRight } from 'lucide-react';

const ENTITY_TABS = [
  { label: 'All Saved', value: 'all' },
  { label: 'PSU Profiles', value: 'psu' },
  { label: 'Research Projects', value: 'project' },
  { label: 'Articles & Blogs', value: 'blog' },
  { label: 'Career Opportunities', value: 'opportunity' },
  { label: 'Academic Resources', value: 'resource' }
];

export default function SavedItemsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');

  const { data: items, isLoading, isError } = useQuery({
    queryKey: ['bookmarks', activeTab],
    queryFn: async () => {
      const endpointUrl = activeTab === 'all' ? '/bookmarks' : `/bookmarks?entityType=${activeTab}`;
      const res = await api.get(endpointUrl);
      return res.data?.data || res.data || [];
    }
  });

  const deleteBookmarkMutation = useMutation({
    mutationFn: async (bookmarkId: string) => {
      await api.delete(`/bookmarks/${bookmarkId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    }
  });

  if (isLoading) return <Spinner />;
  const bookmarksList = Array.isArray(items) ? items : [];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white">Saved Items</h1>
          <p className="text-sm text-surface-500 mt-0.5">Manage bookmarks, documentation scripts, and track core entry targets.</p>
        </div>

        {/* Categories Parameter Filter Tab Row */}
        <div className="flex overflow-x-auto gap-1 pb-2 border-b border-surface-200 dark:border-surface-800 scrollbar-hide">
          {ENTITY_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.value
                  ? 'border-[#1a63ef] text-[#1a63ef]'
                  : 'border-transparent text-surface-400 hover:text-surface-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Card Mapping Workspace Output Frame */}
        {bookmarksList.length === 0 ? (
          <EmptyState title="Bookmarks Ledger Clear" description="You have not saved any technical elements under this categorical tab context vector yet." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookmarksList.map((item: any) => (
              <Card key={item.id} className="p-4 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl shadow-sm flex items-center justify-between gap-4 group">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded bg-surface-50 dark:bg-surface-950 border border-surface-200/40 text-surface-500 dark:text-surface-400">{item.entityType}</span>
                  <h3 className="font-bold text-sm text-surface-900 dark:text-white line-clamp-1 truncate block pt-1">{item.title || 'Saved Asset File'}</h3>
                  <span className="text-[11px] text-surface-400 block font-mono">Pinned: {new Date(item.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <a href={item.targetUrl || '#'} className="p-2 bg-surface-50 dark:bg-surface-950 rounded-xl border border-surface-200/40 text-surface-500 hover:text-blue-600 transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                  <button 
                    onClick={() => deleteBookmarkMutation.mutate(item.id)}
                    className="p-2 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-xl border border-red-100 dark:border-red-900/30 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}