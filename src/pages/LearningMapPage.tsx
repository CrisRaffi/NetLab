import { Link } from 'react-router-dom';
import { Lock, ChevronRight, Play, Map as MapIcon } from 'lucide-react';
import {
  useProgressStore,
  type ProgressState,
} from '../stores/useProgressStore';
import { CONCEPT_DEFINITIONS, CONCEPT_ORDER } from '../data/content/concepts';
import { protocolTip } from '../data/protocolTips';
import { PageHeader } from '../components/common/PageHeader';
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

export function LearningMapPage() {
  const store = useProgressStore();

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
    <div className="space-y-6" style={{ paddingInline: 28, paddingBlock: 24 }}>
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
                      <span
                        key={c.id}
                        className={clsx(
                          'px-2 py-0.5 rounded text-[10px] border',
                          c.unlocked
                            ? c.mastery >= 80
                              ? 'border-[--color-accent-green]/30 bg-[--color-accent-green]/10 text-[--color-accent-green]'
                              : 'border-[--color-accent-blue]/30 bg-[--color-accent-blue]/10 text-[--color-accent-blue]'
                            : 'border-[--color-border-primary] text-[--color-text-muted]',
                        )}
                      >
                        {c.unlocked && c.mastery >= 80 ? '✅ ' : ''}
                        {c.name}
                      </span>
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
                          <span
                            key={id}
                            className="text-[10px] text-[--color-text-muted]"
                            title={protocolTip(CONCEPT_DEFINITIONS[id]?.name)}
                          >
                            {CONCEPT_DEFINITIONS[id]?.name}
                          </span>
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
    </div>
  );
}
