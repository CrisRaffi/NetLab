import { useState, Fragment } from 'react';
import {
  Gamepad2,
  MessageSquareText,
  Wrench,
  Database,
  Package,
  SendHorizonal,
  ClipboardCheck,
  RotateCcw,
  Trophy,
  Layers,
} from 'lucide-react';
import { PageHeader } from '../../../components/common/PageHeader';
import { Card } from '../../../components/common/Card';
import { LayerColumn } from '../components/LayerColumn';
import { JourneyDiagram } from '../components/JourneyDiagram';
import { EncapsulationBuilder } from '../components/EncapsulationBuilder';
import { EncapsulationPlayback } from '../components/EncapsulationPlayback';
import { DecapsulationPlayback } from '../components/DecapsulationPlayback';
import { ExerciseCard } from '../components/ExerciseCard';
import { JOURNEY_EXERCISES } from '../data/exercises';
import { totalXp, accuracyOf } from '../engine/scoring';
import type { ExerciseResult } from '../engine/scoring';
import { OSI_LAYERS, TCP_IP_LAYERS } from '../data/osi';
import { PROTOCOL_TIPS } from '../../../data/protocolTips';
import { clsx } from 'clsx';

function Chip({
  children,
  accent = 'blue',
}: {
  children: string;
  accent?: 'blue' | 'green' | 'purple' | 'yellow' | 'cyan';
}) {
  const colors: Record<string, string> = {
    blue: 'text-[--color-accent-blue] border-[--color-accent-blue]/25 bg-[--color-accent-blue]/8',
    green:
      'text-[--color-accent-green] border-[--color-accent-green]/25 bg-[--color-accent-green]/8',
    purple:
      'text-[--color-accent-purple] border-[--color-accent-purple]/25 bg-[--color-accent-purple]/8',
    yellow:
      'text-[--color-accent-yellow] border-[--color-accent-yellow]/25 bg-[--color-accent-yellow]/8',
    cyan: 'text-[--color-accent-cyan] border-[--color-accent-cyan]/25 bg-[--color-accent-cyan]/8',
  };
  return (
    <span
      className={`inline-block px-1.5 py-0.5 rounded border text-[10px] font-mono ${colors[accent]}`}
      title={PROTOCOL_TIPS[children]}
    >
      {children}
    </span>
  );
}

function StepBadge({ n, accent = 'cyan' }: { n: number; accent?: string }) {
  const colors: Record<string, string> = {
    cyan: 'text-[--color-accent-cyan] border-[--color-accent-cyan]/30 bg-[--color-accent-cyan]/10',
    blue: 'text-[--color-accent-blue] border-[--color-accent-blue]/30 bg-[--color-accent-blue]/10',
    purple: 'text-[--color-accent-purple] border-[--color-accent-purple]/30 bg-[--color-accent-purple]/10',
    green: 'text-[--color-accent-green] border-[--color-accent-green]/30 bg-[--color-accent-green]/10',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-semibold ${colors[accent]}`}
    >
      <span className="font-mono">{n}</span> Passo
    </span>
  );
}

export function PacketJourneyPage() {
  const [mode, setMode] = useState<'osi' | 'tcpip'>('osi');
  const [selected, setSelected] = useState<number>(7);
  const [built, setBuilt] = useState(false);
  const [journeyKey, setJourneyKey] = useState(0);
  const [exIdx, setExIdx] = useState(0);
  const [exResults, setExResults] = useState<ExerciseResult[]>([]);

  const allDone = exIdx >= JOURNEY_EXERCISES.length;
  const reached = exIdx > 0 ? 4 : journeyKey > 0 ? 3 : built ? 2 : 1;

  const layer =
    mode === 'osi'
      ? OSI_LAYERS.find((l) => l.number === selected)
      : TCP_IP_LAYERS[selected - 1];

  const JOURNEY_STEPS = [
    { label: 'Montar o pacote', icon: Package },
    { label: 'Enviar pela rede', icon: SendHorizonal },
    { label: 'Desencapsular', icon: Layers },
    { label: 'Avaliar', icon: ClipboardCheck },
  ];

  return (
    <div className="space-y-3 w-full" style={{ padding: 16 }}>
      <PageHeader
        title="A Viagem do Pacote"
        subtitle="Não memorize as camadas. Veja o que acontece com os dados."
        icon={<Gamepad2 size={18} />}
        accent="cyan"
        badge={
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-[--color-accent-green]/30 text-[--color-accent-green] bg-[--color-accent-green]/8">
            FASE 4 · exercícios e pontuação
          </span>
        }
      />

      <div className="rounded-xl border border-[--color-accent-cyan]/20 bg-gradient-to-r from-[--color-accent-cyan]/8 via-transparent to-transparent px-4 py-3 flex items-start gap-3 card-flair">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[--color-accent-cyan]/10 border border-[--color-accent-cyan]/25 text-[--color-accent-cyan]">
          <MessageSquareText size={16} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[--color-text-primary]">
            Siga o fluxo abaixo, passo a passo
          </p>
          <p className="text-[11px] text-[--color-text-secondary] mt-0.5 leading-relaxed">
            O que acontece com uma informação quando ela sai do seu computador e
            chega em outro computador? Monte, envie e desmonte o pacote — depois
            explore as camadas ao lado.
          </p>
        </div>
      </div>

      {/* Journey stepper */}
      <div className="flex items-center gap-1.5 flex-wrap rounded-xl border border-[--color-border-primary]/45 bg-[--color-bg-card]/60 px-3 py-2.5">
        {JOURNEY_STEPS.map((s, i) => {
          const n = i + 1;
          const done = n < reached || allDone;
          const active = n === reached && !allDone;
          const Icon = s.icon;
          return (
            <Fragment key={s.label}>
              {i > 0 && (
                <span className="hidden sm:block h-px flex-1 min-w-4 bg-[--color-border-secondary]/60" />
              )}
              <div
                className={clsx(
                  'flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-colors',
                  done
                    ? 'border-[--color-accent-green]/30 bg-[--color-accent-green]/8 text-[--color-accent-green]'
                    : active
                      ? 'border-[--color-accent-cyan]/40 bg-[--color-accent-cyan]/10 text-[--color-accent-cyan]'
                      : 'border-[--color-border-primary] text-[--color-text-muted]',
                )}
              >
                <Icon size={13} />
                <span className="text-[10px] font-semibold whitespace-nowrap">
                  {s.label}
                </span>
              </div>
            </Fragment>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4 items-start">
        <div className="space-y-3 min-w-0">
          <Card
            title="Montando o pacote"
            subtitle="Coloque cada cartão na ordem em que ele envelopa os dados"
            icon={<Package size={16} />}
            padding="md"
            actions={<StepBadge n={1} accent="cyan" />}
          >
            <div className="flex flex-col gap-3">
              <EncapsulationBuilder onComplete={() => setBuilt(true)} />
              <div className="border-t border-[--color-border-primary] pt-3">
                <div className="flex items-center gap-2 text-xs text-[--color-text-secondary] mb-2">
                  <SendHorizonal
                    size={14}
                    className="text-[--color-accent-blue]"
                  />
                  agora a rede: assista o encapsulamento e depois{' '}
                  <b>envie pela rede</b>
                </div>
                <EncapsulationPlayback
                  enabled={built}
                  onSent={() => setJourneyKey((k) => k + 1)}
                />
              </div>
            </div>
          </Card>

          <Card
            title="Envio de mensagem"
            subtitle="PC → SWITCH → ROUTER → SERVER"
            padding="md"
            actions={<StepBadge n={2} accent="blue" />}
          >
            <JourneyDiagram sendKey={journeyKey} />
          </Card>

          <Card
            title="Desencapsulando no SERVER"
            subtitle="O pacote chega cheio de cabeçalhos — vamos removê-los um a um até a mensagem"
            padding="md"
            actions={<StepBadge n={3} accent="purple" />}
          >
            <DecapsulationPlayback />
          </Card>

          <Card
            title="Avaliando o que você aprendeu"
            subtitle="Responda, erre, use dicas e entenda o porquê — a nota é só uma consequência"
            icon={<ClipboardCheck size={16} />}
            padding="md"
            actions={<StepBadge n={4} accent="green" />}
          >
            {exIdx < JOURNEY_EXERCISES.length ? (
              <ExerciseCard
                key={JOURNEY_EXERCISES[exIdx].id}
                exercise={JOURNEY_EXERCISES[exIdx]}
                index={exIdx}
                total={JOURNEY_EXERCISES.length}
                onDone={(r) => {
                  setExResults((prev) => [...prev, r]);
                  setExIdx((i) => i + 1);
                }}
              />
            ) : (
              <div className="flex flex-col items-center gap-3 py-3 text-center">
                <div className="w-12 h-12 rounded-full bg-[--color-accent-green]/10 border border-[--color-accent-green]/30 flex items-center justify-center">
                  <Trophy size={20} className="text-[--color-accent-green]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[--color-text-primary]">Exercícios concluídos!</p>
                  <p className="text-xs text-[--color-text-muted] mt-0.5">
                    Precisão (na 1a tentativa): <b className="text-[--color-accent-green]">{accuracyOf(exResults)}%</b> · XP ganho: <b className="text-[--color-accent-blue]">{totalXp(exResults)}</b>
                  </p>
                </div>
                <button
                  onClick={() => { setExResults([]); setExIdx(0); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-[--color-border-secondary] text-[--color-text-muted] hover:text-[--color-text-secondary] hover:bg-[#111A2C] cursor-pointer"
                >
                  <RotateCcw size={12} /> Recomeçar
                </button>
              </div>
            )}
          </Card>

          <Card
            title="As camadas do modelo OSI"
            subtitle="Clique numa camada para ver o que ela faz"
            padding="md"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2">
              {OSI_LAYERS.map((l) => (
                <button
                  key={l.number}
                  onClick={() => {
                    setMode('osi');
                    setSelected(l.number);
                  }}
                  className={clsx(
                    'text-left rounded-lg border bg-[--color-bg-tertiary]/50 p-3 transition-colors cursor-pointer',
                    mode === 'osi' && selected === l.number
                      ? 'border-[--color-accent-cyan]/50 ring-inset-blue-soft'
                      : 'border-[--color-border-primary] hover:border-[--color-accent-blue]/40',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[--color-text-secondary]">
                      <span className="text-[10px] font-mono text-[--color-text-muted] mr-1.5">
                        L{l.number}
                      </span>
                      {l.name}
                    </span>
                    <span className="text-[10px] text-[--color-text-muted]" title="PDU – Protocol Data Unit (unidade de dados do protocolo)">
                      PDU: {l.pdu}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-3 min-w-0 lg:sticky lg:top-4">
          <Card padding="none" className="overflow-hidden">
            <div className="p-3.5">
              <LayerColumn
                mode={mode}
                onMode={setMode}
                selected={selected}
                onSelect={setSelected}
              />
            </div>
            {layer && (
              <div
                key={`${mode}-${selected}`}
                className="border-t border-[--color-border-primary] px-3.5 py-2.5 space-y-2.5 bg-[--color-bg-tertiary]/30 animate-fade-in-up"
              >
                <p className="text-[10px] uppercase tracking-wider text-[--color-text-muted]">
                  Como funciona
                </p>
                <p className="text-xs text-[--color-text-secondary] leading-relaxed">
                  {'function' in layer ? layer.function : layer.osiMapping}
                </p>

                {'pdu' in layer && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[--color-text-muted] mb-1" title="PDU – Protocol Data Unit (unidade de dados do protocolo)">
                      Unidade de dados (PDU)
                    </p>
                    <Chip accent="green">{layer.pdu}</Chip>
                  </div>
                )}

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[--color-text-muted] mb-1">
                    Protocolos
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {layer.protocols.map((p) => (
                      <Chip key={p}>{p}</Chip>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[--color-text-muted] mb-1">
                    Dispositivos
                  </p>
                  {'devices' in layer ? (
                    <div className="flex flex-wrap gap-1">
                      {layer.devices.map((d) => (
                        <Chip key={d} accent="purple">
                          {d}
                        </Chip>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {layer.examples.map((d) => (
                        <Chip key={d} accent="purple">
                          {d}
                        </Chip>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-[--color-accent-red]/20 bg-[--color-accent-red]/5 p-2.5 flex gap-2">
                  <Wrench
                    size={13}
                    className="text-[--color-accent-red] shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-[10px] font-semibold text-[--color-accent-red] mb-0.5">
                      Problema típico
                    </p>
                    <p className="text-[10px] text-[--color-text-muted] leading-relaxed">
                      {layer.problem}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-[--color-accent-green]/20 bg-[--color-accent-green]/5 p-2.5 flex gap-2">
                  <Database
                    size={13}
                    className="text-[--color-accent-green] shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-[10px] font-semibold text-[--color-accent-green] mb-0.5">
                      Exemplo real
                    </p>
                    {'real' in layer ? (
                      <p className="text-[10px] text-[--color-text-muted] leading-relaxed">
                        {layer.real}
                      </p>
                    ) : (
                      <p className="text-[10px] text-[--color-text-muted] leading-relaxed">
                        {layer.osiMapping}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
