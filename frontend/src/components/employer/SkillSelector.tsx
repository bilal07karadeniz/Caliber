import { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface Props {
  skills: { name: string; requiredLevel: number }[];
  onChange: (skills: { name: string; requiredLevel: number }[]) => void;
}

export default function SkillSelector({ skills, onChange }: Props) {
  const [name, setName] = useState('');
  const [level, setLevel] = useState(3);

  const add = () => {
    if (name.trim() && !skills.find(s => s.name.toLowerCase() === name.toLowerCase())) {
      onChange([...skills, { name: name.trim(), requiredLevel: level }]);
      setName('');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {skills.map((s, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 border border-ink-200 text-ink-700 rounded-sm text-sm font-mono">
            {s.name} (L{s.requiredLevel})
            <button onClick={() => onChange(skills.filter((_, j) => j !== i))} className="text-ink-400 hover:text-signal-low">&times;</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2 items-end">
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Skill name" />
        <select value={level} onChange={e => setLevel(Number(e.target.value))} className="px-3 py-2 border border-ink-200 rounded-md text-sm font-mono bg-surface-raised">
          {[1,2,3,4,5].map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <Button type="button" variant="secondary" size="sm" onClick={add}>Add</Button>
      </div>
    </div>
  );
}
