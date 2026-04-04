import Button from '../ui/Button';

export default function PreferencesForm() {
  return (
    <div className="space-y-4 max-w-lg">
      <p className="text-sm text-ink-500 font-body">Job preferences help us provide better recommendations.</p>
      <div>
        <label className="label mb-2 block">Preferred Employment Types</label>
        <div className="space-y-2">
          {['Full Time', 'Part Time', 'Contract', 'Internship', 'Remote'].map(type => (
            <label key={type} className="flex items-center gap-2">
              <input type="checkbox" className="rounded-sm accent-verdant-600" />
              <span className="text-sm font-body">{type}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="label mb-1 block">Preferred Location</label>
        <input className="w-full px-3 py-2 border border-ink-200 rounded-md text-sm font-body bg-surface-raised focus:outline-none focus:border-verdant-500" placeholder="e.g. Istanbul, Remote" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label mb-1 block">Min Salary (USD)</label>
          <input type="number" className="w-full px-3 py-2 border border-ink-200 rounded-md text-sm font-mono bg-surface-raised focus:outline-none focus:border-verdant-500" placeholder="40000" />
        </div>
        <div>
          <label className="label mb-1 block">Max Salary (USD)</label>
          <input type="number" className="w-full px-3 py-2 border border-ink-200 rounded-md text-sm font-mono bg-surface-raised focus:outline-none focus:border-verdant-500" placeholder="100000" />
        </div>
      </div>
      <Button>Save Preferences</Button>
    </div>
  );
}
