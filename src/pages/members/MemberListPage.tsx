import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMembers } from '../../hooks/useMembers';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { GraduationCap } from 'lucide-react';

const CATEGORY_FILTERS = [
  { label: 'Everyone', value: 'all' },
  { label: 'Current Students', value: 'current' },
  { label: 'Alumni', value: 'alumni' },
];

export default function MemberListPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data, isLoading, isError } = useMembers({
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
  });

  const members = data?.data || [];

  const avatarColor = (name: string) => {
    const sum = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const options = ['bg-blue-600 text-blue-50', 'bg-purple-600 text-purple-50', 'bg-teal-600 text-teal-50', 'bg-emerald-600 text-emerald-50', 'bg-indigo-600 text-indigo-50'];
    return options[sum % options.length];
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-surface-200 dark:border-surface-800 gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-white">Community</h1>
            <p className="text-sm text-surface-500 mt-1">Current engineers and alumni sharing what they've learned.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
                selectedCategory === cat.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
            {[...Array(8)].map((_, i) => <div key={i} className="h-56 bg-surface-200 dark:bg-surface-800 rounded-2xl" />)}
          </div>
        ) : isError || members.length === 0 ? (
          <EmptyState title="No members listed yet" description="Members added from the admin page will show up here." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {members.map((m: any) => (
              <Link key={m.id} to={`/members/${m.id}`}>
                <Card className="p-5 h-full flex flex-col items-center text-center dark:bg-surface-900 border-surface-200 dark:border-surface-800 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                  {m.photo_url ? (
                    <img src={m.photo_url} alt={m.full_name} className="w-16 h-16 rounded-full object-cover border mb-4" />
                  ) : (
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg mb-4 ${avatarColor(m.full_name)}`}>
                      {m.full_name?.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <h3 className="font-bold text-base text-surface-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">{m.full_name}</h3>
                  {m.role_title && <p className="text-xs text-surface-500 mt-1 line-clamp-1">{m.role_title}</p>}
                  {m.branch && (
                    <p className="text-[11px] font-medium text-surface-400 mt-2 flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5" /> {m.branch}
                    </p>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
