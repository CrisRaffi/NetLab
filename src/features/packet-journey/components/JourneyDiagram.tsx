import { useEffect, useRef, useState } from 'react';
import { Monitor, Network, Router, Server, Send, RotateCcw, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

const NODES = [
  { id: 'pc', label: 'PC Cliente', sub: 'origem', icon: Monitor },
  { id: 'switch', label: 'SWITCH', sub: 'encaminha', icon: Network },
  { id: 'router', label: 'ROUTER', sub: 'roteia entre redes', icon: Router },
  { id: 'server', label: 'SERVER', sub: 'destino', icon: Server },
] as const;

const X = [10, 38, 63, 90];
const Y = 46;

const ARRIVAL_LOG = ['Mensagem montada no PC', 'Passou pelo SWITCH', 'Passou pelo ROUTER', 'Chegou ao SERVER!'];

const SPEEDS = [0.5, 1, 2, 4] as const;

function posAt(t: number) {
  const segs = X.length - 1;
  const scaled = Math.max(0, Math.min(1, t)) * segs;
  const i = Math.min(Math.floor(scaled), segs - 1);
  const local = scaled - i;
  return { x: X[i] + (X[i + 1] - X[i]) * local, y: Y };
}

export function JourneyDiagram({ sendKey = 0, onArrived }: { sendKey?: number; onArrived?: () => void }) {
  const [status, setStatus] = useState<'idle' | 'travel' | 'arrived'>('idle');
  const [t, setT] = useState(0);
  const [speed, setSpeed] = useState<number>(1);
  const [reached, setReached] = useState(0);
  const raf = useRef<number>(0);
  const startRef = useRef<number>(0);

  const send = () => {
    setStatus('travel');
    setReached(0);
    setT(0);
  };

  useEffect(() => {
    if (sendKey > 0) send();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendKey]);

  useEffect(() => {
    if (status === 'arrived') onArrived?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    if (status !== 'travel') return;
    const duration = 4000 / speed;
    const tick = (now: number) => {
      if (startRef.current === 0) startRef.current = now;
      const elapsed = now - startRef.current;
      const p = Math.min(1, elapsed / duration);
      setT(p);
      setReached(Math.min(NODES.length - 1, Math.floor(p * (NODES.length - 1) + 0.0001)));
      if (p >= 1) {
        setStatus('arrived');
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    startRef.current = 0;
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [status, speed]);

  const restart = () => {
    cancelAnimationFrame(raf.current);
    setStatus('idle');
    setT(0);
    setReached(0);
  };

  const dot = posAt(t);

  return (
    <div className="flex flex-col gap-3">
      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={send}
          disabled={status === 'travel'}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-gradient-to-b from-[--color-accent-blue] to-[#0071D6] text-white shadow-md shadow-[#6366F1]/30 cursor-pointer hover:-translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={13} /> Enviar mensagem
        </button>
        <button
          onClick={restart}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-[--color-border-secondary] text-[--color-text-muted] hover:text-[--color-text-secondary] hover:bg-[#111A2C] cursor-pointer"
        >
          <RotateCcw size={13} /> Reiniciar
        </button>
        <div className="ml-auto flex items-center gap-1 p-0.5 rounded-md bg-[--color-bg-tertiary] border border-[--color-border-primary]/60">
          {SPEEDS.map(s => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={clsx(
                'px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors',
                speed === s ? 'bg-[--color-accent-cyan]/15 text-[--color-accent-cyan]' : 'text-[--color-text-muted] hover:text-[--color-text-secondary]'
              )}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Diagram */}
      <div className="relative rounded-lg border border-[--color-border-primary] bg-[--color-bg-card] shadow-sm overflow-hidden" style={{ minHeight: 190 }}>
        <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
        {/* Links */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
          <line x1={`${X[0]}%`} y1={`${Y}%`} x2={`${X[3]}%`} y2={`${Y}%`} stroke="rgba(0,140,255,0.35)" strokeWidth="2" strokeDasharray="6 6" />
          {NODES.slice(0, -1).map((_, i) => (
            <circle key={i} cx={`${(X[i] + X[i + 1]) / 2}%`} cy={`${Y}%`} r="2" fill="rgba(129, 140, 248,0.5)" />
          ))}
        </svg>
        {/* Packet dot */}
        {status !== 'idle' && (
          <div
            className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[--color-accent-cyan] glow-dot-cyan"
            style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
          />
        )}
        {/* Nodes */}
        {NODES.map((node, i) => {
          const Icon = node.icon;
          const active = status === 'travel' && reached === i;
          const done = status === 'arrived' || (status === 'travel' ? reached > i || reached === i : false);
          return (
            <div
              key={node.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
              style={{ left: `${X[i]}%`, top: `${Y}%` }}
            >
              <div
                className={clsx(
                  'w-14 h-14 rounded-xl border flex items-center justify-center transition-all duration-300',
                  done
                    ? 'border-[--color-accent-cyan]/60 bg-[--color-accent-cyan]/10 text-[--color-accent-cyan] glow-ring-cyan'
                    : i === 0 || status === 'idle'
                      ? 'border-[--color-border-secondary] bg-[--color-bg-secondary] text-[--color-text-secondary]'
                      : 'border-[--color-border-primary] bg-[--color-bg-secondary] text-[--color-text-muted]'
                )}
                style={active ? { transform: 'scale(1.08)' } : undefined}
              >
                <Icon size={24} />
              </div>
              <div className="text-center">
                <span className={clsx('block text-[10px] font-semibold', done ? 'text-[--color-accent-cyan]' : 'text-[--color-text-secondary]')}>{node.label}</span>
                <span className="block text-[9px] text-[--color-text-muted]">{node.sub}</span>
              </div>
            </div>
          );
        })}
        {/* Log */}
        <div className="absolute bottom-2 left-3 right-3 flex flex-wrap items-center gap-1.5 pointer-events-none">
          {status !== 'idle' &&
            ARRIVAL_LOG.slice(0, reached + (status === 'arrived' ? 1 : 0)).map((l, i) => (
              <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#1C2538]/80 border border-[--color-border-primary]/60 text-[--color-text-secondary]">
                {i === ARRIVAL_LOG.length - 1 ? <Sparkles size={9} className="inline -mt-0.5 mr-1 text-[--color-accent-green]" /> : null}
                {l}
              </span>
            ))}
        </div>
      </div>

      {/* Arrival + status line */}
      <div className="min-h-6 flex items-center gap-2 text-xs">
        {status === 'idle' && (
          <span className="text-[--color-text-muted]">
            Clique em <strong className="text-[--color-blue-400]">Enviar mensagem</strong> para ver o que acontece com{' '}
            <code className="font-mono px-1 py-0.5 rounded bg-[--color-bg-tertiary] text-[--color-accent-green]">"OlÃ¡ servidor!"</code> atÃ© chegar ao destino.
          </span>
        )}
        {status === 'arrived' && (
          <div className="flex-1 rounded-lg border border-[--color-accent-green]/30 bg-[--color-accent-green]/8 px-3 py-2">
            <p className="text-[--color-accent-green] font-semibold mb-1">âœ“ Mensagem recebida no SERVER: "OlÃ¡ servidor!"</p>
            <p className="text-[11px] text-[--color-text-muted]">
              A informaÃ§Ã£o desceu pelas camadas do PC (virou <b>bits</b>), atravessou a rede pelo switch e pelo roteador, e subiu de volta pelas camadas do servidor atÃ© virar texto de novo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}