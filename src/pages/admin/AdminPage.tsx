import { useState } from 'react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { PageSpinner } from '../../components/ui/Spinner';
import { Lock, LogOut } from 'lucide-react';

import BlogsPanel from './panels/BlogsPanel';
import OpportunitiesPanel from './panels/OpportunitiesPanel';
import MembersPanel from './panels/MembersPanel';
import ProjectsPanel from './panels/ProjectsPanel';
// NotificationsPanel intentionally not wired in — notifications only make
// sense once there's a login system to target them per-user (a later
// project phase). The backend table/routes are left in place, unused,
// for whenever that's built.

const TABS = [
  { key: 'blogs', label: 'Blogs', Component: BlogsPanel },
  { key: 'opportunities', label: 'Opportunities', Component: OpportunitiesPanel },
  { key: 'members', label: 'Members', Component: MembersPanel },
  { key: 'projects', label: 'Projects', Component: ProjectsPanel },
] as const;

function AdminLoginGate({ onLogin, error }: { onLogin: (password: string) => Promise<boolean>; error: string | null }) {
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onLogin(password);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-8 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center mb-5">
          <Lock className="w-5 h-5 text-blue-600" />
        </div>
        <h1 className="text-xl font-bold text-surface-900 dark:text-white mb-1">ChELL Content Editor</h1>
        <p className="text-sm text-surface-500 mb-6">Enter the shared admin password to continue.</p>
        <Input
          type="password"
          label="Password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error || undefined}
        />
        <Button type="submit" className="w-full mt-5" isLoading={submitting}>Sign in</Button>
      </form>
    </div>
  );
}

export default function AdminPage() {
  const { isAdmin, isLoading, loginError, login, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['key']>('blogs');

  if (isLoading) return <PageSpinner />;
  if (!isAdmin) return <AdminLoginGate onLogin={login} error={loginError} />;

  const ActivePanel = TABS.find((t) => t.key === activeTab)!.Component;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <div className="border-b border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-surface-900 dark:text-white">ChELL Content Editor</h1>
          <button onClick={logout} className="flex items-center gap-1.5 text-xs font-semibold text-surface-500 hover:text-red-600 transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key ? 'border-[#1a63ef] text-[#1a63ef]' : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <ActivePanel />
      </div>
    </div>
  );
}
