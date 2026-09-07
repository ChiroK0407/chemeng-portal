import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/axios';
import { Spinner } from '../../components/ui/Spinner';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Bell, ShieldCheck, MailCheck, FlaskConical, Radio, CheckSquare } from 'lucide-react';

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notificationsList'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data?.data || res.data || [];
    }
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/notifications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationsList'] });
      queryClient.invalidateQueries({ queryKey: ['recentNotifications'] });
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.patch('/notifications/mark-all-read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationsList'] });
      queryClient.invalidateQueries({ queryKey: ['recentNotifications'] });
    }
  });

  if (isLoading) return <Spinner />;
  const logArray = Array.isArray(notificationsData) ? notificationsData : [];

  // Conditional utility mapping resolving vector indicators dynamically per code rules
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'PROJECT':
        return <FlaskConical className="w-4 h-4 text-blue-500" />;
      case 'SYSTEM':
        return <Radio className="w-4 h-4 text-red-500" />;
      case 'SECURITY':
        return <ShieldCheck className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 border-surface-200 dark:border-surface-800">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white">Notifications Registry</h1>
            <p className="text-sm text-surface-500 mt-0.5">Track analytical process alarms, peer collaborations, and recruitment activity logs.</p>
          </div>
          {logArray.some((n: any) => !n.isRead) && (
            <button 
              onClick={() => markAllReadMutation.mutate()}
              className="px-4 py-2 border border-surface-200 dark:border-surface-800 rounded-xl bg-white dark:bg-surface-900 text-xs font-bold text-surface-700 dark:text-surface-300 shadow-sm hover:bg-surface-50 transition-colors flex items-center gap-1.5"
            >
              <CheckSquare className="w-3.5 h-3.5" /> Mark All Read
            </button>
          )}
        </div>

        {logArray.length === 0 ? (
          <EmptyState title="Logs Ledger Empty" description="Telemetry buffers contain zero background notification alarms right now." />
        ) : (
          <div className="space-y-2.5">
            {logArray.map((notif: any) => (
              <Card 
                key={notif.id}
                onClick={() => !notif.isRead && markReadMutation.mutate(notif.id)}
                className={`p-4 bg-white dark:bg-surface-900 border rounded-xl flex items-start gap-4 transition-all ${
                  !notif.isRead 
                    ? 'border-blue-300 dark:border-blue-900/60 bg-blue-50/10 shadow-sm cursor-pointer hover:bg-blue-50/20' 
                    : 'border-surface-200 dark:border-surface-800 opacity-80'
                }`}
              >
                <div className="p-2 bg-surface-50 dark:bg-surface-950 border border-surface-200/40 rounded-xl flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notif.type)}
                </div>
                
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <p className={`text-sm leading-relaxed ${!notif.isRead ? 'font-bold text-surface-900 dark:text-white' : 'text-surface-600 dark:text-surface-300 font-medium'}`}>
                      {notif.message}
                    </p>
                    {!notif.isRead && <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />}
                  </div>
                  <span className="text-[10px] text-surface-400 block font-mono">Log node timestamp: {new Date(notif.createdAt).toLocaleDateString()}</span>
                </div>
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}