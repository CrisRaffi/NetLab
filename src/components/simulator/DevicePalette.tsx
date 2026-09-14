import type { DeviceType } from '../../types';
import { DEVICE_ICONS, DEVICE_COLORS, DEVICE_ORDER } from './deviceIcons';
import { DEVICE_LABELS } from '../../stores/useSimulatorStore';

interface DevicePaletteProps {
  onAdd: (type: DeviceType) => void;
}

export function DevicePalette({ onAdd }: DevicePaletteProps) {
  return (
    <div className="w-44 shrink-0 border-r border-[--color-border-primary] bg-[--color-bg-secondary] overflow-y-auto">
      <div className="px-3 py-2.5 border-b border-[--color-border-primary]">
        <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Equipamentos</h3>
        <p className="text-[10px] text-slate-600 mt-0.5">Clique para adicionar</p>
      </div>
      <div className="p-2 space-y-1">
        {DEVICE_ORDER.map(type => {
          const Icon = DEVICE_ICONS[type];
          const colors = DEVICE_COLORS[type];
          return (
            <button
              key={type}
              onClick={() => onAdd(type)}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md border border-transparent hover:border-[--color-border-secondary] hover:bg-[--color-bg-hover] transition-colors cursor-pointer group"
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded"
                style={{ background: colors.fill, border: `1px solid ${colors.stroke}40` }}
              >
                <Icon size={15} color={colors.text} />
              </span>
              <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">
                {DEVICE_LABELS[type]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}