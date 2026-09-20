import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import { getStreak, subscribeStreak } from '../../features/retention/streak';
import { clsx } from 'clsx';

export function StreakBadge() {
  const [current, setCurrent] = useState(() => getStreak().current);

  useEffect(
    () =>
      subscribeStreak(() => {
        setCurrent(getStreak().current);
      }),
    [],
  );

  if (current === 0) return null;

  return (
    <span
      title={`${current} dia${current > 1 ? 's' : ''} seguidos — volte amanhã para não perder a sequência`}
      className={clsx(
        'hidden sm:inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold',
        'border-[--color-accent-yellow]/30 bg-[--color-accent-yellow]/10 text-[--color-accent-yellow]',
      )}
    >
      <Flame size={12} />
      {current} dia{current > 1 ? 's' : ''}
    </span>
  );
}