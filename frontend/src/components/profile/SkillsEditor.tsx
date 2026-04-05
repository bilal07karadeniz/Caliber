import { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { userApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function SkillsEditor() {
  const { user, fetchMe } = useAuthStore();
  const [skills, setSkills] = useState(user?.userSkills?.map(us => ({ skillName: us.skill?.name || '', proficiencyLevel: us.proficiencyLevel || 3 })) || []);
  const [newSkill, setNewSkill] = useState('');
  const [newLevel, setNewLevel] = useState(3);
  const [loading, setLoading] = useState(false);

  const addSkill = () => {
    if (newSkill.trim() && !skills.find(s => s.skillName.toLowerCase() === newSkill.toLowerCase())) {
      setSkills([...skills, { skillName: newSkill.trim(), proficiencyLevel: newLevel }]);
      setNewSkill('');
    }
  };

  const save = async () => {
    setLoading(true);
    try { await userApi.updateSkills(skills); await fetchMe(); toast.success('Skills updated'); }
    catch { toast.error('Failed'); }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-4">
        {skills.map((s, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 border border-ink-200 text-ink-700 rounded-sm text-sm font-mono">
            {s.skillName} ({s.proficiencyLevel}/5)
            <button onClick={() => setSkills(skills.filter((_, j) => j !== i))} className="ml-1 text-ink-400 hover:text-signal-low">&times;</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2 items-end">
        <Input label="Add Skill" value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder="e.g. React" />
        <div>
          <label className="label mb-1 block">Level</label>
          <select value={newLevel} onChange={e => setNewLevel(Number(e.target.value))} className="px-3 py-2 border border-ink-200 rounded-md font-mono text-sm bg-surface-raised">
            {[1,2,3,4,5].map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <Button onClick={addSkill} variant="secondary">Add</Button>
      </div>
      <Button onClick={save} isLoading={loading}>Save Skills</Button>
    </div>
  );
}
