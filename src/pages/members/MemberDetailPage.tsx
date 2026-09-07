import { useParams, Link } from 'react-router-dom';
import { useMember } from '../../hooks/useMembers';
import { Spinner } from '../../components/ui/Spinner';
import { ArrowLeft, GraduationCap, Linkedin } from 'lucide-react';

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: member, isLoading, isError } = useMember(id || '');

  if (isLoading) return <Spinner />;

  if (isError || !member) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 px-4">
        <div className="text-center max-w-sm card p-6 border border-surface-200 dark:border-surface-800 rounded-2xl">
          <p className="text-sm text-surface-500">This member profile couldn't be found.</p>
          <Link to="/members" className="text-blue-600 font-bold mt-4 inline-flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Back to Community</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/members" className="inline-flex items-center gap-1.5 text-sm font-semibold text-surface-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Community
        </Link>

        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6 mb-8 text-center sm:text-left">
          {member.photo_url ? (
            <img src={member.photo_url} alt={member.full_name} className="w-20 h-20 rounded-full object-cover border-2 border-white dark:border-surface-800 shadow-md" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-white text-2xl shadow-md">
              {member.full_name?.substring(0, 2).toUpperCase()}
            </div>
          )}
          <div className="flex-1 space-y-1.5">
            <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-white leading-tight">{member.full_name}</h1>
            {member.role_title && <p className="text-sm font-semibold text-surface-600 dark:text-surface-300">{member.role_title}</p>}
            {member.branch && (
              <p className="text-xs font-medium text-surface-400 flex items-center justify-center sm:justify-start gap-1">
                <GraduationCap className="w-3.5 h-3.5" /> {member.branch}
              </p>
            )}
          </div>
          {member.linkedin_url && (
            <a href={member.linkedin_url} target="_blank" rel="noreferrer" className="p-2.5 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl hover:text-blue-600 transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
          )}
        </div>

        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-6 rounded-2xl shadow-sm">
          <h3 className="text-sm font-bold text-surface-900 dark:text-white border-b border-surface-100 dark:border-surface-800 pb-3 mb-4 uppercase tracking-wider">About</h3>
          <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed whitespace-pre-line">
            {member.bio || 'No bio added yet.'}
          </p>
        </div>
      </div>
    </div>
  );
}
