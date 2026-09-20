import type { ReactNode } from 'react';
import {
  Network,
  CloudUpload,
  Trophy,
  History,
  ShieldCheck,
  Check,
} from 'lucide-react';

const BENEFITS = [
  { icon: CloudUpload, text: 'Seu progresso fica sincronizado na nuvem' },
  { icon: Trophy, text: 'Pontuações dos questionários salvas com sua conta' },
  { icon: History, text: 'Continue de onde parou em qualquer dispositivo' },
  { icon: ShieldCheck, text: 'Proteção com boas práticas de segurança' },
];

export function AuthLayout({
  children,
  showBenefits = true,
}: {
  children: ReactNode;
  showBenefits?: boolean;
}) {
  return (
    <div className="relative flex flex-col h-full w-full bg-[--color-bg-primary] overflow-hidden">
      <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="glow-orb -top-40 -left-24 h-96 w-[38rem] bg-[--color-accent-blue]/7" />
        <div className="glow-orb top-1/3 right-1/4 h-80 w-[30rem] bg-[--color-accent-purple]/5" />
        <div className="glow-orb bottom-0 -right-24 h-96 w-[30rem] bg-[--color-accent-cyan]/5" />
      </div>

      <div className="relative z-10 flex flex-col min-h-0 h-full">
        <header className="flex items-center justify-center gap-3 px-6 pt-7 pb-5 shrink-0">
          <div className="relative shrink-0">
            <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-br from-[--color-accent-blue]/40 to-[--color-accent-cyan]/20 blur-md" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[--color-accent-blue] via-[#4F46E5] to-[--color-accent-cyan] flex items-center justify-center text-white shadow-lg glow-logo">
              <Network size={19} strokeWidth={2.2} />
            </div>
          </div>
          <div className="leading-none">
            <span className="block text-lg font-bold tracking-tight text-[--color-text-primary]">
              Net<span className="text-gradient">Lab</span>
            </span>
            <span className="block text-[10px] text-[--color-text-muted] uppercase tracking-[0.16em] mt-1">
              Simulador de Redes
            </span>
          </div>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto">
          <div className="mx-auto flex min-h-full w-full max-w-3xl items-center justify-center gap-12 px-5 pb-10 animate-fade-in-up">
            {showBenefits && (
              <aside className="hidden lg:block w-80 shrink-0">
                <div className="rounded-2xl border border-[--color-border-primary]/50 bg-[--color-bg-card] p-6">
                  <h2 className="text-base font-bold text-[--color-text-primary] mb-1">
                    Sua conta, seu progresso
                  </h2>
                  <p className="text-xs text-[--color-text-muted] leading-relaxed mb-4">
                    Entre ou crie sua conta para levar seu aprendizado para onde
                    quiser.
                  </p>
                  <ul className="space-y-3">
                    {BENEFITS.map((b) => {
                      const Icon = b.icon;
                      return (
                        <li
                          key={b.text}
                          className="flex items-center gap-2.5 text-[13px] text-[--color-text-secondary]"
                        >
                          <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-[--color-accent-blue]/10 text-[--color-accent-cyan] shrink-0">
                            <Icon size={13} />
                          </span>
                          {b.text}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <p className="flex items-center gap-1.5 text-[10px] text-[--color-text-muted]/70 mt-4">
                  <ShieldCheck size={11} className="text-[--color-accent-green]" />
                  Desenvolvido seguindo boas práticas de segurança (OWASP).
                </p>
              </aside>
            )}

            <div className="w-full max-w-[400px] shrink-0">
              {children}
              {showBenefits && (
                <p className="flex items-center justify-center gap-1.5 text-[10px] text-[--color-text-muted]/60 lg:hidden mt-4">
                  <Check size={11} className="text-[--color-accent-green]" />
                  Progresso sincronizado na nuvem com sua conta.
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}