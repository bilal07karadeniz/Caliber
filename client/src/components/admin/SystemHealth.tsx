import Card from '../ui/Card';

export default function SystemHealth({ health }: { health: Record<string, string> }) {
  return (
    <Card header={<h3 className="text-sm font-heading font-semibold">System Health</h3>}>
      <div className="space-y-3">
        {Object.entries(health || {}).map(([service, status]) => (
          <div key={service} className="flex items-center justify-between">
            <span className="text-sm capitalize font-body">{service}</span>
            <span className={`font-mono text-xs ${status === 'ok' ? 'text-signal-high' : 'text-signal-low'}`}>
              {status === 'ok' ? '● ONLINE' : '● OFFLINE'}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
