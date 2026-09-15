import { clsx } from 'clsx';
import { Layers, Braces } from 'lucide-react';
import { OSI_LAYERS, TCP_IP_LAYERS } from '../data/osi';

interface LayerColumnProps {
  mode: 'osi' | 'tcpip';
  onMode: (m: 'osi' | 'tcpip') => void;
  selected: number | null;
  onSelect: (n: number) => void;
}

export function LayerColumn({ mode, onMode, selected, onSelect }: LayerColumnProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1 p-1 rounded-lg bg-[--color-bg-tertiary] border border-[--color-border-primary]/60 self-start">
        <button
          onClick={() => onMode('osi')}
          className={clsx(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors',
            mode === 'osi' ? 'bg-[--color-accent-blue]/15 text-[--color-accent-blue]' : 'text-[--color-text-muted] hover:text-[--color-text-secondary]'
          )}
        >
          <Layers size={12} /> OSI
        </button>
        <button
          onClick={() => onMode('tcpip')}
          className={clsx(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors',
            mode === 'tcpip' ? 'bg-[--color-accent-cyan]/15 text-[--color-accent-cyan]' : 'text-[--color-text-muted] hover:text-[--color-text-secondary]'
          )}
        >
          <Braces size={12} /> TCP/IP
        </button>
      </div>

      <div className="rounded-lg border border-[--color-border-primary] bg-[--color-bg-card] shadow-sm overflow-hidden">
        {mode === 'osi'
          ? OSI_LAYERS.map(layer => (
              <button
                key={layer.number}
                onClick={() => onSelect(layer.number)}
                className={clsx(
                  'w-full flex items-center gap-3 px-3 py-2.5 text-left border-b border-[--color-border-primary]/60 last:border-b-0 cursor-pointer transition-colors',
                  selected === layer.number
                    ? 'bg-gradient-to-r from-[--color-accent-blue]/12 to-transparent shadow-[inset_2px_0_0_var(--color-accent-blue)]'
                    : 'hover:bg-[--color-bg-tertiary]'
                )}
              >
                <span
                  className={clsx(
                    'w-7 h-7 shrink-0 flex items-center justify-center rounded-md text-[11px] font-bold border',
                    selected === layer.number
                      ? 'bg-[--color-accent-blue] text-white border-[--color-accent-blue]'
                      : 'bg-[--color-bg-tertiary] text-[--color-text-muted] border-[--color-border-secondary]'
                  )}
                >
                  {layer.number}
                </span>
                <div className="min-w-0 flex-1">
                  <span className={clsx('block text-xs font-semibold', selected === layer.number ? 'text-[--color-accent-blue]' : 'text-[--color-text-secondary]')}>
                    {layer.name}
                  </span>
                  <span className="block text-[10px] text-[--color-text-muted] truncate">PDU: {layer.pdu}</span>
                </div>
                <span className="text-[9px] font-mono text-[--color-text-muted]/70 shrink-0">{layer.protocols[0]}</span>
              </button>
            ))
          : TCP_IP_LAYERS.map((layer, idx) => (
              <button
                key={layer.name}
                onClick={() => onSelect(idx + 1)}
                className={clsx(
                  'w-full flex items-center gap-3 px-3 py-2.5 text-left border-b border-[--color-border-primary]/60 last:border-b-0 cursor-pointer transition-colors',
                  selected === idx + 1
                    ? 'bg-gradient-to-r from-[--color-accent-cyan]/12 to-transparent shadow-[inset_2px_0_0_var(--color-accent-cyan)]'
                    : 'hover:bg-[--color-bg-tertiary]'
                )}
              >
                <div className="min-w-0 flex-1">
                  <span className={clsx('block text-xs font-semibold', selected === idx + 1 ? 'text-[--color-accent-cyan]' : 'text-[--color-text-secondary]')}>
                    {layer.name}
                  </span>
                  <span className="block text-[10px] text-[--color-text-muted] truncate">{layer.osiMapping}</span>
                </div>
              </button>
            ))}
      </div>
    </div>
  );
}