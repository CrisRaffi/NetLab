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
    <div className="page-container space-y-3">
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
              className={clsx(
                '!p-3.5 transition-all duration-200',
                unlocked
                  ? 'hover:border-[--color-accent-yellow]/40'
                  : 'opacity-60',
              )}
            >
              <div className="flex items-center gap-3">
                <span className={clsx('text-2xl', !unlocked && 'opacity-60')}>
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
                  <span className="text-[10px] text-[--color-accent-green] font-mono shrink-0">
                    +{ach.xpReward} XP
                  </span>
                ) : (
                  <Lock
                    size={16}
                    className="text-[--color-text-muted]/60 shrink-0"
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
