import type { MatchBreakdown as MatchBreakdownType } from '../../types';

export default function MatchBreakdown({ breakdown }: { breakdown: MatchBreakdownType }) {
  const items = [
    { label: 'Skill Match', value: breakdown.skill_match },
    { label: 'Experience', value: breakdown.experience_relevance },
    { label: 'Education', value: breakdown.education_match },
    { label: 'Location', value: breakdown.location_match },
    { label: 'Salary Fit', value: breakdown.salary_fit },
  ];

  return (
    <div className="space-y-2.5">
      {items.map(({ label, value }) => (
        <div key={label} className="flex items-center gap-3">
          <span className="w-24 text-right label shrink-0">{label}</span>
          <div className="flex-1 flex gap-0.5">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className={`h-3 flex-1 rounded-sm transition-colors ${
                i < Math.round(value / 5) ? 'bg-verdant-500' : 'bg-ink-100'
              }`} />
            ))}
          </div>
          <span className="w-10 text-right font-mono text-sm tabular-nums text-ink-600">{Math.round(value)}%</span>
        </div>
      ))}
    </div>
  );
}
