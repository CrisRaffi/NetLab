import { Trophy, Lock } from 'lucide-react';
import { useProgressStore } from '../stores/useProgressStore';
import { Card } from '../components/common/Card';
import { PageHeader } from '../components/common/PageHeader';
import { clsx } from 'clsx';

const ALL_ACHIEVEMENTS = [
  {
    id: 'first-ping',
    name: 'Primeiro Ping',
    description: 'Complete seu primeiro ping com sucesso',
    icon: '🏆',
    xpReward: 25,
  },
  {
    id: 'detective',
    name: 'Detective',
    description: 'Encontre seu primeiro bug em um laboratório',
    icon: '🔍',
    xpReward: 25,
  },
  {
    id: 'subnet-master',
    name: 'Subnet Master',
    description: 'Complete o laboratório de sub-redes',
    icon: '🌐',
    xpReward: 25,
  },
  {
    id: 'gateway-hero',
    name: 'Gateway Hero',
    description: 'Resolva o problema de gateway',
    icon: '🚀',
    xpReward: 25,
  },
  {
    id: 'streak-3',
    name: 'Sequência 3',
    description: 'Estude 3 dias seguidos',
    icon: '🔥',
    xpReward: 25,
  },
  {
    id: 'troubleshooter',
    name: 'Quebra-Redes',
    description: 'Resolva seu primeiro desafio de troubleshooting',
    icon: '🔧',
    xpReward: 25,
  },
  {
    id: 'firefighter',
    name: 'Bombeiro de Redes',
    description: 'Resolva 5 desafios de troubleshooting',
    icon: '🚒',
    xpReward: 50,
  },
];

export function AchievementsPage() {
  const progress = useProgressStore((s) => s.progress);

  return (
    <div className="page-container space-y-6">
      <PageHeader
        title="Conquistas"
        subtitle="Complete laboratórios e desafios para desbloquear conquistas e ganhar XP."
        accent="yellow"
        icon={<Trophy size={19} />}
        badge={
          <span className="text-xs font-mono text-[--color-text-muted]">
            {progress.achievements.length} / {ALL_ACHIEVEMENTS.length}{' '}
            desbloqueadas
          </span>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {ALL_ACHIEVEMENTS.map((ach) => {
          const unlocked = progress.achievements.some((a) => a.id === ach.id);
          return (
            <Card
              key={ach.id}
              padding="sm"
              className={clsx(
                'transition-all duration-200',
                unlocked
                  ? 'hover:border-[--color-accent-yellow]/40'
                  : 'opacity-60',
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={clsx(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-xl',
                    unlocked
                      ? 'bg-[--color-accent-yellow]/10 border-[--color-accent-yellow]/30'
                      : 'bg-[--color-bg-tertiary] border-[--color-border-primary]/50 grayscale opacity-70',
                  )}
                  title={unlocked ? ach.description : `Como desbloquear: ${ach.description}`}
                >
                  {ach.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[--color-text-primary] truncate">
                    {ach.name}
                  </p>
                  <p className="text-[11px] text-[--color-text-muted] mt-0.5">
                    {ach.description}
                  </p>
                </div>
                {unlocked ? (
                  <span className="text-[11px] text-[--color-accent-green] shrink-0">
                    +{ach.xpReward} XP
                  </span>
                ) : (
                  <Lock
                    size={16}
                    className="text-[--color-text-muted]/60 shrink-0"
                    aria-label="Bloqueado"
                  />
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
