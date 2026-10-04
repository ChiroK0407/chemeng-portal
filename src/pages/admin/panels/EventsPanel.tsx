import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/axios';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { Spinner } from '../../../components/ui/Spinner';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { JsonUploadPrefill } from '../../../components/admin/JsonUploadPrefill';

const emptyForm = {
  title: '', description: '', content: '', coverImage: '', venue: '', isOnline: false,
  meetingUrl: '', organizerName: '', startsAt: '', endsAt: '', status: 'upcoming',
};

// datetime-local inputs need "YYYY-MM-DDTHH:mm"; Postgres timestamptz comes
// back as a full ISO string, so trim it for the input and expand it back
// out when sending.
const toLocalInput = (iso: string | null) => (iso ? iso.slice(0, 16) : '');

export default function EventsPanel() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => (await api.get('/events/admin/all')).data.data,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : undefined,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      };
      if (editingId) return api.put(`/events/${editingId}`, payload);
      return api.post('/events', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/events/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-events'] }),
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (event: any) => {
    setForm({
      title: event.title, description: event.description || '', content: event.content || '',
      coverImage: event.cover_image || '', venue: event.venue || '', isOnline: event.is_online,
      meetingUrl: event.meeting_url || '', organizerName: event.organizer_name || '',
      startsAt: toLocalInput(event.starts_at), endsAt: toLocalInput(event.ends_at), status: event.status,
    });
    setEditingId(event.id);
    setShowForm(true);
  };

  if (isLoading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-surface-900 dark:text-white">Events</h2>
        {!showForm && <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(true)}>New Event</Button>}
      </div>

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">{editingId ? 'Edit Event' : 'New Event'}</h3>
            <button type="button" onClick={resetForm}><X className="w-4 h-4 text-surface-400" /></button>
          </div>
          <JsonUploadPrefill
            templateUrl="/templates/event-template.json"
            onLoad={(data) => setForm((prev) => ({ ...prev, ...data }))}
          />

          <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea label="Short description (shown in cards)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Textarea label="Full details (HTML allowed, shown on detail page)" rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          <Input label="Cover image URL" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} />
          <Input label="Starts at" type="datetime-local" required value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
          <Input label="Ends at (optional)" type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isOnline} onChange={(e) => setForm({ ...form, isOnline: e.target.checked })} />
            Online event
          </label>
          {form.isOnline ? (
            <Input label="Meeting URL" value={form.meetingUrl} onChange={(e) => setForm({ ...form, meetingUrl: e.target.value })} />
          ) : (
            <Input label="Venue" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
          )}
          <Input label="Organizer name" value={form.organizerName} onChange={(e) => setForm({ ...form, organizerName: e.target.value })} />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={[{ value: 'upcoming', label: 'Upcoming' }, { value: 'ongoing', label: 'Ongoing' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled (hidden)' }]}
          />
          {saveMutation.isError && (
            <p className="text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
              {(saveMutation.error as any)?.response?.data?.message || 'Something went wrong saving this. Check the console for details.'}
            </p>
          )}
          <Button type="submit" isLoading={saveMutation.isPending}>{editingId ? 'Save Changes' : 'Create Event'}</Button>
        </form>
      )}

      <div className="space-y-2">
        {data?.length === 0 && <p className="text-sm text-surface-400 italic">No events yet.</p>}
        {data?.map((event: any) => (
          <div key={event.id} className="flex items-center justify-between bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl px-4 py-3">
            <div>
              <p className="font-semibold text-sm text-surface-900 dark:text-white">{event.title}</p>
              <p className="text-xs text-surface-400">{new Date(event.starts_at).toLocaleString()} · <span className="capitalize">{event.status}</span></p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(event)} className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg"><Pencil className="w-4 h-4 text-surface-500" /></button>
              <button onClick={() => confirm('Delete this event?') && deleteMutation.mutate(event.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
