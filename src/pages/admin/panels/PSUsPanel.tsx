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

const SECTORS = ['Maharatna', 'Navratna', 'Miniratna', 'Central PSU', 'State PSU'];

const emptyForm = {
  name: '', fullName: '', logoUrl: '', sector: 'Navratna', description: '',
  packageMinLpa: '', packageMaxLpa: '', gateCutoff: '', bondYears: '', headquarters: '',
  recruitmentMode: '', eligibleBranches: '', websiteUrl: '', applyUrl: '', isFeatured: false, status: 'draft',
};

export default function PSUsPanel() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-psus'],
    queryFn: async () => (await api.get('/psus/admin/all')).data.data,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        packageMinLpa: form.packageMinLpa ? Number(form.packageMinLpa) : null,
        packageMaxLpa: form.packageMaxLpa ? Number(form.packageMaxLpa) : null,
        bondYears: form.bondYears ? Number(form.bondYears) : null,
        eligibleBranches: form.eligibleBranches.split(',').map((b) => b.trim()).filter(Boolean),
      };
      if (editingId) return api.put(`/psus/${editingId}`, payload);
      return api.post('/psus', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-psus'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/psus/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-psus'] }),
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (psu: any) => {
    setForm({
      name: psu.name, fullName: psu.full_name || '', logoUrl: psu.logo_url || '', sector: psu.sector || 'Navratna',
      description: psu.description || '', packageMinLpa: psu.package_min_lpa ?? '', packageMaxLpa: psu.package_max_lpa ?? '',
      gateCutoff: psu.gate_cutoff || '', bondYears: psu.bond_years ?? '', headquarters: psu.headquarters || '',
      recruitmentMode: psu.recruitment_mode || '', eligibleBranches: (psu.eligible_branches || []).join(', '),
      websiteUrl: psu.website_url || '', applyUrl: psu.apply_url || '', isFeatured: psu.is_featured, status: psu.status,
    });
    setEditingId(psu.id);
    setShowForm(true);
  };

  if (isLoading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-surface-900 dark:text-white">PSUs</h2>
        {!showForm && <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(true)}>New PSU</Button>}
      </div>

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">{editingId ? 'Edit PSU' : 'New PSU'}</h3>
            <button type="button" onClick={resetForm}><X className="w-4 h-4 text-surface-400" /></button>
          </div>
          <JsonUploadPrefill
            templateUrl="/templates/psu-template.json"
            onLoad={(data) => setForm((prev) => ({ ...prev, ...data }))}
          />

          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <Input label="Logo URL" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
          <Select label="Sector" value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} options={SECTORS.map((s) => ({ value: s, label: s }))} />
          <Textarea label="Description (HTML allowed)" rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Min package (LPA)" type="number" value={form.packageMinLpa} onChange={(e) => setForm({ ...form, packageMinLpa: e.target.value })} />
            <Input label="Max package (LPA)" type="number" value={form.packageMaxLpa} onChange={(e) => setForm({ ...form, packageMaxLpa: e.target.value })} />
          </div>
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
          <Button type="submit" isLoading={saveMutation.isPending}>{editingId ? 'Save Changes' : 'Create PSU'}</Button>
        </form>
      )}

      <div className="space-y-2">
        {data?.length === 0 && <p className="text-sm text-surface-400 italic">No PSUs yet.</p>}
        {data?.map((psu: any) => (
          <div key={psu.id} className="flex items-center justify-between bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl px-4 py-3">
            <div>
              <p className="font-semibold text-sm text-surface-900 dark:text-white">{psu.name}{psu.is_featured ? ' ⭐' : ''}</p>
              <p className="text-xs text-surface-400">{psu.sector} · <span className={psu.status === 'published' ? 'text-green-600' : 'text-amber-600'}>{psu.status}</span></p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(psu)} className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg"><Pencil className="w-4 h-4 text-surface-500" /></button>
              <button onClick={() => confirm('Delete this PSU?') && deleteMutation.mutate(psu.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
