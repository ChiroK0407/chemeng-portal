import { useParams, Link } from 'react-router-dom';
import { useBlog } from '../../hooks/useBlogs';
import { Spinner } from '../../components/ui/Spinner';
import { ArrowLeft, Clock, Eye } from 'lucide-react';

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: blog, isLoading, isError } = useBlog(slug || '');

  if (isLoading) return <Spinner />;

  if (isError || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 px-4">
        <div className="text-center max-w-sm card p-6 border border-surface-200 dark:border-surface-800 rounded-2xl">
          <p className="text-sm text-surface-500">This post couldn't be found.</p>
          <Link to="/blogs" className="text-blue-600 font-bold mt-4 inline-flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Back to Blogs</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-surface-50 dark:bg-surface-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/blogs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-surface-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Blogs
        </Link>

        {blog.cover_image && (
          <img src={blog.cover_image} alt={blog.title} className="w-full h-64 object-cover rounded-2xl mb-6" />
        )}

        <h1 className="text-3xl font-bold text-surface-900 dark:text-white leading-tight">{blog.title}</h1>
        <div className="flex items-center gap-4 text-xs text-surface-400 font-semibold mt-3">
          <span>by {blog.author_name}</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {blog.read_time_min || 1} min read</span>
          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {blog.views ?? 0} views</span>
        </div>

        {blog.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {blog.tags.map((tag: string) => (
              <span key={tag} className="px-2.5 py-1 text-xs font-bold rounded bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300">{tag}</span>
            ))}
          </div>
        )}

        <article className="prose dark:prose-invert max-w-none mt-8 whitespace-pre-line text-sm leading-relaxed text-surface-700 dark:text-surface-300">
          {blog.content}
        </article>
      </div>
    </main>
  );
}
