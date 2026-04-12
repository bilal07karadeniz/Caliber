import { useState, useRef, useEffect } from 'react';
import { skillApi } from '../services/api';
import type { Skill } from '../types';

interface SkillAutocompleteProps {
  onSelect: (skill: { name: string; id?: string }) => void;
  placeholder?: string;
  excludeNames?: string[];
}

export default function SkillAutocomplete({ onSelect, placeholder = 'Search skills...', excludeNames = [] }: SkillAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Skill[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = (value: string) => {
    setQuery(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!value.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await skillApi.search({ search: value, limit: 20 });
        const filtered = (data.data as Skill[]).filter((s) => !excludeNames.includes(s.name));
        setResults(filtered);
        setOpen(true);
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 300);
  };

  const handleSelect = (skill: Skill) => {
    onSelect({ name: skill.name, id: skill.id });
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  const handleAddNew = () => {
    if (!query.trim()) return;
    onSelect({ name: query.trim() });
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  // Group results by category
  const grouped: Record<string, Skill[]> = {};
  for (const s of results) {
    const cat = s.category || 'Other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(s);
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => search(e.target.value)}
        onFocus={() => { if (results.length) setOpen(true); }}
        placeholder={placeholder}
        className="w-full bg-transparent border-b-2 py-2.5 text-ink-900 placeholder:text-ink-300 focus:outline-none transition-colors font-body border-ink-300 focus:border-verdant-500"
      />
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-ink-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {loading && <div className="px-4 py-2 text-sm text-ink-400">Searching...</div>}
          {!loading && results.length === 0 && query.trim() && (
            <button
              type="button"
              onClick={handleAddNew}
              className="w-full px-4 py-2 text-left text-sm hover:bg-verdant-50 text-verdant-600"
            >
              Add "{query.trim()}" as new skill
            </button>
          )}
          {Object.entries(grouped).map(([category, skills]) => (
            <div key={category}>
              <div className="px-4 py-1.5 text-xs font-semibold text-ink-400 uppercase tracking-wider bg-ink-50">
                {category}
              </div>
              {skills.map((skill) => (
                <button
                  type="button"
                  key={skill.id}
                  onClick={() => handleSelect(skill)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-verdant-50 text-ink-700"
                >
                  {skill.name}
                </button>
              ))}
            </div>
          ))}
          {!loading && results.length > 0 && query.trim() && !results.some((s) => s.name.toLowerCase() === query.trim().toLowerCase()) && (
            <button
              type="button"
              onClick={handleAddNew}
              className="w-full px-4 py-2 text-left text-sm hover:bg-verdant-50 text-verdant-600 border-t border-ink-100"
            >
              Add "{query.trim()}" as new skill
            </button>
          )}
        </div>
      )}
    </div>
  );
}
