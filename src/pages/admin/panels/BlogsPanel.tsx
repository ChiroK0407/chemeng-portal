import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/axios';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { Spinner } from '../../../components/ui/Spinner';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

const emptyForm = { title: '', content: '', coverImage: '', authorName: '', tags: '', status: 'draft' };

export default function BlogsPanel() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-blogs'],
    queryFn: async () => (await api.get('/blogs/admin/all')).data.data,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) };
      if (editingId) return api.put(`/blogs/${editingId}`, payload);
      return api.post('/blogs', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/blogs/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-blogs'] }),
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (blog: any) => {
    setForm({
      title: blog.title,
      content: blog.content,
      coverImage: blog.cover_image || '',
      authorName: blog.author_name,
      tags: (blog.tags || []).join(', '),
      status: blog.status,
    });
    setEditingId(blog.id);
    setShowForm(true);
  };

  if (isLoading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-surface-900 dark:text-white">Blogs</h2>
        {!showForm && (
          <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(true)}>New Post</Button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }}
          className="bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 mb-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">{editingId ? 'Edit Post' : 'New Post'}</h3>
            <button type="button" onClick={resetForm}><X className="w-4 h-4 text-surface-400" /></button>
          </div>
          <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="Author name" required value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} />
          <Textarea label="Content" required rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          <Input label="Cover image URL" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} />
          <Input label="Tags (comma-separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
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
          <Button type="submit" isLoading={saveMutation.isPending}>{editingId ? 'Save Changes' : 'Create Post'}</Button>
        </form>
      )}

      <div className="space-y-2">
        {data?.length === 0 && <p className="text-sm text-surface-400 italic">No posts yet.</p>}
        {data?.map((blog: any) => (
          <div key={blog.id} className="flex items-center justify-between bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl px-4 py-3">
            <div>
              <p className="font-semibold text-sm text-surface-900 dark:text-white">{blog.title}</p>
              <p className="text-xs text-surface-400">{blog.author_name} · <span className={blog.status === 'published' ? 'text-green-600' : 'text-amber-600'}>{blog.status}</span></p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(blog)} className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg"><Pencil className="w-4 h-4 text-surface-500" /></button>
              <button onClick={() => confirm('Delete this post?') && deleteMutation.mutate(blog.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
