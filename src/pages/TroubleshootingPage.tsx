import { Bug } from 'lucide-react';

export function TroubleshootingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-100">Troubleshooting</h1>
      <div className="flex flex-col items-center justify-center py-20 rounded-lg border border-dashed border-[--color-border-primary] bg-[--color-bg-card]">
        <Bug size={48} className="text-slate-600 mb-4" />
        <p className="text-sm text-slate-400 mb-2">Quebrei a Rede!</p>
        <p className="text-xs text-slate-500 text-center max-w-sm">
          Modo de diagnóstico com problemas aleatórios. Será implementado na Fase 5.
        </p>
      </div>
    </div>
  );
}