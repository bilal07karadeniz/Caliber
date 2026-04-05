export default function Spinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const h = size === 'sm' ? 'h-0.5 w-8' : size === 'md' ? 'h-0.5 w-16' : 'h-1 w-24';
  return (
    <div className={`${h} bg-ink-200 rounded-full overflow-hidden ${className}`}>
      <div className="h-full w-1/3 bg-verdant-500 rounded-full animate-pulse-line" />
    </div>
  );
}
