import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Trophy,
  Clock,
  CheckCircle,
  Target,
  BookOpen,
  Network,
  Bug,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { ProgressBar } from '../components/common/ProgressBar';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useProgressStore } from '../stores/useProgressStore';
import { INITIAL_EXERCISES } from '../data/exercises';
import { CONCEPT_DEFINITIONS } from '../data/content/concepts';

const MODULE_GROUPS: { name: string; conceptIds: string[]; color: string }[] = [
  {
    name: 'Fundamentos',
    conceptIds: ['networking-basics', 'lan-wan', 'network-devices', 'topologies', 'ethernet-basics', 'client-server'],
    color: 'text-[--color-accent-blue]',
  },
  {
    name: 'Modelos',
    conceptIds: ['osi-model', 'tcp-ip-model', 'encapsulation'],
    color: 'text-[--color-accent-purple]',
  },
  {
    name: 'Ethernet',
    conceptIds: ['mac-address', 'switch-operations', 'arp', 'frames'],
    color: 'text-[--color-accent-cyan]',
  },
  {
    name: 'IPv4',
    conceptIds: ['ipv4-basics', 'subnet-mask', 'gateway', 'broadcast'],
    color: 'text-[--color-accent-green]',
  },
  {
    name: 'Subnetting',
    conceptIds: ['subnetting', 'cidr', 'host-calculation'],
    color: 'text-[--color-accent-yellow]',
  },
  {
    name: 'Serviços',
    conceptIds: ['dhcp', 'dns', 'routing-basics'],
    color: 'text-[--color-accent-red]',
  },
];

export function DashboardPage() {
  const progress = useProgressStore(s => s.progress);
  const getMastery = useProgressStore(s => s.getConceptMastery);
  const getOverall = useProgressStore(s => s.getOverallProgress);
  const completedIds = progress.completedExercises;

  const nextExercise = INITIAL_EXERCISES.find(ex => !completedIds.includes(ex.id)) ?? null;
  const lastCompletedId = [...completedIds].reverse().find(id => INITIAL_EXERCISES.some(ex => ex.id === id));
  const lastCompleted = INITIAL_EXERCISES.find(ex => ex.id === lastCompletedId) ?? null;

  const overall = getOverall();

  const weakConcepts = MODULE_GROUPS.flatMap(g => g.conceptIds)
    .map(id => ({ id, mastery: getMastery(id) }))
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 5);

  const masteredCount = progress.concepts.filter(c => c.mastery >= 80).length;
  const inProgressCount = progress.concepts.filter(c => c.mastery > 20 && c.mastery < 80).length;
  const notStartedCount = progress.concepts.filter(c => c.mastery === 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Olá!</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Seu laboratório está pronto. Escolha um desafio e comece a experimentar.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
          <Clock size={15} />
          <span>
            {Math.floor(progress.stats.totalTime / 60)}h {progress.stats.totalTime % 60}m estudados
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-300">Progresso Geral</span>
            <Badge tone="blue">Nível {progress.level}</Badge>
          </div>
          <div className="text-4xl font-bold text-slate-100 font-mono mb-1">{overall}%</div>
          <ProgressBar value={overall} showLabel />
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div className="bg-[--color-bg-tertiary] rounded-md p-2">
              <div className="text-lg font-bold text-emerald-400">{masteredCount}</div>
              <div className="text-[10px] text-slate-500 uppercase">Dominados</div>
            </div>
            <div className="bg-[--color-bg-tertiary] rounded-md p-2">
              <div className="text-lg font-bold text-yellow-400">{inProgressCount}</div>
              <div className="text-[10px] text-slate-500 uppercase">Em curso</div>
            </div>
            <div className="bg-[--color-bg-tertiary] rounded-md p-2">
              <div className="text-lg font-bold text-slate-400">{notStartedCount}</div>
              <div className="text-[10px] text-slate-500 uppercase">Novos</div>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {MODULE_GROUPS.map(group => {
            const groupProgress = group.conceptIds.reduce((sum, id) => sum + getMastery(id), 0) / group.conceptIds.length;
            return (
              <Card key={group.name} className="!p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2 h-2 rounded-full ${group.color}`} />
                  <span className="text-xs font-medium text-slate-300">{group.name}</span>
                </div>
                <ProgressBar value={groupProgress} showLabel />
              </Card>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          title="Continuar Aprendizado"
          icon={<BookOpen size={16} />}
          className="lg:col-span-2"
          padding="none"
        >
          {nextExercise || lastCompleted ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge tone="blue">Próximo Desafio</Badge>
                  {nextExercise && <Badge tone="default">{`Dificuldade ${nextExercise.difficulty}/5`}</Badge>}
                </div>
                <h4 className="text-sm font-semibold text-slate-100">
                  {nextExercise ? nextExercise.title : lastCompleted?.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {nextExercise ? nextExercise.description : lastCompleted?.description}
                </p>
              </div>
              {nextExercise && (
                <Link to={`/labs/${nextExercise.id}`}>
                  <Button variant="secondary" size="sm">
                    Iniciar <ArrowRight size={14} />
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="p-6 text-center">
              <CheckCircle size={32} className="mx-auto text-emerald-500 mb-2" />
              <p className="text-sm text-slate-400">Todos os laboratórios iniciais concluídos!</p>
            </div>
          )}

          {lastCompleted && nextExercise && (
            <div className="border-t border-[--color-border-primary] px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CheckCircle size={13} className="text-emerald-500" />
                  <span className="text-xs text-slate-500">Último concluído: <span className="text-slate-300">{lastCompleted.title}</span></span>
                </div>
                <div className="text-xs text-slate-600 mt-0.5">+{lastCompleted.xpReward} XP ganhos</div>
              </div>
            </div>
          )}
        </Card>

        <Card title="Conquistas" icon={<Trophy size={16} />} padding="none" className="lg:col-span-1">
          {progress.achievements.length === 0 ? (
            <div className="p-5 text-center">
              <div className="flex justify-center gap-2 mb-3 opacity-40">
                {[Trophy, Target, Bug].map((Icon, i) => (
                  <Icon key={i} size={22} className="text-slate-600" />
                ))}
              </div>
              <p className="text-xs text-slate-500 mb-3">Complete laboratórios para ganhar conquistas.</p>
              <Link to="/labs">
                <Button variant="outline" size="sm">Ver laboratórios</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[--color-border-primary]">
              {progress.achievements.slice(0, 3).map(a => (
                <div key={a.id} className="flex items-center gap-3 p-3">
                  <span className="text-lg">{a.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-200">{a.name}</p>
                    <p className="text-[10px] text-slate-500">{a.description}</p>
                  </div>
                  <span className="text-[10px] text-blue-400 font-mono">+{a.xpReward} XP</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Precisa Revisar" icon={<Target size={16} />} padding="none">
          <div className="divide-y divide-[--color-border-primary]">
            {weakConcepts.map(c => (
              <div key={c.id} className="flex items-center gap-3 p-3">
                <span
                  className={`text-lg ${c.mastery >= 80 ? 'opacity-40' : ''}`}
                >
                  {c.mastery === 0 ? '🔴' : c.mastery < 40 ? '🟡' : '🟢'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-200 truncate">
                    {CONCEPT_DEFINITIONS[c.id]?.name ?? c.id}
                  </p>
                </div>
                <ProgressBar value={c.mastery} className="w-24" />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Seus Laboratórios" icon={<Network size={16} />} padding="none">
          <div className="divide-y divide-[--color-border-primary]">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-slate-400">
                {completedIds.filter(id => INITIAL_EXERCISES.some(ex => ex.id === id)).length} de {INITIAL_EXERCISES.length} concluídos
              </span>
              <Link to="/labs" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                Ver todos <ArrowRight size={12} />
              </Link>
            </div>
            {INITIAL_EXERCISES.slice(0, 5).map(ex => {
              const done = completedIds.includes(ex.id);
              return (
                <Link
                  key={ex.id}
                  to={`/labs/${ex.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[--color-bg-hover] transition-colors"
                >
                  <span className={done ? 'text-emerald-500' : 'text-slate-500'}>
                    {done ? <CheckCircle size={16} /> : <Network size={16} />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-200 truncate">{ex.title}</p>
                    <p className="text-[10px] text-slate-500">{ex.estimatedTime} min · {ex.xpReward} XP</p>
                  </div>
                  {done ? (
                    <Badge tone="green">Concluído</Badge>
                  ) : (
                    <Badge tone="yellow">Pendente</Badge>
                  )}
                </Link>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}