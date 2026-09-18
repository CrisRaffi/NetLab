import { Download, Trash2, X, List } from 'lucide-react';
import { useSessionStore } from '../../stores/useSessionStore';
import { useSimulatorStore } from '../../stores/useSimulatorStore';
import { clsx } from 'clsx';

const TAG_COLORS: Record<string, string> = {
  command: 'bg-[#1C2538] text-[--color-text-secondary]',
  dhcp: 'bg-[--color-accent-orange]/10 text-[--color-accent-orange] border-[--color-accent-orange]/30',
  dns: 'bg-[--color-accent-purple]/10 text-[--color-accent-purple] border-[--color-accent-purple]/30',
  web: 'bg-[--color-accent-cyan]/10 text-[--color-accent-cyan] border-[--color-accent-cyan]/30',
  error: 'bg-[--color-accent-red]/10 text-[--color-accent-red] border-[--color-accent-red]/30',
  system: 'bg-[--color-bg-hover]/50 text-[--color-text-muted]',
  packet: 'bg-[--color-accent-green]/10 text-[--color-accent-green] border-[--color-accent-green]/30',
};

export function SessionReport({ open, onClose }: { open: boolean; onClose: () => void }) {
  const topology = useSimulatorStore((s) => s.topology);
  const events = useSessionStore((s) => s.events);
  const clearEvents = useSessionStore((s) => s.clearEvents);
  const exportText = useSessionStore((s) => s.exportText);

  if (!open) return null;

  const download = (ext: 'txt' | 'json') => {
    if (ext === 'txt') {
      const text = exportText(topology.name);
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `netlab-relatorio-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const data = JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          topology: topology.name,
          events,
        },
        null,
        2,
      );
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `netlab-relatorio-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="rmodal-overlay">
      <div className="rmodal-panel rmodal-panel--sm animate-fade-in-up">
        {/* Header */}
        <div className="rmodal-header">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[--color-accent-green]/10 border border-[--color-accent-green]/30 shrink-0">
              <List size={15} className="text-[--color-accent-green]" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-[--color-text-primary]">
                Relatório de sessão
              </h2>
              <p className="text-[10px] text-[--color-text-muted] truncate">
                {topology.name} — {events.length} eventos registrados
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => download('txt')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[--color-border-primary]/60 text-[10px] font-medium text-[--color-text-muted] hover:text-[--color-text-primary] hover:border-[--color-accent-cyan]/40 transition-colors cursor-pointer"
              title="Baixar como .txt"
            >
              <Download size={11} /> .txt
            </button>
            <button
              onClick={() => download('json')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[--color-border-primary]/60 text-[10px] font-medium text-[--color-text-muted] hover:text-[--color-text-primary] hover:border-[--color-accent-cyan]/40 transition-colors cursor-pointer"
              title="Baixar como .json"
            >
              <Download size={11} /> .json
            </button>
            <button
              onClick={clearEvents}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[--color-border-primary]/60 text-[10px] font-medium text-[--color-text-muted] hover:text-[--color-accent-red] hover:border-[--color-accent-red]/40 hover:bg-[--color-accent-red]/5 transition-colors cursor-pointer"
              title="Limpar histórico"
            >
              <Trash2 size={11} /> Limpar
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[--color-text-muted] hover:text-[--color-text-primary] hover:bg-[--color-bg-hover] cursor-pointer"
              title="Fechar"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Events list */}
        <div className="rmodal-body space-y-1">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[11px] text-[--color-text-muted]">
                Nenhum evento registrado. Execute comandos no terminal (ping, web, ipconfig /release, etc.) para gerar registros.
              </p>
            </div>
          ) : (
            [...events]
              .reverse()
              .map((e) => {
                const ts = new Date(e.timestamp).toLocaleTimeString('pt-BR');
                const tagClass = TAG_COLORS[e.type] ?? TAG_COLORS.system;
                return (
                  <div
                    key={e.id}
                    className="flex items-start gap-2 rounded-lg bg-[#111A2C]/40 border border-[--color-border-primary]/30 px-2.5 py-1.5"
                  >
                    <span className="text-[9px] font-mono text-[--color-text-muted] shrink-0 mt-px w-14">
                      {ts}
                    </span>
                    <span
                      className={clsx(
                        'px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border border-transparent shrink-0 mt-px',
                        tagClass,
                      )}
                    >
                      {e.type.slice(0, 6)}
                    </span>
                    <div className="min-w-0">
                      {e.deviceName && (
                        <span className="text-[9px] text-[--color-accent-green] font-mono mr-1.5">
                          [{e.deviceName}]
                        </span>
                      )}
                      {e.command && (
                        <span className="text-[9px] text-[--color-text-secondary] font-mono mr-1.5">
                          {e.command}
                        </span>
                      )}
                      <span className="text-[10px] text-[--color-text-muted] leading-relaxed">
                        {e.detail}
                      </span>
                    </div>
                  </div>
                );
              })
          )}
        </div>

        {/* Footer */}
        <div className="rmodal-footer">
          <p className="text-[9px] text-[--color-text-muted]/70">
            Exporte como .txt ou .json e salve junto ao relatório da atividade.
          </p>
          <button
            onClick={onClose}
            className="rounded-lg border border-[--color-border-primary]/50 px-3 py-1.5 text-[10px] font-medium text-[--color-text-muted] hover:text-[--color-text-primary] hover:bg-[--color-bg-hover] cursor-pointer shrink-0"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}