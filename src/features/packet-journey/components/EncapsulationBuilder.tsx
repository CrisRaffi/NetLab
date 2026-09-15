import { useState } from 'react';
import { MessageSquareText, MousePointerClick, CheckCircle2, HelpCircle } from 'lucide-react';
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

export function EncapsulationBuilder({ onComplete }: { onComplete: () => void }) {
  const [placed, setPlaced] = useState<EncapStep[]>([]);
  const [wrong, setWrong] = useState<EncapStep['id'] | null>(null);

  const pool = ENCAP_ORDER.filter(id => !placed.some(p => p.id === id));
  const nextId = ENCAP_ORDER[placed.length];
  const complete = placed.length === ENCAP_ORDER.length;

  const place = (id: EncapStep['id']) => {
    if (wrong) setWrong(null);
    if (id === nextId) {
      const next = [...placed, ENCAP_STEPS[id]];
      setPlaced(next);
      if (next.length === ENCAP_ORDER.length) onComplete();
    } else {
      const expected = ENCAP_STEPS[nextId];
      setWrong(id);
      setTimeout(() => setWrong(null), 2600);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2.5 rounded-lg border border-[--color-border-primary] bg-[--color-bg-tertiary]/50 px-3 py-2">
        <MessageSquareText size={15} className="text-[--color-accent-green] shrink-0" />
        <span className="text-xs text-[--color-text-secondary]">
          Você deseja enviar: <code className="font-mono text-[--color-accent-green]">"Olá servidor!"</code>
        </span>
      </div>

      {complete ? (
        <div className="flex items-center gap-2 rounded-lg border border-[--color-accent-green]/30 bg-[--color-accent-green]/8 px-3 py-2">
          <CheckCircle2 size={15} className="text-[--color-accent-green] shrink-0" />
          <span className="text-xs text-[--color-accent-green]">Pacote montado na ordem correta! Agora enviar.</span>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-1.5 text-xs text-[--color-text-muted]">
            <MousePointerClick size={13} />
            Monte o encapsulamento: clique cada cartão na ordem em que ele envelopa os dados
            {wrong && (
              <span className="ml-1 text-[--color-accent-red]">
                — esse ainda não é o passo {placeLabel(placed.length + 1)}!
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {pool.map(id => {
              const step = ENCAP_STEPS[id];
              return (
                <button
                  key={id}
                  onClick={() => place(id)}
                  className={clsx(
                    'px-3 py-2 rounded-lg border font-mono text-xs cursor-pointer transition-all hover:-translate-y-0.5',
                    wrong === id
                      ? 'text-[--color-accent-red] border-[--color-accent-red]/60 bg-[--color-accent-red]/10'
                      : ACCENT[step.accent]
                  )}
                >
                  {step.title}
                </button>
              );
            })}
          </div>
          {wrong && (
            <div className="flex items-start gap-2 rounded-lg border border-[--color-accent-yellow]/25 bg-[--color-accent-yellow]/5 px-3 py-2">
              <HelpCircle size={13} className="text-[--color-accent-yellow] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[--color-text-muted]">
                Dica: antes de enviar na rede, a informação precisa primeiro ser <b>criada</b> pela aplicação, depois ganhar <b>portas</b>, depois <b>endereços IP</b>, depois <b>MACs</b> e só então virar <b>sinais</b>.
              </p>
            </div>
          )}
        </>
      )}

      {/* Stack built so far */}
      {placed.length > 0 && (
        <div className="space-y-1.5">
          {[...placed].reverse().map((step, i) => (
            <div
              key={step.id}
              className={clsx(
                'flex items-center gap-2 rounded-md border px-2.5 py-1.5 animate-fade-in',
                ACCENT[step.accent]
              )}
              style={{ marginLeft: (placed.length - 1 - i) * 18 }}
            >
              <span className="text-[10px] font-mono font-bold">{step.title}</span>
              <span className="text-[9px] text-[--color-text-muted] truncate">{step.detail}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function placeLabel(n: number): string {
  const labels = ['primeiro', 'segundo', 'terceiro', 'quarto', 'quinto'];
  return labels[n - 1] ?? String(n);
}