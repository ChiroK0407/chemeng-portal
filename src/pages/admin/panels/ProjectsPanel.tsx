import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/axios';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { Spinner } from '../../../components/ui/Spinner';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

const emptyForm = { title: '', description: '', coverImage: '', authorName: '', techStack: '', projectUrl: '', status: 'draft' };

export default function ProjectsPanel() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: async () => (await api.get('/projects/admin/all')).data.data,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, techStack: form.techStack.split(',').map((t) => t.trim()).filter(Boolean) };
      if (editingId) return api.put(`/projects/${editingId}`, payload);
      return api.post('/projects', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/projects/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-projects'] }),
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (p: any) => {
    setForm({
      title: p.title, description: p.description, coverImage: p.cover_image || '',
      authorName: p.author_name, techStack: (p.tech_stack || []).join(', '),
      projectUrl: p.project_url || '', status: p.status,
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  if (isLoading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-surface-900 dark:text-white">Projects</h2>
        {!showForm && <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(true)}>New Project</Button>}
      </div>

      {showForm && (
        <form
          onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }}
          className="bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 mb-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">{editingId ? 'Edit Project' : 'New Project'}</h3>
            <button type="button" onClick={resetForm}><X className="w-4 h-4 text-surface-400" /></button>
          </div>
          <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="Author name" required value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} />
          <Textarea label="Description" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input label="Cover image URL" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} />
          <Input label="Tech stack (comma-separated)" value={form.techStack} onChange={(e) => setForm({ ...form, techStack: e.target.value })} />
          <Input label="Project URL" value={form.projectUrl} onChange={(e) => setForm({ ...form, projectUrl: e.target.value })} />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={[{ value: 'draft', label: 'Draft (hidden)' }, { value: 'published', label: 'Published (public)' }]}
          />
          {saveMutation.isError && (
            <p className="text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
              {(saveMutation.error as any)?.response?.data?.message || 'Something went wrong saving this. Check the console for details.'}
            </p>
          )}
          <Button type="submit" isLoading={saveMutation.isPending}>{editingId ? 'Save Changes' : 'Create Project'}</Button>
        </form>
      )}

      <div className="space-y-2">
        {data?.length === 0 && <p className="text-sm text-surface-400 italic">No projects yet.</p>}
        {data?.map((p: any) => (
          <div key={p.id} className="flex items-center justify-between bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl px-4 py-3">
            <div>
              <p className="font-semibold text-sm text-surface-900 dark:text-white">{p.title}</p>
              <p className="text-xs text-surface-400">{p.author_name} · <span className={p.status === 'published' ? 'text-green-600' : 'text-amber-600'}>{p.status}</span></p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(p)} className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg"><Pencil className="w-4 h-4 text-surface-500" /></button>
              <button onClick={() => confirm('Delete this project?') && deleteMutation.mutate(p.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
