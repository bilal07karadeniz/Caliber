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
      'rounded-full flex items-center justify-center font-medium text-white bg-primary-600 overflow-hidden',
      { 'w-8 h-8 text-xs': size === 'sm', 'w-10 h-10 text-sm': size === 'md', 'w-14 h-14 text-lg': size === 'lg' },
      className
    )}>
      {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : initials}
    </div>
  );
}
