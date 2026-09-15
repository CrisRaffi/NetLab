import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Trophy,
  Clock,
  CheckCircle,
  Target,
  BookOpen,
  Network,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { ProgressBar } from '../components/common/ProgressBar';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { PageHeader } from '../components/common/PageHeader';
import { useProgressStore } from '../stores/useProgressStore';
import { INITIAL_EXERCISES } from '../data/exercises';
import { CONCEPT_DEFINITIONS } from '../data/content/concepts';

const MODULE_GROUPS: { name: string; conceptIds: string[]; color: string }[] = [
  {
    name: 'Fundamentos',
    conceptIds: [
      'networking-basics',
      'lan-wan',
      'network-devices',
      'topologies',
      'ethernet-basics',
      'client-server',
    ],
    color: 'bg-[--color-accent-blue]',
  },
  {
    name: 'Modelos',
    conceptIds: ['osi-model', 'tcp-ip-model', 'encapsulation'],
    color: 'bg-[--color-accent-purple]',
  },
  {
    name: 'Ethernet',
    conceptIds: ['mac-address', 'switch-operations', 'arp', 'frames'],
    color: 'bg-[--color-accent-cyan]',
  },
  {
    name: 'IPv4',
    conceptIds: ['ipv4-basics', 'subnet-mask', 'gateway', 'broadcast'],
    color: 'bg-[--color-accent-green]',
  },
  {
    name: 'Subnetting',
    conceptIds: ['subnetting', 'cidr', 'host-calculation'],
    color: 'bg-[--color-accent-yellow]',
  },
  {
    name: 'ServiÃ§os',
    conceptIds: ['dhcp', 'dns', 'routing-basics'],
    color: 'bg-[--color-accent-red]',
  },
];

export function DashboardPage() {
  const progress = useProgressStore((s) => s.progress);
  const getMastery = useProgressStore((s) => s.getConceptMastery);
  const getOverall = useProgressStore((s) => s.getOverallProgress);
  const completedIds = progress.completedExercises;

  const nextExercise =
    INITIAL_EXERCISES.find((ex) => !completedIds.includes(ex.id)) ?? null;
  const lastCompletedId = [...completedIds]
    .reverse()
    .find((id) => INITIAL_EXERCISES.some((ex) => ex.id === id));
  const lastCompleted =
    INITIAL_EXERCISES.find((ex) => ex.id === lastCompletedId) ?? null;

  const overall = getOverall();

  const weakConcepts = MODULE_GROUPS.flatMap((g) => g.conceptIds)
    .map((id) => ({ id, mastery: getMastery(id) }))
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 5);

  const masteredCount = progress.concepts.filter((c) => c.mastery >= 80).length;
  const inProgressCount = progress.concepts.filter(
    (c) => c.mastery > 20 && c.mastery < 80,
  ).length;
  const notStartedCount = progress.concepts.filter(
    (c) => c.mastery === 0,
  ).length;

  const nextId = nextExercise?.id ?? lastCompletedId;

  return (
    <div className="space-y-4 page-container">
      <PageHeader
        title="OlÃ¡!"
        subtitle="Seu laboratÃ³rio estÃ¡ pronto. Escolha um desafio e comece a experimentar."
        accent="blue"
        icon={<Sparkles size={19} />}
        actions={
          <div className="hidden sm:flex items-center gap-2 text-sm text-[--color-text-muted]">
            <Clock size={15} />
            <span>
              {Math.floor(progress.stats.totalTime / 60)}h{' '}
              {progress.stats.totalTime % 60}m estudados
            </span>
          </div>
        }
      />

      {/* Hero: continuar + progresso geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative overflow-hidden rounded-2xl border border-[--color-border-primary]/40 bg-gradient-to-br from-[#0A2340] via-[#111A2C] to-[#0D1424] card-shadow-soft">
          <div aria-hidden className="absolute inset-0 bg-grid-pattern opacity-30" />
          <div aria-hidden className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[--color-accent-blue]/12 blur-3xl" />
          <div className="relative p-5 lg:p-6 flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge tone="blue">
                  {nextExercise ? 'PrÃ³ximo desafio' : 'Explorando'}
                </Badge>
                {nextExercise && (
                  <span className="text-[10px] font-mono text-[--color-text-muted]">
                    dificuldade {nextExercise.difficulty}/5 Â· {nextExercise.estimatedTime} min Â· +{nextExercise.xpReward} XP
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-[--color-text-primary] tracking-tight mb-1">
                {nextExercise
                  ? nextExercise.title
                  : lastCompleted
                  ? 'Todos os laboratÃ³rios concluÃ­dos'
                  : 'Comece sua jornada'}
              </h3>
              <p className="text-sm text-[--color-text-muted] mb-3 max-w-xl line-clamp-2">
                {nextExercise
                  ? nextExercise.description
                  : lastCompleted
                  ? `Ãšltimo concluÃ­do: ${lastCompleted.title} (+${lastCompleted.xpReward} XP)`
                  : 'Explore o mapa de aprendizado e monte sua primeira rede.'}
              </p>
              <div className="flex flex-wrap gap-2">
                {nextId && (
                  <Link to={`/labs/${nextId}`}>
                    <Button variant="primary" size="md">
                      {nextExercise ? 'Continuar' : 'Revisitar'} <ArrowRight size={15} />
                    </Button>
                  </Link>
                )}
                <Link to="/viagem">
                  <Button variant="outline" size="md">
                    <GraduationCap size={15} /> A Viagem do Pacote
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-5 shrink-0">
              <div
                className="relative h-24 w-24 rounded-full p-2"
                style={{
                  background: `conic-gradient(var(--color-accent-blue) ${overall * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
                }}
              >
                <div className="h-full w-full rounded-full bg-[#0D1424] flex items-center justify-center flex-col shadow-inner">
                  <span className="text-xl font-bold font-mono text-[--color-text-primary]">{overall}%</span>
                  <span className="text-[9px] uppercase tracking-widest text-[--color-text-muted]">geral</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Card className="!rounded-2xl flex flex-col justify-center">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-semibold text-[--color-text-primary]">
              NÃ­vel {progress.level}
            </span>
            <span className="text-[11px] font-mono text-[--color-accent-blue]">
              {progress.xp.toLocaleString('pt-BR')} XP
            </span>
          </div>
          <ProgressBar
            value={(progress.xp % 1000) / 10}
            colorClass="bg-gradient-to-r from-[#0071D6] to-[--color-accent-cyan]"
          />
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div className="rounded-xl bg-[--color-bg-tertiary]/60 border border-white/5 p-3">
              <div className="text-lg font-bold text-[--color-accent-green]">{masteredCount}</div>
              <div className="text-[10px] text-[--color-text-muted] uppercase tracking-wider mt-0.5">Dominados</div>
            </div>
            <div className="rounded-xl bg-[--color-bg-tertiary]/60 border border-white/5 p-3">
              <div className="text-lg font-bold text-[--color-accent-yellow]">{inProgressCount}</div>
              <div className="text-[10px] text-[--color-text-muted] uppercase tracking-wider mt-0.5">Em curso</div>
            </div>
            <div className="rounded-xl bg-[--color-bg-tertiary]/60 border border-white/5 p-3">
              <div className="text-lg font-bold text-[--color-text-secondary]">{notStartedCount}</div>
              <div className="text-[10px] text-[--color-text-muted] uppercase tracking-wider mt-0.5">Novos</div>
            </div>
          </div>
        </Card>
      </div>

      {/* mÃ³dulos de progresso */}
      <Card
        title="Progresso por mÃ³dulo"
        subtitle="Sua maestria em cada Ã¡rea do conteÃºdo"
        icon={<BookOpen size={16} />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-3">
          {MODULE_GROUPS.map((group) => {
            const groupProgress =
              group.conceptIds.reduce((sum, id) => sum + getMastery(id), 0) /
              group.conceptIds.length;
            return (
              <div key={group.name} className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full shrink-0 ${group.color}`} />
                <span className="text-xs font-medium text-[--color-text-secondary] w-24 shrink-0">
                  {group.name}
                </span>
                <ProgressBar value={groupProgress} className="flex-1" />
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card
          title="Precisa Revisar"
          icon={<Target size={16} />}
          padding="none"
          className="!rounded-2xl"
        >
          <div className="divide-y divide-[--color-border-primary]/60">
            {weakConcepts.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-3">
                <span
                  className={`text-sm ${c.mastery >= 80 ? 'opacity-40' : ''}`}
                >
                  {c.mastery === 0 ? 'ðŸ”´' : c.mastery < 40 ? 'ðŸŸ¡' : 'ðŸŸ¢'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[--color-text-primary] truncate">
                    {CONCEPT_DEFINITIONS[c.id]?.name ?? c.id}
                  </p>
                </div>
                <ProgressBar value={c.mastery} className="w-24" />
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Conquistas"
          icon={<Trophy size={16} />}
          padding="none"
          className="!rounded-2xl"
        >
          {progress.achievements.length === 0 ? (
            <div className="p-5 text-center">
              <div className="flex justify-center gap-2 mb-3 opacity-40">
                {[Trophy, Target, Network].map((Icon, i) => (
                  <Icon
                    key={i}
                    size={22}
                    className="text-[--color-text-muted]"
                  />
                ))}
              </div>
              <p className="text-xs text-[--color-text-muted] mb-3">
                Complete laboratÃ³rios para ganhar conquistas.
              </p>
              <Link to="/labs">
                <Button variant="outline" size="sm">
                  Ver laboratÃ³rios
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[--color-border-primary]/60">
              {progress.achievements.slice(0, 3).map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-3.5">
                  <span className="text-lg">{a.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[--color-text-primary]">
                      {a.name}
                    </p>
                    <p className="text-[10px] text-[--color-text-muted]">
                      {a.description}
                    </p>
                  </div>
                  <span className="text-[10px] text-[--color-accent-blue] font-mono">
                    +{a.xpReward} XP
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card
        title="Seus LaboratÃ³rios"
        icon={<Network size={16} />}
        padding="none"
        className="!rounded-2xl"
      >
        <div className="flex items-center justify-between px-4 py-2.5">
          <span className="text-xs text-[--color-text-muted]">
            {
              completedIds.filter((id) =>
                INITIAL_EXERCISES.some((ex) => ex.id === id),
              ).length
            }{' '}
            de {INITIAL_EXERCISES.length} concluÃ­dos
          </span>
          <Link
            to="/labs"
            className="text-xs text-[--color-accent-blue] hover:text-[--color-text-primary] flex items-center gap-1"
          >
            Ver todos <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4">
          {INITIAL_EXERCISES.slice(0, 6).map((ex) => {
            const done = completedIds.includes(ex.id);
            return (
              <Link
                key={ex.id}
                to={`/labs/${ex.id}`}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-[--color-bg-hover]/70 transition-colors rounded-lg"
              >
                <span
                  className={
                    done
                      ? 'text-[--color-accent-green]'
                      : 'text-[--color-text-muted]'
                  }
                >
                  {done ? <CheckCircle size={16} /> : <Network size={16} />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[--color-text-primary] truncate">
                    {ex.title}
                  </p>
                  <p className="text-[10px] text-[--color-text-muted]">
                    {ex.estimatedTime} min Â· {ex.xpReward} XP
                  </p>
                </div>
                {done ? (
                  <Badge tone="green">ConcluÃ­do</Badge>
                ) : (
                  <Badge tone="yellow">Pendente</Badge>
                )}
              </Link>
            );
          })}
        </div>
      </Card>
    </div>
  );
}