import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import type { AiRecommendation } from '../../types';

export default function RecommendationCard({ rec }: { rec: AiRecommendation }) {
  const score = Math.round(rec.matchScore);
  const fillPercent = Math.min(score, 100);

  return (
    <div className="flex items-stretch gap-4 p-5 border border-ink-200 rounded-md hover:border-ink-400 transition-colors">
      <div className="w-1.5 self-stretch rounded-full overflow-hidden bg-ink-100">
        <div className="w-full rounded-full transition-all" style={{
          height: `${fillPercent}%`,
          marginTop: `${100 - fillPercent}%`,
          background: score >= 80 ? '#2D8A3E' : score >= 60 ? '#D99409' : '#C4421A',
        }} />
      </div>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-mono font-semibold tabular-nums">{score}</span>
          <span className="text-xs font-mono text-ink-400">/ 100</span>
        </div>
        <Link to={`/jobs/${rec.jobId}`} className="font-heading font-semibold text-lg mt-1 block hover:text-verdant-600 transition-colors">
          {rec.job?.title || 'Job Position'}
        </Link>
        <p className="text-sm text-ink-500">{rec.job?.employer?.companyProfile?.companyName} · {rec.job?.location}</p>
        {rec.explanation && <p className="text-sm text-ink-600 mt-2">{rec.explanation}</p>}
        {rec.skillGap && rec.skillGap.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {rec.skillGap.slice(0, 3).map((sg, i) => (
              <Badge key={i} variant="warning">{sg.skill_name}</Badge>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 shrink-0">
        <Link to={`/jobs/${rec.jobId}`}><Button variant="outline" size="sm">View</Button></Link>
      </div>
    </div>
  );
}
