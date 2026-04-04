import { clsx } from 'clsx';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className={clsx(
      'rounded-full flex items-center justify-center font-mono text-white bg-ink-800 overflow-hidden',
      { 'w-7 h-7 text-[10px]': size === 'sm', 'w-9 h-9 text-xs': size === 'md', 'w-12 h-12 text-sm': size === 'lg' },
      className
    )}>
      {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : initials}
    </div>
  );
}
