import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/axios';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Spinner } from '../../../components/ui/Spinner';
import { Plus, Trash2, X, Power } from 'lucide-react';

const emptyForm = { title: '', message: '', link: '' };

export default function NotificationsPanel() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => (await api.get('/notifications/admin/all')).data.data,
  });

  const createMutation = useMutation({
    mutationFn: async () => api.post('/notifications', form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      setForm(emptyForm);
      setShowForm(false);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => api.put(`/notifications/${id}`, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-notifications'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-notifications'] }),
  });

  if (isLoading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-surface-900 dark:text-white">Notifications</h2>
        {!showForm && <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(true)}>New Notification</Button>}
      </div>

      {showForm && (
        <form
          onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }}
          className="bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 mb-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">New Notification</h3>
            <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); }}><X className="w-4 h-4 text-surface-400" /></button>
          </div>
          <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea label="Message" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          <Input label="Link (optional, e.g. /blogs/some-post)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
          {createMutation.isError && (
            <p className="text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
              {(createMutation.error as any)?.response?.data?.message || 'Something went wrong saving this. Check the console for details.'}
            </p>
          )}
          <Button type="submit" isLoading={createMutation.isPending}>Post Notification</Button>
        </form>
      )}

      <div className="space-y-2">
        {data?.length === 0 && <p className="text-sm text-surface-400 italic">No notifications yet.</p>}
        {data?.map((n: any) => (
          <div key={n.id} className={`flex items-center justify-between border rounded-xl px-4 py-3 ${n.is_active ? 'bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800' : 'bg-surface-50 dark:bg-surface-950 border-surface-200 dark:border-surface-800 opacity-60'}`}>
            <div>
              <p className="font-semibold text-sm text-surface-900 dark:text-white">{n.title}</p>
              <p className="text-xs text-surface-400 line-clamp-1">{n.message}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleActiveMutation.mutate({ id: n.id, isActive: !n.is_active })}
                title={n.is_active ? 'Deactivate' : 'Activate'}
                className={`p-2 rounded-lg ${n.is_active ? 'hover:bg-surface-100 dark:hover:bg-surface-800' : 'hover:bg-green-50 dark:hover:bg-green-950/30'}`}
              >
                <Power className={`w-4 h-4 ${n.is_active ? 'text-surface-500' : 'text-green-500'}`} />
              </button>
              <button onClick={() => confirm('Delete this notification?') && deleteMutation.mutate(n.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
