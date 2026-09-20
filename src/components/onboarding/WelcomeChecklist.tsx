import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Network, ClipboardList, Rocket, ArrowRight } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

const STEPS = [
  {
    n: 1,
    title: 'Leia uma lição',
    desc: 'Comece entendendo o modelo OSI e TCP/IP com diagramas animados.',
    to: '/aprender/modelo-osi-tcpip',
    icon: BookOpen,
    accent: 'text-[--color-accent-blue] bg-[--color-accent-blue]/10 border-[--color-accent-blue]/25',
  },
  {
    n: 2,
    title: 'Monte sua primeira rede',
    desc: 'Conecte dois computadores e faça o primeiro ping funcionar.',
    to: '/labs/lab-01-first-network',
    icon: Network,
    accent: 'text-[--color-accent-green] bg-[--color-accent-green]/10 border-[--color-accent-green]/25',
  },
  {
    n: 3,
    title: 'Teste o que aprendeu',
    desc: 'Responda um questionário — se errar, o sistema te ensina na hora.',
    to: '/questionarios',
    icon: ClipboardList,
    accent: 'text-[--color-accent-purple] bg-[--color-accent-purple]/10 border-[--color-accent-purple]/25',
  },
];

const DISMISS_KEY = 'netlab:welcome-dismissed';

export function WelcomeChecklist({ show }: { show: boolean }) {
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(DISMISS_KEY) === '1',
  );

  if (!show || dismissed) return null;

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  }

  return (
    <Modal open onClose={dismiss} size="md">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[--color-accent-blue]/10 text-[--color-accent-blue] border border-[--color-accent-blue]/25">
            <Rocket size={18} />
          </span>
          <div>
            <h3 className="text-base font-bold text-[--color-text-primary]">
              Bem-vindo(a) ao NetLab!
            </h3>
            <p className="text-xs text-[--color-text-muted] leading-relaxed mt-0.5">
              Três passos simples para você começar. Depois é só seguir o Mapa de
              Aprendizado.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <Link
                key={step.n}
                to={step.to}
                onClick={dismiss}
                className="group flex items-center gap-3 rounded-xl border border-[--color-border-primary]/45 bg-[--color-bg-card]/70 p-3 transition-all hover:border-[--color-accent-blue]/50 hover:bg-[--color-bg-hover]/50"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${step.accent}`}
                >
                  <Icon size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-[--color-text-primary]">
                    <span className="font-mono text-[--color-accent-cyan] mr-1.5">
                      {step.n}.
                    </span>
                    {step.title}
                  </span>
                  <span className="block text-[11px] text-[--color-text-muted] leading-relaxed mt-0.5">
                    {step.desc}
                  </span>
                </span>
                <ArrowRight
                  size={14}
                  className="shrink-0 text-[--color-accent-blue] opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0"
                />
              </Link>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <Link
            to="/mapa"
            onClick={dismiss}
            className="text-xs text-[--color-accent-cyan] hover:underline"
          >
            Ver o Mapa de Aprendizado
          </Link>
          <Button variant="outline" size="sm" onClick={dismiss}>
            Entendi, obrigado
          </Button>
        </div>
      </div>
    </Modal>
  );
}