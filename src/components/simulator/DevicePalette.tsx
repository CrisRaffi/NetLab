import type { DeviceType } from '../../types';
import { DEVICE_ICONS, DEVICE_COLORS, DEVICE_ORDER } from './deviceIcons';
import { DEVICE_LABELS } from '../../stores/useSimulatorStore';
import { Plus } from 'lucide-react';

interface DevicePaletteProps {
  onAdd: (type: DeviceType) => void;
}

export function DevicePalette({ onAdd }: DevicePaletteProps) {
  return (
    <div className="w-36 shrink-0 border-r border-[--color-border-primary]/50 bg-[#03111F] overflow-y-auto flex flex-col">
      <div className="px-3 py-3 flex-1">
        <h3 className="text-[10px] font-semibold text-[--color-text-secondary] uppercase tracking-widest">
          Equipamentos
        </h3>
        <p className="text-[10px] text-[--color-text-muted]/70 mt-0.5">Clique para adicionar</p>

        <div className="mt-2.5 space-y-1.5">
          {DEVICE_ORDER.map(type => {
            const Icon = DEVICE_ICONS[type];
            const colors = DEVICE_COLORS[type];
            return (
              <button
                key={type}
                onClick={() => onAdd(type)}
                className="group w-full flex items-center gap-2 px-2 py-2 rounded-xl bg-[#071A2C]/60 border border-transparent hover:border-[#123B61] hover:bg-[#081C30] transition-all duration-150 cursor-pointer hover:-translate-y-px"
              >
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0 transition-transform duration-150 group-hover:scale-105"
                  style={{ background: colors.fill, border: `1px solid ${colors.stroke}45` }}
                >
                  <Icon size={14} color={colors.text} />
                </span>
                <span className="flex-1 text-left text-[11px] font-medium text-[--color-text-secondary] group-hover:text-[--color-text-primary] transition-colors truncate">
                  {DEVICE_LABELS[type]}
                </span>
                <Plus size={10} className="text-[--color-text-muted]/0 group-hover:text-[--color-accent-blue]/70 transition-all shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}