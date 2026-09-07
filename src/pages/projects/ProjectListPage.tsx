import { Link } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';
import { EmptyState } from '../../components/ui/EmptyState';
import { ExternalLink } from 'lucide-react';

export default function ProjectListPage() {
  const { data, isLoading, isError } = useProjects({ limit: 30 });
  const projects = data?.data || [];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-white">Recent Work</h1>
          <p className="text-sm text-surface-500 mt-1">Projects built by ChELL members — process sims, tools, research, and more.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-surface-200 dark:bg-surface-800 rounded-2xl" />)}
          </div>
        ) : isError || projects.length === 0 ? (
          <EmptyState title="No projects posted yet" description="Projects added from the admin page will show up here." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p: any) => (
              <Link key={p.id} to={`/projects/${p.slug}`} className="block h-full">
                <div className="h-full bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden group">
                  {p.cover_image ? (
                    <img src={p.cover_image} alt={p.title} className="w-full h-36 object-cover" />
                  ) : (
                    <div className="w-full h-36 bg-gradient-to-br from-blue-500 to-indigo-600" />
                  )}
                  <div className="p-5">
                    <h3 className="font-bold text-base text-surface-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">{p.title}</h3>
                    <p className="text-xs text-surface-400 mt-1">by {p.author_name}</p>
                    <p className="text-sm text-surface-500 mt-3 line-clamp-2">{p.description}</p>
                    {p.tech_stack?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {p.tech_stack.slice(0, 3).map((tech: string) => (
                          <span key={tech} className="px-2 py-0.5 text-[10px] font-bold rounded bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 text-surface-500">{tech}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
