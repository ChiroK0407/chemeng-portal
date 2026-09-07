import { useParams, Link } from 'react-router-dom';
import { useProject } from '../../hooks/useProjects';
import { Spinner } from '../../components/ui/Spinner';
import { ArrowLeft, ExternalLink } from 'lucide-react';

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: project, isLoading, isError } = useProject(slug || '');

  if (isLoading) return <Spinner />;

  if (isError || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 px-4">
        <div className="text-center max-w-sm card p-6 border border-surface-200 dark:border-surface-800 rounded-2xl">
          <p className="text-sm text-surface-500">This project couldn't be found.</p>
          <Link to="/projects" className="text-blue-600 font-bold mt-4 inline-flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Back to Projects</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm font-semibold text-surface-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </Link>

        {project.cover_image && (
          <img src={project.cover_image} alt={project.title} className="w-full h-64 object-cover rounded-2xl mb-6" />
        )}

        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">{project.title}</h1>
        <p className="text-sm text-surface-400 mt-1">by {project.author_name}</p>

        {project.tech_stack?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {project.tech_stack.map((tech: string) => (
              <span key={tech} className="px-2.5 py-1 text-xs font-bold rounded bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300">{tech}</span>
            ))}
          </div>
        )}

        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-6 rounded-2xl shadow-sm mt-6">
          <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed whitespace-pre-line">{project.description}</p>
        </div>

        {project.project_url && (
          <a href={project.project_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 mt-6 px-4 py-2 bg-[#1a63ef] text-white text-sm font-bold rounded-xl">
            View Project <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}
