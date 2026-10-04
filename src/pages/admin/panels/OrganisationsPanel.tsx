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

// Fixed set, covering both government and corporate employers -- this
// is the whole point of the PSU -> Organisations generalization. Add
// another value here (and to migration_007's CHECK constraint) if a
// new category is ever needed.
const ORG_TYPES = ['Government PSU', 'Private Company', 'MNC', 'Startup'];

const emptyForm = {
  name: '', fullName: '', logoUrl: '', orgType: 'Government PSU', description: '', engineerNotes: '',
  gateCutoff: '', bondYears: '', headquarters: '',
  recruitmentMode: '', eligibleBranches: '', websiteUrl: '', applyUrl: '', isFeatured: false, status: 'draft',
};

export default function OrganisationsPanel() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-organisations'],
    queryFn: async () => (await api.get('/organisations/admin/all')).data.data,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        bondYears: form.bondYears ? Number(form.bondYears) : null,
        eligibleBranches: form.eligibleBranches.split(',').map((b) => b.trim()).filter(Boolean),
      };
      if (editingId) return api.put(`/organisations/${editingId}`, payload);
      return api.post('/organisations', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-organisations'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/organisations/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-organisations'] }),
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (org: any) => {
    setForm({
      name: org.name, fullName: org.full_name || '', logoUrl: org.logo_url || '', orgType: org.org_type || 'Government PSU',
      description: org.description || '', engineerNotes: org.engineer_notes || '',
      gateCutoff: org.gate_cutoff || '', bondYears: org.bond_years ?? '', headquarters: org.headquarters || '',
      recruitmentMode: org.recruitment_mode || '', eligibleBranches: (org.eligible_branches || []).join(', '),
      websiteUrl: org.website_url || '', applyUrl: org.apply_url || '', isFeatured: org.is_featured, status: org.status,
    });
    setEditingId(org.id);
    setShowForm(true);
  };

  if (isLoading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-surface-900 dark:text-white">Organisations</h2>
        {!showForm && <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(true)}>New Organisation</Button>}
      </div>

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">{editingId ? 'Edit Organisation' : 'New Organisation'}</h3>
            <button type="button" onClick={resetForm}><X className="w-4 h-4 text-surface-400" /></button>
          </div>
          <JsonUploadPrefill
            templateUrl="/templates/organisation-template.json"
            onLoad={(data) => setForm((prev) => ({ ...prev, ...data }))}
          />

          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <Input label="Logo URL" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
          <Select label="Type" value={form.orgType} onChange={(e) => setForm({ ...form, orgType: e.target.value })} options={ORG_TYPES.map((t) => ({ value: t, label: t }))} />
          <Textarea label="Description (HTML allowed)" rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Textarea
            label="What a chemical engineer should know (HTML allowed)"
            rows={5}
            placeholder="Typical roles, growth path, work culture -- never salary"
            value={form.engineerNotes}
            onChange={(e) => setForm({ ...form, engineerNotes: e.target.value })}
          />
          <Input label="GATE cutoff (leave blank if not GATE-based)" value={form.gateCutoff} onChange={(e) => setForm({ ...form, gateCutoff: e.target.value })} />
          <Input label="Bond years" type="number" value={form.bondYears} onChange={(e) => setForm({ ...form, bondYears: e.target.value })} />
          <Input label="Headquarters" value={form.headquarters} onChange={(e) => setForm({ ...form, headquarters: e.target.value })} />
          <Input label="Recruitment mode" value={form.recruitmentMode} onChange={(e) => setForm({ ...form, recruitmentMode: e.target.value })} />
          <Input label="Eligible branches (comma-separated)" value={form.eligibleBranches} onChange={(e) => setForm({ ...form, eligibleBranches: e.target.value })} />
          <Input label="Website URL" value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} />
          <Input label="Apply URL" value={form.applyUrl} onChange={(e) => setForm({ ...form, applyUrl: e.target.value })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
            Featured
          </label>
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={[{ value: 'draft', label: 'Draft (hidden)' }, { value: 'published', label: 'Published (public)' }]} />
          {saveMutation.isError && (
            <p className="text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
              {(saveMutation.error as any)?.response?.data?.message || 'Something went wrong saving this. Check the console for details.'}
            </p>
          )}
          <Button type="submit" isLoading={saveMutation.isPending}>{editingId ? 'Save Changes' : 'Create Organisation'}</Button>
        </form>
      )}

      <div className="space-y-2">
        {data?.length === 0 && <p className="text-sm text-surface-400 italic">No organisations yet.</p>}
        {data?.map((org: any) => (
          <div key={org.id} className="flex items-center justify-between bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl px-4 py-3">
            <div>
              <p className="font-semibold text-sm text-surface-900 dark:text-white">{org.name}{org.is_featured ? ' ⭐' : ''}</p>
              <p className="text-xs text-surface-400">{org.org_type} · <span className={org.status === 'published' ? 'text-green-600' : 'text-amber-600'}>{org.status}</span></p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(org)} className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg"><Pencil className="w-4 h-4 text-surface-500" /></button>
              <button onClick={() => confirm('Delete this organisation?') && deleteMutation.mutate(org.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
