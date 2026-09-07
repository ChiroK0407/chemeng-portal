import { useState } from 'react';
import { useOpportunities } from '../../hooks/useOpportunities';
import { useDebounce } from '../../hooks/useDebounce';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Search, MapPin, Building, IndianRupee } from 'lucide-react';

const TYPE_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Internships', value: 'internship' },
  { label: 'Jobs', value: 'job' },
  { label: 'Research', value: 'research' },
  { label: 'Other', value: 'other' },
];

export default function OpportunitiesPage() {
  const [activeType, setActiveType] = useState('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError } = useOpportunities({
    limit: 30,
    type: activeType !== 'all' ? activeType : undefined,
    search: debouncedSearch || undefined,
  });

  const listings = data?.data || [];

  const getDeadlineMeta = (deadline: string | null) => {
    if (!deadline) return { text: 'No deadline', colorClass: 'text-surface-400 bg-surface-100 dark:bg-surface-800' };
    const diffDays = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
    if (diffDays < 0) return { text: 'Closed', colorClass: 'text-surface-400 bg-surface-100 dark:bg-surface-800' };
    if (diffDays <= 3) return { text: `${diffDays}d left`, colorClass: 'text-red-600 bg-red-50 dark:bg-red-950/30' };
    if (diffDays <= 14) return { text: `${diffDays}d left`, colorClass: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' };
    return { text: `${diffDays}d left`, colorClass: 'text-green-600 bg-green-50 dark:bg-green-950/30' };
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-white">Opportunities</h1>
          <p className="text-sm text-surface-500 mt-0.5">Internships, jobs, and research openings shared by the ChELL community.</p>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search role or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setActiveType(opt.value)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
                activeType === opt.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-surface-200 dark:bg-surface-800 rounded-2xl animate-pulse" />)}</div>
        ) : isError || listings.length === 0 ? (
          <EmptyState title="No openings yet" description="Check back soon — new opportunities are posted regularly." />
        ) : (
          <div className="space-y-4">
            {listings.map((opp: any) => {
              const dl = getDeadlineMeta(opp.deadline);
              return (
                <Card key={opp.id} className="p-5 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start justify-between gap-5">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shrink-0">
                      {opp.company?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-surface-900 dark:text-white">{opp.title}</h3>
                      <p className="text-sm font-semibold text-surface-500 flex items-center gap-1"><Building className="w-3.5 h-3.5" /> {opp.company}</p>
                      <p className="text-sm text-surface-500 mt-2 line-clamp-2">{opp.description}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-surface-400 mt-2">
                        {opp.location && <span><MapPin className="w-3.5 h-3.5 inline mr-1" />{opp.location}{opp.is_remote ? ' (Remote OK)' : ''}</span>}
                        {opp.stipend_max && <span><IndianRupee className="w-3.5 h-3.5 inline mr-1" />Up to {Number(opp.stipend_max).toLocaleString()}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-end gap-3 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-surface-100 dark:border-surface-800">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${dl.colorClass}`}>{dl.text}</span>
                    {opp.apply_url && (
                      <a href={opp.apply_url} target="_blank" rel="noreferrer" className="px-4 py-1.5 bg-[#1a63ef] text-white text-xs font-bold rounded-xl">
                        Apply
                      </a>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
