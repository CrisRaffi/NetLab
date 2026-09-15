import { useState } from 'react';
import type { DeviceType, Position } from '../../types';
import { DEVICE_ICONS, DEVICE_COLORS, DEVICE_ORDER } from './deviceIcons';
import { DEVICE_LABELS } from '../../stores/useSimulatorStore';
import { useSimulatorStore } from '../../stores/useSimulatorStore';
import { useSavedBoardsStore } from '../../stores/useSavedBoardsStore';
import { Plus, Waypoints, Save, History, Upload } from 'lucide-react';

interface DevicePaletteProps {
  onAdd: (type: DeviceType, position: Position) => void;
}

export function DevicePalette({ onAdd }: DevicePaletteProps) {
  const [deviceCounter, setDeviceCounter] = useState(0);
  const explodeTopology = useSimulatorStore((s) => s.explodeTopology);
  const loadTopology = useSimulatorStore((s) => s.loadTopology);
  const saveBoard = useSavedBoardsStore((s) => s.saveBoard);
  const boards = useSavedBoardsStore((s) => s.boards);
  const [saved, setSaved] = useState(false);

  const getPosition = (): Position => {
    const baseX = 200;
    const baseY = 150;
    const offset = deviceCounter * 60;
    return {
      x: baseX + (offset % 400),
      y: baseY + Math.floor(offset / 400) * 80,
    };
  };

  const handleAdd = (type: DeviceType) => {
    onAdd(type, getPosition());
    setDeviceCounter((c) => c + 1);
  };

  const handleSave = () => {
    saveBoard(useSimulatorStore.getState().topology);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  const lastBoard = boards[0] ?? null;

  return (
    <div className="w-40 shrink-0 border-r border-[--color-border-primary]/20 bg-[#020A14]/70 overflow-y-auto flex flex-col">
      <div className="px-4 py-4 flex-1">
        <h3 className="text-[10px] font-semibold text-[--color-text-secondary] uppercase tracking-[0.14em]">
          Equipamentos
        </h3>
        <p className="text-[10px] text-[--color-text-muted]/70 mt-1 mb-4">
          Clique para adicionar
        </p>

        <div className="space-y-2.5">
          {DEVICE_ORDER.map((type) => {
            const Icon = DEVICE_ICONS[type];
            const colors = DEVICE_COLORS[type];
            return (
              <button
                key={type}
                onClick={() => handleAdd(type)}
                className="group w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl bg-[#111A2C]/50 hover:bg-[#1C2538] transition-all duration-150 cursor-pointer hover:-translate-y-px"
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0 transition-transform duration-150 group-hover:scale-105"
                  style={{
                    background: colors.fill,
                    border: `1px solid ${colors.stroke}45`,
                  }}
                >
                  <Icon size={15} color={colors.text} />
                </span>
                <span className="flex-1 text-left text-[11px] font-medium text-[--color-text-secondary] group-hover:text-[--color-text-primary] transition-colors truncate">
                  {DEVICE_LABELS[type]}
                </span>
                <Plus
                  size={11}
                  className="text-[--color-text-muted]/0 group-hover:text-[--color-accent-blue]/70 transition-all shrink-0"
                />
              </button>
            );
          })}
        </div>

        <button
          onClick={explodeTopology}
          title="Explodir rede: reorganiza os equipamentos com espaçamento"
          className="mt-5 w-full flex flex-col items-center justify-center gap-2 rounded-xl px-2 py-4 bg-[#111A2C]/50 hover:bg-[#1C2538] text-[--color-accent-cyan] transition-all duration-150 cursor-pointer group"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[--color-accent-cyan]/10 group-hover:scale-105 transition-transform">
            <Waypoints size={15} />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider">EX</span>
          <span className="text-[9px] text-[--color-text-muted] text-center leading-snug">
            Explodir rede
          </span>
        </button>

        <button
          onClick={handleSave}
          title="Salvar o quadro atual"
          className="mt-2.5 w-full flex items-center justify-center gap-2 rounded-xl px-2 py-2.5 bg-[--color-accent-green]/8 hover:bg-[--color-accent-green]/15 text-[--color-accent-green] transition-all duration-150 cursor-pointer"
        >
          <Save size={12} />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {saved ? 'Salvo!' : 'Salvar'}
          </span>
        </button>

        <div className="mt-6">
          <div className="flex items-center gap-2 text-[10px] font-semibold text-[--color-text-secondary] uppercase tracking-[0.14em] mb-3">
            <History size={11} />
            Último salvo
          </div>
          {lastBoard ? (
            <button
              onClick={() => loadTopology(lastBoard.topology)}
              title="Carregar quadro salvo"
              className="w-full text-left rounded-xl px-3 py-2.5 bg-[#111A2C]/50 hover:bg-[#1C2538] transition-all duration-150 cursor-pointer group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Upload size={11} className="text-[--color-accent-cyan] shrink-0" />
                <span className="text-[10px] font-medium text-[--color-text-secondary] group-hover:text-[--color-text-primary] truncate">
                  {lastBoard.name}
                </span>
              </div>
              <p className="text-[9px] text-[--color-text-muted] mt-1">
                {lastBoard.topology.devices.length} disp. ·{' '}
                {new Date(lastBoard.savedAt).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </button>
          ) : (
            <p className="text-[9px] text-[--color-text-muted] leading-relaxed">
              Nenhum quadro salvo ainda. Clique em Salvar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
