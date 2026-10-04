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

const TYPES = [
  { value: 'pdf', label: 'PDF' }, { value: 'video', label: 'Video' }, { value: 'book', label: 'Book' },
  { value: 'notes', label: 'Notes' }, { value: 'link', label: 'External Link' },
];

const emptyForm = { title: '', description: '', type: 'link', subject: '', semester: '', url: '', uploaderName: '', status: 'draft' };

export default function ResourcesPanel() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-resources'],
    queryFn: async () => (await api.get('/resources/admin/all')).data.data,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, semester: form.semester ? Number(form.semester) : null };
      if (editingId) return api.put(`/resources/${editingId}`, payload);
      return api.post('/resources', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/resources/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-resources'] }),
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (r: any) => {
    setForm({
      title: r.title, description: r.description || '', type: r.type, subject: r.subject || '',
      semester: r.semester ?? '', url: r.url, uploaderName: r.uploader_name || '', status: r.status,
    });
    setEditingId(r.id);
    setShowForm(true);
  };

  if (isLoading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-surface-900 dark:text-white">Resources</h2>
        {!showForm && <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(true)}>New Resource</Button>}
      </div>

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">{editingId ? 'Edit Resource' : 'New Resource'}</h3>
            <button type="button" onClick={resetForm}><X className="w-4 h-4 text-surface-400" /></button>
          </div>
          <JsonUploadPrefill
            templateUrl="/templates/resource-template.json"
            onLoad={(data) => setForm((prev) => ({ ...prev, ...data }))}
          />

          <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={TYPES} />
          <Input label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <Input label="Semester (optional)" type="number" min="1" max="8" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} />
          <Input label="URL" required value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          <Input label="Uploader name (optional)" value={form.uploaderName} onChange={(e) => setForm({ ...form, uploaderName: e.target.value })} />
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={[{ value: 'draft', label: 'Draft (hidden)' }, { value: 'published', label: 'Published (public)' }]} />
          {saveMutation.isError && (
            <p className="text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
              {(saveMutation.error as any)?.response?.data?.message || 'Something went wrong saving this. Check the console for details.'}
            </p>
          )}
          <Button type="submit" isLoading={saveMutation.isPending}>{editingId ? 'Save Changes' : 'Create Resource'}</Button>
        </form>
      )}

      <div className="space-y-2">
        {data?.length === 0 && <p className="text-sm text-surface-400 italic">No resources yet.</p>}
        {data?.map((r: any) => (
          <div key={r.id} className="flex items-center justify-between bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl px-4 py-3">
            <div>
              <p className="font-semibold text-sm text-surface-900 dark:text-white">{r.title}</p>
              <p className="text-xs text-surface-400">{r.type} · {r.downloads} hits · <span className={r.status === 'published' ? 'text-green-600' : 'text-amber-600'}>{r.status}</span></p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(r)} className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg"><Pencil className="w-4 h-4 text-surface-500" /></button>
              <button onClick={() => confirm('Delete this resource?') && deleteMutation.mutate(r.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
