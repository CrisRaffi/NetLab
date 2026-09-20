import { useRef, useState } from 'react';
import { clsx } from 'clsx';
import { UserAvatar, UserBanner } from '../common/UserAvatar';
import {
  loadProfile,
  type UserProfile,
} from '../../features/community/firestoreProfile';
import {
  loadPublicStats,
  type PublicStats,
} from '../../features/community/publicStats';

interface UserHoverCardProps {
  uid?: string;
  name: string;
  size?: number;
  side?: 'left' | 'right';
}

export function UserHoverCard({
  uid,
  name,
  size = 32,
  side = 'left',
}: UserHoverCardProps) {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<PublicStats | null>(null);
  const fetchedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onEnter() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setOpen(true);
      if (uid && !fetchedRef.current) {
        fetchedRef.current = true;
        void Promise.all([loadProfile(uid), loadPublicStats(uid)]).then(
          ([p, s]) => {
            setProfile(p);
            setStats(s);
          },
        );
      }
    }, 250);
  }

  function onLeave() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(false);
  }

  const displayName = profile?.displayName || name;
  const role = uid ? 'Membro da comunidade' : 'Visitante';

  return (
    <span
      className="relative inline-flex shrink-0"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <UserAvatar
        name={name}
        avatarUrl={profile?.avatarUrl}
        avatarEmoji={profile?.avatarEmoji}
        size={size}
      />

      {open && (
        <span
          className={clsx(
            'absolute top-0 z-50 w-80 overflow-hidden rounded-2xl border border-[--color-border-primary]/60 bg-[--color-bg-card] shadow-2xl shadow-black/50 glass-strong animate-fade-in-up',
            side === 'right' ? 'right-full mr-2' : 'left-full ml-2',
          )}
        >
          <UserBanner
            bannerUrl={profile?.bannerUrl}
            name={displayName}
            height={64}
          />
          <div className="relative -mt-7 px-3.5 pb-3.5">
            <span
              className="block w-fit rounded-full ring-4 ring-[--color-bg-card]"
              style={{ marginTop: '-25px' }}
            >
              <UserAvatar
                name={name}
                avatarUrl={profile?.avatarUrl}
                avatarEmoji={profile?.avatarEmoji}
                size={48}
              />
            </span>
            <p className="mt-1.5 text-sm font-semibold text-[--color-text-primary] truncate">
              {displayName}
            </p>
            <p className="text-[11px] text-[--color-text-muted]">{role}</p>

            {stats ? (
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                <div className="rounded-lg bg-[--color-bg-tertiary]/60 border border-white/5 px-2 py-1.5 text-center">
                  <div className="text-sm font-bold text-[--color-text-primary]">
                    {stats.level}
                  </div>
                  <div className="text-[9px] text-[--color-text-muted]">
                    Nível
                  </div>
                </div>
                <div className="rounded-lg bg-[--color-bg-tertiary]/60 border border-white/5 px-2 py-1.5 text-center">
                  <div className="text-sm font-bold text-[--color-text-primary]">
                    {stats.xp.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-[9px] text-[--color-text-muted]">XP</div>
                </div>
                <div className="rounded-lg bg-[--color-bg-tertiary]/60 border border-white/5 px-2 py-1.5 text-center">
                  <div className="text-sm font-bold text-[--color-text-primary]">
                    {stats.mastered}
                  </div>
                  <div className="text-[9px] text-[--color-text-muted]">
                    Dominados
                  </div>
                </div>
                <div className="col-span-3 rounded-lg bg-[--color-bg-tertiary]/60 border border-white/5 px-2 py-1.5 text-center text-[11px] text-[--color-text-secondary]">
                  {stats.achievements} conquista
                  {stats.achievements === 1 ? '' : 's'} · {stats.labsDone} lab
                  {stats.labsDone === 1 ? '' : 's'} concluído
                  {stats.labsDone === 1 ? '' : 's'}
                </div>
              </div>
            ) : (
              <p className="mt-2 text-[10px] text-[--color-text-muted]/70">
                Sem estatísticas públicas ainda.
              </p>
            )}
          </div>
        </span>
      )}
    </span>
  );
}
