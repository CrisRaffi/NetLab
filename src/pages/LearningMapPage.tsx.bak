import { Link } from 'react-router-dom';
import { Lock, ChevronRight, Play } from 'lucide-react';
import { useProgressStore } from '../stores/useProgressStore';
import { CONCEPT_DEFINITIONS, CONCEPT_ORDER } from '../data/content/concepts';
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
      { id: 'ethernet', label: 'Ethernet', concepts: ['ethernet-basics'] },
      { id: 'client-server', label: 'Cliente/Servidor', concepts: ['client-server'] },
    ],
  },
  {
    id: 'modelos',
    label: 'Modelo OSI e TCP/IP',
    concepts: ['osi-model', 'tcp-ip-model', 'encapsulation'],
    children: [{ id: 'ipv4', label: 'IPv4', concepts: ['ipv4-basics', 'subnet-mask', 'gateway', 'broadcast'] }],
  },
];

export function LearningMapPage() {
  const getMastery = useProgressStore(s => s.getConceptMastery);
  const isUnlocked = useProgressStore(s => s.isConceptUnlocked);

  const allConcepts = CONCEPT_ORDER.map(id => ({
    id,
    ...CONCEPT_DEFINITIONS[id],
    mastery: getMastery(id),
    unlocked: isUnlocked(id, CONCEPT_DEFINITIONS[id].prerequisites),
  }));

  const grouped = new Map<number, typeof allConcepts>();
  for (const c of allConcepts) {
    if (!grouped.has(c.level)) grouped.set(c.level, []);
    grouped.get(c.level)!.push(c);
  }

  const groupProgress = (items: typeof allConcepts) =>
    Math.round(items.reduce((s, c) => s + c.mastery, 0) / items.length);

  const getNextLocked = () => allConcepts.find(c => !c.unlocked);
  const nextLocked = getNextLocked();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Mapa de Aprendizado</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Fundamentos liberam conceitos mais avançados. Domine cada nível para avançar.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
        <div className="flex flex-col gap-3">
          {[...grouped.entries()].sort((a, b) => a[0] - b[0]).map(([level, items]) => {
            const pct = groupProgress(items);
            const levelUnlocked = items.every(i => i.unlocked) || items.some(i => i.mastery > 0);
            return (
              <div
                key={level}
                className={clsx(
                  'rounded-lg border p-4 transition-colors',
                  levelUnlocked ? 'border-[--color-border-primary] bg-[--color-bg-card]' : 'opacity-60'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-md bg-slate-800 flex items-center justify-center text-[11px] font-bold text-slate-400">
                      {level}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      Nível {level}
                    </span>
                  </div>
                  {!levelUnlocked && <Lock size={13} className="text-slate-600" />}
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {items.map(c => (
                    <span
                      key={c.id}
                      className={clsx(
                        'px-2 py-0.5 rounded text-[10px] border',
                        c.unlocked
                          ? c.mastery >= 80
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                            : 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                          : 'border-slate-700 text-slate-600'
                      )}
                    >
                      {c.unlocked && c.mastery >= 80 ? '✅ ' : ''}
                      {c.name}
                    </span>
                  ))}
                </div>
                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={clsx('h-full rounded-full', pct >= 80 ? 'bg-emerald-500' : 'bg-blue-500')}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}

          {nextLocked && (
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
              <p className="text-xs text-yellow-400 font-medium mb-1">Domine: {nextLocked.name}</p>
              <p className="text-[11px] text-slate-500">
                Domine os pré-requisitos para liberar este conceito.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-[--color-border-primary] bg-[--color-bg-card] p-6 overflow-x-auto">
          <h3 className="text-sm font-semibold text-slate-200 mb-6">REDES DE COMPUTADORES</h3>
          <div className="space-y-3">
            {DIAGRAM.flatMap(node => {
              const rows: { label: string; concepts: string[]; isChild?: boolean }[] = [
                { label: node.label, concepts: node.concepts },
                ...(node.children ?? []).map(ch => ({ label: ch.label, concepts: ch.concepts, isChild: true })),
              ];
              return rows;
            }).map((row, i) => {
              const mastery = Math.round(row.concepts.reduce((s, id) => s + getMastery(id), 0) / row.concepts.length);
              const unlocked = row.concepts.every(id => isUnlocked(id, CONCEPT_DEFINITIONS[id].prerequisites)) || row.concepts.some(id => getMastery(id) > 0);
              return (
                <div key={i}>
                  {i > 0 && (
                    <div className="flex justify-center py-1">
                      <ChevronRight size={14} className="text-slate-700 rotate-90" />
                    </div>
                  )}
                  <div
                    className={clsx(
                      'flex items-center gap-3 rounded-md border p-3',
                      row.isChild ? 'ml-8 border-slate-800 bg-slate-800/30' : 'border-[--color-border-secondary] bg-[--color-bg-tertiary]',
                      !unlocked && 'opacity-50'
                    )}
                  >
                    <span className={clsx('text-lg', unlocked ? '' : 'text-slate-600')}>
                      {mastery >= 80 ? '✅' : unlocked ? '📘' : '🔒'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200">{row.label}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {row.concepts.map(id => (
                          <span key={id} className="text-[10px] text-slate-500">{CONCEPT_DEFINITIONS[id]?.name}</span>
                        ))}
                      </div>
                    </div>
                    <div className="h-1.5 w-20 rounded-full bg-slate-800 overflow-hidden shrink-0">
                      <div className={clsx('h-full', mastery >= 80 ? 'bg-emerald-500' : 'bg-blue-500')} style={{ width: `${mastery}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {nextLocked && (
            <Link to="/labs" className="mt-6 inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300">
              <Play size={14} /> Praticar: {nextLocked.name}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}