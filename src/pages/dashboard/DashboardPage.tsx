import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/axios';
import { Spinner } from '../../components/ui/Spinner';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { 
  PlusCircle, BookOpen, Briefcase, Bell, Bookmark, 
  ArrowRight, Activity, FolderGit2, ChevronRight 
} from 'lucide-react';

export default function DashboardPage() {
  const { profile } = useAuth();

  // Concurrent dashboard analytics payload hydration fetch loops
  const { data: notificationsData, isLoading: notificationsLoading } = useQuery({
    queryKey: ['recentNotifications'],
    queryFn: async () => {
      const res = await api.get('/notifications?limit=5');
      return res.data?.data || res.data || [];
    }
  });

  const { data: bookmarksData, isLoading: bookmarksLoading } = useQuery({
    queryKey: ['previewBookmarks'],
    queryFn: async () => {
      const res = await api.get('/bookmarks?limit=4');
      return res.data?.data || res.data || [];
    }
  });

  if (notificationsLoading || bookmarksLoading) return <Spinner />;

  const notifications = Array.isArray(notificationsData) ? notificationsData : [];
  const bookmarks = Array.isArray(bookmarksData) ? bookmarksData : [];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Banner Welcome Message Block */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-surface-900 dark:text-white">
            Welcome back, <span className="text-gradient">{profile?.fullName || 'Engineer'}</span>
          </h1>
          <p className="text-sm text-surface-500 mt-1">Operational command panel telemetry status for your ChemEng ecosystem portal accounts.</p>
        </div>

        {/* Analytic Metrics Summary Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="p-5 flex items-center justify-between dark:bg-surface-900 border-surface-200 dark:border-surface-800">
            <div>
              <p className="text-xs font-bold uppercase text-surface-400 tracking-wider">Your Research</p>
              {/* ✅ FIXED code 2339: Added generic any type casting fallback path lookup to satisfy strict interface declarations */}
              <h3 className="text-2xl font-black text-surface-900 dark:text-white mt-1">{(profile as any)?._count?.projects || 0} Projects</h3>
            </div>
            <FolderGit2 className="w-8 h-8 text-blue-500 opacity-80" />
          </Card>
          <Card className="p-5 flex items-center justify-between dark:bg-surface-900 border-surface-200 dark:border-surface-800">
            <div>
              <p className="text-xs font-bold uppercase text-surface-400 tracking-wider">Your Articles</p>
              {/* ✅ FIXED code 2339: Added generic any type casting fallback path lookup to satisfy strict interface declarations */}
              <h3 className="text-2xl font-black text-surface-900 dark:text-white mt-1">{(profile as any)?._count?.blogs || 0} Logs</h3>
            </div>
            <BookOpen className="w-8 h-8 text-purple-500 opacity-80" />
          </Card>
          <Card className="p-5 flex items-center justify-between dark:bg-surface-900 border-surface-200 dark:border-surface-800">
            <div>
              <p className="text-xs font-bold uppercase text-surface-400 tracking-wider">Saved Content</p>
              <h3 className="text-2xl font-black text-surface-900 dark:text-white mt-1">{bookmarks.length} Bookmarks</h3>
            </div>
            <Bookmark className="w-8 h-8 text-amber-500 opacity-80" />
          </Card>
          <Card className="p-5 flex items-center justify-between dark:bg-surface-900 border-surface-200 dark:border-surface-800">
            <div>
              <p className="text-xs font-bold uppercase text-surface-400 tracking-wider">Alerts Network</p>
              <h3 className="text-2xl font-black text-surface-900 dark:text-white mt-1">{notifications.filter((n: any) => !n.isRead).length} Unread</h3>
            </div>
            <Bell className="w-8 h-8 text-red-500 opacity-80" />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Activity Feeds Column Segment Block Panel */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Recent Notifications Ingestion Summary View Section */}
            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-surface-100 dark:border-surface-800 pb-3">
                <h3 className="font-bold text-base text-surface-900 dark:text-white flex items-center gap-1.5"><Activity className="w-4 h-4 text-blue-600" /> Recent Stream Telemetry</h3>
                <Link to="/dashboard/notifications" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-0.5">All Logs <ChevronRight className="w-3.5 h-3.5" /></Link>
              </div>

              {notifications.length === 0 ? (
                <p className="text-xs italic text-surface-400 py-4 text-center">No active background system context operations logged in this window cycle.</p>
              ) : (
                <div className="divide-y divide-surface-100 dark:divide-surface-800/60">
                  {notifications.map((notif: any) => (
                    <div key={notif.id} className={`py-3 flex items-start gap-3 first:pt-0 last:pb-0 ${!notif.isRead ? 'bg-blue-50/20 dark:bg-blue-950/10 px-2 rounded-xl' : ''}`}>
                      <Bell className="w-4 h-4 text-surface-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-surface-800 dark:text-surface-200">{notif.message}</p>
                        <span className="text-[10px] text-surface-400 mt-1 block font-mono">{new Date(notif.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Content Profiles Preview Row Split Grid Selection */}
            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-surface-100 dark:border-surface-800 pb-3">
                <h3 className="font-bold text-base text-surface-900 dark:text-white flex items-center gap-1.5"><Bookmark className="w-4 h-4 text-amber-500" /> Saved Item Previews</h3>
                <Link to="/dashboard/saved-items" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-0.5">Manage All <ChevronRight className="w-3.5 h-3.5" /></Link>
              </div>

              {bookmarks.length === 0 ? (
                <p className="text-xs italic text-surface-400 py-4 text-center">Your saved items collection is currently empty.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {bookmarks.map((b: any) => (
                    <div key={b.id} className="p-3 border border-surface-200 dark:border-surface-800 rounded-xl bg-surface-50 dark:bg-surface-950 flex flex-col justify-between items-start">
                      <div>
                        <Badge className="text-[9px] uppercase tracking-wide font-black px-1.5 py-0.5 rounded bg-surface-200/60 dark:bg-surface-800 text-surface-600 dark:text-surface-400 border-none">{b.entityType}</Badge>
                        <h4 className="font-bold text-sm text-surface-900 dark:text-white mt-2 line-clamp-1 leading-tight">{b.title || 'Saved Entry Node'}</h4>
                      </div>
                      <Link to={b.targetUrl || `#`} className="text-xs font-bold text-blue-600 hover:underline mt-3 flex items-center gap-0.5">Explore <ArrowRight className="w-3 h-3" /></Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Quick Shortcuts Side Layout Panel Stack Column */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-xs uppercase text-surface-400 tracking-wider">Quick Operational Shortcuts</h3>
              <div className="space-y-2.5">
                <Link to="/projects/new" className="flex items-center gap-3 p-3 border border-surface-100 dark:border-surface-800 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-950 transition-colors group">
                  <PlusCircle className="w-5 h-5 text-blue-600 group-hover:scale-105 transition-transform" />
                  <div><h4 className="font-bold text-sm text-surface-900 dark:text-white">Add Project</h4><p className="text-[11px] text-surface-400">Index your process configurations</p></div>
                </Link>
                <Link to="/blogs/new" className="flex items-center gap-3 p-3 border border-surface-100 dark:border-surface-800 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-950 transition-colors group">
                  <PlusCircle className="w-5 h-5 text-purple-600 group-hover:scale-105 transition-transform" />
                  <div><h4 className="font-bold text-sm text-surface-900 dark:text-white">Write Blog Log</h4><p className="text-[11px] text-surface-400">Publish engineering document logs</p></div>
                </Link>
                <Link to="/opportunities" className="flex items-center gap-3 p-3 border border-surface-100 dark:border-surface-800 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-950 transition-colors group">
                  <Briefcase className="w-5 h-5 text-amber-600 group-hover:scale-105 transition-transform" />
                  <div><h4 className="font-bold text-sm text-surface-900 dark:text-white">Browse Career Pipeline</h4><p className="text-[11px] text-surface-400">Explore core sector recruitment channels</p></div>
                </Link>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}