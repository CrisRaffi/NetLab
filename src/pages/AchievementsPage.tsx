import { Trophy } from 'lucide-react';
import { useProgressStore } from '../stores/useProgressStore';
import { Card } from '../components/common/Card';

const ALL_ACHIEVEMENTS = [
  { id: 'first-ping', name: 'Primeiro Ping', description: 'Complete seu primeiro ping com sucesso', icon: '🏆', xpReward: 25 },
  { id: 'detective', name: 'Detective', description: 'Encontre seu primeiro bug em um laboratório', icon: '🔍', xpReward: 25 },
  { id: 'subnet-master', name: 'Subnet Master', description: 'Complete o laboratório de sub-redes', icon: '🌐', xpReward: 25 },
  { id: 'gateway-hero', name: 'Gateway Hero', description: 'Resolva o problema de gateway', icon: '🚀', xpReward: 25 },
  { id: 'streak-3', name: 'Sequência 3', description: 'Estude 3 dias seguidos', icon: '🔥', xpReward: 25 },
  { id: 'troubleshooter', name: 'Quebra-Redes', description: 'Resolva seu primeiro desafio de troubleshooting', icon: '🔧', xpReward: 25 },
  { id: 'firefighter', name: 'Bombeiro de Redes', description: 'Resolva 5 desafios de troubleshooting', icon: '🚒', xpReward: 50 },
];

export function AchievementsPage() {
  const progress = useProgressStore(s => s.progress);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-100">Conquistas</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ALL_ACHIEVEMENTS.map(ach => {
          const unlocked = progress.achievements.some(a => a.id === ach.id);
          return (
            <Card key={ach.id} className={`!p-4 ${unlocked ? '' : 'opacity-50'}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{ach.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200">{ach.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{ach.description}</p>
                </div>
                {unlocked ? (
                  <span className="text-[10px] text-emerald-400 font-mono">+{ach.xpReward} XP</span>
                ) : (
                  <Trophy size={16} className="text-slate-600" />
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}