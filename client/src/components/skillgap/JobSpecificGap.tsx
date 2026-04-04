import Badge from '../ui/Badge';
import type { SkillGapItem } from '../../types';

interface Props { gaps: SkillGapItem[]; readiness: number; }

export default function JobSpecificGap({ gaps, readiness }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="label shrink-0">Readiness</span>
        <div className="flex-1 flex gap-0.5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className={`h-3 flex-1 rounded-sm ${i < Math.round(readiness / 5) ? 'bg-verdant-500' : 'bg-ink-100'}`} />
          ))}
        </div>
        <span className="font-mono text-sm tabular-nums w-10 text-right">{Math.round(readiness)}%</span>
      </div>
      <div className="space-y-1.5">
        {gaps.map((gap, i) => (
          <div key={i} className="flex items-center justify-between p-2.5 border border-ink-200 rounded-md">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{gap.skill_name}</span>
              <Badge variant={gap.severity === 'critical' ? 'error' : gap.severity === 'moderate' ? 'warning' : 'success'}>{gap.severity || `gap ${gap.gap}`}</Badge>
            </div>
            <span className="text-xs font-mono text-ink-400">L{gap.user_level} → L{gap.required_level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
