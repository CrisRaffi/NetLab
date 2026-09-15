import { useState } from 'react';
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
    >
      {children}
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

  const layer =
    mode === 'osi'
      ? OSI_LAYERS.find((l) => l.number === selected)
      : TCP_IP_LAYERS[selected - 1];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6" style={{ padding: 20 }}>
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

      <div className="rounded-lg border border-[--color-accent-cyan]/20 bg-gradient-to-r from-[--color-accent-cyan]/6 to-transparent px-4 py-3 flex items-center gap-3">
        <MessageSquareText
          size={16}
          className="text-[--color-accent-cyan] shrink-0"
        />
        <p className="text-xs text-[--color-text-secondary]">
          O que acontece com uma informação quando ela sai do seu computador e
          chega em outro computador? Siga o fluxo abaixo — depois explore as
          camadas ao lado.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
        <div className="space-y-6 min-w-0">
          <Card
            title="Montando o pacote"
            subtitle="Coloque cada cartão na ordem em que ele envelopa os dados"
            icon={<Package size={16} />}
            padding="md"
          >
            <div className="flex flex-col gap-4">
              <EncapsulationBuilder onComplete={() => setBuilt(true)} />
              <div className="border-t border-[--color-border-primary] pt-4">
                <div className="flex items-center gap-2 text-xs text-[--color-text-secondary] mb-3">
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
          >
            <JourneyDiagram sendKey={journeyKey} />
          </Card>

          <Card
            title="Desencapsulando no SERVER"
            subtitle="O pacote chega cheio de cabeçalhos — vamos removê-los um a um até a mensagem"
            padding="md"
          >
            <DecapsulationPlayback />
          </Card>

          <Card
            title="Avaliando o que você aprendeu"
            subtitle="Responda, erre, use dicas e entenda o porquê — a nota é só uma consequência"
            icon={<ClipboardCheck size={16} />}
            padding="md"
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
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <div className="w-12 h-12 rounded-full bg-[--color-accent-green]/10 border border-[--color-accent-green]/30 flex items-center justify-center">
                  <Trophy size={20} className="text-[--color-accent-green]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[--color-text-primary]">Exercícios concluídos!</p>
                  <p className="text-xs text-[--color-text-muted] mt-1">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
              {OSI_LAYERS.map((l) => (
                <button
                  key={l.number}
                  onClick={() => {
                    setMode('osi');
                    setSelected(l.number);
                  }}
                  className="text-left rounded-lg border border-[--color-border-primary] bg-[--color-bg-tertiary]/50 p-3 hover:border-[--color-accent-blue]/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[--color-text-secondary]">
                      <span className="text-[10px] font-mono text-[--color-text-muted] mr-1.5">
                        L{l.number}
                      </span>
                      {l.name}
                    </span>
                    <span className="text-[10px] text-[--color-text-muted]">
                      PDU: {l.pdu}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4 min-w-0">
          <Card padding="none" className="overflow-hidden">
            <div className="p-4">
              <LayerColumn
                mode={mode}
                onMode={setMode}
                selected={selected}
                onSelect={setSelected}
              />
            </div>
            {layer && (
              <div className="border-t border-[--color-border-primary] px-4 py-3 space-y-3 bg-[--color-bg-tertiary]/30">
                <p className="text-[10px] uppercase tracking-wider text-[--color-text-muted]">
                  Como funciona
                </p>
                <p className="text-xs text-[--color-text-secondary] leading-relaxed">
                  {'function' in layer ? layer.function : layer.osiMapping}
                </p>

                {'pdu' in layer && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[--color-text-muted] mb-1">
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
