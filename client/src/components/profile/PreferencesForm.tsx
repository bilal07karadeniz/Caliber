import { useState, useEffect } from 'react';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE'];
const LABELS: Record<string, string> = { FULL_TIME: 'Full Time', PART_TIME: 'Part Time', CONTRACT: 'Contract', INTERNSHIP: 'Internship', REMOTE: 'Remote' };

export default function PreferencesForm() {
  const [types, setTypes] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('job_preferences');
    if (saved) {
      const p = JSON.parse(saved);
      setTypes(p.types || []);
      setLocation(p.location || '');
      setSalaryMin(p.salaryMin || '');
      setSalaryMax(p.salaryMax || '');
    }
  }, []);

  const toggleType = (t: string) => setTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const handleSave = () => {
    localStorage.setItem('job_preferences', JSON.stringify({ types, location, salaryMin, salaryMax }));
    toast.success('Preferences saved');
  };

  return (
    <div className="space-y-4 max-w-lg">
      <p className="text-sm text-ink-500 font-body">Job preferences help us provide better recommendations.</p>
      <div>
        <label className="label mb-2 block">Preferred Employment Types</label>
        <div className="space-y-2">
          {EMPLOYMENT_TYPES.map(type => (
            <label key={type} className="flex items-center gap-2">
              <input type="checkbox" className="rounded-sm accent-verdant-600" checked={types.includes(type)} onChange={() => toggleType(type)} />
              <span className="text-sm font-body">{LABELS[type]}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="label mb-1 block">Preferred Location</label>
        <input className="w-full px-3 py-2 border border-ink-200 rounded-md text-sm font-body bg-surface-raised focus:outline-none focus:border-verdant-500" placeholder="e.g. Istanbul, Remote" value={location} onChange={e => setLocation(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label mb-1 block">Min Salary (USD)</label>
          <input type="number" className="w-full px-3 py-2 border border-ink-200 rounded-md text-sm font-mono bg-surface-raised focus:outline-none focus:border-verdant-500" placeholder="40000" value={salaryMin} onChange={e => setSalaryMin(e.target.value)} />
        </div>
        <div>
          <label className="label mb-1 block">Max Salary (USD)</label>
          <input type="number" className="w-full px-3 py-2 border border-ink-200 rounded-md text-sm font-mono bg-surface-raised focus:outline-none focus:border-verdant-500" placeholder="100000" value={salaryMax} onChange={e => setSalaryMax(e.target.value)} />
        </div>
      </div>
      <Button onClick={handleSave}>Save Preferences</Button>
    </div>
  );
}
