import { useEffect, useState } from 'react';
import {
  UserRound,
  Trophy,
  Flame,
  Target,
  Copy,
  Check,
  Zap,
  GraduationCap,
  ImagePlus,
  Save,
  Trash2,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { UserAvatar, UserBanner } from '../components/common/UserAvatar';
import { useProgressStore } from '../stores/useProgressStore';
import { useQuizStore } from '../stores/useQuizStore';
import { useAuth } from '../features/auth/AuthContext';
import { getStreak } from '../features/retention/streak';
import { CONCEPT_DEFINITIONS } from '../data/content/concepts';
import { toast } from '../stores/useToastStore';
import {
  loadProfile,
  saveProfile,
  loadLocalProfile,
  saveLocalProfile,
  AVATAR_EMOJIS,
  type UserProfile,
} from '../features/community/firestoreProfile';
import { clsx } from 'clsx';

export function ProfilePage() {
  const progress = useProgressStore((s) => s.progress);
  const quizResults = useQuizStore((s) => s.results);
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    if (user?.uid) {
      void loadProfile(user.uid).then((p) => {
        if (!active) return;
        setProfile(p);
        setAvatarUrl(p?.avatarUrl ?? '');
        setAvatarEmoji(p?.avatarEmoji ?? '');
        setBannerUrl(p?.bannerUrl ?? '');
      });
    } else {
      const local = loadLocalProfile();
      setProfile(local);
      setAvatarUrl(local?.avatarUrl ?? '');
      setAvatarEmoji(local?.avatarEmoji ?? '');
      setBannerUrl(local?.bannerUrl ?? '');
    }
    return () => {
      active = false;
    };
  }, [user?.uid]);

  const streak = getStreak();
  const mastered = progress.concepts.filter((c) => c.mastery >= 80);
  const quizCount = Object.keys(quizResults).length;
  const hours = Math.floor(progress.stats.totalTime / 60);
  const minutes = progress.stats.totalTime % 60;

  const displayName = user?.displayName ?? profile?.displayName ?? 'Aluno';

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    const data: UserProfile = {
      displayName: user?.displayName ?? profile?.displayName ?? undefined,
      email: user?.email ?? profile?.email ?? undefined,
      avatarUrl: avatarUrl.trim() || undefined,
      avatarEmoji: avatarUrl.trim() ? undefined : avatarEmoji || undefined,
      bannerUrl: bannerUrl.trim() || undefined,
    };
    try {
      if (user?.uid) {
        await saveProfile(user.uid, data);
        toast('success', 'Perfil atualizado!');
      } else {
        saveLocalProfile(data);
        toast(
          'success',
          'Salvo neste dispositivo. Entre para salvar na nuvem.',
        );
      }
      setProfile(data);
    } catch {
      toast('error', 'Não foi possível salvar o perfil.');
    } finally {
      setSaving(false);
    }
  }

  async function copyInvite() {
    const text = `🎓 Eu estou estudando redes no NetLab! Estou no nível ${progress.level}, com ${progress.xp} XP e uma sequência de ${streak.current} dia(s). Venha montar redes comigo! ${window.location.origin}/cadastro`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast('success', 'Convite copiado! Envie para um amigo.');
    } catch {
      toast('error', 'Não foi possível copiar o convite.');
    }
  }

  const stat = (icon: React.ReactNode, value: string, label: string) => (
    <div className="rounded-xl bg-[--color-bg-tertiary]/60 border border-white/5 p-4">
      <span>{icon}</span>
      <div className="mt-1.5 text-xl font-bold text-[--color-text-primary]">
        {value}
      </div>
      <div className="text-[11px] text-[--color-text-muted] mt-0.5">
        {label}
      </div>
    </div>
  );

  return (
    <div className="page-container space-y-6 max-w-4xl">
      <PageHeader
        title="Meu perfil"
        subtitle="Sua identidade, progresso e sequência de estudo."
        accent="blue"
        icon={<UserRound size={19} />}
      />

      {/* Banner + avatar */}
      <Card padding="none" className="overflow-hidden">
        <div className="relative">
          <UserBanner
            bannerUrl={profile?.bannerUrl}
            name={displayName}
            height={120}
          />
          <div className="absolute -bottom-8 left-6">
            <span
              className="block rounded-full ring-4 ring-[--color-bg-card]"
              style={{
                marginTop: '-100px',
                position: 'fixed',
                marginLeft: 20,
              }}
            >
              <UserAvatar
                name={displayName}
                avatarUrl={profile?.avatarUrl}
                avatarEmoji={profile?.avatarEmoji}
                size={80}
              />
            </span>
          </div>
        </div>
        <div className="pt-12 px-6 pb-5" style={{ marginTop: 20 }}>
          <p className="text-lg font-bold text-[--color-text-primary] truncate">
            {displayName}
          </p>
          <p className="text-xs text-[--color-text-muted] break-all">
            {user?.email ?? profile?.email ?? 'Visitante'}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="chip bg-[--color-accent-blue]/10 text-[--color-accent-blue] border border-[--color-accent-blue]/25">
              Nível {progress.level}
            </span>
            {streak.current > 0 && (
              <span className="chip bg-[--color-accent-yellow]/10 text-[--color-accent-yellow] border border-[--color-accent-yellow]/25">
                <Flame size={11} /> {streak.current} dia
                {streak.current > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Editor de avatar + banner */}
      <Card
        title="Personalizar perfil"
        subtitle="Escolha uma foto e um banner para aparecerem na comunidade"
        icon={<ImagePlus size={16} />}
      >
        <div className="space-y-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[--color-text-secondary] mb-2">
              Avatar (foto)
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <UserAvatar
                name={displayName}
                avatarUrl={avatarUrl.trim() || undefined}
                avatarEmoji={
                  avatarUrl.trim() ? undefined : avatarEmoji || undefined
                }
                size={52}
              />
              <div className="flex-1 min-w-[220px]">
                <input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="Cole o link de uma imagem (URL)..."
                  className="w-full rounded-lg border border-[--color-border-primary]/40 bg-[#0D1424]/80 px-3 py-2 text-xs text-[--color-text-primary] placeholder:text-[--color-text-muted] outline-none focus:border-[--color-accent-blue]/50"
                />
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {AVATAR_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setAvatarEmoji(emoji);
                        setAvatarUrl('');
                      }}
                      title="Usar emoji como avatar"
                      className={clsx(
                        'flex h-8 w-8 items-center justify-center rounded-lg border text-base transition-colors cursor-pointer',
                        avatarEmoji === emoji && !avatarUrl.trim()
                          ? 'border-[--color-accent-blue]/50 bg-[--color-accent-blue]/15'
                          : 'border-[--color-border-primary]/50 bg-[--color-bg-tertiary]/40 hover:border-[--color-border-secondary]',
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarEmoji('');
                      setAvatarUrl('');
                    }}
                    className="flex h-8 items-center gap-1 rounded-lg border border-[--color-border-primary]/50 px-2.5 text-[11px] text-[--color-text-muted] hover:text-[--color-text-primary] transition-colors cursor-pointer"
                  >
                    <Trash2 size={11} /> Iniciais
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[--color-text-secondary] mb-2">
              Banner de perfil
            </p>
            <div className="space-y-2">
              <div className="relative overflow-hidden rounded-xl border border-[--color-border-primary]/40">
                <UserBanner
                  bannerUrl={bannerUrl.trim() || undefined}
                  name={displayName}
                  height={72}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="Cole o link de uma imagem de banner (URL)..."
                  className="flex-1 min-w-[220px] rounded-lg border border-[--color-border-primary]/40 bg-[#0D1424]/80 px-3 py-2 text-xs text-[--color-text-primary] placeholder:text-[--color-text-muted] outline-none focus:border-[--color-accent-blue]/50"
                />
                <button
                  type="button"
                  onClick={() => setBannerUrl('')}
                  className="flex h-9 items-center gap-1 rounded-lg border border-[--color-border-primary]/50 px-3 text-[11px] text-[--color-text-muted] hover:text-[--color-text-primary] transition-colors cursor-pointer"
                >
                  <Trash2 size={11} /> Remover
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-[10px] text-[--color-text-muted]">
              {user?.uid
                ? 'Salvo na nuvem e visível para a comunidade.'
                : 'Sem conta, o perfil fica salvo só neste dispositivo.'}
            </p>
            <Button
              variant="accent"
              size="sm"
              onClick={handleSave}
              disabled={saving}
            >
              <Save size={13} /> {saving ? 'Salvando…' : 'Salvar'}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stat(
          <Zap size={15} className="text-[--color-accent-blue]" />,
          `${progress.xp.toLocaleString('pt-BR')}`,
          'XP total',
        )}
        {stat(
          <GraduationCap size={15} className="text-[--color-accent-green]" />,
          `${mastered.length}`,
          'conceitos dominados',
        )}
        {stat(
          <Trophy size={15} className="text-[--color-accent-yellow]" />,
          `${progress.achievements.length}`,
          'conquistas',
        )}
        {stat(
          <Flame size={15} className="text-[--color-accent-red]" />,
          `${hours > 0 ? `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}` : `${minutes}m`}`,
          'estudados',
        )}
      </div>

      <Card
        title="Conceitos dominados"
        subtitle="Maestria igual ou acima de 80%"
        icon={<Target size={16} />}
        padding="none"
      >
        {mastered.length === 0 ? (
          <p className="px-4 py-6 text-xs text-[--color-text-muted] text-center">
            Nenhum conceito dominado ainda. Complete laboratórios e quizzes para
            progredir.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 p-4">
            {mastered.map((c) => (
              <span
                key={c.conceptId}
                className="inline-flex items-center gap-1.5 rounded-full border border-[--color-accent-green]/30 bg-[--color-accent-green]/10 px-2.5 py-1 text-[11px] font-medium text-[--color-accent-green]"
              >
                <Target size={10} />{' '}
                {CONCEPT_DEFINITIONS[c.conceptId]?.name ?? c.conceptId}
              </span>
            ))}
          </div>
        )}
      </Card>

      <Card
        title="Desafie um amigo"
        subtitle="Compartilhe seu progresso e convide alguém para aprender redes"
        icon={<Flame size={16} />}
      >
        <p className="text-xs text-[--color-text-secondary] leading-relaxed mb-3">
          Copie um resumo do seu progresso e envie para um colega. Quem começar,
          segue os mesmos primeiros passos — e vocês podem comparar conquistas.
        </p>
        <Button variant="accent" size="sm" onClick={copyInvite}>
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copiado!' : 'Copiar convite'}
        </Button>
        <span className="text-[10px] text-[--color-text-muted] block mt-2">
          {quizCount} quizzes realizados · melhor sequência: {streak.best}{' '}
          dia(s)
        </span>
      </Card>
    </div>
  );
}
