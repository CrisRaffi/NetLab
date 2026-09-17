import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { MonitorX } from 'lucide-react';

export function DesktopOnlyGate({ children }: { children: ReactNode }) {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 1024,
  );

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  if (isDesktop) return <>{children}</>;

  return (
    <div className="h-full w-full flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center rounded-2xl border border-[--color-border-primary]/50 bg-[--color-bg-card] p-8">
        <span className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-[--color-bg-tertiary] border border-[--color-border-primary]/70 mb-3">
          <MonitorX size={26} className="text-[--color-accent-yellow]" />
        </span>
        <h2 className="text-sm font-semibold text-[--color-text-primary] mb-1">
          Atividade só no computador
        </h2>
        <p className="text-xs text-[--color-text-muted] leading-relaxed mb-4">
          Esta atividade usa o quadro de montagem de rede e exige uma tela
          grande. Acesse pelo computador.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[--color-accent-blue]/10 text-[--color-accent-cyan] border border-[--color-accent-blue]/30 px-4 py-2 text-xs font-semibold transition-colors hover:bg-[--color-accent-blue]/20"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}