import { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipForward, RotateCcw, Repeat, Search, SendHorizonal } from 'lucide-react';
import { clsx } from 'clsx';
import { ENCAP_ORDER, ENCAP_STEPS } from '../data/steps';
import type { EncapStep } from '../data/steps';

const ACCENT: Record<string, string> = {
  green: 'text-[--color-accent-green] border-[--color-accent-green]/40 bg-[--color-accent-green]/10',
  blue: 'text-[--color-accent-blue] border-[--color-accent-blue]/40 bg-[--color-accent-blue]/10',
  purple: 'text-[--color-accent-purple] border-[--color-accent-purple]/40 bg-[--color-accent-purple]/10',
  yellow: 'text-[--color-accent-yellow] border-[--color-accent-yellow]/40 bg-[--color-accent-yellow]/10',
  cyan: 'text-[--color-accent-cyan] border-[--color-accent-cyan]/40 bg-[--color-accent-cyan]/10',
};

const SPEEDS = [0.5, 1, 2, 4];

interface PlaybackProps {
  enabled: boolean;
  onSent: () => void;
}

export function EncapsulationPlayback({ enabled, onSent }: PlaybackProps) {
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [inspect, setInspect] = useState<EncapStep | null>(null);
  const onSentRef = useRef(onSent);
  onSentRef.current = onSent;

  const done = stage >= ENCAP_ORDER.length;
  const layers = ENCAP_ORDER.slice(0, stage).map(id => ENCAP_STEPS[id]);
  const newest = layers[layers.length - 1];

  useEffect(() => {
    if (!playing) return;
    if (done) {
      setPlaying(false);
      onSentRef.current();
      return;
    }
    const t = setTimeout(() => setStage(s => s + 1), 750 / speed);
    return () => clearTimeout(t);
  }, [playing, stage, speed, done]);

  if (!enabled) {
    return (
      <div className="rounded-lg border border-[--color-border-primary]/60 bg-[--color-bg-tertiary]/40 px-4 py-6 text-center">
        <p className="text-xs text-[--color-text-muted]">
          Monte o pacote no painel acima para liberar o envio pela rede.
        </p>
      </div>
    );
  }

  const restart = () => { setPlaying(false); setStage(0); setInspect(null); };
  const play = () => {
    if (done) setStage(0);
    setPlaying(p => !p);
  };
  const step = () => { if (!done) setStage(s => s + 1); };

  return (
    <div className="flex flex-col gap-3">
      {/* Controles */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={play}
          className={clsx(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white shadow-md cursor-pointer hover:-translate-y-px transition-all',
            playing ? 'bg-gradient-to-b from-[--color-accent-yellow] to-[#C48A00] shadow-[#F59E0B]/30' : 'bg-gradient-to-b from-[--color-accent-blue] to-[#0071D6] shadow-[#6366F1]/30'
          )}
        >
          {playing ? <Pause size={13} /> : <Play size={13} />}
          {playing ? 'Pausar' : done ? 'Repetir' : 'Executar'}
        </button>
        <button onClick={step} disabled={done} title="Próxima etapa"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border border-[--color-border-secondary] text-[--color-text-muted] hover:text-[--color-text-secondary] hover:bg-[#111A2C] cursor-pointer disabled:opacity-40">
          <SkipForward size={13} /> Etapa
        </button>
        <button onClick={restart} title="Reiniciar"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border border-[--color-border-secondary] text-[--color-text-muted] hover:text-[--color-text-secondary] hover:bg-[#111A2C] cursor-pointer">
          <RotateCcw size={13} /> <span className="hidden sm:inline">Reiniciar</span>
        </button>
        <button onClick={() => { setStage(0); setPlaying(true); setInspect(null); }} title="Repetir do início"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border border-[--color-border-secondary] text-[--color-text-muted] hover:text-[--color-text-secondary] hover:bg-[#111A2C] cursor-pointer">
          <Repeat size={13} />
        </button>
        <div className="ml-auto flex items-center gap-1 p-0.5 rounded-md bg-[--color-bg-tertiary] border border-[--color-border-primary]/60">
          {SPEEDS.map(s => (
            <button key={s} onClick={() => setSpeed(s)}
              className={clsx('px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors',
                speed === s ? 'bg-[--color-accent-cyan]/15 text-[--color-accent-cyan]' : 'text-[--color-text-muted] hover:text-[--color-text-secondary]')}>
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Pacote + detalhe */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-lg border border-[--color-border-primary] bg-[--color-bg-card] p-3 space-y-1.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-wider text-[--color-text-muted]">Encapsulando</span>
            <span className="text-[10px] font-mono text-[--color-text-muted]">{layerCount(layers.length)}</span>
          </div>
          {done && (
            <div className={clsx('rounded-md border px-2.5 py-1.5 font-mono text-[10px] break-all', ACCENT.cyan)}>
              Bits enviados: 0100101011000101 1011010010101100 01100100 01101111 01101101 ...
            </div>
          )}
          {[...layers].slice(done ? 0 : 0).reverse().map(step => (
            <button
              key={step.id}
              onClick={() => setInspect(step)}
              className={clsx(
                'w-full text-left flex items-center gap-2 rounded-md border px-2.5 py-1.5 cursor-pointer transition-colors',
                ACCENT[step.accent],
                inspect?.id === step.id ? 'ring-1 ring-[--color-accent-cyan]' : ''
              )}
            >
              <Search size={11} className="opacity-60" />
              <span className="text-[10px] font-mono font-bold">{step.title}</span>
              <span className="ml-auto text-[9px] text-[--color-text-muted] truncate">{step.detail}</span>
            </button>
          ))}
          {layers.length === 0 && (
            <p className="text-[11px] text-[--color-text-muted] py-4 text-center">
              Clique em <b>Executar</b> ou <b>Etapa</b> para adicionar cada camada.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-[--color-border-primary] bg-[--color-bg-card] p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Search size={12} className="text-[--color-accent-cyan]" />
            <span className="text-[10px] uppercase tracking-wider text-[--color-text-muted]">Inspeção</span>
          </div>
          {inspect ? (
            <details className="space-y-2">
              <summary className="cursor-pointer text-xs font-semibold text-[--color-text-primary]">
                {inspect.title} <span className="text-[--color-text-muted] text-[10px]">({inspect.pdu})</span>
              </summary>
              <p className="text-[10px] text-[--color-text-muted] leading-relaxed">{inspect.detail}</p>
              <dl className="mt-1 space-y-1">
                {inspect.fields.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 text-[10px] border-b border-[--color-border-primary]/40 pb-0.5">
                    <dt className="text-[--color-text-muted]">{k}</dt>
                    <dd className="font-mono text-[--color-text-secondary] text-right truncate">{v}</dd>
                  </div>
                ))}
              </dl>
            </details>
          ) : (
            <p className="text-[10px] text-[--color-text-muted] leading-relaxed">
              Clique numa camada do pacote para inspecionar seus campos (portas, IPs, MACs, bits).
            </p>
          )}
        </div>
      </div>

      {done && !playing && (
        <button
          onClick={() => { setStage(0); setPlaying(true); onSent(); }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-b from-[--color-accent-green] to-[#1FA655] shadow-md shadow-[#10B981]/30 cursor-pointer hover:-translate-y-px transition-all self-end"
        >
          <SendHorizonal size={15} /> Enviar pela rede
        </button>
      )}
    </div>
  );
}

function layerCount(n: number): string {
  const seq = ['Nenhuma camada ainda', 'Camada 7 — Aplicação', '+ Camada 4 — Transporte', '+ Camada 3 — Rede', '+ Camada 2 — Enlace', 'Camada 1 — Física (pronto)'];
  return seq[n] ?? seq[5];
}