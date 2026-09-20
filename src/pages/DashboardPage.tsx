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
  Clock,
  Zap,
  FlaskConical,
  MessagesSquare,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { ProgressBar } from '../components/common/ProgressBar';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useProgressStore } from '../stores/useProgressStore';
import { useQuizStore } from '../stores/useQuizStore';
import { useAuth } from '../features/auth/AuthContext';
import { WelcomeChecklist } from '../components/onboarding/WelcomeChecklist';
import { WeeklySummaryCard } from '../components/dashboard/WeeklySummaryCard';
import {
  getDailyGoalState,
  updateDailyGoal,
  GOAL_PRESETS,
} from '../features/retention/dailyGoal';
import { getDueForReview } from '../data/reinforcements';
import { QUIZZES } from '../data/quizzes';
import { INITIAL_EXERCISES } from '../data/exercises';
import { CONCEPT_DEFINITIONS } from '../data/content/concepts';
import { protocolTip } from '../data/protocolTips';
import { clsx } from 'clsx';

const MODULE_GROUPS: { name: string; conceptIds: string[] }[] = [
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
  },
  {
    name: 'Modelos',
    conceptIds: ['osi-model', 'tcp-ip-model', 'encapsulation'],
  },
  {
    name: 'Ethernet',
    conceptIds: ['mac-address', 'switch-operations', 'arp', 'frames'],
  },
  {
    name: 'IPv4',
    conceptIds: ['ipv4-basics', 'subnet-mask', 'gateway', 'broadcast'],
  },
  {
    name: 'Subnetting',
    conceptIds: ['subnetting', 'cidr', 'host-calculation'],
  },
  {
    name: 'Serviços',
    conceptIds: ['dhcp', 'dns', 'routing-basics'],
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
      className="card-flair relative rounded-2xl border border-[--color-border-primary]/45 bg-[--color-bg-card]/70 backdrop-blur-sm card-shadow px-5 py-4 flex flex-wrap items-center gap-x-4 gap-y-2"
      style={stagger(3)}
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
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[--color-border-primary]/60 text-[--color-text-muted] transition-colors hover:text-[--color-text-primary] hover:bg-[--color-bg-hover]/60 cursor-pointer"
        >
          <ChevronLeft size={15} />
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
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[--color-border-primary]/60 text-[--color-text-muted] transition-colors hover:text-[--color-text-primary] hover:bg-[--color-bg-hover]/60 cursor-pointer"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </section>
  );
}

function CommunitySpotlight() {
  const featuredLab =
    INITIAL_EXERCISES.find((ex) => ex.id === 'lab-01-first-network') ??
    INITIAL_EXERCISES[0];
  const featuredQuiz = QUIZZES[0];

  return (
    <Card
      title="Em alta na comunidade"
      subtitle="Destaques sugeridos para você"
      icon={<MessagesSquare size={16} />}
      padding="none"
      actions={
        <Link
          to="/comunidade"
          className="text-xs text-[--color-accent-blue] hover:text-[--color-text-primary] flex items-center gap-1"
        >
          Ver comunidade <ArrowRight size={12} />
        </Link>
      }
    >
      <div className="divide-y divide-[--color-border-primary]/60">
        {featuredLab && (
          <Link
            to={`/labs/${featuredLab.id}`}
            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[--color-bg-hover]/70"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[--color-accent-green]/10 text-[--color-accent-green]">
              <Network size={16} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-medium text-[--color-text-primary]">
                {featuredLab.title}
              </span>
              <span className="block text-[11px] text-[--color-text-muted]">
                Lab em destaque · {featuredLab.estimatedTime} min · +{featuredLab.xpReward} XP
              </span>
            </span>
            <ArrowRight size={13} className="shrink-0 text-[--color-text-muted]" />
          </Link>
        )}
        {featuredQuiz && (
          <Link
            to="/questionarios"
            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[--color-bg-hover]/70"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[--color-accent-purple]/10 text-[--color-accent-purple]">
              <BookOpen size={16} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-medium text-[--color-text-primary]">
                {featuredQuiz.name}
              </span>
              <span className="block text-[11px] text-[--color-text-muted]">
                Quiz em alta · {featuredQuiz.questions.length} questões
              </span>
            </span>
            <ArrowRight size={13} className="shrink-0 text-[--color-text-muted]" />
          </Link>
        )}
      </div>
    </Card>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function DailyGoalCard() {
  const totalXp = useProgressStore((s) => s.progress.xp);
  const [state, setState] = useState(() => getDailyGoalState(totalXp));
  const earned = Math.max(0, totalXp - state.baseline);
  const pct = Math.min(100, Math.round((earned / state.goal) * 100));
  const done = earned >= state.goal;

  function changeGoal(goal: number) {
    setState(updateDailyGoal(goal, totalXp));
  }

  return (
    <section
      className="card-flair rounded-2xl border border-[--color-border-primary]/45 bg-[--color-bg-card]/70 backdrop-blur-sm card-shadow px-5 py-4 flex flex-wrap items-center gap-4"
      style={stagger(1)}
    >
      <span
        className={clsx(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border',
          done
            ? 'border-[--color-accent-green]/30 bg-[--color-accent-green]/10 text-[--color-accent-green]'
            : 'border-[--color-accent-yellow]/30 bg-[--color-accent-yellow]/10 text-[--color-accent-yellow]',
        )}
      >
        <Zap size={18} />
      </span>
      <div className="min-w-[220px] flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs font-semibold text-[--color-text-primary]">
            {done ? 'Meta de hoje cumprida! 🎉' : 'Meta de hoje'}
          </p>
          <span className="text-xs font-medium text-[--color-text-secondary]">
            {earned} / {state.goal} XP
          </span>
        </div>
        <ProgressBar
          value={pct}
          colorClass={
            done
              ? 'bg-[--color-accent-green]'
              : 'bg-gradient-to-r from-[--color-accent-yellow] to-[--color-accent-blue]'
          }
        />
        <p className="text-[11px] text-[--color-text-muted] mt-1">
          {done
            ? 'Excelente! Continue no ritmo para manter a sequência.'
            : `${state.goal - earned} XP para bater a meta de hoje.`}
        </p>
      </div>
      <div className="flex shrink-0 flex-col gap-1">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-[--color-text-muted]">
          Meta
        </label>
        <div className="flex gap-1">
          {GOAL_PRESETS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => changeGoal(g)}
              className={clsx(
                'rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer',
                state.goal === g
                  ? 'border-[--color-accent-yellow]/40 bg-[--color-accent-yellow]/15 text-[--color-accent-yellow]'
                  : 'border-[--color-border-primary]/60 text-[--color-text-muted] hover:text-[--color-text-primary] hover:bg-white/[0.04]',
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewToday({
  concepts,
}: {
  concepts: Array<{ conceptId: string; name: string; level: number }>;
}) {
  return (
    <Card
      title="Revisar hoje"
      subtitle="Conceitos prontos para revisão — reforce para fixar"
      icon={<Target size={16} />}
      className="packet-flow"
      actions={
        <Link
          to="/mapa"
          className="inline-flex items-center gap-1 rounded-lg bg-[--color-accent-blue]/10 text-[--color-accent-cyan] border border-[--color-accent-blue]/30 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-[--color-accent-blue]/20 shrink-0"
        >
          Revisar no Mapa <ArrowRight size={12} />
        </Link>
      }
    >
      <div className="flex flex-wrap gap-2">
        {concepts.map((c) => (
          <span
            key={c.conceptId}
            className="inline-flex items-center gap-1.5 rounded-full border border-[--color-accent-yellow]/30 bg-[--color-accent-yellow]/10 px-2.5 py-1 text-[11px] font-medium text-[--color-accent-yellow]"
          >
            <Target size={11} />
            {c.name}
          </span>
        ))}
      </div>
    </Card>
  );
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

  const dueReview = getDueForReview(progress.concepts);

  const weakConcepts = MODULE_GROUPS.flatMap((g) => g.conceptIds)
    .map((id) => ({ id, mastery: getMastery(id) }))
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 5);

  const labsDoneCount = completedIds.filter((id) =>
    INITIAL_EXERCISES.some((ex) => ex.id === id),
  ).length;
  const quizCount = Object.keys(quizResults).length;

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

  const heroSubtitle = nextExercise
    ? `${nextExercise.title} espera por você. Retome de onde parou.`
    : hasProgress
      ? 'Você já concluiu todos os laboratórios. Que tal revisar um tema ou testar seus conhecimentos?'
      : 'Monte redes, resolva problemas e acompanhe cada pacote. Escolha um ponto de partida!';

  const kpis = [
    {
      label: 'Nível',
      value: String(progress.level),
      sub: `${progress.xp.toLocaleString('pt-BR')} XP`,
      icon: Zap,
    },
    {
      label: 'Laboratórios',
      value: `${labsDoneCount}/${INITIAL_EXERCISES.length}`,
      sub: 'concluídos',
      icon: FlaskConical,
    },
    {
      label: 'Quizzes',
      value: String(quizCount),
      sub: 'realizados',
      icon: BookOpen,
    },
    {
      label: 'Conquistas',
      value: String(progress.achievements.length),
      sub: 'desbloqueadas',
      icon: Trophy,
    },
  ];

  const stepCard = (() => {
    if (nextExercise) {
      return {
        kicker: 'Sua próxima etapa',
        title: nextExercise.title,
        description: `${nextExercise.difficulty}/5 de dificuldade · ${nextExercise.estimatedTime} min · +${nextExercise.xpReward} XP`,
        to: heroCta.to,
        cta: 'Continuar',
      };
    }
    if (lastCompleted) {
      return {
        kicker: 'Bom retorno!',
        title: `Revisitar: ${lastCompleted.title}`,
        description: `Concluído · ${lastCompleted.estimatedTime} min para revisão`,
        to: heroCta.to,
        cta: 'Revisitar',
      };
    }
    return {
      kicker: 'Primeiros passos',
      title: 'Comece pelo Mapa de Aprendizado',
      description: 'Trilha guiada, conceito por conceito, até a prática.',
      to: '/mapa',
      cta: 'Começar agora',
    };
  })();

  return (
    <div className="space-y-5 page-container">
      <WelcomeChecklist show={!hasProgress} />

      {/* F6 — Resumo semanal (1ª sessão da semana) */}
      <WeeklySummaryCard />

      {/* Zona 1 — Saudação + CTA único + card "próxima etapa" */}
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4" style={stagger(0)}>
        <div className="card-flair relative overflow-hidden rounded-2xl border border-[--color-border-primary]/40 bg-[--color-bg-card] card-shadow-soft flex flex-col justify-center px-6 py-6">
          <div aria-hidden className="absolute inset-0 bg-grid-pattern opacity-25" />
          <div aria-hidden className="absolute -right-16 -top-24 h-56 w-56 rounded-full bg-[--color-accent-blue]/10 blur-3xl" />
          <div className="relative">
            <Badge tone="blue">
              {nextExercise
                ? 'Próximo desafio'
                : hasProgress
                  ? 'Bom retorno!'
                  : 'Bem-vindo(a) à jornada'}
            </Badge>
            <h1 className="text-2xl font-bold text-[--color-text-primary] tracking-tight mt-2.5 mb-1.5">
              {greeting}
            </h1>
            <p className="text-sm text-[--color-text-muted] leading-relaxed max-w-xl">
              {heroSubtitle}
            </p>
            <div className="flex flex-wrap items-center gap-2.5 mt-5">
              <Link to={heroCta.to}>
                <Button variant={heroCta.variant}>
                  {heroCta.label} <ArrowRight size={15} />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Card próxima etapa */}
        <Link
          to={stepCard.to}
          className="card-flair packet-flow group relative rounded-2xl border border-[--color-border-primary]/45 bg-[--color-bg-card]/70 backdrop-blur-sm card-shadow flex flex-col justify-between overflow-hidden p-5 transition-all duration-150 hover:border-[--color-accent-blue]/50 hover:-translate-y-0.5"
        >
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[--color-accent-cyan]">
              {stepCard.kicker}
            </p>
            <h3 className="text-lg font-bold text-[--color-text-primary] leading-snug mt-1.5">
              {stepCard.title}
            </h3>
            <p className="text-xs text-[--color-text-muted] leading-relaxed mt-1.5">
              {stepCard.description}
            </p>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-[11px] text-[--color-text-muted] mb-1.5">
              <span>Progresso geral</span>
              <span className="font-semibold text-[--color-text-secondary]">{overall}%</span>
            </div>
            <ProgressBar
              value={overall}
              colorClass="bg-gradient-to-r from-[--color-accent-blue] to-[--color-accent-cyan]"
            />
            <div className="flex items-center justify-between mt-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[--color-accent-blue]">
                {stepCard.cta} <ArrowRight size={13} />
              </span>
              <span className="flex items-center gap-1 text-[10px] text-[--color-text-muted]">
                <Clock size={11} /> ~10 min
              </span>
            </div>
          </div>
        </Link>
      </section>

      {/* F3 — Meta de hoje */}
      <DailyGoalCard />

      {/* F9 — Revisar hoje (fixo, perto do topo) */}
      {dueReview.length > 0 && <ReviewToday concepts={dueReview} />}

      {/* Zona 2 — 4 KPIs limpos */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3" style={stagger(1)}>
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              className="card-flair rounded-2xl border border-[--color-border-primary]/45 bg-[--color-bg-card]/70 backdrop-blur-sm card-shadow p-4 transition-colors hover:border-[--color-border-primary]/80"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[--color-accent-blue]/10 text-[--color-accent-blue]">
                  <Icon size={16} />
                </span>
                <span className="text-2xl font-bold text-[--color-text-primary]">
                  {k.value}
                </span>
              </div>
              <p className="text-xs font-medium text-[--color-text-secondary] mt-2">
                {k.label}
              </p>
              <p className="text-[11px] text-[--color-text-muted]">{k.sub}</p>
            </div>
          );
        })}
      </section>

      {/* Zona 3 — Continuar estudando (atalhos silenciosos) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3" style={stagger(2)}>
        <Link
          to="/viagem"
          className="group flex items-center gap-3 rounded-2xl border border-[--color-border-primary]/45 bg-[--color-bg-card]/70 backdrop-blur-sm card-shadow px-4 py-3 transition-all hover:border-[--color-accent-cyan]/50"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[--color-accent-cyan]/10 text-[--color-accent-cyan]">
            <GraduationCap size={16} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-[--color-text-primary]">
              A Viagem do Pacote
            </span>
            <span className="block text-xs text-[--color-text-muted]">
              Veja os dados do início ao fim
            </span>
          </span>
          <ArrowRight
            size={14}
            className="shrink-0 text-[--color-accent-cyan] opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0"
          />
        </Link>
        <Link
          to="/questionarios"
          className="group flex items-center gap-3 rounded-2xl border border-[--color-border-primary]/45 bg-[--color-bg-card]/70 backdrop-blur-sm card-shadow px-4 py-3 transition-all hover:border-[--color-accent-purple]/50"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[--color-accent-purple]/10 text-[--color-accent-purple]">
            <BookOpen size={16} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-[--color-text-primary]">
              Teste com questionários
            </span>
            <span className="block text-xs text-[--color-text-muted]">
              Se errar, o sistema te ensina na hora
            </span>
          </span>
          <ArrowRight
            size={14}
            className="shrink-0 text-[--color-accent-purple] opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0"
          />
        </Link>
      </section>

      {/* Dica rápida */}
      <TipBanner />

      {/* F14 — Em alta na comunidade */}
      <CommunitySpotlight />

      {/* Zona 4 — Seus módulos */}
      <section style={stagger(4)}>
        <Card
          title="Seus módulos"
          subtitle="Sua maestria em cada área do conteúdo"
          icon={<BookOpen size={16} />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {MODULE_GROUPS.map((group) => {
              const groupProgress =
                group.conceptIds.reduce((sum, id) => sum + getMastery(id), 0) /
                group.conceptIds.length;
              const colorClass =
                groupProgress >= 80
                  ? 'bg-[--color-accent-green]'
                  : 'bg-[--color-accent-blue]';
              return (
                <div key={group.name} className="flex items-center gap-3">
                  <span
                    className={clsx('h-2 w-2 rounded-full shrink-0', colorClass)}
                  />
                  <span
                    className="text-sm font-medium text-[--color-text-secondary] w-28 shrink-0"
                    title={protocolTip(group.name)}
                  >
                    {group.name}
                  </span>
                  <ProgressBar value={groupProgress} className="flex-1" colorClass={colorClass} />
                  <span className="text-[11px] font-mono text-[--color-text-muted] w-9 text-right">
                    {Math.round(groupProgress)}%
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      {/* Zona 5 — Laboratórios + Conquistas */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch" style={stagger(5)}>
        <Card
          title="Seus Laboratórios"
          icon={<Network size={16} />}
          padding="none"
          className="flex flex-col"
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
                    <p className="text-[11px] text-[--color-text-muted]">
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

        <Card
          title="Conquistas"
          icon={<Trophy size={16} />}
          className="flex flex-col"
          padding="none"
          actions={
            progress.achievements.length > 0 ? (
              <Link
                to="/conquistas"
                className="text-xs text-[--color-accent-blue] hover:text-[--color-text-primary] flex items-center gap-1"
              >
                Ver todas <ArrowRight size={12} />
              </Link>
            ) : undefined
          }
        >
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
                      <p className="text-[11px] text-[--color-text-muted]">
                        {a.description}
                      </p>
                    </div>
                    <span className="text-[11px] text-[--color-accent-blue]">
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
        </Card>
      </section>

      {/* Zona 6 — Precisa revisar (somente com histórico) */}
      {hasProgress && weakConcepts.length > 0 && (
        <section style={stagger(6)}>
          <Card
            title="Precisa revisar"
            subtitle="Conceitos que merecem mais atenção"
            icon={<Target size={16} />}
            padding="none"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-4">
              {weakConcepts.map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-4">
                  <span className={clsx('w-2.5 h-2.5 rounded-full shrink-0', reviewDot(c.mastery))} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[--color-text-primary] truncate">
                      {CONCEPT_DEFINITIONS[c.id]?.name ?? c.id}
                    </p>
                    <p className="text-[11px] text-[--color-text-muted]">
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