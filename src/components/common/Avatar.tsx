interface AvatarProps {
  name: string;
  color: string;
  avatar?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  sm:  'w-8 h-8 text-sm',
  md:  'w-11 h-11 text-lg',
  lg:  'w-14 h-14 text-2xl',
  xl:  'w-20 h-20 text-3xl',
};

export function Avatar({ name, color, avatar, size = 'md', className = '' }: AvatarProps) {
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold shrink-0 select-none ${sizes[size]} ${className}`}
      style={{ backgroundColor: color + '22', border: `2px solid ${color}40`, color }}
    >
      {avatar || initials}
    </div>
  );
}
