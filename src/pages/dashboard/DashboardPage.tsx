import { Link } from 'react-router-dom';
import { useMyMember } from '../../hooks/useMyMember';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { Clock, CheckCircle2, Pencil, Link as LinkIcon } from 'lucide-react';

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-bold text-surface-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-surface-800 dark:text-surface-200 mt-0.5">
        {value ? value : <span className="italic text-surface-400">Not set</span>}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const { data: myMember, isLoading } = useMyMember();

  if (isLoading) return <Spinner />;

  if (!myMember) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-950 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">You haven't set up a member card yet</h1>
          <p className="text-sm text-surface-500 mt-2 mb-6">Head to your Profile to fill in your details and join.</p>
          <Link to="/dashboard/profile">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a63ef] text-white text-sm font-bold rounded-xl">
              <Pencil className="w-4 h-4" /> Set up your profile
            </span>
          </Link>
        </div>
      </div>
    );
  }

  const isPending = myMember.status === 'draft';
  const isLive = myMember.status === 'published';

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white">Your Member Card</h1>
          <p className="text-sm text-surface-500 mt-1">This is what's currently on file — a read-only view.</p>
        </div>

        {isPending && (
          <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl text-sm font-semibold text-amber-700 dark:text-amber-400">
            <Clock className="w-4 h-4 flex-shrink-0" /> Pending admin approval — not visible on the Members page yet.
          </div>
        )}
        {isLive && (
          <div className="flex items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-xl text-sm font-semibold text-green-700 dark:text-green-400">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Live on the Members page.
          </div>
        )}

        <Card className="p-6 dark:bg-surface-900 border-surface-200 dark:border-surface-800">
          <div className="flex items-center gap-4 pb-5 mb-5 border-b border-surface-100 dark:border-surface-800">
            {myMember.photo_url ? (
              <img src={myMember.photo_url} alt={myMember.full_name} className="w-16 h-16 rounded-full object-cover border border-surface-200 dark:border-surface-800" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-white text-lg">
                {myMember.full_name?.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-surface-900 dark:text-white">{myMember.full_name}</h2>
              {myMember.role_title && <p className="text-sm text-surface-500">{myMember.role_title}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="You are" value={myMember.category === 'alumni' ? 'Alumni' : 'Current student'} />
            {myMember.category === 'current' && <Field label="Roll number" value={myMember.roll_number} />}
            <Field label="Stream" value={myMember.branch} />
            <div className="sm:col-span-2">
              <Field label="Bio" value={myMember.bio} />
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-bold text-surface-400 uppercase tracking-wide">LinkedIn</p>
              {myMember.linkedin_url ? (
                <a href={myMember.linkedin_url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-0.5">
                  <LinkIcon className="w-3.5 h-3.5" /> {myMember.linkedin_url}
                </a>
              ) : (
                <p className="text-sm italic text-surface-400 mt-0.5">Not set</p>
              )}
            </div>
          </div>
        </Card>

        <p className="text-sm text-surface-500 text-center">
          To edit any of this, go to your{' '}
          <Link to="/dashboard/profile" className="text-[#1a63ef] font-semibold hover:underline">
            Profile
          </Link>.
        </p>
      </div>
    </div>
  );
}
