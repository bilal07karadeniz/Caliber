import Card from '../ui/Card';
import Badge from '../ui/Badge';

interface Props { insights: { strongest_areas: string[]; recommended_paths: string[]; next_skills: string[]; summary: string; }; }

export default function CareerInsightsCard({ insights }: Props) {
  return (
    <Card header={<h3 className="text-sm font-heading font-semibold">Career Insights</h3>}>
      <div className="space-y-4">
        <div>
          <p className="label mb-1.5">Strongest Areas</p>
          <div className="flex flex-wrap gap-1">{insights.strongest_areas?.map(a => <Badge key={a} variant="success">{a}</Badge>)}</div>
        </div>
        <div>
          <p className="label mb-1.5">Recommended Paths</p>
          <div className="flex flex-wrap gap-1">{insights.recommended_paths?.map(p => <Badge key={p} variant="info">{p}</Badge>)}</div>
        </div>
        <div>
          <p className="label mb-1.5">Next Skills</p>
          <div className="flex flex-wrap gap-1">{insights.next_skills?.map(s => <Badge key={s} variant="warning">{s}</Badge>)}</div>
        </div>
        {insights.summary && <p className="text-sm text-ink-600 border-t border-ink-100 pt-3">{insights.summary}</p>}
      </div>
    </Card>
  );
}
