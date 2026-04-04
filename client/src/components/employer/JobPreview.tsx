import Badge from '../ui/Badge';

interface Props { title: string; description: string; location: string; employmentType: string; salaryMin?: number; salaryMax?: number; skills: { name: string; requiredLevel: number }[]; }

export default function JobPreview({ title, description, location, employmentType, salaryMin, salaryMax, skills }: Props) {
  return (
    <div className="border border-ink-200 rounded-md p-4">
      <h3 className="font-heading font-semibold text-lg">{title || 'Job Title'}</h3>
      <div className="flex gap-2 text-xs font-mono text-ink-400 mt-1">
        <span>{location || 'Location'}</span>
        <Badge>{employmentType?.replace('_', ' ') || 'Type'}</Badge>
      </div>
      {(salaryMin || salaryMax) && <p className="text-sm font-mono text-ink-600 mt-2">${salaryMin?.toLocaleString()} - ${salaryMax?.toLocaleString()}</p>}
      <p className="text-sm text-ink-700 mt-3 whitespace-pre-wrap font-body">{description || 'Job description...'}</p>
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {skills.map((s, i) => <span key={i} className="px-1.5 py-0.5 border border-ink-200 text-ink-600 rounded-sm text-xs font-mono">{s.name} L{s.requiredLevel}</span>)}
        </div>
      )}
    </div>
  );
}
