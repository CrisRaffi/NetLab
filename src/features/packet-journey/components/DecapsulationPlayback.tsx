import { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipForward, RotateCcw, Repeat, Search, ArrowDownToLine, GraduationCap } from 'lucide-react';
import { clsx } from 'clsx';
import { ENCAP_ORDER, ENCAP_STEPS } from '../data/steps';
import type { EncapStep } from '../data/steps';
import { PROTOCOL_TIPS } from '../../../data/protocolTips';

const ACCENT: Record<string, string> = {
  green: 'text-[--color-accent-green] border-[--color-accent-green]/40 bg-[--color-accent-green]/10',
  blue: 'text-[--color-accent-blue] border-[--color-accent-blue]/40 bg-[--color-accent-blue]/10',
  purple: 'text-[--color-accent-purple] border-[--color-accent-purple]/40 bg-[--color-accent-purple]/10',
  yellow: 'text-[--color-accent-yellow] border-[--color-accent-yellow]/40 bg-[--color-accent-yellow]/10',
  cyan: 'text-[--color-accent-cyan] border-[--color-accent-cyan]/40 bg-[--color-accent-cyan]/10',
};

const SPEEDS = [0.5, 1, 2, 4];
const PEEL_MSG: Record<string, string> = {
  bits: 'Camada física leu os sinais e reconstruiu o quadro (Ethernet).',
  ethernet: 'O switch/servidor leu o MAC de destino e removeu o cabeçalho Ethernet.',
  ip: 'A camada de Rede conferiu o IP destino e removeu o cabeçalho IPv4.',
  tcp: 'A camada de Transporte entregou os dados à porta 80 (HTTP) e removeu o segmento TCP.',
  dados: 'A aplicação recebeu o payload final: menu!',
};

export function DecapsulationPlayback() {
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [inspect, setInspect] = useState<EncapStep | null>(null);

  const done = stage >= ENCAP_ORDER.length;
  const remaining = ENCAP_ORDER.slice(0, ENCAP_ORDER.length - stage).map(id => ENCAP_STEPS[id]);
  const peeled = ENCAP_ORDER.slice(ENCAP_ORDER.length - stage).map(id => ENCAP_STEPS[id]);
  const lastPeeled = peeled[peeled.length - 1];

  useEffect(() => {
    if (!playing) return;
    if (done) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStage(s => s + 1), 750 / speed);
    return () => clearTimeout(t);
  }, [playing, stage, speed, done]);

  const restart = () => { setPlaying(false); setStage(0); setInspect(null); };
  const play = () => {
    if (done) setStage(0);
    setPlaying(p => !p);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Controles */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button onClick={play}
          className={clsx(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white shadow-md cursor-pointer hover:-translate-y-px transition-all',
            playing ? 'bg-gradient-to-b from-[--color-accent-yellow] to-[#C48A00] shadow-[#F59E0B]/30' : 'bg-gradient-to-b from-[--color-accent-purple] to-[#6B5BD6] shadow-[#8B7CF6]/30'
          )}>
          {playing ? <Pause size={13} /> : <Play size={13} />}
          {playing ? 'Pausar' : done ? 'Repetir' : 'Executar'}
        </button>
        <button onClick={() => { if (!done) setStage(s => s + 1); }} disabled={done} title="Próxima etapa"
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

      {/* Palco */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-lg border border-[--color-border-primary] bg-[--color-bg-card] p-3 space-y-1.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-wider text-[--color-text-muted]">
              {done ? 'Conteúdo entregue' : 'Cabeçalhos no pacote recebido'}
            </span>
            <span className="text-[10px] font-mono text-[--color-text-muted]">{remaining.length}</span>
          </div>

          {done ? (
            <div className="rounded-md border border-[--color-accent-green]/40 bg-[--color-accent-green]/10 px-3 py-3 text-center">
              <p className="text-sm font-bold text-[--color-accent-green] font-mono break-all">"Olá servidor!"</p>
              <p className="text-[10px] text-[--color-text-muted] mt-1">Todos os cabeçalhos foram removidos: restou só a mensagem da aplicação.</p>
            </div>
          ) : (
            <>
              {remaining.some(s => s.id === 'bits') && (
                <div className={clsx('rounded-md border px-2.5 py-1.5 font-mono text-[10px] break-all', ACCENT.cyan)}>
                  BITS: 0100101011000101 1011010010101100 01100100 01101111 01101101 ...
                </div>
              )}
              {[...remaining].reverse().map(step => (
                <button key={step.id} onClick={() => setInspect(step)}
                  className={clsx(
                    'w-full text-left flex items-center gap-2 rounded-md border px-2.5 py-1.5 cursor-pointer transition-colors',
                    ACCENT[step.accent],
                    inspect?.id === step.id ? 'ring-1 ring-[--color-accent-cyan]' : ''
                  )}>
                  {step.id !== 'bits' && <Search size={11} className="opacity-60 shrink-0" />}
                  {step.id === 'bits' && <span className="w-2.5 shrink-0" />}
                  <span className="text-[10px] font-mono font-bold truncate min-w-0" title={PROTOCOL_TIPS[step.title]}>{step.title}</span>
                  <span className="ml-auto text-[9px] text-[--color-text-muted] truncate min-w-0">{step.detail}</span>
                </button>
              ))}
            </>
          )}
        </div>

        <div className="flex flex-col gap-3 min-w-0">
          <div className="rounded-lg border border-[--color-border-primary] bg-[--color-bg-card] p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <ArrowDownToLine size={12} className="text-[--color-accent-purple]" />
              <span className="text-[10px] uppercase tracking-wider text-[--color-text-muted]">Camada removida</span>
            </div>
            {lastPeeled ? (
              <>
                <p className={clsx('text-[10px] font-mono font-bold mb-1', ACCENT[lastPeeled.accent])}>
                  {lastPeeled.title}
                </p>
                <p className="text-[10px] text-[--color-text-muted] leading-relaxed">{PEEL_MSG[lastPeeled.id]}</p>
                <dl className="mt-1.5 space-y-1">
                  {lastPeeled.fields.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 text-[10px] border-b border-[--color-border-primary]/40 pb-0.5">
                      <dt className="text-[--color-text-muted]">{k}</dt>
                      <dd className="font-mono text-[--color-text-secondary] text-right truncate">{v}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : (
              <p className="text-[10px] text-[--color-text-muted] leading-relaxed">
                Ainda nada foi removido. Execute a desencapsulação para começar a abrir o pacote.
              </p>
            )}
          </div>

          <div className="rounded-lg border border-[--color-border-primary] bg-[--color-bg-card] p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <GraduationCap size={12} className="text-[--color-accent-green]" />
              <span className="text-[10px] uppercase tracking-wider text-[--color-text-muted]">Por que isso importa</span>
            </div>
            <p className="text-[10px] text-[--color-text-muted] leading-relaxed">
              <b>Desencapsular</b> é o caminho inverso do encapsulamento: cada equipamento (ou o servidor)
              lê o cabeçalho da sua camada, verifica se é para ele, remove o cabeçalho e entrega o resto à camada acima —
              até sobrar apenas os dados da aplicação.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}