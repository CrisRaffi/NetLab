import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Lock,
  ChevronRight,
  Play,
  Map as MapIcon,
  BookOpen,
  FlaskConical,
  ClipboardList,
  CheckCircle,
} from 'lucide-react';
import {
  useProgressStore,
  type ProgressState,
} from '../stores/useProgressStore';
import { CONCEPT_DEFINITIONS, CONCEPT_ORDER } from '../data/content/concepts';
import { getLessonById } from '../data/lessons';
import { protocolTip } from '../data/protocolTips';
import { PageHeader } from '../components/common/PageHeader';
import { Modal } from '../components/common/Modal';
import { INITIAL_EXERCISES } from '../data/exercises';
import {
  getWeakConcepts,
  getDueForReview,
  getReinforcementSuggestions,
} from '../data/reinforcements';
import { clsx } from 'clsx';

interface DiagramNode {
  id: string;
  subId?: string;
  label: string;
  concepts: string[];
  children?: DiagramNode[];
}

const DIAGRAM: DiagramNode[] = [
  {
    id: 'fundamentos',
    label: 'Fundamentos',
    concepts: ['networking-basics', 'lan-wan', 'network-devices', 'topologies'],
    children: [
      {
        id: 'ethernet',
        label: 'Ethernet',
        concepts: ['ethernet-basics'],
      },
      {
        id: 'client-server',
        label: 'Cliente/Servidor',
        concepts: ['client-server'],
      },
    ],
  },
  {
    id: 'modelos',
    label: 'Modelo OSI e TCP/IP',
    concepts: ['osi-model', 'tcp-ip-model', 'encapsulation'],
    children: [
      {
        id: 'ipv4',
        label: 'IPv4',
        concepts: ['ipv4-basics', 'subnet-mask', 'gateway', 'broadcast'],
      },
    ],
  },
];

type StoreState = ProgressState;

function getConceptMastery(store: StoreState, conceptId: string): number {
  return (
    store.progress.concepts.find((c) => c.conceptId === conceptId)?.mastery ?? 0
  );
}

function isConceptUnlocked(
  store: StoreState,
  conceptId: string,
  prerequisites: string[],
): boolean {
  if (prerequisites.length === 0) {
    return true;
  }

  return prerequisites.every((prereq) => {
    const concept = store.progress.concepts.find((c) => c.conceptId === prereq);

    if (!concept) {
      return false;
    }

    return concept.mastery >= 100;
  });
}

const CONCEPT_LESSON: Record<string, string> = {
  'osi-model': 'modelo-osi-tcpip',
  'tcp-ip-model': 'modelo-osi-tcpip',
  encapsulation: 'modelo-osi-tcpip',
  frames: 'modelo-osi-tcpip',
  'mac-address': 'modelo-osi-tcpip',
  'switch-operations': 'modelo-osi-tcpip',
  arp: 'modelo-osi-tcpip',
};

function ConceptModal({
  conceptId,
  onClose,
}: {
  conceptId: string | null;
  onClose: () => void;
}) {
  const store = useProgressStore();
  if (!conceptId) return null;

  const def = CONCEPT_DEFINITIONS[conceptId];
  if (!def) return null;

  const mastery = getConceptMastery(store, conceptId);
  const unlocked = isConceptUnlocked(store, conceptId, def.prerequisites);
  const lessonId = CONCEPT_LESSON[conceptId];
  const labs = INITIAL_EXERCISES.filter((ex) =>
    ex.concepts.includes(conceptId),
  );

  const statusLabel = !unlocked
    ? 'Bloqueado'
    : mastery === 0
      ? 'Não iniciado'
      : mastery >= 80
        ? 'Dominado'
        : 'Em progresso';

  const statusTone = !unlocked
    ? 'text-[--color-text-muted] border-[--color-border-primary] bg-[--color-bg-tertiary]'
    : mastery >= 80
      ? 'text-[--color-accent-green] border-[--color-accent-green]/30 bg-[--color-accent-green]/10'
      : mastery > 0
        ? 'text-[--color-accent-yellow] border-[--color-accent-yellow]/30 bg-[--color-accent-yellow]/10'
        : 'text-[--color-accent-blue] border-[--color-accent-blue]/30 bg-[--color-accent-blue]/10';

  return (
    <Modal open onClose={onClose} title={def.name} size="md">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className={clsx('chip', statusTone)}>{statusLabel}</span>
          <span className="chip bg-[--color-bg-tertiary] text-[--color-text-muted] border border-[--color-border-primary]">
            Nível {def.level}
          </span>
          <span className="chip bg-[--color-bg-tertiary] text-[--color-text-muted] border border-[--color-border-primary]">
            Maestria {Math.round(mastery)}%
          </span>
        </div>

        {!unlocked && def.prerequisites.length > 0 && (
          <div className="rounded-lg border border-[--color-accent-yellow]/30 bg-[--color-accent-yellow]/5 p-3 text-xs text-[--color-text-secondary] leading-relaxed">
            <p className="font-medium text-[--color-accent-yellow] mb-1">
              Para liberar este conceito, domine primeiro:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {def.prerequisites.map((p) => (
                <span
                  key={p}
                  className="text-[11px] text-[--color-text-muted] px-2 py-0.5 rounded bg-[--color-bg-tertiary]"
                >
                  {CONCEPT_DEFINITIONS[p]?.name ?? p}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[--color-text-muted] mb-2">
            O que fazer
          </p>
          <div className="space-y-2">
            {lessonId && (
              <Link
                to={`/aprender/${lessonId}`}
                onClick={onClose}
                className="flex items-center gap-3 rounded-lg border border-[--color-accent-blue]/25 bg-[--color-accent-blue]/5 p-3 transition-colors hover:border-[--color-accent-blue]/50 hover:bg-[--color-accent-blue]/10"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[--color-accent-blue]/10 text-[--color-accent-blue]">
                  <BookOpen size={15} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-[--color-text-primary]">
                    Estudar a lição
                  </span>
                  <span className="block text-[11px] text-[--color-text-muted] truncate">
                    {getLessonById(lessonId)?.title ?? 'Lição com diagramas animados'}
                  </span>
                </span>
                <Play size={14} className="shrink-0 text-[--color-accent-blue]" />
              </Link>
            )}

            {labs.length > 0 && (
              <div className="rounded-lg border border-[--color-border-primary]/50 overflow-hidden">
                <p className="flex items-center gap-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[--color-text-muted] border-b border-[--color-border-primary]/40">
                  <FlaskConical size={11} className="text-[--color-accent-green]" />
                  Laboratórios relacionados ({labs.length})
                </p>
                {labs.slice(0, 3).map((ex) => (
                  <Link
                    key={ex.id}
                    to={`/labs/${ex.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-[--color-bg-hover]"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-medium text-[--color-text-secondary]">
                        {ex.title}
                      </span>
                      <span className="block text-[11px] text-[--color-text-muted]">
                        {ex.estimatedTime} min · +{ex.xpReward} XP
                      </span>
                    </span>
                    <Play size={13} className="shrink-0 text-[--color-accent-green]" />
                  </Link>
                ))}
              </div>
            )}

            <Link
              to="/questionarios"
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg border border-[--color-accent-purple]/25 bg-[--color-accent-purple]/5 p-3 transition-colors hover:border-[--color-accent-purple]/50 hover:bg-[--color-accent-purple]/10"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[--color-accent-purple]/10 text-[--color-accent-purple]">
                <ClipboardList size={15} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-[--color-text-primary]">
                  Testar no questionário
                </span>
                <span className="block text-[11px] text-[--color-text-muted]">
                  {mastery >= 80
                    ? 'Revise e mantenha sua maestria'
                    : mastery > 0
                      ? 'Consolide o que já aprendeu'
                      : 'Aprenda testando seus conhecimentos'}
                </span>
              </span>
              <Play size={14} className="shrink-0 text-[--color-accent-purple]" />
            </Link>
          </div>
        </div>

        {unlocked && mastery >= 80 && (
          <p className="flex items-center gap-1.5 text-[11px] text-[--color-accent-green]">
            <CheckCircle size={12} /> Você domina este conceito. Continue revisando para fixar.
          </p>
        )}
      </div>
    </Modal>
  );
}

export function LearningMapPage() {
  const store = useProgressStore();
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);

  const allConcepts = CONCEPT_ORDER.map((id) => ({
    id,
    ...CONCEPT_DEFINITIONS[id],
    mastery: getConceptMastery(store, id),
    unlocked: isConceptUnlocked(
      store,
      id,
      CONCEPT_DEFINITIONS[id].prerequisites,
    ),
  }));

  const weakConcepts = getWeakConcepts(store.progress.concepts);
  const dueForReview = getDueForReview(store.progress.concepts);
  const reinforcementSuggestions = getReinforcementSuggestions(
    store.progress.concepts,
  );

  const grouped = new Map<number, typeof allConcepts>();

  for (const c of allConcepts) {
    if (!grouped.has(c.level)) {
      grouped.set(c.level, []);
    }

    grouped.get(c.level)!.push(c);
  }

  const groupProgress = (items: typeof allConcepts) =>
    Math.round(items.reduce((sum, c) => sum + c.mastery, 0) / items.length);

  const getNextLocked = () => allConcepts.find((c) => !c.unlocked);
  const nextLocked = getNextLocked();

  return (
    <div className="page-container space-y-6">
      <PageHeader
        title="Mapa de Aprendizado"
        subtitle="Fundamentos liberam conceitos mais avançados. Domine cada nível para avançar."
        accent="purple"
        icon={<MapIcon size={19} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
        <div className="flex flex-col gap-3">
          {[...grouped.entries()]
            .sort((a, b) => a[0] - b[0])
            .map(([level, items]) => {
              const pct = groupProgress(items);

              const levelUnlocked =
                items.every((i) => i.unlocked) ||
                items.some((i) => i.mastery > 0);

              return (
                <div
                  key={level}
                  className={clsx(
                    'rounded-lg border p-3.5 transition-colors',
                    levelUnlocked
                      ? 'border-[--color-border-primary] bg-[--color-bg-card]'
                      : 'opacity-60',
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[--color-bg-tertiary] text-[11px] font-bold text-[--color-accent-blue]">
                        {level}
                      </span>

                      <span className="text-xs font-semibold text-[--color-text-secondary]">
                        Nível {level}
                      </span>
                    </div>

                    {!levelUnlocked && (
                      <Lock size={13} className="text-[--color-text-muted]" />
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {items.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedConcept(c.id)}
                        title={`Abrir ações de "${c.name}"`}
                        className={clsx(
                          'px-2 py-0.5 rounded text-[11px] border transition-all cursor-pointer',
                          c.unlocked
                            ? c.mastery >= 80
                              ? 'border-[--color-accent-green]/30 bg-[--color-accent-green]/10 text-[--color-accent-green] hover:bg-[--color-accent-green]/20'
                              : 'border-[--color-accent-blue]/30 bg-[--color-accent-blue]/10 text-[--color-accent-blue] hover:bg-[--color-accent-blue]/20'
                            : 'border-[--color-border-primary] text-[--color-text-muted] hover:border-[--color-border-secondary]',
                        )}
                      >
                        {c.unlocked && c.mastery >= 80 ? '✅ ' : ''}
                        {c.name}
                      </button>
                    ))}
                  </div>

                  <div className="h-2 rounded-full bg-[--color-bg-tertiary] overflow-hidden">
                    <div
                      className={clsx(
                        'h-full rounded-full',
                        pct >= 80
                          ? 'bg-[--color-accent-green]'
                          : 'bg-[--color-accent-blue]',
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}

          {weakConcepts.length > 0 && (
            <div className="rounded-lg border border-[--color-accent-red]/30 bg-[--color-accent-red]/5 p-3 mb-3">
              <h4 className="text-xs font-medium text-[--color-accent-red] mb-2">
                Conceitos Fraquezas
              </h4>

              <div className="flex flex-wrap gap-2">
                {weakConcepts.map((c) => (
                  <span
                    key={c.conceptId}
                    className="text-[10px] text-[--color-accent-red] font-medium px-2 py-1 rounded bg-[--color-accent-red]/10"
                  >
                    {c.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {dueForReview.length > 0 && (
            <div className="rounded-lg border border-[--color-accent-yellow]/30 bg-[--color-accent-yellow]/5 p-3 mb-3">
              <h4 className="text-xs font-medium text-[--color-accent-yellow] mb-2">
                Para Revisão Hoje
              </h4>

              <div className="flex flex-wrap gap-2">
                {dueForReview.map((c) => (
                  <span
                    key={c.conceptId}
                    className="text-[10px] text-[--color-accent-yellow] font-medium px-2 py-1 rounded bg-[--color-accent-yellow]/10"
                  >
                    {c.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {reinforcementSuggestions.length > 0 && (
            <div className="rounded-lg border border-[--color-accent-green]/30 bg-[--color-accent-green]/5 p-3 mb-3">
              <h4 className="text-xs font-medium text-[--color-accent-green] mb-2">
                Sugestões de Reforço
              </h4>

              <div className="space-y-2">
                {reinforcementSuggestions.map((s) => (
                  <div key={s.conceptId} className="flex items-start gap-2">
                    <div className="flex-shrink-0">
                      <span className="text-[10px] text-[--color-accent-green] font-medium">
                        📚
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-[--color-text-secondary]">
                        {s.conceptName}
                      </p>

                      <p className="text-[9px] text-[--color-text-muted]">
                        {s.reason}
                      </p>
                    </div>

                    <div className="flex-shrink-0 text-[9px] text-[--color-text-muted]">
                      {s.suggestedExercises.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {nextLocked && (
            <div className="rounded-lg border border-[--color-accent-yellow]/30 bg-[--color-accent-yellow]/5 p-3">
              <p className="text-xs text-[--color-accent-yellow] font-medium mb-1">
                Domine: {nextLocked.name}
              </p>

              <p className="text-[11px] text-[--color-text-muted]">
                Domine os pré-requisitos para liberar este conceito.
              </p>
            </div>
          )}

          {nextLocked && (
            <Link
              to="/labs"
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-[--color-accent-blue] hover:text-[--color-text-primary]"
            >
              <Play size={14} />
              Praticar: {nextLocked.name}
            </Link>
          )}
        </div>

        <div className="rounded-lg border border-[--color-border-primary]/70 bg-[--color-bg-card] p-5 overflow-x-auto">
          <h3 className="text-sm font-semibold text-[--color-text-primary] mb-4 uppercase tracking-wider">
            REDES DE COMPUTADORES
          </h3>

          <div className="space-y-2">
            {DIAGRAM.flatMap((node) => {
              const rows: {
                label: string;
                concepts: string[];
                isChild?: boolean;
              }[] = [
                {
                  label: node.label,
                  concepts: node.concepts,
                },
                ...(node.children ?? []).map((ch) => ({
                  label: ch.label,
                  concepts: ch.concepts,
                  isChild: true,
                })),
              ];

              return rows;
            }).map((row, i) => {
              const mastery = Math.round(
                row.concepts.reduce(
                  (sum, id) => sum + getConceptMastery(store, id),
                  0,
                ) / row.concepts.length,
              );

              const unlocked =
                row.concepts.every((id) =>
                  isConceptUnlocked(
                    store,
                    id,
                    CONCEPT_DEFINITIONS[id].prerequisites,
                  ),
                ) ||
                row.concepts.some((id) => getConceptMastery(store, id) > 0);

              return (
                <div key={i}>
                  {i > 0 && (
                    <div className="flex justify-center py-0.5">
                      <ChevronRight
                        size={14}
                        className="text-[--color-text-muted] rotate-90"
                      />
                    </div>
                  )}

                  <div
                    className={clsx(
                      'flex items-center gap-3 rounded-md border p-2.5',
                      row.isChild
                        ? 'ml-8 border-[--color-border-primary]/60 bg-[--color-bg-tertiary]/50'
                        : 'border-[--color-border-secondary] bg-[--color-bg-tertiary]',
                      !unlocked && 'opacity-50',
                    )}
                  >
                    <span
                      className={clsx(
                        'text-lg',
                        unlocked ? '' : 'text-[--color-text-muted]',
                      )}
                    >
                      {mastery >= 80 ? '✅' : unlocked ? '📘' : '🔒'}
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[--color-text-primary]" title={protocolTip(row.label)}>
                        {row.label}
                      </p>

                      <div className="flex flex-wrap gap-1 mt-1">
                        {row.concepts.map((id) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setSelectedConcept(id)}
                            title={`Abrir ações de "${CONCEPT_DEFINITIONS[id]?.name}"`}
                            className="text-[11px] text-[--color-text-muted] hover:text-[--color-accent-cyan] underline decoration-dotted underline-offset-2 cursor-pointer transition-colors"
                          >
                            {CONCEPT_DEFINITIONS[id]?.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="h-2 w-20 rounded-full bg-[--color-bg-tertiary] overflow-hidden shrink-0">
                      <div
                        className={clsx(
                          'h-full',
                          mastery >= 80
                            ? 'bg-[--color-accent-green]'
                            : 'bg-[--color-accent-blue]',
                        )}
                        style={{
                          width: `${mastery}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {nextLocked && (
            <Link
              to="/labs"
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-[--color-accent-blue] hover:text-[--color-text-primary]"
            >
              <Play size={14} />
              Praticar: {nextLocked.name}
            </Link>
          )}
        </div>
      </div>

      <ConceptModal
        conceptId={selectedConcept}
        onClose={() => setSelectedConcept(null)}
      />
    </div>
  );
}
