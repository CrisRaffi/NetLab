import { useState } from 'react';
import { Trash2, AlertTriangle, Settings, Info } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { PageHeader } from '../components/common/PageHeader';
import { useProgressStore } from '../stores/useProgressStore';

export function ConfigPage() {
  const resetProgress = useProgressStore((s) => s.resetProgress);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleReset = () => {
    resetProgress();
    setShowConfirm(false);
    setResetDone(true);
    setTimeout(() => setResetDone(false), 3000);
  };

  return (
    <div className="page-container space-y-6 max-w-2xl">
      <PageHeader
        title="Configurações"
        subtitle="Preferências e dados da sua conta."
        accent="cyan"
        icon={<Settings size={19} />}
      />

      <Card title="Dados de Progresso" icon={<Trash2 size={15} />}>
        <p className="text-sm text-[--color-text-muted] mb-2">
          Resete todo o seu progresso. Esta ação é irreversível.
        </p>
        {showConfirm ? (
          <div className="rounded-lg border border-[--color-accent-red]/30 bg-[--color-accent-red]/5 p-3">
            <div className="flex items-center gap-2 mb-2 text-[--color-accent-red]">
              <AlertTriangle size={15} />
              <span className="text-sm font-medium">Tem certeza?</span>
            </div>
            <p className="text-xs text-[--color-text-muted] mb-2">
              Todo o progresso, conquistas e XP serão perdidos.
            </p>
            <div className="flex items-center gap-2">
              <Button variant="danger" size="sm" onClick={handleReset}>
                Sim, resetar tudo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirm(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowConfirm(true)}
          >
            Resetar progresso
          </Button>
        )}
        {resetDone && (
          <p className="text-xs text-[--color-accent-green] mt-2">
            Progresso resetado com sucesso.
          </p>
        )}
      </Card>

      <Card
        title="Sobre"
        subtitle="Informações do projeto"
        icon={<Info size={15} />}
      >
        <div className="space-y-2 text-xs text-[--color-text-muted]">
          <p>
            <strong className="text-[--color-text-primary]">NetLab</strong>{' '}
            v0.1.0
          </p>
          <p>Laboratório Virtual de Redes de Computadores</p>
          <p>Phase 1: Foundation — completed</p>
          <p className="text-[--color-text-muted]/70 mt-2">
            Stack: React, TypeScript, Vite, Zustand, Tailwind CSS
          </p>
        </div>
      </Card>
    </div>
  );
}
