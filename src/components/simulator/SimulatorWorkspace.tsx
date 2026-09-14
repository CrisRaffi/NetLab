import { useEffect, useState } from 'react';
import {
  Cable,
  Trash2,
  MousePointer2,
  RotateCcw,
  Info,
  TerminalSquare,
  Layers,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from 'lucide-react';
import { DevicePalette } from './DevicePalette';
import { TopologyCanvas } from './TopologyCanvas';
import { PropertyPanel } from './PropertyPanel';
import { Terminal } from './Terminal';
import { PacketInspector } from './PacketInspector';
import { useSimulatorStore } from '../../stores/useSimulatorStore';
import { useTerminalStore } from '../../stores/useTerminalStore';
import type { DeviceType, Topology } from '../../types';
import { clsx } from 'clsx';

interface SimulatorWorkspaceProps {
  title: string;
  subtitle?: string;
  extraHeaderActions?: React.ReactNode;
  onValidate?: (topology: Topology) => void;
  validationSummary?: { passed: number; total: number } | null;
  resetTopologyTo?: Topology;
  evaluationTab?: { label: string; content: React.ReactNode } | null;
  flashHint?: boolean;
}

export function SimulatorWorkspace({
  title,
  subtitle,
  extraHeaderActions,
  onValidate,
  validationSummary,
  resetTopologyTo,
  evaluationTab,
  flashHint,
}: SimulatorWorkspaceProps) {
  const addDevice = useSimulatorStore(s => s.addDevice);
  const resetTopology = useSimulatorStore(s => s.resetTopology);
  const loadTopology = useSimulatorStore(s => s.loadTopology);
  const selectDevice = useSimulatorStore(s => s.selectDevice);
  const connectingFromId = useSimulatorStore(s => s.connectingFromId);
  const startConnection = useSimulatorStore(s => s.startConnection);
  const completeConnection = useSimulatorStore(s => s.completeConnection);
  const cancelConnection = useSimulatorStore(s => s.cancelConnection);
  const selectedDeviceId = useSimulatorStore(s => s.selectedDeviceId);
  const selectedConnectionId = useSimulatorStore(s => s.selectedConnectionId);
  const removeDevice = useSimulatorStore(s => s.removeDevice);
  const removeConnection = useSimulatorStore(s => s.removeConnection);
  const deviceCount = useSimulatorStore(s => s.topology.devices.length);

  const [connectMode, setConnectMode] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  const [bottomTab, setBottomTab] = useState<'console' | 'packets' | 'evaluation'>('console');
  const [bottomExpanded, setBottomExpanded] = useState(false);

  const terminalOpen = useTerminalStore(s => s.open);
  const terminalDeviceId = useTerminalStore(s => s.deviceId);
  const openTerminal = useTerminalStore(s => s.openTerminal);
  const packetCount = useSimulatorStore(s => s.packets.length);
  const terminalDeviceName = useSimulatorStore(s =>
    s.topology.devices.find(d => d.id === terminalDeviceId)?.name
  );

  useEffect(() => {
    let wasOpen = useTerminalStore.getState().open;
    return useTerminalStore.subscribe(state => {
      if (state.open && !wasOpen) {
        setBottomTab('console');
        setBottomExpanded(true);
      }
      wasOpen = state.open;
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      if (e.key === 'Escape') {
        cancelConnection();
        setConnectMode(false);
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedDeviceId) removeDevice(selectedDeviceId);
        else if (selectedConnectionId) removeConnection(selectedConnectionId);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedDeviceId, selectedConnectionId, removeDevice, removeConnection, cancelConnection]);

  const handleAdd = (type: DeviceType) => {
    const col = deviceCount % 5;
    const row = Math.floor(deviceCount / 5);
    addDevice(type, { x: 180 + col * 140, y: 140 + row * 150 });
  };

  const handleDeviceClick = (deviceId: string) => {
    if (connectMode) {
      if (!connectingFromId) startConnection(deviceId);
      else if (connectingFromId === deviceId) cancelConnection();
      else completeConnection(deviceId);
      return;
    }
    selectDevice(deviceId);
  };

  const handleBackgroundClick = () => {
    if (connectingFromId) cancelConnection();
    selectDevice(null);
  };

  const toggleConnectMode = () => {
    setConnectMode(v => !v);
    cancelConnection();
  };

  const handleConsoleTab = () => {
    setBottomTab('console');
    setBottomExpanded(true);
    if (!terminalOpen && selectedDeviceId) openTerminal(selectedDeviceId);
  };

  const handlePacketsTab = () => {
    setBottomTab('packets');
    setBottomExpanded(true);
  };

  const handleEvaluationTab = () => {
    setBottomTab('evaluation');
    setBottomExpanded(true);
  };

  const handleValidate = () => {
    onValidate?.(useSimulatorStore.getState().topology);
  };

  const allPassed = validationSummary && validationSummary.total > 0 && validationSummary.passed === validationSummary.total;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-3 px-4 h-12 border-b border-[--color-border-primary] bg-[--color-bg-secondary] shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-slate-200 truncate">{title}</span>
          {subtitle && (
            <span className="text-[10px] text-slate-600 hidden md:block truncate">{subtitle}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onValidate && (
            <button
              onClick={handleValidate}
              className={clsx(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium border cursor-pointer transition-colors',
                allPassed
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : 'bg-blue-600/15 border-blue-500/40 text-blue-300 hover:bg-blue-600/25',
                flashHint && (!allPassed) && 'animate-pulse'
              )}
            >
              <ShieldCheck size={13} />
              Validar laboratório
              {validationSummary && (
                <span
                  className={clsx(
                    'text-[9px] px-1.5 rounded-full font-mono',
                    allPassed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-300'
                  )}
                >
                  {validationSummary.passed}/{validationSummary.total}
                </span>
              )}
            </button>
          )}

          <button
            onClick={toggleConnectMode}
            className={clsx(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium border cursor-pointer transition-colors',
              connectMode
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400'
                : 'border-[--color-border-primary] text-slate-400 hover:text-slate-200 hover:bg-[--color-bg-hover]'
            )}
          >
            <MousePointer2 size={13} />
            {connectMode ? 'Cancelar conexão' : 'Conectar'}
          </button>

          <button
              onClick={() => { if (resetTopologyTo) loadTopology(resetTopologyTo); else resetTopology(); setConnectMode(false); }}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium border border-[--color-border-primary] text-slate-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 cursor-pointer transition-colors"
            >
              <RotateCcw size={13} /> Limpar
            </button>

          {extraHeaderActions}

          <button
            onClick={() => setShowHelp(v => !v)}
            className={clsx(
              'p-1.5 rounded-md border cursor-pointer transition-colors',
              showHelp
                ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                : 'border-[--color-border-primary] text-slate-500 hover:text-slate-300'
            )}
            title="Ajuda"
          >
            <Info size={14} />
          </button>
        </div>
      </div>

      {showHelp && (
        <div className="flex items-center gap-4 px-4 py-2 bg-blue-500/5 border-b border-blue-500/20 text-[11px] text-slate-400 shrink-0 overflow-x-auto">
          <span className="flex items-center gap-1.5 shrink-0">
            <MousePointer2 size={12} className="text-blue-400" />
            <strong className="text-slate-300">Selecionar:</strong> clique num equipamento
          </span>
          <span className="flex items-center gap-1.5 shrink-0">
            <Cable size={12} className="text-cyan-400" />
            <strong className="text-slate-300">Conectar:</strong> ative "Conectar" e clique em dois equipamentos
          </span>
          <span className="flex items-center gap-1.5 shrink-0">
            <Trash2 size={12} className="text-red-400" />
            <strong className="text-slate-300">Remover:</strong> selecione e pressione Delete
          </span>
          <span className="hidden lg:block text-slate-600 shrink-0">Roda do mouse = zoom · arraste o fundo = mover</span>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        <DevicePalette onAdd={handleAdd} />
        <TopologyCanvas
          connectMode={connectMode}
          onDeviceClick={handleDeviceClick}
          onBackgroundClick={handleBackgroundClick}
        />
        <PropertyPanel />
      </div>

      <div className="shrink-0 border-t border-[--color-border-primary] bg-[--color-bg-secondary]">
        <div className="flex items-center justify-between px-3 h-9">
          <div className="flex items-center gap-1">
            <button
              onClick={handleConsoleTab}
              className={clsx(
                'flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer transition-colors',
                bottomExpanded && bottomTab === 'console'
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[--color-bg-hover]'
              )}
            >
              <TerminalSquare size={13} /> Console
              {terminalDeviceName && (
                <span className="text-[9px] text-slate-500">{terminalDeviceName}</span>
              )}
            </button>
            <button
              onClick={handlePacketsTab}
              className={clsx(
                'flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer transition-colors',
                bottomExpanded && bottomTab === 'packets'
                  ? 'bg-blue-500/15 text-blue-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[--color-bg-hover]'
              )}
            >
              <Layers size={13} /> Pacotes
              {packetCount > 0 && (
                <span className="text-[9px] px-1.5 rounded-full bg-blue-500/20 text-blue-300">
                  {packetCount}
                </span>
              )}
            </button>
            {evaluationTab && (
              <button
                onClick={handleEvaluationTab}
                className={clsx(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer transition-colors',
                  bottomExpanded && bottomTab === 'evaluation'
                    ? 'bg-amber-500/15 text-amber-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[--color-bg-hover]'
                )}
              >
                <ShieldCheck size={13} /> {evaluationTab.label}
              </button>
            )}
          </div>
          <button
            onClick={() => setBottomExpanded(v => !v)}
            className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-[--color-bg-hover] cursor-pointer"
            title={bottomExpanded ? 'Recolher painel' : 'Expandir painel'}
          >
            {bottomExpanded ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
          </button>
        </div>

        {bottomExpanded && (
          <div className="h-56 border-t border-[--color-border-primary]">
            {bottomTab === 'console' ? (
              terminalOpen ? (
                <Terminal />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <TerminalSquare size={22} className="text-slate-700 mb-2" />
                  <p className="text-xs text-slate-500">
                    Selecione um equipamento e clique em <span className="text-emerald-400">Abrir console</span>.
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    No console você pode executar ipconfig, ping, tracert, arp e mais.
                  </p>
                </div>
              )
            ) : bottomTab === 'packets' ? (
              <PacketInspector />
            ) : (
              evaluationTab?.content ?? null
            )}
          </div>
        )}
      </div>
    </div>
  );
}