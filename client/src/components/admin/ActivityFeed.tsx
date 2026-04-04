import Card from '../ui/Card';

export default function ActivityFeed({ activities }: { activities: any }) {
  const items = [
    ...(activities?.recentUsers?.map((u: any) => ({ type: 'REG', text: `${u.name} joined as ${u.role}`, date: u.createdAt })) || []),
    ...(activities?.recentApplications?.map((a: any) => ({ type: 'APP', text: `${a.user?.name} applied to ${a.job?.title}`, date: a.appliedAt })) || []),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20);

  return (
    <Card header={<h3 className="text-sm font-heading font-semibold">Activity</h3>}>
      <div className="space-y-0 max-h-80 overflow-y-auto divide-y divide-ink-100">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-ink-400 bg-surface-sunken px-1.5 py-0.5 rounded-sm">{item.type}</span>
              <span className="text-sm text-ink-700">{item.text}</span>
            </div>
            <span className="text-xs font-mono text-ink-400 shrink-0">{new Date(item.date).toLocaleDateString()}</span>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-ink-400 text-center py-6">No recent activity</p>}
      </div>
    </Card>
  );
}
