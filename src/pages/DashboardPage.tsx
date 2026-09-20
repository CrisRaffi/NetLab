import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Trophy,
  CheckCircle,
  Target,
  BookOpen,
  Network,
  GraduationCap,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { ProgressBar } from '../components/common/ProgressBar';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useProgressStore } from '../stores/useProgressStore';
import { useQuizStore } from '../stores/useQuizStore';
import { useAuth } from '../features/auth/AuthContext';
import { WelcomeChecklist } from '../components/onboarding/WelcomeChecklist';
import { INITIAL_EXERCISES } from '../data/exercises';
import { CONCEPT_DEFINITIONS } from '../data/content/concepts';
import { protocolTip } from '../data/protocolTips';
import { clsx } from 'clsx';

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
    name: 'Serviços',
    conceptIds: ['dhcp', 'dns', 'routing-basics'],
    color: 'bg-[--color-accent-red]',
  },
];

const STUDY_TIPS = [
  'TCP é confiável e orientado à conexão; UDP é rápido e sem garantias. E-mail e páginas usam TCP; jogos e streaming usam UDP.',
  'O MAC é o endereço de fábrica da placa de rede; o IP é lógico e pode mudar. O protocolo ARP resolve IP → MAC.',
  'O DNS é a agenda de contatos da Internet: você digita www.exemplo.com e ele devolve o IP 192.0.2.44.',
  'No modelo OSI, cada camada "conversa" com a mesma camada do outro computador usando a mesma PDU.',
  'Enlace entrega dentro do mesmo "bairro" usando MAC; Rede escolhe o caminho entre redes usando IP.',
  'Encapsulamento é empacotar (adicionar cabeçalhos) no envio; desencapsulamento é desempacotar no destino.',
  'O DHCP entrega IP automaticamente. Sem ele, você configuraria IP, máscara e gateway na mão.',
  'O TTL é o "ticket de viagem" do pacote: cai 1 a cada salto e evita que dados fiquem em loop para sempre.',
  'No TCP/IP, as camadas 5, 6 e 7 do OSI viram uma só: a camada de Aplicação.',
  'A máscara de sub-rede separa o que é rede do que é host dentro do endereço IP.',
];

function TipBanner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % STUDY_TIPS.length), 9000);
    return () => clearInterval(t);
  }, []);

  const prev = () => setIndex((i) => (i - 1 + STUDY_TIPS.length) % STUDY_TIPS.length);
  const next = () => setIndex((i) => (i + 1) % STUDY_TIPS.length);

  return (
    <section
      className="packet-flow relative overflow-hidden rounded-xl border border-[--color-accent-purple]/25 bg-gradient-to-r from-[--color-accent-purple]/10 via-[--color-bg-card]/60 to-[--color-accent-blue]/10 px-5 py-4 flex flex-wrap items-center gap-x-4 gap-y-2"
      style={stagger(1)}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[--color-accent-purple]/30 bg-[--color-accent-purple]/10 text-[--color-accent-purple]">
        <Lightbulb size={18} />
      </span>
      <div className="flex-1 min-w-[220px]">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[--color-accent-purple]">
          Dica rápida
        </p>
        <p className="text-sm text-[--color-text-primary] leading-relaxed mt-0.5">
          {STUDY_TIPS[index]}
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={prev}
          aria-label="Dica anterior"
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[--color-border-primary]/60 text-[--color-text-muted] transition-colors hover:text-[--color-text-primary] hover:bg-[--color-bg-hover]/60 cursor-pointer"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="flex items-center gap-1">
          {STUDY_TIPS.map((_, i) => (
            <span
              key={i}
              className={clsx(
                'h-1.5 rounded-full transition-all duration-300',
                i === index
                  ? 'w-4 bg-[--color-accent-purple]'
                  : 'w-1.5 bg-[--color-border-secondary]/60',
              )}
            />
          ))}
        </span>
        <button
          type="button"
          onClick={next}
          aria-label="Próxima dica"
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[--color-border-primary]/60 text-[--color-text-muted] transition-colors hover:text-[--color-text-primary] hover:bg-[--color-bg-hover]/60 cursor-pointer"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </section>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

const stagger = (i: number) => ({
  animation: 'fadeInUp .5s ease both',
  animationDelay: `${i * 90}ms`,
});

function reviewDot(mastery: number) {
  if (mastery === 0) return 'bg-[--color-accent-red]';
  if (mastery < 40) return 'bg-[--color-accent-yellow]';
  return 'bg-[--color-accent-green]';
}

export function DashboardPage() {
  const progress = useProgressStore((s) => s.progress);
  const getMastery = useProgressStore((s) => s.getConceptMastery);
  const getOverall = useProgressStore((s) => s.getOverallProgress);
  const quizResults = useQuizStore((s) => s.results);
  const { user } = useAuth();
  const completedIds = progress.completedExercises;

  const firstName = user?.displayName?.split(' ')[0] ?? '';
  const greeting = firstName ? `${getGreeting()}, ${firstName}!` : `${getGreeting()}!`;

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
  const labsDoneCount = completedIds.filter((id) =>
    INITIAL_EXERCISES.some((ex) => ex.id === id),
  ).length;
  const quizCount = Object.keys(quizResults).length;
  const hours = Math.floor(progress.stats.totalTime / 60);
  const minutes = progress.stats.totalTime % 60;

  const hasProgress =
    progress.xp > 0 ||
    labsDoneCount > 0 ||
    progress.achievements.length > 0 ||
    quizCount > 0;

  const nextId = nextExercise?.id ?? lastCompletedId;
  const heroCta = nextExercise
    ? { label: 'Continuar', to: `/labs/${nextId}`, variant: 'primary' as const }
    : lastCompleted
      ? { label: 'Revisitar', to: `/labs/${lastCompletedId}`, variant: 'primary' as const }
      : { label: 'Começar agora', to: '/mapa', variant: 'primary' as const };

  const statPills = [
    {
      label: `Nível ${progress.level}`,
      detail: `${progress.xp.toLocaleString('pt-BR')} XP`,
      dot: 'bg-[--color-accent-blue]',
    },
    {
      label: `${labsDoneCount}/${INITIAL_EXERCISES.length} labs`,
      detail: 'concluídos',
      dot: 'bg-[--color-accent-green]',
    },
    {
      label: `${progress.achievements.length} conquistas`,
      detail: 'desbloqueadas',
      dot: 'bg-[--color-accent-yellow]',
    },
    {
      label: `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`,
      detail: 'estudados',
      dot: 'bg-[--color-accent-cyan]',
    },
  ];

  return (
    <div className="space-y-5 page-container">
      <WelcomeChecklist show={!hasProgress} />
      {/* Hero compacto: informações + anel na mesma linha */}
      <section
        className="relative overflow-hidden rounded-2xl border border-[--color-border-primary]/40 bg-gradient-to-br from-[#0A2340] via-[#111A2C] to-[#0D1424] card-shadow-soft packet-flow"
        style={stagger(0)}
      >
        <div aria-hidden className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div aria-hidden className="absolute -right-16 -top-24 h-56 w-56 rounded-full bg-[--color-accent-blue]/12 blur-3xl" />
        <div className="relative px-6 py-5 flex flex-wrap items-center gap-x-8 gap-y-5">
          <div className="flex-1 min-w-[260px]">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge tone="blue">
                {nextExercise ? 'Próximo desafio' : hasProgress ? 'Bom retorno!' : 'Bem-vindo(a) à jornada'}
              </Badge>
              {nextExercise && (
                <span className="text-[10px] font-mono text-[--color-text-muted]">
                  {nextExercise.difficulty}/5 dificuldade · {nextExercise.estimatedTime} min · +{nextExercise.xpReward} XP
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-[--color-text-primary] tracking-tight mb-1.5">
              {greeting}
            </h1>
            <p className="text-xs text-[--color-text-muted] leading-relaxed line-clamp-2 max-w-2xl mb-4">
              {nextExercise
                ? `${nextExercise.title} espera por você. Retome de onde parou e siga avançando.`
                : hasProgress
                  ? 'Você já concluiu todos os laboratórios. Que tal revisar um tema ou testar seus conhecimentos?'
                  : 'Aqui você monta redes, resolve problemas e acompanha cada pacote. Escolha um ponto de partida!'}
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <Link to={heroCta.to}>
                <Button variant={heroCta.variant} size="sm">
                  {heroCta.label} <ArrowRight size={14} />
                </Button>
              </Link>
              <Link to="/viagem">
                <Button variant="outline" size="sm">
                  <GraduationCap size={14} /> A Viagem do Pacote
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {statPills.map((p) => (
                <span
                  key={p.label}
                  className="inline-flex items-center gap-2 rounded-full border border-[--color-border-primary]/60 bg-[#0A0E1A]/60 px-3 py-1.5"
                  title={p.detail}
                >
                  <span className={clsx('h-1.5 w-1.5 rounded-full shrink-0', p.dot)} />
                  <span className="text-[11px] font-medium text-[--color-text-secondary] whitespace-nowrap">
                    {p.label}
                  </span>
                </span>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-center">
            <svg
              viewBox="0 0 80 80"
              className="h-24 w-24"
              role="img"
              aria-label={`Progresso geral: ${overall}%`}
            >
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="#0D1424"
                stroke="rgba(255,255,255,0.07)"
                strokeWidth="7"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke="var(--color-accent-blue)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={`${(overall / 100) * 213.6} 213.6`}
                transform="rotate(-90 40 40)"
              />
              <text
                x="40"
                y="42"
                textAnchor="middle"
                fontSize="18"
                fontWeight="700"
                fill="var(--color-text-primary)"
                fontFamily="JetBrains Mono, ui-monospace, monospace"
              >
                {overall}%
              </text>
              <text
                x="40"
                y="57"
                textAnchor="middle"
                fontSize="7"
                fill="var(--color-text-muted)"
                letterSpacing="1.5"
              >
                GERAL
              </text>
            </svg>
          </div>
        </div>
      </section>

      {/* Dica rápida */}
      <TipBanner />

      {/* Nível + progresso por módulo */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch" style={stagger(2)}>
        <Card className="flex flex-col packet-flow">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-semibold text-[--color-text-primary]">
              Nível {progress.level}
            </span>
            <span className="text-[11px] font-mono text-[--color-accent-blue]">
              {progress.xp.toLocaleString('pt-BR')} XP
            </span>
          </div>
          <ProgressBar
            value={(progress.xp % 1000) / 10}
            colorClass="bg-gradient-to-r from-[#0071D6] to-[--color-accent-cyan]"
          />
          <div className="text-[10px] text-[--color-text-muted] mt-1.5">
            {progress.xp % 1000} / 1000 XP para o próximo nível
          </div>
          <div className="grid grid-cols-3 gap-2 mt-auto pt-4 text-center">
            <div className="rounded-xl bg-[--color-bg-tertiary]/60 border border-white/5 p-3">
              <div className="text-lg font-bold text-[--color-accent-green]">{masteredCount}</div>
              <div className="text-[10px] text-[--color-text-muted] uppercase tracking-wider mt-0.5">Dominados</div>
            </div>
            <div className="rounded-xl bg-[--color-bg-tertiary]/60 border border-white/5 p-3">
              <div className="text-lg font-bold text-[--color-accent-yellow]">{quizCount}</div>
              <div className="text-[10px] text-[--color-text-muted] uppercase tracking-wider mt-0.5">Quizzes</div>
            </div>
            <div className="rounded-xl bg-[--color-bg-tertiary]/60 border border-white/5 p-3">
              <div className="text-lg font-bold text-[--color-accent-cyan]">
                {progress.achievements.length}
              </div>
              <div className="text-[10px] text-[--color-text-muted] uppercase tracking-wider mt-0.5">Conquistas</div>
            </div>
          </div>
        </Card>

        <Card
          title="Progresso por módulo"
          subtitle="Sua maestria em cada área do conteúdo"
          icon={<BookOpen size={16} />}
          className="packet-flow-green"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {MODULE_GROUPS.map((group) => {
              const groupProgress =
                group.conceptIds.reduce((sum, id) => sum + getMastery(id), 0) /
                group.conceptIds.length;
              return (
                <div key={group.name} className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${group.color}`} />
                  <span
                    className="text-xs font-medium text-[--color-text-secondary] w-24 shrink-0"
                    title={protocolTip(group.name)}
                  >
                    {group.name}
                  </span>
                  <ProgressBar value={groupProgress} className="flex-1" />
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      {/* Laboratórios + Conquistas */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch" style={stagger(3)}>
        <Card
          title="Seus Laboratórios"
          icon={<Network size={16} />}
          padding="none"
          className="packet-flow flex flex-col"
          actions={
            <Link
              to="/labs"
              className="text-xs text-[--color-accent-blue] hover:text-[--color-text-primary] flex items-center gap-1"
            >
              Ver todos <ArrowRight size={12} />
            </Link>
          }
        >
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[--color-border-primary]/40">
            <span className="text-xs text-[--color-text-muted]">
              {labsDoneCount} de {INITIAL_EXERCISES.length} concluídos
            </span>
          </div>
          <div className="grid grid-cols-1 gap-x-4 flex-1 content-start">
            {INITIAL_EXERCISES.slice(0, 6).map((ex) => {
              const done = completedIds.includes(ex.id);
              return (
                <Link
                  key={ex.id}
                  to={`/labs/${ex.id}`}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-[--color-bg-hover]/70 transition-colors rounded-lg"
                >
                  <span
                    className={clsx(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
                      done
                        ? 'bg-[--color-accent-green]/10 border-[--color-accent-green]/30 text-[--color-accent-green]'
                        : 'bg-[--color-bg-tertiary]/60 border-[--color-border-primary]/60 text-[--color-text-muted]',
                    )}
                  >
                    {done ? <CheckCircle size={15} /> : <Network size={15} />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[--color-text-primary] truncate">
                      {ex.title}
                    </p>
                    <p className="text-[10px] text-[--color-text-muted]">
                      {ex.estimatedTime} min · {ex.xpReward} XP
                    </p>
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

        <div className="card-flair packet-flow relative rounded-xl border border-[--color-border-primary]/45 bg-[--color-bg-card]/70 backdrop-blur-sm card-shadow flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-3 pb-3 border-b border-[--color-border-primary]/40">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-[--color-accent-blue] shrink-0 icon-glow-blue">
                <Trophy size={16} />
              </span>
              <h3 className="text-sm font-semibold text-[--color-text-primary] tracking-tight truncate">
                Conquistas
              </h3>
            </div>
            {progress.achievements.length > 0 && (
              <Link
                to="/conquistas"
                className="text-xs text-[--color-accent-blue] hover:text-[--color-text-primary] flex items-center gap-1 shrink-0"
              >
                Ver todas <ArrowRight size={12} />
              </Link>
            )}
          </div>
          {progress.achievements.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 p-6 text-center min-h-[180px]">
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
                Complete laboratórios e quizzes para ganhar conquistas.
              </p>
              <Link to="/labs">
                <Button variant="outline" size="sm">
                  Ver laboratórios
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col flex-1">
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
              <div className="mt-auto px-3 py-2.5 border-t border-[--color-border-primary]/40">
                <Link
                  to="/conquistas"
                  className="flex items-center justify-center gap-1 text-xs text-[--color-accent-blue] hover:text-[--color-text-primary]"
                >
                  Ver todas as conquistas <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Precisa revisar */}
      {weakConcepts.length > 0 && (
        <section style={stagger(4)}>
          <Card
            title="Precisa revisar"
            subtitle="Conceitos que merecem mais atenção"
            icon={<Target size={16} />}
            padding="none"
            className="packet-flow-green"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-4">
              {weakConcepts.map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-4">
                  <span className={clsx('w-2.5 h-2.5 rounded-full shrink-0', reviewDot(c.mastery))} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[--color-text-primary] truncate">
                      {CONCEPT_DEFINITIONS[c.id]?.name ?? c.id}
                    </p>
                    <p className="text-[10px] text-[--color-text-muted]">
                      {c.mastery === 0
                        ? 'Não iniciado'
                        : c.mastery < 40
                          ? 'Começando'
                          : 'Quase lá'}
                    </p>
                  </div>
                  <ProgressBar value={c.mastery} className="w-16" />
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}