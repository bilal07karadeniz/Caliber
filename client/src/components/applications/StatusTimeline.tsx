const statuses = ['PENDING', 'REVIEWED', 'SHORTLISTED', 'ACCEPTED'];

export default function StatusTimeline({ currentStatus }: { currentStatus: string }) {
  const idx = statuses.indexOf(currentStatus);
  const rejected = currentStatus === 'REJECTED';

  return (
    <div className="flex items-center gap-1 font-mono text-[10px]">
      {statuses.map((s, i) => (
        <div key={s} className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-sm ${i <= idx && !rejected ? 'bg-verdant-500' : 'bg-ink-200'}`} />
          <span className={i <= idx && !rejected ? 'text-verdant-700' : 'text-ink-300'}>{s}</span>
          {i < statuses.length - 1 && <div className={`w-4 h-px ${i < idx && !rejected ? 'bg-verdant-400' : 'bg-ink-200'}`} />}
        </div>
      ))}
      {rejected && <><div className="w-2 h-2 rounded-sm bg-signal-low" /><span className="text-signal-low">REJECTED</span></>}
    </div>
  );
}
