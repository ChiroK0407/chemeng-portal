import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBlogs } from '../../hooks/useBlogs';
import { useDebounce } from '../../hooks/useDebounce';
import { EmptyState } from '../../components/ui/EmptyState';
import { Search, Clock, Eye } from 'lucide-react';

export default function BlogListPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError } = useBlogs({ limit: 20, search: debouncedSearch || undefined });
  const blogs = data?.data || [];

  return (
    <main className="min-h-screen bg-surface-50 dark:bg-surface-950 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-white">Blogs</h1>
          <p className="text-sm text-surface-500 mt-1">Experiences and insights from current engineers and alumni.</p>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl text-sm"
          />
        </div>

        {isLoading ? (
          <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-surface-200 dark:bg-surface-800 rounded-2xl animate-pulse" />)}</div>
        ) : isError || blogs.length === 0 ? (
          <EmptyState title="No posts yet" description="New blog posts from the community will show up here." />
        ) : (
          <div className="space-y-4">
            {blogs.map((blog: any) => (
              <Link key={blog.id} to={`/blogs/${blog.slug}`} className="block">
                <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-sm hover:shadow-md transition-all p-5 flex gap-5 items-start">
                  {blog.cover_image && (
                    <img src={blog.cover_image} alt={blog.title} className="w-28 h-20 object-cover rounded-xl shrink-0 hidden sm:block" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-surface-900 dark:text-white line-clamp-1">{blog.title}</h3>
                    <p className="text-xs text-surface-400 mt-1">by {blog.author_name}</p>
                    {blog.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {blog.tags.slice(0, 4).map((tag: string) => (
                          <span key={tag} className="px-2 py-0.5 text-[10px] font-bold rounded bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 text-surface-500">{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-[11px] text-surface-400 font-semibold mt-3">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {blog.read_time_min || 1} min read</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {blog.views ?? 0} views</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
