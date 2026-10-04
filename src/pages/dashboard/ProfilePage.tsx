import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMyMember, useJoinMembers, useUpdateMyMember, MyMemberInput } from '../../hooks/useMyMember';
import { toImageDataUrl } from '../../utils/toImageDataUrl';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { Clock, CheckCircle2, ExternalLink, Upload } from 'lucide-react';

const emptyForm: MyMemberInput = {
  fullName: '', roleTitle: '', category: 'current', branch: '', bio: '', photoUrl: '', linkedinUrl: '', rollNumber: '',
};

const STREAMS = ['BChE'];
const ROLL_NUMBER_PATTERN = /^[0-9]{12}$/;

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: myMember, isLoading } = useMyMember();
  const joinMutation = useJoinMembers();
  const updateMutation = useUpdateMyMember();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<MyMemberInput>(emptyForm);
  const [rollNumberError, setRollNumberError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoProcessing, setPhotoProcessing] = useState(false);

  useEffect(() => {
    if (myMember) {
      setForm({
        fullName: myMember.full_name || '',
        roleTitle: myMember.role_title || '',
        category: myMember.category || 'current',
        branch: myMember.branch || '',
        bio: myMember.bio || '',
        photoUrl: myMember.photo_url || '',
        linkedinUrl: myMember.linkedin_url || '',
        rollNumber: myMember.roll_number || '',
      });
    } else if (user) {
      setForm((f) => ({ ...f, fullName: f.fullName || user.full_name || '' }));
    }
  }, [myMember, user]);

  const hasJoined = !!myMember;
  const isPending = myMember?.status === 'draft';
  const isLive = myMember?.status === 'published';

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);

    if (!file.type.startsWith('image/')) {
      setPhotoError('Please choose an image file.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setPhotoError('Image is too large — please choose one under 8MB.');
      return;
    }

    setPhotoProcessing(true);
    try {
      const dataUrl = await toImageDataUrl(file);
      setForm((f) => ({ ...f, photoUrl: dataUrl }));
    } catch (err: any) {
      setPhotoError(err.message || 'Could not process that image.');
    } finally {
      setPhotoProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (form.category === 'current' && !ROLL_NUMBER_PATTERN.test(form.rollNumber || '')) {
      setRollNumberError('Roll number must be exactly 12 digits.');
      return;
    }
    setRollNumberError(null);

    const payload = form.category === 'alumni' ? { ...form, rollNumber: undefined } : form;
    if (hasJoined) {
      updateMutation.mutate(payload);
    } else {
      joinMutation.mutate(payload);
    }
  };

  const saving = joinMutation.isPending || updateMutation.isPending;
  const saveError = joinMutation.error || updateMutation.error;

  if (isLoading) return <Spinner />;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white">
            {hasJoined ? 'Edit Your Member Card' : 'Set Up Your Member Card'}
          </h1>
          <p className="text-sm text-surface-500 mt-1">
            {hasJoined
              ? 'Update your details any time — changes go live after admin review.'
              : 'Fill this in and hit Join to appear on the public Members page.'}
          </p>
        </div>

        {isPending && (
          <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl text-sm font-semibold text-amber-700 dark:text-amber-400">
            <Clock className="w-4 h-4 flex-shrink-0" /> Pending admin approval — not visible on the Members page yet.
          </div>
        )}
        {isLive && (
          <div className="flex items-center justify-between gap-2 px-4 py-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-xl text-sm font-semibold text-green-700 dark:text-green-400">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Live on the Members page.</span>
            <Link to={`/members/${myMember.id}`} className="flex items-center gap-1 text-xs underline underline-offset-2">
              View your card <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Card className="p-6 dark:bg-surface-900 border-surface-200 dark:border-surface-800 space-y-4">
            <div>
              <label className="text-xs font-bold text-surface-500 uppercase tracking-wide">Photo</label>
              <div className="flex items-center gap-4 mt-1.5">
                {form.photoUrl ? (
                  <img src={form.photoUrl} alt="Preview" className="w-16 h-16 rounded-full object-cover border border-surface-200 dark:border-surface-800" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-400 text-xs font-bold">
                    No photo
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
                <Button
                  type="button" variant="outline" size="sm" isLoading={photoProcessing}
                  leftIcon={<Upload className="w-3.5 h-3.5" />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {form.photoUrl ? 'Change photo' : 'Upload photo'}
                </Button>
              </div>
              {photoError && <p className="text-xs font-semibold text-red-600 mt-1.5">{photoError}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-surface-500 uppercase tracking-wide">Full name</label>
                <input
                  type="text" required value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a63ef]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-surface-500 uppercase tracking-wide">Role / title</label>
                <input
                  type="text" placeholder="e.g. Final year, Chemical Engineering" value={form.roleTitle}
                  onChange={(e) => setForm({ ...form, roleTitle: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a63ef]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-surface-500 uppercase tracking-wide">You are</label>
                <select
                  value={form.category}
                  onChange={(e) => {
                    const category = e.target.value as 'current' | 'alumni';
                    setRollNumberError(null);
                    setForm({ ...form, category, rollNumber: category === 'alumni' ? '' : form.rollNumber });
                  }}
                  className="w-full mt-1 p-2.5 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a63ef]"
                >
                  <option value="current">Current student</option>
                  <option value="alumni">Alumni</option>
                </select>
              </div>
              {form.category === 'current' && (
                <div>
                  <label className="text-xs font-bold text-surface-500 uppercase tracking-wide">Roll number (12 digits)</label>
                  <input
                    type="text" inputMode="numeric" required maxLength={12}
                    value={form.rollNumber}
                    onChange={(e) => {
                      setRollNumberError(null);
                      setForm({ ...form, rollNumber: e.target.value.replace(/\D/g, '') });
                    }}
                    className="w-full mt-1 p-2.5 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a63ef]"
                  />
                  {rollNumberError && <p className="text-xs font-semibold text-red-600 mt-1">{rollNumberError}</p>}
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-surface-500 uppercase tracking-wide">Stream</label>
                <select
                  required
                  value={form.branch}
                  onChange={(e) => setForm({ ...form, branch: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a63ef]"
                >
                  <option value="" disabled>Select your stream</option>
                  {form.branch && !STREAMS.includes(form.branch) && (
                    <option value={form.branch}>{form.branch}</option>
                  )}
                  {STREAMS.map((stream) => <option key={stream} value={stream}>{stream}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-surface-500 uppercase tracking-wide">Bio</label>
                <textarea
                  rows={3} value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a63ef]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-surface-500 uppercase tracking-wide">LinkedIn URL</label>
                <input
                  type="text" value={form.linkedinUrl}
                  onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a63ef]"
                />
              </div>
            </div>

            {saveError && (
              <p className="text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
                {(saveError as any)?.response?.data?.message || 'Something went wrong saving this.'}
              </p>
            )}

            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={saving} className="px-6 rounded-xl font-bold">
                {hasJoined ? 'Save Changes' : 'Join'}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
}
