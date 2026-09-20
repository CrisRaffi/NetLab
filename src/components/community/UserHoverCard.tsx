import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { UserAvatar, UserBanner } from '../common/UserAvatar';
import {
  loadProfile,
  type UserProfile,
} from '../../features/community/firestoreProfile';
import {
  loadPublicStats,
  type PublicStats,
} from '../../features/community/publicStats';

const CARD_W = 320;
const CARD_EST_H = 240;

function formatMinutes(m: number): string {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h > 0) return `${h}h${mm > 0 ? ` ${mm}m` : ''}`;
  return `${mm}m`;
}

interface UserHoverCardProps {
  uid?: string;
  name: string;
  size?: number;
  children?: ReactNode;
  profile?: UserProfile | null;
  stats?: PublicStats | null;
}

export function UserHoverCard({
  uid,
  name,
  size = 32,
  children,
  profile: profileProp,
  stats: statsProp,
}: UserHoverCardProps) {
  const [open, setOpen] = useState(false);
  const [fetchedProfile, setFetchedProfile] = useState<UserProfile | null>(null);
  const [fetchedStats, setFetchedStats] = useState<PublicStats | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const fetchedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const profile = profileProp !== undefined ? profileProp : fetchedProfile;
  const stats = statsProp !== undefined ? statsProp : fetchedStats;

  useEffect(() => {
    if (!open) return;
    const onScroll = () => setOpen(false);
    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
  }, [open]);

  function onEnter() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const el = anchorRef.current;
      if (el) {
        const r = el.getBoundingClientRect();
        let left = r.right + 8;
        if (left + CARD_W > window.innerWidth - 8) {
          left = Math.max(8, r.left - CARD_W - 8);
        }
        let top = r.top;
        if (top + CARD_EST_H > window.innerHeight - 8) {
          top = Math.max(8, window.innerHeight - 8 - CARD_EST_H);
        }
        setPos({ top, left });
      }
      setOpen(true);
      if (uid && profileProp === undefined && !fetchedRef.current) {
        fetchedRef.current = true;
        void Promise.all([loadProfile(uid), loadPublicStats(uid)]).then(
          ([p, s]) => {
            setFetchedProfile(p);
            setFetchedStats(s);
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

  const card = (
    <div
      className="w-80 overflow-hidden rounded-2xl border border-[--color-border-primary]/60 bg-[--color-bg-card] shadow-2xl shadow-black/50 glass-strong animate-fade-in-up"
      style={{
        position: 'fixed',
        top: pos?.top ?? 0,
        left: pos?.left ?? 0,
        zIndex: 1000,
      }}
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
              <div className="text-[9px] text-[--color-text-muted]">Nível</div>
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
              {stats.labsDone === 1 ? '' : 's'} ·{' '}
              {formatMinutes(stats.minutes ?? 0)} de estudo
            </div>
          </div>
        ) : (
          <p className="mt-2 text-[10px] text-[--color-text-muted]/70">
            Sem estatísticas públicas ainda.
          </p>
        )}
      </div>
    </div>
  );

  return (
    <span
      ref={anchorRef}
      className="relative inline-flex shrink-0 items-center"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {children ?? (
        <UserAvatar
          name={name}
          avatarUrl={profile?.avatarUrl}
          avatarEmoji={profile?.avatarEmoji}
          size={size}
        />
      )}
      {open && pos && createPortal(card, document.body)}
    </span>
  );
}
