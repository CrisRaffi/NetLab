import { useState } from 'react';
import { Info, X } from 'lucide-react';
import { clsx } from 'clsx';

interface LegendRow {
  color: string;
  label: string;
  dashed?: boolean;
  symbol?: 'check' | 'cross' | 'dot' | 'line';
}

const ROWS: LegendRow[] = [
  {
    symbol: 'dot',
    color: '#10B981',
    label: 'Equipamento conectado e operacional',
  },
  {
    symbol: 'dot',
    color: '#F59E0B',
    label: 'Conectado, mas falta configurar (IP)',
  },
  { symbol: 'dot', color: '#8094AD', label: 'Sem link (não conectado)' },
  { symbol: 'line', color: '#10B981', label: 'Cabo ativo' },
  { symbol: 'line', color: '#F43F5E', label: 'Cabo inativo (porta desligada)' },
  {
    symbol: 'line',
    color: '#F59E0B',
    dashed: true,
    label: 'Cabo negociando conexão',
  },
  { symbol: 'check', color: '#22C55E', label: 'Validação passou' },
  { symbol: 'cross', color: '#EF4444', label: 'Validação falhou' },
];

function LegendSymbol({ row }: { row: LegendRow }) {
  if (row.symbol === 'dot') {
    return (
      <span
        className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
        style={{ backgroundColor: row.color, width: 15, height: 15 }}
      />
    );
  }
  if (row.symbol === 'line') {
    return (
      <span className="inline-flex items-center w-5 shrink-0">
        <span
          className="h-0.5 w-full rounded-full"
          style={{
            backgroundColor: row.color,
            borderTop: row.dashed ? `1.5px dashed ${row.color}` : undefined,
            height: row.dashed ? 1.5 : undefined,
          }}
        />
      </span>
    );
  }
  if (row.symbol === 'check' || row.symbol === 'cross') {
    return (
      <span
        className="inline-flex h-2.5 w-2.5 items-center justify-center rounded-full text-[7px] font-bold shrink-0"
        style={{ backgroundColor: row.color, width: 15, height: 15 }}
      >
        <span
          className="text-[#0A0E1A]"
          style={{ color: '#fff', fontSize: 12 }}
        >
          {row.symbol === 'check' ? '✓' : '✕'}
        </span>
      </span>
    );
  }
  return null;
}

export function StatusLegend() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        style={{ marginLeft: 215 }}
        onClick={() => setOpen(true)}
        className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 rounded-full border border-[--color-border-primary]/40 bg-[#0D1424]/85 px-3 py-1.5 text-[10px] font-semibold text-[--color-text-secondary] hover:text-[--color-text-primary] hover:bg-[#111A2C]/90 backdrop-blur-md shadow-lg cursor-pointer transition-colors"
        title="Mostrar legenda de cores e status"
      >
        <Info size={11} className="text-[--color-accent-cyan]" />
        Legenda
      </button>
    );
  }

  return (
    <div className="absolute bottom-3 left-3 z-20 w-[220px] rounded-lg border border-[--color-border-primary]/35 bg-[#0D1424]/85 backdrop-blur-md shadow-lg p-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[--color-text-secondary]">
          <Info size={11} className="text-[--color-accent-cyan]" />
          Cores e status
        </span>
        <button
          onClick={() => setOpen(false)}
          className="p-0.5 rounded text-[--color-text-muted] hover:text-[--color-text-primary] hover:bg-[--color-bg-hover] cursor-pointer transition-colors"
          title="Ocultar legenda"
        >
          <X size={11} />
        </button>
      </div>
      <ul className="space-y-1">
        {ROWS.map((row) => (
          <li
            key={row.label}
            className={clsx(
              'flex items-center gap-2 text-[9.5px] leading-snug text-[--color-text-muted]',
            )}
          >
            <LegendSymbol row={row} />
            <span>{row.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
