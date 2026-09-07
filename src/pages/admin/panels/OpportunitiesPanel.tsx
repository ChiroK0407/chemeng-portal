import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/axios';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { Spinner } from '../../../components/ui/Spinner';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

const emptyForm = {
  title: '', company: '', description: '', type: 'internship', location: '',
  isRemote: false, stipendMax: '', applyUrl: '', deadline: '', status: 'draft',
};

export default function OpportunitiesPanel() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-opportunities'],
    queryFn: async () => (await api.get('/opportunities/admin/all')).data.data,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, stipendMax: form.stipendMax ? Number(form.stipendMax) : null, deadline: form.deadline || null };
      if (editingId) return api.put(`/opportunities/${editingId}`, payload);
      return api.post('/opportunities', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-opportunities'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/opportunities/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-opportunities'] }),
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (opp: any) => {
    setForm({
      title: opp.title, company: opp.company, description: opp.description, type: opp.type,
      location: opp.location || '', isRemote: opp.is_remote, stipendMax: opp.stipend_max || '',
      applyUrl: opp.apply_url || '', deadline: opp.deadline ? opp.deadline.slice(0, 10) : '', status: opp.status,
    });
    setEditingId(opp.id);
    setShowForm(true);
  };

  if (isLoading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-surface-900 dark:text-white">Opportunities</h2>
        {!showForm && <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(true)}>New Opportunity</Button>}
      </div>

      {showForm && (
        <form
          onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }}
          className="bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 mb-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">{editingId ? 'Edit Opportunity' : 'New Opportunity'}</h3>
            <button type="button" onClick={resetForm}><X className="w-4 h-4 text-surface-400" /></button>
          </div>
          <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="Company" required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <Textarea label="Description" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Select
            label="Type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            options={[{ value: 'internship', label: 'Internship' }, { value: 'job', label: 'Job' }, { value: 'research', label: 'Research' }, { value: 'other', label: 'Other' }]}
          />
          <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isRemote} onChange={(e) => setForm({ ...form, isRemote: e.target.checked })} />
            Remote OK
          </label>
          <Input label="Max stipend (₹, optional)" type="number" value={form.stipendMax} onChange={(e) => setForm({ ...form, stipendMax: e.target.value })} />
          <Input label="Apply URL" value={form.applyUrl} onChange={(e) => setForm({ ...form, applyUrl: e.target.value })} />
          <Input label="Deadline" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
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
          <Button type="submit" isLoading={saveMutation.isPending}>{editingId ? 'Save Changes' : 'Create Opportunity'}</Button>
        </form>
      )}

      <div className="space-y-2">
        {data?.length === 0 && <p className="text-sm text-surface-400 italic">No opportunities yet.</p>}
        {data?.map((opp: any) => (
          <div key={opp.id} className="flex items-center justify-between bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl px-4 py-3">
            <div>
              <p className="font-semibold text-sm text-surface-900 dark:text-white">{opp.title} · {opp.company}</p>
              <p className="text-xs text-surface-400">{opp.type} · <span className={opp.status === 'published' ? 'text-green-600' : 'text-amber-600'}>{opp.status}</span></p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(opp)} className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg"><Pencil className="w-4 h-4 text-surface-500" /></button>
              <button onClick={() => confirm('Delete this opportunity?') && deleteMutation.mutate(opp.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
