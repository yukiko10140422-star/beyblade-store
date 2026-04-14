import clsx from 'clsx';
import {TYPE_CONFIG, isBeyType} from '~/lib/beyblade-types';

interface TypeBadgeProps {
  type: string | null | undefined;
  size?: 'sm' | 'md';
}

export function TypeBadge({type, size = 'sm'}: TypeBadgeProps) {
  if (!type || !isBeyType(type)) return null;

  const config = TYPE_CONFIG[type];

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 border rounded-full font-heading uppercase tracking-wider',
        config.bg,
        config.text,
        config.border,
        size === 'sm' && 'text-[9px] px-2 py-0.5',
        size === 'md' && 'text-[10px] px-2.5 py-1',
      )}
    >
      <svg
        className={clsx(size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3')}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={config.icon} />
      </svg>
      {type}
    </span>
  );
}
