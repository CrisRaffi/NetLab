import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useProgressStore } from '../stores/useProgressStore';

export function ConfigPage() {
  const resetProgress = useProgressStore(s => s.resetProgress);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleReset = () => {
    resetProgress();
    setShowConfirm(false);
    setResetDone(true);
    setTimeout(() => setResetDone(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold text-slate-100">Configurações</h1>

      <Card title="Progresso" icon={<Trash2 size={15} />}>
        <p className="text-sm text-slate-400 mb-4">
          Resete todo o seu progresso. Esta ação é irreversível.
        </p>
        {showConfirm ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
            <div className="flex items-center gap-2 mb-3 text-red-400">
              <AlertTriangle size={15} />
              <span className="text-sm font-medium">Tem certeza?</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Todo o progresso, conquistas e XP serão perdidos.
            </p>
            <div className="flex items-center gap-2">
              <Button variant="danger" size="sm" onClick={handleReset}>
                Sim, resetar tudo
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowConfirm(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="danger" size="sm" onClick={() => setShowConfirm(true)}>
            Resetar progresso
          </Button>
        )}
        {resetDone && (
          <p className="text-xs text-emerald-400 mt-2">Progresso resetado com sucesso.</p>
        )}
      </Card>

      <Card title="Sobre" subtitle="Informações do projeto">
        <div className="space-y-2 text-xs text-slate-400">
          <p><strong className="text-slate-300">NetLab</strong> v0.1.0</p>
          <p>Laboratório Virtual de Redes de Computadores</p>
          <p>Phase 1: Foundation — completed</p>
          <p className="text-slate-500 mt-2">Stack: React, TypeScript, Vite, Zustand, Tailwind CSS</p>
        </div>
      </Card>
    </div>
  );
}