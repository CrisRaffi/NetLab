import { FileQuestion } from 'lucide-react';

export function ProvaPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-100">Modo Prova</h1>
      <div className="flex flex-col items-center justify-center py-20 rounded-lg border border-dashed border-[--color-border-primary] bg-[--color-bg-card]">
        <FileQuestion size={48} className="text-slate-600 mb-4" />
        <p className="text-sm text-slate-400 mb-2">Modo Prova</p>
        <p className="text-xs text-slate-500 text-center max-w-sm">
          Avaliações cronometradas sem dicas. Será implementado nas próximas fases.
        </p>
      </div>
    </div>
  );
}