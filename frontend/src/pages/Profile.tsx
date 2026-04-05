import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuthStore } from '../store/authStore';
import { userApi, companyApi, resumeApi } from '../services/api';

export default function Profile() {
  const { user, fetchMe } = useAuthStore();
  const [activeTab, setActiveTab] = useState('personal');
  const [skills, setSkills] = useState<{ skillName: string; proficiencyLevel: number }[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [newLevel, setNewLevel] = useState(3);
  const [loading, setLoading] = useState(false);
  const [resumes, setResumes] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  // Security tab state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  const { register, handleSubmit, reset } = useForm();
  const companyForm = useForm();

  useEffect(() => {
    if (user) {
      reset({ name: user.name, phone: user.phone || '', location: user.location || '', bio: user.bio || '' });
      setSkills(user.userSkills?.map((us) => ({ skillName: us.skill?.name || '', proficiencyLevel: us.proficiencyLevel || 3 })) || []);
      if (user.role === 'EMPLOYER' && user.companyProfile) {
        companyForm.reset(user.companyProfile);
      }
    }
    loadResumes();
  }, [user]);

  const loadResumes = async () => {
    try {
      const { data: res } = await resumeApi.getAll();
      setResumes(res.data || []);
    } catch {}
  };

  const onSaveProfile = async (data: any) => {
    setLoading(true);
    try {
      await userApi.updateProfile(data);
      await fetchMe();
      toast.success('Profile updated');
    } catch { toast.error('Failed to update'); }
    setLoading(false);
  };

  const onSaveSkills = async () => {
    setLoading(true);
    try {
      await userApi.updateSkills(skills);
      await fetchMe();
      toast.success('Skills updated');
    } catch { toast.error('Failed to update skills'); }
    setLoading(false);
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.find((s) => s.skillName.toLowerCase() === newSkill.toLowerCase())) {
      setSkills([...skills, { skillName: newSkill.trim(), proficiencyLevel: newLevel }]);
      setNewSkill('');
    }
  };

  const onSaveCompany = async (data: any) => {
    setLoading(true);
    try {
      await companyApi.update(data);
      await fetchMe();
      toast.success('Company profile updated');
    } catch { toast.error('Failed to update'); }
    setLoading(false);
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await resumeApi.upload(file);
      await loadResumes();
      await fetchMe();
      toast.success('Resume uploaded and parsed');
    } catch { toast.error('Upload failed'); }
    setUploading(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) { toast.error('Passwords do not match'); return; }
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setPasswordLoading(true);
    try {
      await userApi.changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword('');
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    setPasswordLoading(false);
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !emailPassword) { toast.error('All fields are required'); return; }
    setEmailLoading(true);
    try {
      await userApi.changeEmail({ newEmail, password: emailPassword });
      toast.success('Verification email sent to your new address');
      setNewEmail(''); setEmailPassword('');
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to change email'); }
    setEmailLoading(false);
  };

  const tabs = ['personal', 'skills', 'resumes', 'security'];
  if (user?.role === 'EMPLOYER') tabs.splice(3, 0, 'company');

  return (
    <DashboardLayout>
      <h1 className="font-heading text-2xl font-bold text-ink-900 mb-6">Profile Settings</h1>

      <div className="flex gap-2 mb-6 border-b border-ink-200">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === tab ? 'border-verdant-600 text-verdant-600' : 'border-transparent text-ink-500 hover:text-ink-700'}`}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'personal' && (
        <Card>
          <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4 max-w-lg">
            <Input label="Full Name" {...register('name')} />
            <Input label="Email" value={user?.email || ''} disabled />
            <Input label="Phone" {...register('phone')} />
            <Input label="Location" {...register('location')} />
            <TextArea label="Bio" {...register('bio')} maxLength={2000} />
            <Button type="submit" isLoading={loading}>Save Changes</Button>
          </form>
        </Card>
      )}

      {activeTab === 'skills' && (
        <Card>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {skills.map((s, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 border border-ink-200 rounded-md font-mono text-xs text-ink-700">
                  {s.skillName} <span className="text-ink-400">({s.proficiencyLevel}/5)</span>
                  <button onClick={() => setSkills(skills.filter((_, j) => j !== i))} className="ml-1 text-ink-400 hover:text-signal-high transition-colors">&times;</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 items-end">
              <Input label="Add Skill" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="e.g. React" />
              <div>
                <p className="label mb-1">Level</p>
                <select value={newLevel} onChange={(e) => setNewLevel(Number(e.target.value))} className="px-3 py-2 border border-ink-200 rounded-md font-body text-sm transition-colors focus:border-verdant-500 focus:outline-none">
                  {[1, 2, 3, 4, 5].map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <Button onClick={addSkill} variant="secondary">Add</Button>
            </div>
            <Button onClick={onSaveSkills} isLoading={loading}>Save Skills</Button>
          </div>
        </Card>
      )}

      {activeTab === 'resumes' && (
        <Card>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-ink-300 rounded-md p-6 text-center">
              <p className="text-ink-500 mb-2 font-body">Upload your resume (PDF, DOC, DOCX - max 10MB)</p>
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" id="resume-upload" />
              <label htmlFor="resume-upload">
                <span className="inline-flex items-center px-4 py-2 border-2 border-verdant-600 text-verdant-600 rounded-md text-sm font-medium cursor-pointer hover:bg-verdant-50 transition-colors">{uploading ? 'Uploading...' : 'Choose File'}</span>
              </label>
            </div>
            {resumes.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-4 border border-ink-200 rounded-md">
                <div>
                  <p className="font-medium text-sm text-ink-900">{r.fileName}</p>
                  <p className="text-xs text-ink-500">{new Date(r.uploadedAt).toLocaleDateString()}</p>
                  {r.parsedData?.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {r.parsedData.skills.slice(0, 8).map((s: string) => (
                        <span key={s} className="inline-flex items-center px-2 py-0.5 border border-ink-200 rounded-md font-mono text-xs text-ink-600">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
                <Button variant="danger" size="sm" onClick={async () => {
                  await resumeApi.delete(r.id);
                  await loadResumes();
                  toast.success('Deleted');
                }}>Delete</Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'company' && user?.role === 'EMPLOYER' && (
        <Card>
          <form onSubmit={companyForm.handleSubmit(onSaveCompany)} className="space-y-4 max-w-lg">
            <Input label="Company Name" {...companyForm.register('companyName')} />
            <Input label="Industry" {...companyForm.register('industry')} />
            <Input label="Website" {...companyForm.register('website')} />
            <TextArea label="Description" {...companyForm.register('description')} />
            <div>
              <p className="label mb-1">Company Size</p>
              <select {...companyForm.register('size')} className="w-full px-3 py-2 border border-ink-200 rounded-md font-body text-sm transition-colors focus:border-verdant-500 focus:outline-none">
                <option value="">Select size</option>
                {['1-10', '11-50', '51-200', '201-500', '500+'].map((s) => <option key={s} value={s}>{s} employees</option>)}
              </select>
            </div>
            <Button type="submit" isLoading={loading}>Save Company Profile</Button>
          </form>
        </Card>
      )}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card>
            <h3 className="font-heading text-lg font-semibold text-ink-900 mb-4">Change Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
              <Input label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" required />
              <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 8 chars, upper + lower + number" required />
              <Input label="Confirm New Password" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="••••••••" required />
              <Button type="submit" isLoading={passwordLoading}>Update Password</Button>
            </form>
          </Card>
          <Card>
            <h3 className="font-heading text-lg font-semibold text-ink-900 mb-4">Change Email</h3>
            <p className="text-sm text-ink-500 mb-4">Current email: <span className="font-medium text-ink-700">{user?.email}</span></p>
            <form onSubmit={handleChangeEmail} className="space-y-4 max-w-lg">
              <Input label="New Email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="new@example.com" required />
              <Input label="Password" type="password" value={emailPassword} onChange={(e) => setEmailPassword(e.target.value)} placeholder="Enter your password to confirm" required />
              <Button type="submit" isLoading={emailLoading}>Change Email</Button>
            </form>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
