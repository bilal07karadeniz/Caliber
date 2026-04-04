interface Props { label: string; value: string | number; }

export default function StatsCard({ label, value }: Props) {
  return (
    <div className="p-5">
      <p className="label mb-1">{label}</p>
      <p className="data-value">{value}</p>
    </div>
  );
}
