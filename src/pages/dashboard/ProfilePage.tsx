import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/axios';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useState, useEffect } from 'react';
import { Award, User, GraduationCap, Link2, Plus, X } from 'lucide-react';

interface ProfileFormInputs {
  fullName: string;
  username: string;
  bio: string;
  college: string;
  branch: string;
  gradYear: string;
  linkedinUrl: string;
  githubUrl: string;
  websiteUrl: string;
}

export default function ProfilePage() {
  // ✅ FIXED: Destructured 'profile' from useAuth() as exposed by your AuthContextValue
  const { profile, refreshProfile } = useAuth(); 
  const queryClient = useQueryClient();

  const currentSkills = Array.isArray(profile?.skills) ? profile.skills : [];
  const [skills, setSkills] = useState<string[]>(currentSkills);
  const [skillInput, setSkillInput] = useState('');

  // Synchronize dynamic skill lists state if profile updates after initial load
  useEffect(() => {
    if (Array.isArray(profile?.skills)) {
      setSkills(profile.skills);
    }
  }, [profile?.skills]);

  // ✅ FIXED: Configured default form values to safely point back to the local 'profile' data object
  const { register, handleSubmit, reset } = useForm<ProfileFormInputs>({
    defaultValues: {
      fullName: profile?.fullName || '',
      username: profile?.username || '',
      bio: profile?.bio || '',
      college: profile?.college || '',
      branch: profile?.branch || 'Chemical Engineering',
      gradYear: profile?.gradYear ? String(profile.gradYear) : '',
      linkedinUrl: profile?.linkedinUrl || '',
      githubUrl: profile?.githubUrl || '',
      websiteUrl: profile?.websiteUrl || ''
    }
  });

  // Re-sync form fields if auth data changes
  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName || '',
        username: profile.username || '',
        bio: profile.bio || '',
        college: profile.college || '',
        branch: profile.branch || 'Chemical Engineering',
        gradYear: profile.gradYear ? String(profile.gradYear) : '',
        linkedinUrl: profile.linkedinUrl || '',
        githubUrl: profile.githubUrl || '',
        websiteUrl: profile.websiteUrl || ''
      });
    }
  }, [profile, reset]);

  const updateMutation = useMutation({
    mutationFn: async (data: ProfileFormInputs) => {
      const payload = { ...data, gradYear: data.gradYear ? Number(data.gradYear) : null, skills };
      const res = await api.patch('/members/profile', payload);
      return res.data;
    },
    onSuccess: async () => {
      alert('Profile details successfully validated and updated.');
      // Invalidate query caches and force the context to fetch fresh profile tokens
      queryClient.invalidateQueries({ queryKey: ['me'] });
      if (refreshProfile) {
        await refreshProfile();
      }
    },
    onError: () => {
      alert('Failed to save profile changes. Verify your field parameter definitions.');
    }
  });

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillInput.trim()) return;
    if (!skills.includes(skillInput.trim())) {
      setSkills(prev => [...prev, skillInput.trim()]);
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (tag: string) => {
    setSkills(prev => prev.filter(s => s !== tag));
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white">Profile Settings</h1>
          <p className="text-sm text-surface-500">Configure your digital core engineering portfolio identity parameters.</p>
        </div>

        <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-6">
          
          {/* Avatar Preview Segment Section */}
          <Card className="p-5 dark:bg-surface-900 border-surface-200 dark:border-surface-800 flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-inner flex-shrink-0">
              {profile?.fullName?.substring(0, 2).toUpperCase() || 'CH'}
            </div>
            <div>
              <h4 className="font-bold text-sm text-surface-900 dark:text-white">Identity Avatar</h4>
              <Button type="button" variant="outline" className="mt-2 text-xs py-1 px-3 h-auto" onClick={() => alert('Cloudinary assets attachment engine initialized.')}>Upload Avatar</Button>
            </div>
          </Card>

          {/* Core Personal Metadata Grid Block */}
          <Card className="p-6 dark:bg-surface-900 border-surface-200 dark:border-surface-800 space-y-4">
            <h3 className="font-bold text-sm text-surface-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider border-b pb-2 border-surface-100 dark:border-surface-800"><User className="w-4 h-4 text-blue-600" /> Identity Particulars</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-surface-500 uppercase tracking-wide">Full Legal Name</label>
                <input type="text" {...register('fullName', { required: true })} className="w-full mt-1 p-2.5 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a63ef]" />
              </div>
              <div>
                <label className="text-xs font-bold text-surface-500 uppercase tracking-wide">Username</label>
                <input type="text" {...register('username', { required: true })} className="w-full mt-1 p-2.5 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a63ef]" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-surface-500 uppercase tracking-wide">Professional Abstract / Biography Statement</label>
                <textarea rows={3} {...register('bio')} placeholder="Summarize your engineering specializations or research domains..." className="w-full mt-1 p-2.5 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a63ef]" />
              </div>
            </div>
          </Card>

          {/* Academic Alignments Selection Field Grid Panel Block */}
          <Card className="p-6 dark:bg-surface-900 border-surface-200 dark:border-surface-800 space-y-4">
            <h3 className="font-bold text-sm text-surface-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider border-b pb-2 border-surface-100 dark:border-surface-800"><GraduationCap className="w-4 h-4 text-purple-500" /> Academic Affiliation Matrices</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-surface-500 uppercase tracking-wide">College Campus / Institute</label>
                <input type="text" {...register('college')} className="w-full mt-1 p-2.5 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a63ef]" />
              </div>
              <div>
                <label className="text-xs font-bold text-surface-500 uppercase tracking-wide">Graduation Batch Year</label>
                <input type="number" placeholder="2026" {...register('gradYear')} className="w-full mt-1 p-2.5 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a63ef]" />
              </div>
              <div className="sm:col-span-3">
                <label className="text-xs font-bold text-surface-500 uppercase tracking-wide">Engineering Branch Specification</label>
                <input type="text" {...register('branch')} className="w-full mt-1 p-2.5 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a63ef]" />
              </div>
            </div>
          </Card>

          {/* Dynamic Technical Skills Management Tag Panel Block */}
          <Card className="p-6 dark:bg-surface-900 border-surface-200 dark:border-surface-800 space-y-4">
            <h3 className="font-bold text-sm text-surface-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider border-b pb-2 border-surface-100 dark:border-surface-800"><Award className="w-4 h-4 text-teal-500" /> Technical Domain Core Expertise</h3>
            <div>
              <label className="text-xs font-bold text-surface-500 uppercase tracking-wide">Add Skills Tags</label>
              <div className="flex gap-2 mt-1">
                <input type="text" placeholder="e.g. Aspen Plus, MATLAB, Process Control" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} className="flex-1 p-2.5 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a63ef]" />
                <button type="button" onClick={handleAddSkill} className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center justify-center shadow-sm"><Plus className="w-5 h-5" /></button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3.5">
                {skills.map(s => (
                  <span key={s} className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 text-xs font-bold rounded-lg bg-surface-100 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 text-surface-700 dark:text-surface-300">
                    {s} <X className="w-3 h-3 text-surface-400 hover:text-red-500 cursor-pointer" onClick={() => handleRemoveSkill(s)} />
                  </span>
                ))}
              </div>
            </div>
          </Card>

          {/* External Social Profiles Channel Block Area */}
          <Card className="p-6 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 space-y-4">
            <h3 className="font-bold text-sm text-surface-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider border-b pb-2 border-surface-100 dark:border-surface-800"><Link2 className="w-4 h-4 text-amber-500" /> Professional Channels Mappings</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-surface-50 dark:bg-surface-950 p-2 border border-surface-200 dark:border-surface-800 rounded-xl">
                <div className="w-5 h-5 text-surface-400 fill-current ml-2 flex items-center">
                  <svg viewBox="0 0 24 24" className="w-full h-full"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </div>
                <input type="text" placeholder="LinkedIn Profile URL..." {...register('linkedinUrl')} className="flex-1 bg-transparent border-none text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-0" />
              </div>
              <div className="flex items-center gap-3 bg-surface-50 dark:bg-surface-950 p-2 border border-surface-200 dark:border-surface-800 rounded-xl">
                <div className="w-5 h-5 text-surface-400 fill-current ml-2 flex items-center">
                  <svg viewBox="0 0 24 24" className="w-full h-full"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 3.523 1.304 4.381.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </div>
                <input type="text" placeholder="GitHub Handle URL..." {...register('githubUrl')} className="flex-1 bg-transparent border-none text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-0" />
              </div>
            </div>
          </Card>

          <div className="flex justify-end pt-4">
            <Button type="submit" variant="primary" className="px-6 rounded-xl font-bold shadow-sm" isLoading={updateMutation.isPending}>Save Profile Context Changes</Button>
          </div>

        </form>
      </div>
    </div>
  );
}