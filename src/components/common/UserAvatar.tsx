import { clsx } from 'clsx';

const PALETTES = [
  'linear-gradient(135deg,#6366f1,#8b5cf6)',
  'linear-gradient(135deg,#10b981,#059669)',
  'linear-gradient(135deg,#38bdf8,#06b6d4)',
  'linear-gradient(135deg,#f59e0b,#f97316)',
  'linear-gradient(135deg,#f43f5e,#ec4899)',
  'linear-gradient(135deg,#14b8a6,#0d9488)',
  'linear-gradient(135deg,#8b5cf6,#ec4899)',
  'linear-gradient(135deg,#22c55e,#84cc16)',
];

export function nameHash(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

interface UserAvatarProps {
  name: string;
  avatarUrl?: string;
  avatarEmoji?: string;
  size?: number;
  className?: string;
}

export function UserAvatar({
  name,
  avatarUrl,
  avatarEmoji,
  size = 32,
  className,
}: UserAvatarProps) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.4) };

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        width={size}
        height={size}
        loading="lazy"
        className={clsx('rounded-full object-cover border border-white/10 shrink-0', className)}
        style={style}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={clsx('flex shrink-0 items-center justify-center rounded-full font-bold text-white select-none', className)}
      style={{ ...style, background: PALETTES[nameHash(name) % PALETTES.length] }}
    >
      {avatarEmoji ?? initialsOf(name)}
    </span>
  );
}

export const BANNER_FALLBACK =
  'linear-gradient(120deg, #1e3a8a 0%, #4f46e5 45%, #0ea5e9 100%)';

export function UserBanner({
  bannerUrl,
  name,
  height = 96,
  className,
}: {
  bannerUrl?: string;
  name: string;
  height?: number;
  className?: string;
}) {
  if (bannerUrl) {
    return (
      <img
        src={bannerUrl}
        alt={`Banner de ${name}`}
        loading="lazy"
        className={clsx('w-full object-cover', className)}
        style={{ height }}
      />
    );
  }
  return (
    <div
      aria-hidden
      className={clsx('w-full', className)}
      style={{ height, background: BANNER_FALLBACK, opacity: 0.85 }}
    />
  );
}